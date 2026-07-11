"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <AnimatePresence>
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md neo-surface rounded-[2rem] border border-red-500/20 shadow-2xl overflow-hidden bg-gradient-to-b from-black/80 to-black/95"
                >
                    {/* Header Glow */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />

                    <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-fg-3 hover:text-white transition-colors z-10">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 pt-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-fg-1 tracking-tight mb-3">Delete Media?</h2>
                        <p className="text-fg-3 mb-8">
                            Are you sure you want to permanently delete <strong className="text-fg-1">{itemCount}</strong> selected {itemCount === 1 ? 'item' : 'items'}? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-xl neo-button font-bold text-fg-2 hover:text-white transition-colors bg-white/5 border border-white/10"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
