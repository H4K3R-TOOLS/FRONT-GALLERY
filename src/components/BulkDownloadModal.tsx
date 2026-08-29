"use client";

import React, { useState } from 'react';
import { Package, Download, Mail, Clock, CheckCircle2, AlertCircle, X, ArrowUpRight } from 'lucide-react';

interface BulkDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderName: string;
    userPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
    userUuid: string;
    onSuccess: (message: string) => void;
}

export default function BulkDownloadModal({
    isOpen,
    onClose,
    folderName,
    userPlan,
    userUuid,
    onSuccess
}: BulkDownloadModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'queued' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const isPremium = userPlan === 'premium' || userPlan === 'enterprise';

    const handleBulkDownload = async () => {
        if (!isPremium) return;
        setIsLoading(true);
        setStatus('idle');
        try {
            const response = await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/bulk-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid: userUuid, folderName })
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('queued');
                setMessage(data.message || 'Processing started! Check your email.');
                onSuccess(data.message);
                setTimeout(() => { onClose(); setStatus('idle'); }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || data.error || 'Failed to start download');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const infoRows = [
        {
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/30',
            icon: Package,
            label: 'All photos & videos compressed to ZIP',
        },
        {
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/30',
            icon: Mail,
            label: 'Download link sent directly to email',
        },
        {
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/30',
            icon: Clock,
            label: 'Background processing takes 2–10 minutes',
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[550] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm bg-[#0f1115] border border-white/15 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-center animate-in zoom-in-95 duration-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
                >
                    <X size={14} />
                </button>

                {/* Header Icon */}
                <div className="clay-icon-pod w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center text-orange-400 border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                    <Download size={26} />
                </div>

                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-400 mb-1">
                    Batch Export
                </div>

                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mb-2">
                    Bulk Folder Download
                </h3>

                {!isPremium ? (
                    /* Upgrade gate */
                    <div className="space-y-4 pt-1">
                        <p className="text-xs text-white/70 font-sans leading-relaxed">
                            Bulk ZIP download is an exclusive feature for <strong className="text-amber-400">Premium</strong> and <strong className="text-purple-400">Enterprise</strong> tiers.
                        </p>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 font-mono text-xs font-bold">
                            📦 Download whole folders in one click
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>Upgrade to Unlock</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                ) : status === 'queued' ? (
                    /* Success */
                    <div className="py-3 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-emerald-400">Processing Started</h4>
                        <p className="text-xs text-white/70">{message}</p>
                        <p className="text-[10px] text-white/40 font-mono pt-2">
                            Check your inbox in a few minutes.
                        </p>
                    </div>
                ) : status === 'error' ? (
                    /* Error */
                    <div className="py-3 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-rose-400">Request Failed</h4>
                        <p className="text-xs text-white/70">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    /* Idle */
                    <div className="space-y-4 pt-1">
                        {/* Target Folder Pill */}
                        <div className="p-3 bg-[#16181d] border border-white/10 rounded-2xl flex items-center gap-3 text-left">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                                <Package size={16} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{folderName}</div>
                                <div className="text-[10px] text-white/40 font-mono">Complete media directory</div>
                            </div>
                        </div>

                        {/* Specs List */}
                        <div className="space-y-2 text-left">
                            {infoRows.map((row, i) => {
                                const RowIcon = row.icon;
                                return (
                                    <div key={i} className="flex items-center gap-2.5 text-xs">
                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${row.bg} ${row.color}`}>
                                            <RowIcon size={13} />
                                        </div>
                                        <span className="text-[11px] text-zinc-300">{row.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action CTA */}
                        <button
                            onClick={handleBulkDownload}
                            disabled={isLoading}
                            className="clay-cta-button w-full py-3 rounded-2xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            {isLoading ? (
                                <span>Queuing Extraction...</span>
                            ) : (
                                <>
                                    <Download size={14} />
                                    <span>Download Entire Folder</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
