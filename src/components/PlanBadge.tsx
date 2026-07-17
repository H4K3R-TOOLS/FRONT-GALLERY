"use client";

interface PlanBadgeProps {
    plan?: 'basic' | 'standard' | 'premium';
    onClick?: () => void;
}

const config = {
    basic: {
        label: '✨ FREE PLAN',
        className: 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-zinc-300 font-bold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-zinc-700 shadow-[0_0_12px_rgba(255,255,255,0.1)] flex items-center justify-center gap-1.5 transition-transform hover:scale-105',
    },
    standard: {
        label: '⭐ STANDARD',
        className: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-black font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.65)] flex items-center justify-center gap-1.5 transition-transform hover:scale-105',
    },
    premium: {
        label: '👑 PREMIUM',
        className: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-extrabold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full border border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-center gap-1.5 transition-transform hover:scale-105 animate-pulse-soft',
    },
};

export default function PlanBadge({ plan = 'basic', onClick }: PlanBadgeProps) {
    const { label, className } = config[plan] || config.basic;
    return (
        <button
            type="button"
            className={className}
            aria-label={`${plan} plan — click to manage`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {label}
        </button>
    );
}
