"use client";

import React from 'react';
import { Crown, Zap, Shield, Building2 } from 'lucide-react';

interface PlanBadgeProps {
    plan?: 'basic' | 'standard' | 'premium' | 'enterprise';
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

const config = {
    basic: {
        label: 'Free Tier',
        shortLabel: 'Free',
        icon: Shield,
        className: 'clay-capsule text-zinc-300 border-white/10 hover:border-white/20 shadow-md',
        iconColor: 'text-zinc-400',
        glowColor: 'bg-zinc-500/10'
    },
    standard: {
        label: 'Standard',
        shortLabel: 'Std',
        icon: Zap,
        className: 'bg-emerald-500/15 border-2 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5)]',
        iconColor: 'text-emerald-400',
        glowColor: 'bg-emerald-500/20'
    },
    premium: {
        label: 'Premium VIP',
        shortLabel: 'Pro',
        icon: Crown,
        className: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/80 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_28px_rgba(245,158,11,0.65)] animate-pulse-soft',
        iconColor: 'text-amber-400',
        glowColor: 'bg-amber-500/20'
    },
    enterprise: {
        label: 'Enterprise',
        shortLabel: 'Enterprise',
        icon: Building2,
        className: 'bg-gradient-to-r from-purple-600/25 via-violet-500/20 to-indigo-600/25 border-2 border-purple-400/80 text-purple-200 shadow-[0_0_22px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] animate-pulse-soft',
        iconColor: 'text-purple-300',
        glowColor: 'bg-purple-500/20'
    },
};

export default function PlanBadge({ plan = 'basic', onClick, size = 'md' }: PlanBadgeProps) {
    const item = config[plan] || config.basic;
    const Icon = item.icon;

    const sizeClasses = {
        sm: 'px-2.5 py-1 text-[10px] gap-1 rounded-lg',
        md: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
        lg: 'px-5 py-2 text-sm gap-2 rounded-2xl'
    }[size];

    const iconSizes = {
        sm: 11,
        md: 13,
        lg: 16
    }[size];

    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center font-mono font-black tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-95 ${sizeClasses} ${item.className}`}
            aria-label={`${plan} plan — click to manage`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <Icon size={iconSizes} className={item.iconColor} />
            <span>{item.label}</span>
        </button>
    );
}
