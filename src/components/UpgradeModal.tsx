"use client";

import { Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard';
}

const FEATURES = [
    'Unlimited Photos & Videos',
    'Camera & Live Microphone',
    'SMS & Contacts Sync',
    'Notification Reader',
    'ZIP & Bulk Download',
    'All Tools Unlocked',
    'Up to 10 Devices',
];

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[700] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-[#131417] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center bg-emerald-500/5 border-b border-emerald-500/10 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
                        <Zap size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-[10px] font-black tracking-[0.15em] uppercase text-emerald-400 mb-1">Standard Plan Required</p>
                    <h2 className="text-lg font-bold text-white tracking-tight">{feature}</h2>
                    <p className="text-xs text-white/40 mt-1">Upgrade to unlock this feature</p>
                </div>

                <div className="p-5">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-5">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-3">Standard includes</p>
                        <div className="space-y-2.5">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <Check size={13} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-xs text-white/60">{f}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-baseline gap-1">
                            <span className="text-xl font-black text-white">$5</span>
                            <span className="text-xs text-white/30">/ year</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            Not now
                        </button>
                        <a
                            href={`https://wa.me/923460257488?text=${encodeURIComponent('⚡ *Upgrade Request*\n\nI want to upgrade to the Standard plan ($5/year) for Gallery Eye.\n\nPlease process my request! 🙏')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-white text-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                        >
                            <Zap size={14} /> Upgrade
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
