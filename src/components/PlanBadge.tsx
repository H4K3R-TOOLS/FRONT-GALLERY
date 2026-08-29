"use client";

import React from 'react';
import { Shield, Zap, Crown, Building2 } from 'lucide-react';

interface PlanBadgeProps {
    plan?: 'basic' | 'standard' | 'premium' | 'enterprise';
    onClick?: () => void;
}

const config = {
    basic: {
        label: 'FREE STARTER',
        icon: Shield,
        className: 'clay-capsule px-3.5 py-1.5 rounded-full text-zinc-300 font-mono font-black text-[11px] tracking-wider uppercase border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95',
        iconColor: 'text-zinc-400',
    },
    standard: {
        label: 'STANDARD PRO',
        icon: Zap,
        className: 'clay-pill-emerald px-3.5 py-1.5 rounded-full text-emerald-300 font-mono font-black text-[11px] tracking-wider uppercase border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95',
        iconColor: 'text-emerald-400',
    },
    premium: {
        label: 'PREMIUM ELITE',
        icon: Crown,
        className: 'clay-pill-amber px-3.5 py-1.5 rounded-full text-amber-300 font-mono font-black text-[11px] tracking-wider uppercase border border-amber-500/50 shadow-[0_0_22px_rgba(245,158,11,0.45)] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95',
        iconColor: 'text-amber-400',
    },
    enterprise: {
        label: 'ENTERPRISE VIP',
        icon: Building2,
        className: 'clay-capsule px-3.5 py-1.5 rounded-full text-purple-300 font-mono font-black text-[11px] tracking-wider uppercase border border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 shadow-[0_0_25px_rgba(147,51,234,0.4)] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95',
        iconColor: 'text-purple-400',
    },
};

export default function PlanBadge({ plan = 'basic', onClick }: PlanBadgeProps) {
    const { label, className, icon: Icon, iconColor } = config[plan] || config.basic;
    return (
        <button
            type="button"
            className={className}
            aria-label={`${plan} plan — click to manage`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <Icon size={13} className={iconColor} />
            <span>{label}</span>
        </button>
    );
}
