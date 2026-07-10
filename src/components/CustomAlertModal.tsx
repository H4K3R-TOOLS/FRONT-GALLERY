"use client";

interface CustomAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
}

const typeConfig = {
    error: {
        bg: 'rgba(244,63,94,0.10)',
        border: 'rgba(244,63,94,0.25)',
        iconBg: 'rgba(244,63,94,0.15)',
        iconColor: '#f43f5e',
        btnBg: '#f43f5e',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
        ),
    },
    warning: {
        bg: 'rgba(245,158,11,0.10)',
        border: 'rgba(245,158,11,0.25)',
        iconBg: 'rgba(245,158,11,0.15)',
        iconColor: '#f59e0b',
        btnBg: '#f59e0b',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" />
            </svg>
        ),
    },
    success: {
        bg: 'rgba(16,185,129,0.10)',
        border: 'rgba(16,185,129,0.25)',
        iconBg: 'rgba(16,185,129,0.15)',
        iconColor: '#10b981',
        btnBg: '#10b981',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
    info: {
        bg: 'rgba(34,211,238,0.10)',
        border: 'rgba(34,211,238,0.25)',
        iconBg: 'rgba(34,211,238,0.15)',
        iconColor: '#22d3ee',
        btnBg: '#22d3ee',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
        ),
    },
};

export default function CustomAlertModal({ isOpen, onClose, title, message, type = 'error' }: CustomAlertModalProps) {
    if (!isOpen) return null;
    const cfg = typeConfig[type];

    return (
        <div
            className="animate-fadeIn"
            style={{
                position: 'fixed', inset: 0, zIndex: 5000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(6,11,26,0.80)', backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)', padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                className="animate-scaleIn"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 400,
                    background: 'var(--bg-surface)',
                    border: `1px solid ${cfg.border}`,
                    borderRadius: '1.5rem',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 52, height: 52, borderRadius: '1rem',
                    background: cfg.iconBg, border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.iconColor, marginBottom: '1.25rem',
                }}>
                    {cfg.icon}
                </div>

                <h3 style={{
                    fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em',
                    color: 'var(--text-primary)', marginBottom: '0.5rem',
                }}>
                    {title}
                </h3>
                <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.875rem',
                    lineHeight: 1.6, marginBottom: '1.5rem',
                }}>
                    {message}
                </p>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '0.75rem',
                        background: cfg.btnBg, color: '#fff',
                        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                        borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                        transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
