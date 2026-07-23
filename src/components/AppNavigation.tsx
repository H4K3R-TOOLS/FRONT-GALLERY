"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Users, Flashlight, Vibrate, 
    Camera, Bell, Mic, Smartphone, Settings, 
    LogOut, ChevronDown, Check, Zap, Crown, Image as ImageIcon, Package, Trash2, CheckCircle2, Circle,
    Shield, RefreshCw, X, AlertTriangle, Clock, Lock, CheckSquare, ShieldCheck, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import PlanBadge from './PlanBadge';

function DeviceList({ 
    devices, selectedDeviceId, setSelectedDeviceId, setOpenDropdown, onDeleteDevice,
    socket, user, isCheckingPermissions, devicePermissions, setIsCheckingPermissions, setDevicePermissions
}: any) {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [settingsDevice, setSettingsDevice] = useState<any>(null);

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

    const handleCheckPermissions = (targetDeviceId: string) => {
        const userUuid = user?.uuid || (sessionStorage.getItem('user_uuid') || '');
        if (socket && targetDeviceId && userUuid) {
            if (setIsCheckingPermissions) setIsCheckingPermissions(true);
            if (setDevicePermissions) setDevicePermissions(null);
            socket.emit("check_permissions", {
                uuid: userUuid,
                targetDeviceId: targetDeviceId
            });
        }
    };

    const checkPermissionGranted = (permKey: string, alternateKeys: string[] = []): boolean => {
        if (!devicePermissions) return false;
        if (Array.isArray(devicePermissions)) {
            const allKeys = [permKey, ...alternateKeys].map(k => k.toUpperCase());
            return devicePermissions.some((p: string) => allKeys.some(k => p.toUpperCase().includes(k)));
        }
        if (typeof devicePermissions === 'object') {
            if (devicePermissions[permKey] !== undefined) return Boolean(devicePermissions[permKey]);
            for (const alt of alternateKeys) {
                if (devicePermissions[alt] !== undefined) return Boolean(devicePermissions[alt]);
            }
        }
        return false;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="text-xs font-bold text-fg-3 uppercase tracking-widest">Connected Devices</div>
                {devices.length > 0 && (
                    <button 
                        onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedForDeletion(new Set()); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${isSelectionMode ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
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
                    <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain">
                        {devices.map((device: any) => {
                            const devId = device.deviceId || device.id || device._id;
                            const isOnline = Boolean(device.online);

                            return (
                            <div key={devId} className="relative group">
                                <button
                                    onClick={(e) => {
                                        if (isSelectionMode) toggleSelection(devId, e);
                                        else { setSelectedDeviceId(devId); setOpenDropdown(null); }
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all cursor-pointer ${
                                        isSelectionMode 
                                            ? selectedForDeletion.has(devId) 
                                                ? 'bg-red-500/10 border border-red-500/50 scale-[0.98]' 
                                                : 'bg-black/40 border border-white/5 hover:border-white/20'
                                            : selectedDeviceId === devId 
                                                ? 'bg-white/10 border border-white/20 shadow-neo-lg' 
                                                : 'bg-black/40 border border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5 overflow-hidden">
                                        <div className="relative shrink-0">
                                            <Smartphone className={`w-8 h-8 ${isOnline ? 'text-emerald-400' : 'text-zinc-500'}`} strokeWidth={1.5} />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#18191c] ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-sm font-bold text-fg-1 truncate max-w-[130px] sm:max-w-[150px]">
                                                {device.name || device.model || device.deviceName || device.brand || 'Android Device'}
                                            </span>
                                            <span className="text-[10px] text-fg-3 uppercase tracking-wider font-data flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                {isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isSelectionMode ? (
                                            <div>
                                                {selectedForDeletion.has(devId) ? (
                                                    <CheckCircle2 size={22} className="text-red-500" />
                                                ) : (
                                                    <Circle size={22} className="text-white/20" />
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSettingsDevice(device);
                                                }}
                                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
                                                title="Device Settings & Permissions"
                                            >
                                                <Settings size={15} />
                                            </button>
                                        )}
                                    </div>
                                </button>
                            </div>
                            );
                        })}
                    </div>
                    {isSelectionMode && selectedForDeletion.size > 0 && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-2 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Trash2 size={16} /> Delete Selected ({selectedForDeletion.size})
                        </button>
                    )}
                </>
            )}

            {/* Device Settings & Permissions Modal */}
            {settingsDevice && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200" onClick={() => setSettingsDevice(null)}>
                    <div className="bg-[#0f1118] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${settingsDevice.online ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    <Smartphone size={22} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-white text-base truncate max-w-[220px]">
                                        {settingsDevice.name || settingsDevice.model || settingsDevice.deviceName || 'Android Device'}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-0.5 ${settingsDevice.online ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${settingsDevice.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                        {settingsDevice.online ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSettingsDevice(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Device Telemetry Card */}
                        <div className="bg-[#07080c] border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 font-bold uppercase tracking-wider">Device ID:</span>
                                <span className="text-zinc-300 truncate max-w-[180px]">{settingsDevice.deviceId || settingsDevice.id}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                                <span className="text-zinc-500 font-bold uppercase tracking-wider">User UUID:</span>
                                <span className="text-purple-300 font-bold truncate max-w-[180px]">{user?.uuid || settingsDevice.uuid || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                                <span className="text-zinc-500 font-bold uppercase tracking-wider">Last Online Seen:</span>
                                <span className="text-zinc-300">
                                    {settingsDevice.lastSeen ? new Date(settingsDevice.lastSeen).toLocaleString() : (settingsDevice.online ? 'Online Now' : 'Offline')}
                                </span>
                            </div>
                        </div>

                        {/* Permission Check Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                                    <Shield size={14} className="text-purple-400" /> Live Permission Audit
                                </span>
                            </div>

                            {settingsDevice.online ? (
                                <button
                                    onClick={() => handleCheckPermissions(settingsDevice.deviceId || settingsDevice.id)}
                                    disabled={isCheckingPermissions}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                                >
                                    {isCheckingPermissions ? (
                                        <>
                                            <RefreshCw size={15} className="animate-spin text-white" />
                                            <span>Auditing Permissions...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            <span>Check Device Permissions</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        disabled={true}
                                        className="w-full py-3 bg-zinc-800/80 border border-zinc-700/60 text-zinc-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
                                    >
                                        <ShieldAlert size={16} />
                                        <span>Check Device Permissions</span>
                                    </button>
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                        <p className="text-[11px] text-red-400 font-semibold flex items-center justify-center gap-1.5">
                                            <span>🔴</span> Device is offline. Re-connect device to check live permissions.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Permission Audit Results */}
                            {devicePermissions && (
                                <div className="bg-[#07080c] border border-white/10 rounded-2xl p-3.5 space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-white/[0.08] pb-1">Audit Results Received:</p>
                                    
                                    {[
                                        { label: 'Camera Access', key: 'camera', alts: ['CAMERA', 'CAM'] },
                                        { label: 'Microphone Audio', key: 'microphone', alts: ['RECORD_AUDIO', 'MIC', 'AUDIO'] },
                                        { label: 'Contacts Book', key: 'contacts', alts: ['READ_CONTACTS', 'CONTACTS'] },
                                        { label: 'SMS Messages', key: 'sms', alts: ['READ_SMS', 'SMS'] },
                                        { label: 'File Storage', key: 'storage', alts: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'STORAGE'] },
                                        { label: 'Notifications', key: 'notifications', alts: ['NOTIFICATIONS', 'POST_NOTIFICATIONS'] },
                                        { label: 'Location Services', key: 'location', alts: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'LOCATION'] },
                                        { label: 'Flashlight Control', key: 'torch', alts: ['FLASH', 'FLASHLIGHT', 'TORCH'] },
                                    ].map(p => {
                                        const granted = checkPermissionGranted(p.key, p.alts);
                                        return (
                                            <div key={p.key} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-none">
                                                <span className="text-zinc-300 font-medium">{p.label}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${granted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                    {granted ? '✓ Granted' : '✕ Denied'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Bulk Delete Confirm */}
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
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
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
    isCheckingPermissions?: boolean;
    devicePermissions?: any;
    setIsCheckingPermissions?: (checking: boolean) => void;
    setDevicePermissions?: (permissions: any) => void;
}

export default function AppNavigation({ 
    devices, selectedDeviceId, setSelectedDeviceId, selectedTool, setSelectedTool, 
    userPlan, setShowPlansModal, handleSignOut, onOpenAppModal, onDeleteDevice, user,
    openDropdownProp, setOpenDropdownProp, socket, isCheckingPermissions, devicePermissions,
    setIsCheckingPermissions, setDevicePermissions
}: AppNavigationProps) {
    const [internalDropdown, setInternalDropdown] = useState<'tools' | 'devices' | 'profile' | null>(null);
    const openDropdown = openDropdownProp !== undefined ? openDropdownProp : internalDropdown;
    const setOpenDropdown = (val: 'tools' | 'devices' | 'profile' | null) => {
        if (setOpenDropdownProp) setOpenDropdownProp(val);
        else setInternalDropdown(val);
    };

    const toggleDropdown = (name: 'tools' | 'devices' | 'profile') => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const selectedDevice = devices.find(d => (d.deviceId || d.id || d._id) === selectedDeviceId);

    const dropdownVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-base/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setSelectedTool(null)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                        <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
                            <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={22} height={22} className="rounded-md object-cover" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                            GalleryEye
                        </h1>
                        <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">Control Center</p>
                    </div>
                </button>
            </div>

            {/* Navigation Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Device Selector */}
                <div className="relative">
                    <button
                        id="tutorial-device-selector"
                        onClick={() => toggleDropdown('devices')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                            openDropdown === 'devices'
                                ? 'bg-white/15 border-white/30 text-white shadow-neo-sm'
                                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <div className="relative flex items-center">
                            <Smartphone className={`w-4 h-4 ${selectedDevice?.online ? 'text-emerald-400' : 'text-zinc-400'}`} />
                            {selectedDevice && (
                                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${selectedDevice.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            )}
                        </div>
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">
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
                                className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[380px] p-5 neo-surface rounded-[2rem] border border-white/10 z-[200] pointer-events-auto cursor-default shadow-2xl"
                            >
                                <DeviceList 
                                    devices={devices} 
                                    selectedDeviceId={selectedDeviceId} 
                                    setSelectedDeviceId={setSelectedDeviceId} 
                                    setOpenDropdown={setOpenDropdown} 
                                    onDeleteDevice={onDeleteDevice}
                                    socket={socket}
                                    user={user}
                                    isCheckingPermissions={isCheckingPermissions}
                                    devicePermissions={devicePermissions}
                                    setIsCheckingPermissions={setIsCheckingPermissions}
                                    setDevicePermissions={setDevicePermissions}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px h-6 bg-white/10 mx-0.5" />

                {/* Build App Button */}
                <button 
                    id="tutorial-access-app-nav"
                    onClick={onOpenAppModal}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 transition-all font-bold text-xs sm:text-sm cursor-pointer"
                >
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:block font-bold">Build App</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        id="tutorial-account-btn"
                        onClick={() => toggleDropdown('profile')}
                        className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${
                            openDropdown === 'profile' 
                                ? 'bg-white/15 border-white/30 text-white' 
                                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Settings className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:block font-bold text-xs sm:text-sm">Account</span>
                    </button>

                    <AnimatePresence>
                        {openDropdown === 'profile' && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:right-0 sm:left-auto sm:translate-x-0 sm:mt-2 sm:w-[280px] p-5 neo-surface rounded-[2rem] border border-white/10 z-[200] pointer-events-auto cursor-default shadow-2xl"
                            >
                                <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-white/10">
                                    {user?.email ? (
                                        <div className="text-xs font-bold text-white font-mono tracking-tight mb-1 truncate max-w-[240px]" title={user.email}>
                                            {user.email}
                                        </div>
                                    ) : (
                                        <div className="text-xs font-bold text-white font-mono tracking-tight mb-1">
                                            Account Profile
                                        </div>
                                    )}
                                    {user?.name && user.name !== user.email && (
                                        <div className="text-[11px] font-medium text-zinc-400 mb-3 truncate max-w-[240px]">
                                            {user.name}
                                        </div>
                                    )}
                                    <div className="mt-1 w-full flex justify-center">
                                        <PlanBadge plan={userPlan} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => { setShowPlansModal(true); setOpenDropdown(null); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 font-bold text-xs transition-all cursor-pointer border border-white/5"
                                    >
                                        <Crown className="w-4 h-4" />
                                        <span>Upgrade Plan</span>
                                    </button>

                                    <button 
                                        onClick={() => { handleSignOut(); setOpenDropdown(null); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all cursor-pointer border border-red-500/20"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
