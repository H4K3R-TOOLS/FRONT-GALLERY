"use client";

import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
}

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    itemCount
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-sm bg-[#0f1115] border border-rose-500/30 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-center animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer z-10"
                >
                    <X size={14} />
                </button>

                {/* 3D Icon Pod */}
                <div className="clay-icon-pod w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center text-rose-400 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                    <Trash2 size={26} />
                </div>
                
                {/* Tag */}
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-400/80 mb-1">
                    Permanent Deletion
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight mb-2">
                    Delete Selected Media?
                </h2>

                {/* Message */}
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                    Are you sure you want to permanently remove <strong className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">{itemCount}</strong> selected {itemCount === 1 ? 'item' : 'items'}? This operation cannot be reversed.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-[#16181d] border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-mono font-bold text-xs transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider text-white transition-all bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-rose-400/50"
                    >
                        <Trash2 size={13} />
                        <span>Confirm Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
