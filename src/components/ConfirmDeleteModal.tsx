"use client";

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

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
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100">
            <div 
                className="relative w-full max-w-md bg-[#0f1115] rounded-3xl border border-rose-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.98)] p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-100 text-center"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)]">
                    <AlertTriangle size={26} />
                </div>
                
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2">Delete Selected Media?</h2>
                <p className="text-xs sm:text-sm text-zinc-300 mb-6 bg-[#16181d] border border-white/10 p-3 rounded-2xl leading-relaxed font-medium">
                    Permanently delete <strong className="text-rose-400">{itemCount}</strong> selected {itemCount === 1 ? 'item' : 'items'} from the database? This action cannot be reversed.
                </p>

                <div className="flex gap-2.5">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#16181d] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono font-bold text-xs transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider text-white transition-all bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-rose-400/40"
                    >
                        <Trash2 size={14} /> <span>Confirm Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
