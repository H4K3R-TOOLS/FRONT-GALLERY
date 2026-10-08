"use client";

import React from 'react';
import { 
    WifiOff, ShieldAlert, Smartphone, RefreshCw, X, Camera, Mic, 
    Folder, MapPin, MessageSquare, Users, Bell, AlertTriangle
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[420px] bg-[#0f1115] rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] border border-rose-500/40 overflow-hidden animate-in zoom-in-95 duration-100"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                {/* 3D Rose Pod Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.3)] mx-auto mb-4">
                    <WifiOff size={28} className="animate-pulse" />
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                        <span>Endpoint Disconnected</span>
                    </div>

                    <h3 className="font-black text-lg sm:text-xl text-rose-400 tracking-tight mb-2">
                        Device is Offline
                    </h3>

                    {/* Target Device Name Pod */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-semibold text-white/90 mb-4">
                        <Smartphone size={13} className="text-orange-400" />
                        <span className="truncate max-w-[220px]">{deviceName}</span>
                    </div>

                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                        {actionName ? (
                            <>Unable to execute <strong className="text-white">{actionName}</strong> because this device is currently offline.</>
                        ) : (
                            <>This device is currently unreachable or disconnected from the network.</>
                        )}
                        <span className="block mt-2 text-white/50 text-[11px] font-mono">
                            Live commands, sensors, and remote controls require an active internet connection on the target phone.
                        </span>
                    </p>
                </div>

                {/* Action Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    Dismiss
                </button>
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

const PERMISSION_CONFIG: Record<string, { label: string; icon: any; hint: string }> = {
    camera: {
        label: 'Camera Access',
        icon: Camera,
        hint: 'Required for remote snapshots, live streaming, and camera flash.'
    },
    microphone: {
        label: 'Microphone Access',
        icon: Mic,
        hint: 'Required for real-time ambient listening and voice note recordings.'
    },
    location: {
        label: 'GPS Location Access',
        icon: MapPin,
        hint: 'Required for real-time GPS coordinate telemetry and location tracking.'
    },
    storage: {
        label: 'Storage / All Files Access',
        icon: Folder,
        hint: 'Required for remote file browsing, gallery synchronization, and media extraction.'
    },
    sms: {
        label: 'SMS & Messages Access',
        icon: MessageSquare,
        hint: 'Required for intercepting text messages, OTPs, and SMS history.'
    },
    contacts: {
        label: 'Contacts Access',
        icon: Users,
        hint: 'Required for phonebook contacts directory synchronization.'
    },
    notifications: {
        label: 'Notification Listener',
        icon: Bell,
        hint: 'Required for reading incoming WhatsApp, Telegram, and social notifications.'
    }
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
    const config = PERMISSION_CONFIG[keyClean] || {
        label: permissionLabel || `${permissionKey.toUpperCase()} Access`,
        icon: AlertTriangle,
        hint: 'Required to execute this hardware command on the target phone.'
    };
    const IconComp = config.icon;
    const finalLabel = permissionLabel || config.label;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[430px] bg-[#0f1115] rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] border border-amber-500/40 overflow-hidden animate-in zoom-in-95 duration-100"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                {/* 3D Amber Pod Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.3)] mx-auto mb-4">
                    <ShieldAlert size={28} />
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        <span>Permission Restricted</span>
                    </div>

                    <h3 className="font-black text-lg sm:text-xl text-amber-400 tracking-tight mb-2">
                        Hardware Permission Required
                    </h3>

                    {/* Target Device & Permission Pill */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-semibold text-white/80">
                            <Smartphone size={13} className="text-orange-400" />
                            <span className="truncate max-w-[150px]">{deviceName}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
                            <IconComp size={13} className="text-amber-400" />
                            <span>{finalLabel}</span>
                        </div>
                    </div>

                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                        The requested action requires <strong className="text-amber-300">{finalLabel}</strong>, which is currently disabled on the target device.
                        <span className="block mt-2 text-white/60 text-xs">
                            {config.hint}
                        </span>
                    </p>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-left mb-6">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1 font-bold">
                            Resolution Instructions:
                        </div>
                        <div className="text-xs text-white/80 leading-relaxed font-mono">
                            Grant this permission manually under <span className="text-amber-300 font-bold">Settings &gt; Apps &gt; Permissions</span> on the target Android phone.
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                    {onProbePermissions && (
                        <button
                            type="button"
                            onClick={onProbePermissions}
                            disabled={isProbing}
                            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-mono font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <RefreshCw size={13} className={isProbing ? 'animate-spin' : ''} />
                            <span>{isProbing ? 'Probing...' : 'Probe Device'}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className={`py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/90 font-mono font-bold text-xs transition-all cursor-pointer ${onProbePermissions ? '' : 'w-full'}`}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
