"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Wallpaper, Upload, Sparkles, Check, CheckCircle2, AlertCircle, 
    Smartphone, Lock, Home, RefreshCw, X, Image as ImageIcon,
    Wifi, BatteryCharging, Shield, Info, ArrowRight
} from 'lucide-react';
import Image from 'next/image';

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
        tag: 'Cyberpunk',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'neon_tokyo',
        name: 'Neon Tokyo',
        tag: 'Midnight',
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'deep_space',
        name: 'Cosmic Nebula',
        tag: 'AMOLED',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'dark_peaks',
        name: 'Dark Peaks',
        tag: 'Minimal',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'crimson_horizon',
        name: 'Crimson Flow',
        tag: 'Abstract',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'synthwave',
        name: 'Synthwave Sun',
        tag: 'Retro 80s',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'emerald_aurora',
        name: 'Emerald Aurora',
        tag: 'Nature',
        url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=360&q=70'
    },
    {
        id: 'obsidian_liquid',
        name: 'Obsidian Fluid',
        tag: 'Dark 4K',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
        thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=360&q=70'
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
    const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_WALLPAPERS[0].id);
    const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
    const [customFileName, setCustomFileName] = useState<string>('');
    const [targetScreen, setTargetScreen] = useState<'both' | 'home' | 'lock'>('both');
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active image source for preview
    const activeImageSrc = activeTab === 'custom' && customImageBase64 
        ? customImageBase64 
        : (PRESET_WALLPAPERS.find(p => p.id === selectedPresetId)?.url || PRESET_WALLPAPERS[0].url);

    // Listen to wallpaper_status event from socket
    useEffect(() => {
        if (!socket) return;

        const handleStatus = (data: any) => {
            setIsApplying(false);
            if (data?.success) {
                const screenLabel = data?.target === 'home' ? 'Home screen' : data?.target === 'lock' ? 'Lock screen' : 'Both screens';
                setFeedback({
                    type: 'success',
                    message: `Wallpaper changed successfully on ${screenLabel}!`
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: data?.message || 'Failed to update wallpaper on target device.'
                });
            }
            // Auto clear feedback after 6 seconds
            setTimeout(() => setFeedback(null), 6000);
        };

        socket.on('wallpaper_status', handleStatus);
        return () => {
            socket.off('wallpaper_status', handleStatus);
        };
    }, [socket]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 12 * 1024 * 1024) {
            setFeedback({ type: 'error', message: 'Image size exceeds 12MB limit. Please choose a smaller photo.' });
            return;
        }

        setCustomFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                setCustomImageBase64(result);
                setActiveTab('custom');
                setFeedback(null);
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

            const imagePayload = activeTab === 'custom' && customImageBase64
                ? customImageBase64
                : (PRESET_WALLPAPERS.find(p => p.id === selectedPresetId)?.url || PRESET_WALLPAPERS[0].url);

            if (!imagePayload) {
                setFeedback({ type: 'error', message: 'Please select a wallpaper or upload an image.' });
                return;
            }

            setIsApplying(true);
            setFeedback(null);

            socket.emit('set_wallpaper', {
                uuid: userUuid,
                targetDeviceId: effectiveTarget,
                image: imagePayload,
                target: targetScreen,
                type: activeTab
            });

            // Fallback timeout in case device is unresponsive
            setTimeout(() => {
                setIsApplying((prev) => {
                    if (prev) {
                        setFeedback({ type: 'error', message: 'Request timed out. Target device may be in deep sleep or offline.' });
                        return false;
                    }
                    return false;
                });
            }, 18000);
        }, { actionName: 'Wallpaper Changer' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-16">
            
            {/* ── Top Header Banner ── */}
            <div className="clay-card p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="clay-icon-pod w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-orange-400 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                            <Wallpaper className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Remote Wallpaper Changer</h2>
                                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[9px] font-mono font-bold text-orange-300 uppercase tracking-wider">
                                    LIVE SYNC
                                </span>
                            </div>
                            <p className="text-xs text-white/50 font-sans">
                                Push high-resolution presets or custom photos directly to target screen background
                            </p>
                        </div>
                    </div>
                </div>

                {/* Device Online Status Capsule */}
                <div className="relative z-10 flex items-center gap-2">
                    <div className={`clay-pill px-3.5 py-1.5 flex items-center gap-2 ${
                        isOnline 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-400'
                        }`} />
                        <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                            {isOnline ? 'DEVICE LINKED & ACTIVE' : 'TARGET OFFLINE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Feedback Alert Banner */}
            {feedback && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                    feedback.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.15)]' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.15)]'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {feedback.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        ) : (
                            <AlertCircle size={18} className="text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-mono font-bold">{feedback.message}</span>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setFeedback(null)} 
                        className="text-white/40 hover:text-white p-1"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Main Two-Column Studio Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── Left Column: Interactive Phone Screen Mockup (4 cols) ── */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="clay-card p-6 w-full flex flex-col items-center relative overflow-hidden">
                        
                        {/* Sub-label */}
                        <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/50 mb-4 pb-3 border-b border-white/5">
                            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                                <Smartphone size={13} />
                                REAL-TIME PREVIEW
                            </span>
                            <span className="uppercase text-white/40">
                                {targetScreen === 'both' ? 'Home & Lock Screen' : `${targetScreen} Screen`}
                            </span>
                        </div>

                        {/* ── Tactical 3D Phone Shell ── */}
                        <div className="w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[2.8rem] bg-[#0c0d12] p-2.5 relative shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_0_0_2px_rgba(255,255,255,0.1)] border-4 border-[#1f222b]">
                            
                            {/* Inner Screen Bezel */}
                            <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative flex flex-col justify-between bg-black select-none">
                                
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={activeImageSrc} 
                                        alt="Wallpaper Preview" 
                                        className="w-full h-full object-cover transition-all duration-500 ease-out" 
                                    />
                                    {/* Dark gradient overlay for UI readability */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/65 pointer-events-none" />
                                </div>

                                {/* Dynamic Island / Speaker Notch */}
                                <div className="relative z-20 w-full pt-2 flex justify-center">
                                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2.5 border border-white/10 shadow-md">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                                    </div>
                                </div>

                                {/* Phone Status Bar */}
                                <div className="relative z-20 px-5 flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow">
                                    <span className="font-bold">09:41</span>
                                    <div className="flex items-center gap-1.5">
                                        <Wifi size={11} />
                                        <BatteryCharging size={13} className="text-emerald-400" />
                                    </div>
                                </div>

                                {/* Phone Screen Content Depending on Target Mode */}
                                {targetScreen === 'lock' ? (
                                    /* Lock Screen Mockup */
                                    <div className="relative z-20 flex-1 flex flex-col items-center justify-between py-6 px-4">
                                        <div className="flex flex-col items-center mt-6">
                                            <Lock size={15} className="text-white/70 mb-2 drop-shadow" />
                                            <div className="text-5xl font-black text-white font-sans tracking-tight drop-shadow-lg">
                                                09:41
                                            </div>
                                            <div className="text-xs font-medium text-white/80 drop-shadow mt-1">
                                                Wednesday, October 18
                                            </div>
                                        </div>

                                        <div className="text-[10px] font-mono text-white/60 tracking-wider uppercase animate-pulse drop-shadow">
                                            Swipe up to unlock
                                        </div>
                                    </div>
                                ) : (
                                    /* Home Screen Mockup */
                                    <div className="relative z-20 flex-1 flex flex-col justify-between py-5 px-3">
                                        {/* Top Weather Widget Mock */}
                                        <div className="bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 mx-2 text-white/90 shadow-lg">
                                            <div className="text-[11px] font-bold">24° Sunny</div>
                                            <div className="text-[9px] text-white/60 font-mono">Location Tracked</div>
                                        </div>

                                        {/* Home Screen App Grid */}
                                        <div className="grid grid-cols-4 gap-2.5 px-2 my-auto">
                                            {['Phone', 'Messages', 'Gallery', 'Settings', 'Camera', 'Maps', 'Chrome', 'Files'].map((app, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-1">
                                                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center text-white/90 text-xs font-black">
                                                        {app[0]}
                                                    </div>
                                                    <span className="text-[8px] font-medium text-white/80 drop-shadow truncate w-full text-center">
                                                        {app}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bottom Dock */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mx-1 flex items-center justify-around border border-white/15">
                                            {['📞', '💬', '🌐', '📷'].map((icon, idx) => (
                                                <div key={idx} className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-sm shadow">
                                                    {icon}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Screen Target Mode Buttons */}
                        <div className="w-full mt-5 space-y-2">
                            <label className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider block text-center">
                                Select Destination Screen
                            </label>
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
                                            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
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
                    </div>
                </div>

                {/* ── Right Column: Source Tabs & Wallpaper Picker (7 cols) ── */}
                <div className="lg:col-span-7 space-y-5">
                    
                    {/* Source Mode Switcher: Presets vs Custom Upload */}
                    <div className="clay-card p-2 sm:p-2.5 flex items-center gap-2">
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
                            <span>Curated Presets ({PRESET_WALLPAPERS.length})</span>
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

                    {/* Tab 1: Presets Gallery Grid */}
                    {activeTab === 'presets' && (
                        <div className="clay-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-black text-white">Curated Aesthetic Wallpapers</h3>
                                    <p className="text-[10px] sm:text-[11px] font-mono text-white/40">Select any 4K preset to preview and apply</p>
                                </div>
                                <span className="text-[10px] font-mono text-orange-400 font-bold px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                    FAST CDN
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                                {PRESET_WALLPAPERS.map((preset) => {
                                    const isSelected = selectedPresetId === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setSelectedPresetId(preset.id)}
                                            className={`group relative rounded-2xl overflow-hidden aspect-[9/16] transition-all cursor-pointer border text-left flex flex-col justify-between p-2.5 ${
                                                isSelected 
                                                    ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.45)] ring-2 ring-orange-400/50 scale-[1.02]' 
                                                    : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                                            }`}
                                        >
                                            {/* Thumbnail Image */}
                                            <img 
                                                src={preset.thumb} 
                                                alt={preset.name} 
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

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

                    {/* Tab 2: Custom Image Upload Zone */}
                    {activeTab === 'custom' && (
                        <div className="clay-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-black text-white">Upload Custom Image</h3>
                                    <p className="text-[10px] sm:text-[11px] font-mono text-white/40">Upload any photo (JPG, PNG, WebP up to 12MB)</p>
                                </div>
                                {customImageBase64 && (
                                    <button
                                        type="button"
                                        onClick={() => {
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
                                /* Drag & Drop Upload Zone */
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-8 sm:p-12 border-2 border-dashed border-white/15 hover:border-orange-500/60 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-white/[0.02] group"
                                >
                                    <div className="clay-icon-pod w-14 h-14 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-3 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                                        <Upload size={22} className="text-orange-400" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">Click to browse or drop an image here</h4>
                                    <p className="text-[10px] font-mono text-white/40">PNG, JPG, JPEG, WebP • High resolution recommended</p>
                                </div>
                            )}

                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200/80 font-mono leading-relaxed flex items-start gap-2">
                                <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
                                <span>Images are decoded and scaled directly on the target device to fit its exact native screen resolution without distortion.</span>
                            </div>
                        </div>
                    )}

                    {/* ── Master Action HUD Button ── */}
                    <div className="clay-card p-5 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-white/50">
                            <span>Target: <strong className="text-orange-300 font-bold uppercase">{targetScreen === 'both' ? 'Home & Lock Screen' : `${targetScreen} Screen`}</strong></span>
                            <span>Source: <strong className="text-white/80 font-bold">{activeTab === 'custom' ? 'Custom Upload' : 'Curated Preset'}</strong></span>
                        </div>

                        <button
                            type="button"
                            onClick={handleApplyWallpaper}
                            disabled={isApplying}
                            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-black font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-98 ${
                                isApplying
                                    ? 'bg-orange-500/40 text-black/60 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-black shadow-[0_8px_30px_rgba(249,115,22,0.4)] hover:scale-[1.01]'
                            }`}
                        >
                            {isApplying ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin text-black" />
                                    <span>Applying Wallpaper to Device...</span>
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
