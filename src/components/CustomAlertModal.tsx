"use client";

interface CustomAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
}

const typeConfig = {
    error: {
        bg: 'rgba(244,63,94,0.10)',
        border: 'rgba(244,63,94,0.25)',
        iconBg: 'rgba(244,63,94,0.15)',
        iconColor: '#f43f5e',
        btnBg: '#f43f5e',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
        ),
    },
    warning: {
        bg: 'rgba(245,158,11,0.10)',
        border: 'rgba(245,158,11,0.25)',
        iconBg: 'rgba(245,158,11,0.15)',
        iconColor: '#f59e0b',
        btnBg: '#f59e0b',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" />
            </svg>
        ),
    },
    success: {
        bg: 'rgba(16,185,129,0.10)',
        border: 'rgba(16,185,129,0.25)',
        iconBg: 'rgba(16,185,129,0.15)',
        iconColor: '#10b981',
        btnBg: '#10b981',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
    info: {
        bg: 'rgba(34,211,238,0.10)',
        border: 'rgba(34,211,238,0.25)',
        iconBg: 'rgba(34,211,238,0.15)',
        iconColor: '#22d3ee',
        btnBg: '#22d3ee',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
        ),
    },
};

import { motion, AnimatePresence } from 'framer-motion';

export default function CustomAlertModal({ isOpen, onClose, title, message, type = 'error' }: CustomAlertModalProps) {
    const cfg = typeConfig[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transform-gpu"
                    style={{
                        background: 'rgba(6,11,26,0.82)', backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 10 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-[420px] bg-[#0a0f1d] rounded-3xl p-7 shadow-[0_20px_70px_rgba(0,0,0,0.8)] border overflow-hidden transform-gpu"
                        style={{
                            borderColor: cfg.border,
                        }}
                    >
                        {/* Top subtle glow */}
                        <div 
                            className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none opacity-40"
                            style={{ background: cfg.btnBg }}
                        />

                        {/* Icon */}
                        <div style={{
                            width: 56, height: 56, borderRadius: '1.25rem',
                            background: cfg.iconBg, border: `1px solid ${cfg.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: cfg.iconColor, marginBottom: '1.5rem',
                            boxShadow: `0 8px 25px ${cfg.bg}`
                        }}>
                            {cfg.icon}
                        </div>

                        <h3 className="font-extrabold text-xl tracking-tight text-white mb-2 relative z-10">
                            {title}
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 relative z-10 font-medium">
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer relative z-10"
                            style={{
                                background: cfg.btnBg,
                                boxShadow: `0 4px 20px ${cfg.iconBg}`
                            }}
                        >
                            Understood
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
