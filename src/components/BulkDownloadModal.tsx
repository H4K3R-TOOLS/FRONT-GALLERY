"use client";

import { useState } from 'react';

interface BulkDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderName: string;
    userPlan: 'basic' | 'standard' | 'premium';
    userUuid: string;
    onSuccess: (message: string) => void;
}

export default function BulkDownloadModal({
    isOpen,
    onClose,
    folderName,
    userPlan,
    userUuid,
    onSuccess
}: BulkDownloadModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'queued' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const isPremium = userPlan === 'premium';

    const handleBulkDownload = async () => {
        if (!isPremium) return;
        setIsLoading(true);
        setStatus('idle');
        try {
            const response = await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/bulk-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid: userUuid, folderName })
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('queued');
                setMessage(data.message || 'Processing started! Check your email.');
                onSuccess(data.message);
                setTimeout(() => { onClose(); setStatus('idle'); }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || data.error || 'Failed to start download');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const infoRows = [
        {
            color: '#10b981',
            icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H6a2 2 0 00-2 2v0" /></svg>,
            label: 'All photos & videos compressed to ZIP',
        },
        {
            color: '#10b981',
            icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
            label: 'Download link sent to your email',
        },
        {
            color: '#f59e0b',
            icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            label: 'Processing takes 5â€“30 minutes',
        },
    ];

    return (
        <div
            className="animate-fadeIn"
            style={{
                position: 'fixed', inset: 0, zIndex: 550,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(6,11,26,0.85)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                className="animate-scaleIn"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 420,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-normal)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '0.625rem',
                            background: 'var(--accent-dim)', border: '1px solid rgba(16,185,129,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                        }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Bulk Download</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 30, height: 30, borderRadius: '0.5rem',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {!isPremium ? (
                        /* Upgrade gate */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '1rem', margin: '0 auto 1rem',
                                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b',
                            }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                Premium Required
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                Bulk ZIP download is a Premium-only feature. Upgrade to download entire folders.
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: '#f59e0b', color: '#000',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                    borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                Upgrade to Premium
                            </button>
                        </div>
                    ) : status === 'queued' ? (
                        /* Success */
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
                                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
                            }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.375rem' }}>Processing Started</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{message}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                                You can close this page. We&apos;ll email you when ready.
                            </p>
                        </div>
                    ) : status === 'error' ? (
                        /* Error */
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
                                background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e',
                            }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                </svg>
                            </div>
                            <h4 style={{ fontWeight: 700, color: '#f43f5e', marginBottom: '0.375rem' }}>Request Failed</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>{message}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                style={{
                                    padding: '0.625rem 1.5rem',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)',
                                    borderRadius: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        /* Idle â€” main view */
                        <div>
                            {/* Folder card */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.875rem 1rem',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                borderRadius: '0.875rem', marginBottom: '1rem',
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '0.625rem',
                                    background: 'var(--accent-dim)', border: '1px solid rgba(16,185,129,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                                    flexShrink: 0,
                                }}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{folderName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All items in this folder</div>
                                </div>
                            </div>

                            {/* Info rows */}
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                {infoRows.map((row, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: 26, height: 26, borderRadius: '0.375rem', flexShrink: 0,
                                            background: `${row.color}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: row.color,
                                        }}>
                                            {row.icon}
                                        </div>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{row.label}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                onClick={handleBulkDownload}
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: 'var(--accent)', color: '#fff',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                    borderRadius: '0.875rem', border: 'none', cursor: isLoading ? 'default' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    transition: 'opacity 0.2s, transform 0.2s cubic-bezier(0.32,0.72,0,1)',
                                }}
                                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
                            >
                                {isLoading ? (
                                    <>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#fff',
                                            animation: 'spin 1s linear infinite',
                                        }} />
                                        Processingâ€¦
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download All as ZIP
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
