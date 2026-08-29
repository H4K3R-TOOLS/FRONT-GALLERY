"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2, X, HelpCircle } from 'lucide-react';

interface CustomConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function CustomConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Continue',
    cancelText = 'Cancel',
    type = 'info'
}: CustomConfirmModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            border: 'border-rose-500/40',
            iconPod: 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.25)]',
            confirmClass: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]',
            icon: <Trash2 size={24} />,
            accentTitle: 'text-rose-400',
        },
        warning: {
            border: 'border-amber-500/40',
            iconPod: 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
            confirmClass: 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] font-black',
            icon: <AlertTriangle size={24} />,
            accentTitle: 'text-amber-400',
        },
        info: {
            border: 'border-cyan-500/40',
            iconPod: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]',
            confirmClass: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.35)] font-black',
            icon: <HelpCircle size={24} />,
            accentTitle: 'text-cyan-400',
        }
    };

    const cfg = typeConfig[type];

    return (
        <div 
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-100" 
            onClick={onClose}
        >
            <div
                className={`bg-[#0f1115] rounded-3xl p-6 sm:p-7 max-w-md w-full border ${cfg.border} shadow-[0_25px_80px_rgba(0,0,0,0.98)] animate-in zoom-in-95 duration-100 relative overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close X */}
                <button
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                <div className="flex items-center gap-3.5 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${cfg.iconPod}`}>
                        {cfg.icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className={`text-base sm:text-lg font-black tracking-tight ${cfg.accentTitle}`}>{title}</h3>
                        <p className="text-[11px] font-mono text-white/40">Action Confirmation Required</p>
                    </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-medium whitespace-pre-line bg-[#16181d] border border-white/10 p-3.5 rounded-2xl">
                    {message}
                </p>

                <div className="flex gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#16181d] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${cfg.confirmClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
