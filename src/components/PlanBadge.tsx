"use client";

interface PlanBadgeProps {
    plan: 'basic' | 'standard' | 'premium';
    onClick?: () => void;
}

const config = {
    basic: {
        label: 'FREE',
        className: 'plan-badge plan-badge-basic',
    },
    standard: {
        label: 'STANDARD',
        className: 'plan-badge plan-badge-standard',
    },
};

export default function PlanBadge({ plan, onClick }: PlanBadgeProps) {
    const p = (plan === 'standard' || (plan as string) === 'premium') ? 'standard' : 'basic';
    const { label, className } = config[p];
    return (
        <button
            className={className}
            aria-label={`${p} plan — click to manage`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {label}
        </button>
    );
}
