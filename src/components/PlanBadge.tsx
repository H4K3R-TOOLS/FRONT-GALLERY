"use client";

interface PlanBadgeProps {
    plan: 'basic' | 'standard' | 'premium';
    onClick?: () => void;
}

export default function PlanBadge({ plan, onClick }: PlanBadgeProps) {
    const getStyles = () => {
        switch (plan) {
            case 'premium':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                    icon: '👑'
                };
            case 'standard':
                return {
                    bg: 'bg-gradient-to-r from-purple-500 to-blue-500',
                    icon: '⭐'
                };
            default:
                return {
                    bg: 'bg-white/20',
                    icon: '🆓'
                };
        }
    };

    const styles = getStyles();

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center w-7 h-7 md:w-auto md:h-auto md:px-2.5 md:py-1 rounded-full text-xs font-semibold hover:scale-105 transition-transform ${styles.bg} ${onClick ? 'cursor-pointer' : ''}`}
            title={`${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Click to view plans`}
        >
            <span className="text-sm">{styles.icon}</span>
        </button>
    );
}
