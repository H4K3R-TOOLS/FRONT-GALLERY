"use client";

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

interface CustomAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
}

const typeConfig = {
    error: {
        border: 'border-rose-500/40',
        iconPod: 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.25)]',
        btnClass: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        icon: <XCircle size={28} />,
        accentTitle: 'text-rose-400',
    },
    warning: {
        border: 'border-amber-500/40',
        iconPod: 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        btnClass: 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] font-black',
        icon: <AlertTriangle size={28} />,
        accentTitle: 'text-amber-400',
    },
    success: {
        border: 'border-emerald-500/40',
        iconPod: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)] font-black',
        icon: <CheckCircle2 size={28} />,
        accentTitle: 'text-emerald-400',
    },
    info: {
        border: 'border-cyan-500/40',
        iconPod: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]',
        btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.35)] font-black',
        icon: <Info size={28} />,
        accentTitle: 'text-cyan-400',
    },
};

export default function CustomAlertModal({ isOpen, onClose, title, message, type = 'error' }: CustomAlertModalProps) {
    if (!isOpen) return null;
    const cfg = typeConfig[type];

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-[400px] bg-[#0f1115] rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] border ${cfg.border} overflow-hidden animate-in zoom-in-95 duration-100`}
            >
                {/* Close X */}
                <button
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                {/* 3D Icon Pod */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border mx-auto mb-4 ${cfg.iconPod}`}>
                    {cfg.icon}
                </div>

                <div className="text-center">
                    <h3 className={`font-black text-lg sm:text-xl tracking-tight mb-2 ${cfg.accentTitle}`}>
                        {title}
                    </h3>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">
                        {message}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className={`w-full py-3 px-6 rounded-2xl font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${cfg.btnClass}`}
                >
                    Acknowledge
                </button>
            </div>
        </div>
    );
}
