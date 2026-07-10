"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Package, CloudUpload, CheckCircle, AlertCircle, X, Loader2, DownloadCloud } from 'lucide-react';

interface ZipProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: 'creating' | 'uploading' | 'ready' | 'error';
    current: number;
    total: number;
    folderName: string;
    downloadUrl?: string;
    error?: string;
    onCancel?: () => void;
}

const stageConfig = {
    creating: {
        color: 'text-accent',
        bg: 'bg-accent/20',
        border: 'border-accent/30',
        label: 'Creating archive',
        sub: 'Compressing files...',
        icon: <Package className="w-8 h-8 text-accent" />,
    },
    uploading: {
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/20',
        border: 'border-indigo-500/30',
        label: 'Uploading to cloud',
        sub: 'Almost there...',
        icon: <CloudUpload className="w-8 h-8 text-indigo-400" />,
    },
    ready: {
        color: 'text-success',
        bg: 'bg-success/20',
        border: 'border-success/30',
        label: 'Ready to download',
        sub: 'Your ZIP is ready',
        icon: <CheckCircle className="w-8 h-8 text-success" />,
    },
    error: {
        color: 'text-danger',
        bg: 'bg-danger/20',
        border: 'border-danger/30',
        label: 'Something went wrong',
        sub: 'Please try again',
        icon: <AlertCircle className="w-8 h-8 text-danger" />,
    },
};

export default function ZipProgressModal({ isOpen, onClose, stage, current, total, folderName, downloadUrl, error, onCancel }: ZipProgressModalProps) {
    if (!isOpen) return null;

    const cfg = stageConfig[stage];
    const progress = total > 0 ? Math.round((current / total) * 100) : 0;
    const isInProgress = stage === 'creating' || stage === 'uploading';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm neo-surface rounded-[2rem] border border-white/10 shadow-2xl p-8 text-center overflow-hidden"
                >
                    {/* Header Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />

                    {/* Close / Cancel Button */}
                    {isInProgress ? (
                        <button
                            onClick={() => {
                                if (onCancel) onCancel();
                                onClose();
                            }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors z-10 shadow-inner"
                            title="Cancel"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-fg-2 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border shadow-inner ${cfg.bg} ${cfg.border}`}>
                        {cfg.icon}
                    </div>

                    {/* Stage label */}
                    <h3 className="text-xl font-bold text-fg-1 mb-1 tracking-tight">
                        {cfg.label}
                    </h3>
                    <p className="text-sm font-semibold text-accent/80 mb-6 px-3 py-1 bg-accent/10 inline-block rounded-full border border-accent/20">
                        {folderName}
                    </p>

                    {/* Progress bar */}
                    {isInProgress && (
                        <div className="mt-2 mb-6">
                            <div className="h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden relative shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute top-0 left-0 h-full bg-accent rounded-full shadow-accent-glow"
                                />
                            </div>
                            <div className="flex justify-between items-center mt-3 text-sm font-semibold">
                                <span className="text-fg-3">{cfg.sub}</span>
                                <span className="text-accent">{progress}%</span>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {stage === 'error' && (
                        <div className="mt-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
                            {error || 'An unexpected error occurred.'}
                        </div>
                    )}

                    {/* Download Button */}
                    {stage === 'ready' && downloadUrl && (
                        <a
                            href={downloadUrl}
                            download
                            onClick={onClose}
                            className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-success text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-success-glow"
                        >
                            <DownloadCloud className="w-5 h-5" /> Download ZIP
                        </a>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
