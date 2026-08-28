"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CloudUpload, CheckCircle, AlertCircle, X, Download, RefreshCw } from 'lucide-react';

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
        color: 'text-orange-400',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        label: 'Compressing Archive',
        sub: 'Packaging folder files into ZIP...',
        icon: <Package className="w-8 h-8 text-orange-400 animate-pulse" />,
    },
    uploading: {
        color: 'text-amber-400',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        label: 'Streaming to Cloud Vault',
        sub: 'Encrypting and syncing payload...',
        icon: <CloudUpload className="w-8 h-8 text-amber-400 animate-bounce" />,
    },
    ready: {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        label: 'Archive Extraction Ready',
        sub: 'Your ZIP package is ready to download',
        icon: <CheckCircle className="w-8 h-8 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />,
    },
    error: {
        color: 'text-red-400',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        label: 'Sync Interrupted',
        sub: 'Extraction could not complete',
        icon: <AlertCircle className="w-8 h-8 text-red-400" />,
    },
};

export default function ZipProgressModal({ 
    isOpen, 
    onClose, 
    stage, 
    current, 
    total, 
    folderName, 
    downloadUrl, 
    error, 
    onCancel 
}: ZipProgressModalProps) {
    if (!isOpen) return null;

    const cfg = stageConfig[stage] || stageConfig.creating;
    const progress = total > 0 ? Math.round((current / total) * 100) : 0;
    const isInProgress = stage === 'creating' || stage === 'uploading';

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150">
            <div 
                className="clay-card relative w-full max-w-sm p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center overflow-hidden animate-in zoom-in-95 duration-150"
            >
                {/* Close / Cancel Button */}
                {isInProgress ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (onCancel) onCancel();
                            onClose();
                        }}
                        className="clay-card-error absolute top-4 right-4 p-2 rounded-xl text-red-400 hover:text-white transition-colors z-10 cursor-pointer"
                        title="Cancel Extraction"
                    >
                        <X size={16} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="clay-button-sm absolute top-4 right-4 p-2 rounded-xl text-white/60 hover:text-white transition-colors z-10 cursor-pointer"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Stage 3D Icon Pod */}
                <div className="clay-icon-pod w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    {cfg.icon}
                </div>

                {/* Stage Label */}
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-1">
                    {cfg.label}
                </h3>
                <p className="text-xs text-white/40 font-mono mb-6">
                    {error || cfg.sub}
                </p>

                {/* Progress HUD if in progress */}
                {isInProgress && (
                    <div className="space-y-3 mb-6">
                        <div className="clay-coords-badge p-3 rounded-2xl flex items-center justify-between text-xs font-mono font-black">
                            <span className="text-orange-300 flex items-center gap-1.5">
                                <RefreshCw size={12} className="animate-spin text-orange-400" />
                                {folderName || 'Media'}
                            </span>
                            <span className="text-white">
                                {total > 0 ? `${current} / ${total} (${progress}%)` : 'Initializing...'}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_10px_#f97316]"
                                style={{ width: `${Math.max(5, progress)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Ready Action (Download ZIP) */}
                {stage === 'ready' && downloadUrl && (
                    <div className="space-y-3 pt-2">
                        <a
                            href={downloadUrl}
                            download={`${folderName || 'archive'}.zip`}
                            className="clay-cta-button w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(249,115,22,0.5)] transition-transform hover:scale-105 active:scale-95"
                        >
                            <Download size={15} />
                            <span>Download ZIP Archive</span>
                        </a>
                    </div>
                )}

                {/* Error Action */}
                {stage === 'error' && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="clay-capsule w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white hover:text-orange-300 cursor-pointer"
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}
