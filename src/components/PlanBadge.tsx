"use client";

import React from 'react';
import { Shield, Zap, Crown, Building2, Sparkles } from 'lucide-react';

interface PlanBadgeProps {
    plan?: 'basic' | 'standard' | 'premium' | 'enterprise';
    onClick?: () => void;
}

const config = {
    basic: {
        label: 'Free Starter',
        icon: Shield,
        badgeStyle: 'bg-[#16181e] border-white/15 text-zinc-300 shadow-md hover:border-white/30',
        iconPod: 'bg-white/5 border-white/10 text-zinc-400',
        dot: 'bg-zinc-400',
    },
    standard: {
        label: 'Standard Pro',
        icon: Zap,
        badgeStyle: 'bg-[#0f1a15] border-emerald-500/40 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:border-emerald-500/70',
        iconPod: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
        dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse',
    },
    premium: {
        label: 'Premium Elite',
        icon: Crown,
        badgeStyle: 'bg-[#1c180e] border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-400',
        iconPod: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse',
    },
    enterprise: {
        label: 'Enterprise VIP',
        icon: Building2,
        badgeStyle: 'bg-[#181022] border-purple-500/50 text-purple-300 shadow-[0_0_22px_rgba(168,85,247,0.35)] hover:border-purple-400',
        iconPod: 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        dot: 'bg-purple-400 shadow-[0_0_8px_#a855f7] animate-pulse',
    },
};

export default function PlanBadge({ plan = 'basic', onClick }: PlanBadgeProps) {
    const active = config[plan] || config.basic;
    const Icon = active.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            aria-label={`${plan} subscription plan tier`}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${active.badgeStyle} ${
                onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
            }`}
        >
            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${active.iconPod}`}>
                <Icon size={11} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                {active.label}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active.dot}`} />
        </button>
    );
}
