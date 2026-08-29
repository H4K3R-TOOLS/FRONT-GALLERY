"use client";

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface CustomAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
}

const typeConfig = {
    error: {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        glow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
        color: 'text-rose-400',
        btnClass: 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)] text-white',
        icon: AlertCircle,
        label: 'System Error',
    },
    warning: {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
        color: 'text-amber-400',
        btnClass: 'bg-amber-500 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-black font-black',
        icon: AlertTriangle,
        label: 'Security Notice',
    },
    success: {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
        color: 'text-emerald-400',
        btnClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-black font-black',
        icon: CheckCircle2,
        label: 'Operation Success',
    },
    info: {
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/40',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
        color: 'text-cyan-400',
        btnClass: 'bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-black font-black',
        icon: Info,
        label: 'Information',
    },
};

export default function CustomAlertModal({ isOpen, onClose, title, message, type = 'error' }: CustomAlertModalProps) {
    if (!isOpen) return null;
    const cfg = typeConfig[type] || typeConfig.error;
    const Icon = cfg.icon;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-sm bg-[#0f1115] border border-white/15 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-center animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
                >
                    <X size={14} />
                </button>

                {/* 3D Icon Pod */}
                <div className={`clay-icon-pod w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${cfg.color} ${cfg.border} ${cfg.glow}`}>
                    <Icon size={30} />
                </div>

                {/* Subtitle Badge */}
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40 mb-1">
                    {cfg.label}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className={`w-full py-3 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${cfg.btnClass}`}
                >
                    Acknowledge
                </button>
            </div>
        </div>
    );
}
