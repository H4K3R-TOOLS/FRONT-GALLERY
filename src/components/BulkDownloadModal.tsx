"use client";

import React, { useState } from 'react';
import { DownloadCloud, Folder, CheckCircle, AlertCircle, X, Crown, RefreshCw, Mail, Clock, Archive } from 'lucide-react';

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
                setMessage(data.message || 'Processing started! Download link will be sent to your email.');
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
            icon: <Archive size={14} className="text-emerald-400" />,
            label: 'All folder photos & videos compressed to ZIP archive',
        },
        {
            icon: <Mail size={14} className="text-emerald-400" />,
            label: 'Direct cloud download link delivered to registered email',
        },
        {
            icon: <Clock size={14} className="text-amber-400" />,
            label: 'Background compression takes ~2 to 10 minutes',
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[550] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[420px] bg-[#0f1115] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] overflow-hidden animate-in zoom-in-95 duration-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer z-10"
                >
                    <X size={15} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center text-orange-400 border-orange-500/40">
                        <DownloadCloud size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-base sm:text-lg text-white">Bulk Folder Extraction</h3>
                        <p className="text-[11px] font-mono text-white/40">Compressed Cloud Archive</p>
                    </div>
                </div>

                {!isPremium ? (
                    /* Upgrade Gate */
                    <div className="text-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                            <Crown size={26} />
                        </div>
                        <h4 className="font-black text-base text-white mb-1">
                            Premium Plan Required
                        </h4>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-5 font-medium">
                            Bulk ZIP download is an exclusive feature. Upgrade your plan to export full media archives.
                        </p>
                        <button
                            onClick={onClose}
                            className="clay-cta-button w-full py-3 rounded-2xl font-mono font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                        >
                            Upgrade to Premium
                        </button>
                    </div>
                ) : status === 'queued' ? (
                    /* Queued Success */
                    <div className="text-center py-3 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <CheckCircle size={26} />
                        </div>
                        <h4 className="font-black text-emerald-400 text-base">Extraction Queued!</h4>
                        <p className="text-xs text-zinc-300 bg-[#16181d] border border-white/10 p-3 rounded-xl leading-relaxed">{message}</p>
                        <p className="text-[11px] font-mono text-white/40">
                            You can safely close this modal. Cloud worker is packaging your files.
                        </p>
                    </div>
                ) : status === 'error' ? (
                    /* Error */
                    <div className="text-center py-3 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                            <AlertCircle size={26} />
                        </div>
                        <h4 className="font-black text-rose-400 text-base">Extraction Interrupted</h4>
                        <p className="text-xs text-zinc-300 bg-[#16181d] border border-white/10 p-3 rounded-xl">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="clay-capsule w-full py-2.5 rounded-xl font-mono font-bold text-xs text-white hover:text-orange-300 cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    /* Idle */
                    <div className="space-y-4">
                        {/* Target Folder Badge */}
                        <div className="bg-[#16181d] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                                <Folder size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-black text-white font-mono truncate">{folderName}</div>
                                <div className="text-[10px] font-mono text-white/40">Target storage directory</div>
                            </div>
                        </div>

                        {/* Info List */}
                        <div className="space-y-2 bg-[#16181d] border border-white/10 p-3.5 rounded-2xl">
                            {infoRows.map((row, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                                        {row.icon}
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-300">{row.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Trigger Button */}
                        <button
                            type="button"
                            onClick={handleBulkDownload}
                            disabled={isLoading}
                            className="clay-cta-button w-full py-3 rounded-2xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Packaging Request...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadCloud size={15} />
                                    <span>Dispatch Archive Job</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
