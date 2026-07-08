"use client";

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'standard' | 'premium';
    userEmail: string;
    userUuid: string;
}

const plans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 'Free',
        period: 'forever',
        accent: '#4d5a72',
        accentDim: 'rgba(77,90,114,0.12)',
        accentBorder: 'rgba(77,90,114,0.25)',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        features: [
            { label: '1 device', available: true },
            { label: '50 photos sync', available: true },
            { label: 'Basic gallery view', available: true },
            { label: 'SMS & contacts', available: false },
            { label: 'Hidden features', available: false },
        ],
    },
    {
        id: 'standard',
        name: 'Standard',
        price: '$5',
        period: 'per year',
        accent: '#5b5ef4',
        accentDim: 'rgba(91,94,244,0.12)',
        accentBorder: 'rgba(91,94,244,0.30)',
        recommended: false,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        features: [
            { label: '7 devices', available: true },
            { label: '200 photos sync', available: true },
            { label: 'SMS & contacts access', available: true },
            { label: 'Hide app icon', available: true },
            { label: 'Flashlight & vibration', available: true },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$10',
        period: 'per year',
        accent: '#f59e0b',
        accentDim: 'rgba(245,158,11,0.12)',
        accentBorder: 'rgba(245,158,11,0.30)',
        recommended: true,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        features: [
            { label: '20 devices', available: true },
            { label: 'Unlimited photos & videos', available: true },
            { label: 'Bulk ZIP download', available: true },
            { label: 'Hidden camera & live audio', available: true },
            { label: 'All features unlocked', available: true },
        ],
    },
];

export default function PlansModal({ isOpen, onClose, currentPlan, userEmail, userUuid }: PlansModalProps) {
    if (!isOpen) return null;

    const generateWhatsAppLink = (planName: string, price: string) => {
        const msg = `Hello, I want to upgrade to ${planName} Plan (${price}).\n\nMy Email: ${userEmail}\nMy UUID: ${userUuid}`;
        return `https://wa.me/923460257488?text=${encodeURIComponent(msg)}`;
    };

    const isUpgradeable = (planId: string) => {
        if (currentPlan === 'basic') return planId === 'standard' || planId === 'premium';
        if (currentPlan === 'standard') return planId === 'premium';
        return false;
    };

    return (
        <div
            className="animate-fadeIn"
            style={{
                position: 'fixed', inset: 0, zIndex: 600,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                background: 'rgba(6,11,26,0.90)', backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={onClose}
        >
            <div
                className="animate-slideUp"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 900,
                    maxHeight: '92dvh',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-normal)',
                    borderRadius: '1.75rem 1.75rem 0 0',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem 1.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                }}>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                            Choose your plan
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                            Active plan: <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>{currentPlan}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 36, height: 36, borderRadius: '0.625rem',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Plans grid */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                    alignContent: 'start',
                }}>
                    {plans.map((plan) => {
                        const isActive = currentPlan === plan.id;
                        const canUpgrade = isUpgradeable(plan.id);
                        const isPast = !isActive && !canUpgrade;

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    position: 'relative',
                                    borderRadius: '1.25rem',
                                    border: `1px solid ${isActive ? '#10b981' + '50' : plan.recommended && !isActive ? plan.accentBorder : 'var(--border-subtle)'}`,
                                    background: isActive ? 'rgba(16,185,129,0.06)' : plan.recommended && !isPast ? plan.accentDim : 'var(--bg-elevated)',
                                    padding: '1.25rem',
                                    opacity: isPast ? 0.45 : 1,
                                    display: 'flex', flexDirection: 'column',
                                    boxShadow: plan.recommended && !isPast && !isActive ? `0 0 0 1px ${plan.accent}40, 0 8px 24px ${plan.accent}15` : 'none',
                                    transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1)',
                                }}
                            >
                                {/* Recommended badge */}
                                {plan.recommended && !isActive && canUpgrade && (
                                    <div style={{
                                        position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                                        background: plan.accent, color: '#000',
                                        fontFamily: "'Space Grotesk', monospace",
                                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
                                        textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 9999,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                {/* Active badge */}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', top: '-11px', left: '1rem',
                                        background: 'var(--bg-surface)', border: '1px solid rgba(16,185,129,0.4)',
                                        color: '#10b981', borderRadius: 9999,
                                        fontFamily: "'Space Grotesk', monospace",
                                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
                                        textTransform: 'uppercase', padding: '0.2rem 0.625rem',
                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse-online 2s infinite', display: 'inline-block' }} />
                                        Active
                                    </div>
                                )}

                                {/* Icon + Name */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '0.625rem',
                                            background: isActive ? 'rgba(16,185,129,0.15)' : plan.accentDim,
                                            border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : plan.accentBorder}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isActive ? '#10b981' : plan.accent, flexShrink: 0,
                                        }}>
                                            {plan.icon}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                            {plan.name}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontFamily: "'Space Grotesk', monospace",
                                            fontWeight: 700, fontSize: '1.375rem',
                                            color: isActive ? '#10b981' : plan.recommended ? plan.accent : 'var(--text-primary)',
                                            lineHeight: 1,
                                        }}>
                                            {plan.price}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.125rem' }}>
                                            {plan.period}
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    {plan.features.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {f.available ? (
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <circle cx="7" cy="7" r="6.5" stroke={isActive ? '#10b981' : plan.accent} strokeOpacity="0.4" />
                                                    <path d="M4.5 7l2 2 3-3" stroke={isActive ? '#10b981' : plan.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <circle cx="7" cy="7" r="6.5" stroke="var(--text-muted)" strokeOpacity="0.3" />
                                                    <path d="M5 5l4 4M9 5l-4 4" stroke="var(--text-muted)" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
                                                </svg>
                                            )}
                                            <span style={{
                                                fontSize: '0.8125rem',
                                                color: f.available ? 'var(--text-secondary)' : 'var(--text-muted)',
                                            }}>
                                                {f.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {isActive ? (
                                    <div style={{
                                        padding: '0.625rem', textAlign: 'center',
                                        background: 'rgba(16,185,129,0.10)',
                                        border: '1px solid rgba(16,185,129,0.25)',
                                        borderRadius: '0.75rem',
                                        color: '#10b981', fontWeight: 600, fontSize: '0.875rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2.5 7l3 3 6-6" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Current plan
                                    </div>
                                ) : canUpgrade ? (
                                    <a
                                        href={generateWhatsAppLink(plan.name, plan.price)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                            padding: '0.75rem', borderRadius: '0.75rem',
                                            background: plan.accent, color: plan.id === 'premium' ? '#000' : '#fff',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), opacity 0.2s',
                                            boxShadow: `0 4px 16px ${plan.accent}35`,
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        Upgrade to {plan.name}
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                ) : (
                                    <div style={{
                                        padding: '0.625rem', textAlign: 'center',
                                        background: 'var(--bg-overlay)', borderRadius: '0.75rem',
                                        color: 'var(--text-muted)', fontSize: '0.8125rem',
                                    }}>
                                        Included
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer note */}
                <div style={{
                    padding: '1rem 1.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    flexShrink: 0,
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Upgrades processed via WhatsApp · Contact us for enterprise plans
                    </p>
                </div>
            </div>
        </div>
    );
}
