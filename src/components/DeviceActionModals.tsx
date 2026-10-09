"use client";

import React from 'react';
import { 
    WifiOff, Smartphone, RefreshCw, X, Camera, Mic, 
    Folder, MapPin, MessageSquare, Users, Bell, ShieldAlert
} from 'lucide-react';

interface DeviceOfflineModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceName?: string;
    actionName?: string;
}

export function DeviceOfflineModal({
    isOpen,
    onClose,
    deviceName = 'Target Device',
    actionName
}: DeviceOfflineModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[340px] rounded-3xl p-5 bg-[#0f1115]/95 backdrop-blur-2xl border border-rose-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(244,63,94,0.12),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden animate-in zoom-in-95 duration-150"
            >
                {/* Ambient Soft Glow in Background */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Top Bar: Badge & Micro Close */}
                <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Offline
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                    >
                        <X size={13} />
                    </button>
                </div>

                {/* Icon Pod & Title */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)] mb-3">
                        <WifiOff size={22} />
                    </div>

                    <h3 className="font-bold text-base text-white tracking-tight mb-1">
                        Device is Offline
                    </h3>

                    {/* Compact Device Name Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-white/70 mb-2">
                        <Smartphone size={11} className="text-orange-400" />
                        <span className="truncate max-w-[190px]">{deviceName}</span>
                    </div>

                    <p className="text-white/50 text-xs leading-relaxed mb-5">
                        Target phone is disconnected from the network.
                    </p>

                    {/* Single Sleek Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] border border-rose-400/30 active:scale-95 transition-all cursor-pointer"
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DevicePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceName?: string;
    permissionKey: string;
    permissionLabel?: string;
    onProbePermissions?: () => void;
    isProbing?: boolean;
}

const PERMISSION_ICONS: Record<string, { label: string; icon: any }> = {
    camera: { label: 'Camera', icon: Camera },
    microphone: { label: 'Microphone', icon: Mic },
    location: { label: 'Location', icon: MapPin },
    storage: { label: 'Storage', icon: Folder },
    sms: { label: 'SMS', icon: MessageSquare },
    contacts: { label: 'Contacts', icon: Users },
    notifications: { label: 'Notifications', icon: Bell }
};

export function DevicePermissionModal({
    isOpen,
    onClose,
    deviceName = 'Target Device',
    permissionKey,
    permissionLabel,
    onProbePermissions,
    isProbing = false
}: DevicePermissionModalProps) {
    if (!isOpen) return null;

    const keyClean = (permissionKey || '').toLowerCase();
    const config = PERMISSION_ICONS[keyClean] || {
        label: permissionLabel || 'Hardware',
        icon: ShieldAlert
    };
    const IconComp = config.icon;
    const displayName = permissionLabel || `${config.label} Permission`;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[340px] rounded-3xl p-5 bg-[#0f1115]/95 backdrop-blur-2xl border border-amber-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden animate-in zoom-in-95 duration-150"
            >
                {/* Ambient Soft Glow in Background */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Top Bar: Badge & Micro Close */}
                <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Restricted
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                    >
                        <X size={13} />
                    </button>
                </div>

                {/* Icon Pod & Title */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-3">
                        <IconComp size={22} />
                    </div>

                    <h3 className="font-bold text-base text-white tracking-tight mb-1">
                        {displayName} Required
                    </h3>

                    {/* Compact Device Name Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-white/70 mb-2">
                        <Smartphone size={11} className="text-orange-400" />
                        <span className="truncate max-w-[190px]">{deviceName}</span>
                    </div>

                    <p className="text-white/50 text-xs leading-relaxed mb-5">
                        Please enable this permission in target phone settings.
                    </p>

                    {/* Actions: Sleek Buttons */}
                    <div className="flex items-center gap-2 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium text-xs active:scale-95 transition-all cursor-pointer"
                        >
                            Dismiss
                        </button>
                        {onProbePermissions ? (
                            <button
                                type="button"
                                onClick={onProbePermissions}
                                disabled={isProbing}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-[0_4px_16px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-amber-400/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                            >
                                <RefreshCw size={12} className={isProbing ? 'animate-spin' : ''} />
                                <span>{isProbing ? 'Checking...' : 'Check Status'}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-[0_4px_16px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-amber-400/30 active:scale-95 transition-all cursor-pointer"
                            >
                                Understood
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
