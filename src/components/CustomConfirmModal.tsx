"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

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
            icon: AlertCircle,
            color: 'text-rose-400',
            border: 'border-rose-500/40',
            glow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
            confirmBtn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]',
            tag: 'Destructive Action'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-400',
            border: 'border-amber-500/40',
            glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]',
            tag: 'Security Warning'
        },
        info: {
            icon: Info,
            color: 'text-cyan-400',
            border: 'border-cyan-500/40',
            glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
            confirmBtn: 'bg-cyan-500 hover:bg-cyan-600 text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.4)]',
            tag: 'Confirmation Required'
        }
    };

    const cfg = typeConfig[type] || typeConfig.info;
    const Icon = cfg.icon;

    return (
        <div 
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
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
                    <Icon size={28} />
                </div>

                {/* Tag */}
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40 mb-1">
                    {cfg.tag}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6 whitespace-pre-line">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-[#16181d] border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-mono font-bold text-xs transition-all cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${cfg.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
