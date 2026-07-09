"use client";

interface PlanBadgeProps {
    plan: 'basic' | 'standard' | 'premium';
    onClick?: () => void;
}

const config = {
    basic: {
        label: 'BASIC',
        className: 'plan-badge plan-badge-basic',
    },
    standard: {
        label: 'STD',
        className: 'plan-badge plan-badge-standard',
    },
    premium: {
        label: 'PRO',
        className: 'plan-badge plan-badge-premium',
    },
};

export default function PlanBadge({ plan, onClick }: PlanBadgeProps) {
    const { label, className } = config[plan] || config.basic;
    return (
        <button
            className={className}
            aria-label={`${plan} plan — click to manage`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {label}
        </button>
    );
}
