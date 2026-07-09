"use client";

interface ZipProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: 'creating' | 'uploading' | 'ready' | 'error';
    current: number;
    total: number;
    folderName: string;
    downloadUrl?: string;
    error?: string;
}

const stageConfig = {
    creating: {
        color: '#10b981',
        dim: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        label: 'Creating archive',
        sub: 'Compressing filesâ€¦',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
        ),
    },
    uploading: {
        color: '#22d3ee',
        dim: 'rgba(34,211,238,0.12)',
        border: 'rgba(34,211,238,0.25)',
        label: 'Uploading to cloud',
        sub: 'Almost thereâ€¦',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
            </svg>
        ),
    },
    ready: {
        color: '#10b981',
        dim: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        label: 'Ready to download',
        sub: 'Your ZIP is ready',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
    },
    error: {
        color: '#f43f5e',
        dim: 'rgba(244,63,94,0.12)',
        border: 'rgba(244,63,94,0.25)',
        label: 'Something went wrong',
        sub: 'Please try again',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
        ),
    },
};

export default function ZipProgressModal({ isOpen, onClose, stage, current, total, folderName, downloadUrl, error }: ZipProgressModalProps) {
    if (!isOpen) return null;

    const cfg = stageConfig[stage];
    const progress = total > 0 ? Math.round((current / total) * 100) : 0;
    const isInProgress = stage === 'creating' || stage === 'uploading';

    return (
        <div
            className="animate-fadeIn"
            style={{
                position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)' as any,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(6,11,26,0.85)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', padding: '1rem',
            }}
        >
            <div
                className="animate-scaleIn"
                style={{
                    width: '100%', maxWidth: 360,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-normal)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative',
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '0.875rem', right: '0.875rem',
                        width: 32, height: 32, borderRadius: '0.5rem',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                <div style={{ padding: '1.75rem', textAlign: 'center' }}>
                    {/* Icon */}
                    <div style={{
                        width: 60, height: 60, borderRadius: '1.125rem', margin: '0 auto 1.25rem',
                        background: cfg.dim, border: `1px solid ${cfg.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cfg.color,
                    }}>
                        {cfg.icon}
                    </div>

                    {/* Stage label */}
                    <h3 style={{
                        fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em',
                        color: 'var(--text-primary)', marginBottom: '0.25rem',
                    }}>
                        {cfg.label}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                        {folderName}
                    </p>

                    {/* Progress bar */}
                    {isInProgress && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <div style={{
                                height: 6, borderRadius: 9999,
                                background: 'var(--bg-elevated)',
                                overflow: 'hidden', marginBottom: '0.625rem',
                            }}>
                                <div style={{
                                    height: '100%', borderRadius: 9999,
                                    background: cfg.color,
                                    width: stage === 'uploading' ? '85%' : `${progress}%`,
                                    transition: 'width 0.5s cubic-bezier(0.32,0.72,0,1)',
                                    boxShadow: `0 0 12px ${cfg.color}60`,
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {stage === 'creating' ? `${current} / ${total} files` : 'Uploadingâ€¦'}
                                </span>
                                {stage === 'creating' && (
                                    <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', color: cfg.color, fontWeight: 600 }}>
                                        {progress}%
                                    </span>
                                )}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.875rem', opacity: 0.7 }}>
                                You can close this â€” process continues in the background
                            </p>
                        </div>
                    )}

                    {/* Download button */}
                    {stage === 'ready' && downloadUrl && (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                marginTop: '1.25rem', display: 'inline-flex',
                                alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
                                background: cfg.color, color: '#fff',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1)',
                                boxShadow: `0 4px 16px ${cfg.color}40`,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2v9M4 8l4 4 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 13h12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            Download ZIP
                        </a>
                    )}

                    {/* Error */}
                    {stage === 'error' && (
                        <p style={{ color: '#fda4af', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                            {error || 'Connection failed. Please try again.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
