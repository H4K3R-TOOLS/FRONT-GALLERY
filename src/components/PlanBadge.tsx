"use client";

interface PlanBadgeProps {
    plan: 'basic' | 'standard' | 'premium';
    size?: 'sm' | 'md';
    onClick?: () => void;
}

export default function PlanBadge({ plan, size = 'sm', onClick }: PlanBadgeProps) {
    const getStyles = () => {
        switch (plan) {
            case 'premium':
                return {
                    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                    icon: '👑',
                    text: 'Premium'
                };
            case 'standard':
                return {
                    bg: 'bg-gradient-to-r from-purple-500 to-blue-500',
                    icon: '⭐',
                    text: 'Standard'
                };
            default:
                return {
                    bg: 'bg-white/20',
                    icon: '🆓',
                    text: 'Basic'
                };
        }
    };

    const styles = getStyles();
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-2 py-0.5 gap-1'
        : 'text-xs px-3 py-1 gap-1.5';

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center font-semibold rounded-full hover:scale-105 transition-transform ${styles.bg} ${sizeClasses} ${onClick ? 'cursor-pointer hover:ring-2 ring-white/20' : ''}`}
        >
            <span>{styles.icon}</span>
            <span className="uppercase tracking-wide">{styles.text}</span>
        </button>
    );
}
