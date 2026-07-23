"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

interface User {
    email: string;
    name?: string;
    uuid?: string;
    plan: 'basic' | 'standard' | 'premium' | 'enterprise';
    planExpiresAt?: string | null;
    created_at?: string;
    image?: string;
    provider?: string;
}

interface R2File {
    id: string;
    url: string;
    created_at: string;
    resource_type: 'image' | 'video';
    size?: number;
}

interface AdminDevice {
    deviceId: string;
    uuid?: string;
    name?: string;
    model?: string;
    online: boolean;
    lastSeen?: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'devices' | 'media'>('users');

    const [devices, setDevices] = useState<AdminDevice[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(false);

    // Selected user for editing
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPlan, setNewPlan] = useState<'basic' | 'standard' | 'premium' | 'enterprise'>('basic');
    const [expiryDate, setExpiryDate] = useState('');

    // R2 Media Browser State
    const [r2Files, setR2Files] = useState<R2File[]>([]);
    const [r2Loading, setR2Loading] = useState(false);
    const [r2UuidFilter, setR2UuidFilter] = useState('');
    const [mediaPreview, setMediaPreview] = useState<R2File | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
    const [visibleCount, setVisibleCount] = useState(50);

    const BACKEND_URL = 'https://p01--gallery-eye--9zr85m7yb6s4.code.run';
    const R2_CACHE_KEY = 'admin_r2_files_cache';
    const R2_CACHE_TS_KEY = 'admin_r2_cache_ts';

    // Check if session email matches admin email
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            checkAdminAccess(session.user.email);
        } else if (status === 'unauthenticated') {
            setIsAuthorized(false);
        }
    }, [session, status]);

    const checkAdminAccess = async (email: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.authorized) {
                    setIsAuthorized(true);
                    localStorage.setItem('admin_authorized', 'true');
                    localStorage.setItem('admin_email', email);
                    fetchUsers(email);
                    fetchDevices(email);
                } else {
                    setIsAuthorized(false);
                    setError('Your Google account is not authorized for admin access.');
                }
            }
        } catch {
            const cached = localStorage.getItem('admin_authorized');
            const cachedEmail = localStorage.getItem('admin_email');
            if (cached === 'true' && cachedEmail === email) {
                setIsAuthorized(true);
                fetchUsers(email);
                fetchDevices(email);
            } else {
                setError('Failed to verify admin access');
            }
        }
    };

    const fetchDevices = async (email: string) => {
        setDevicesLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/devices`, {
                headers: { 'x-admin-email': email }
            });
            if (res.ok) {
                setDevices(await res.json());
            }
        } catch {
            console.error('Failed to fetch devices');
        } finally {
            setDevicesLoading(false);
        }
    };

    const fetchUsers = async (email: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/users`, {
                headers: { 'x-admin-email': email }
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch {
            setError('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || !session?.user?.email) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/users/search?email=${encodeURIComponent(searchQuery)}`, {
                headers: { 'x-admin-email': session.user.email }
            });
            if (res.ok) setSearchResults(await res.json());
        } catch {
            setError('Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPlan = async () => {
        if (!selectedUser || !session?.user?.email) return;
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${BACKEND_URL}/admin/set-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-email': session.user.email
                },
                body: JSON.stringify({
                    email: selectedUser.email,
                    plan: newPlan,
                    expiresAt: expiryDate || null
                })
            });
            if (res.ok) {
                setSuccess(`Plan updated for ${selectedUser.email}`);
                setSelectedUser(null);
                fetchUsers(session.user.email);
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to update plan');
            }
        } catch {
            setError('Failed to update plan');
        } finally {
            setIsLoading(false);
        }
    };

    // R2 Media Functions — with localStorage cache
    const fetchR2Files = useCallback(async (useCache = false) => {
        if (!session?.user?.email) return;

        // Try loading from cache first for instant display
        if (useCache) {
            try {
                const cached = localStorage.getItem(R2_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setR2Files(parsed);
                }
            } catch { /* ignore */ }
        }

        setR2Loading(true);
        try {
            const url = r2UuidFilter
                ? `${BACKEND_URL}/admin/r2-files?uuid=${encodeURIComponent(r2UuidFilter)}`
                : `${BACKEND_URL}/admin/r2-files`;
            const res = await fetch(url, {
                headers: { 'x-admin-email': session.user.email }
            });
            if (res.ok) {
                const data = await res.json();
                setR2Files(data);
                setVisibleCount(50);
                // Cache to localStorage
                try {
                    localStorage.setItem(R2_CACHE_KEY, JSON.stringify(data));
                    localStorage.setItem(R2_CACHE_TS_KEY, Date.now().toString());
                } catch { /* storage full, ignore */ }
            }
        } catch {
            setError('Failed to fetch R2 files');
        } finally {
            setR2Loading(false);
        }
    }, [session, r2UuidFilter]);

    const deleteR2Files = async (fileIds: string[]) => {
        if (!session?.user?.email || fileIds.length === 0) return;
        setR2Loading(true);
        setError('');
        try {
            const CHUNK_SIZE = 500;
            let totalDeleted = 0;
            
            for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
                const chunk = fileIds.slice(i, i + CHUNK_SIZE);
                const res = await fetch(`${BACKEND_URL}/admin/r2-delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-email': session.user.email
                    },
                    body: JSON.stringify({ ids: chunk })
                });
                
                if (!res.ok) throw new Error('Partial delete failed');
                
                totalDeleted += chunk.length;
                
                setR2Files(prev => {
                    const updated = prev.filter(f => !chunk.includes(f.id));
                    try { localStorage.setItem(R2_CACHE_KEY, JSON.stringify(updated)); } catch { }
                    return updated;
                });
            }
            
            setSelectedFiles(new Set());
            setSuccess(`Deleted ${totalDeleted} file(s)`);
            setDeleteConfirm(false);
        } catch {
            setError('Delete failed during bulk operation');
        } finally {
            setR2Loading(false);
        }
    };

    const toggleFileSelect = (id: string) => {
        setSelectedFiles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedFiles.size === displayedFiles.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(displayedFiles.map(f => f.id)));
        }
    };

    useEffect(() => {
        if (isAuthorized && activeTab === 'media' && r2Files.length === 0) {
            fetchR2Files(true); // Load from cache first, then fetch fresh
        }
    }, [activeTab, isAuthorized]);

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setNewPlan(user.plan || 'basic');
        setExpiryDate(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '');
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'enterprise': return 'bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-400/40';
            case 'premium': return 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/40 font-extrabold';
            case 'standard': return 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/30';
            default: return 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60';
        }
    };

    const getProviderDisplay = (user: User) => {
        const isGoogle = user.provider === 'google' || user.image?.includes('googleusercontent') || user.image?.includes('google');
        return isGoogle ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google Auth
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 text-xs font-semibold">
                📧 Email & Password
            </span>
        );
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const displayUsers = searchResults.length > 0 ? searchResults : users;

    // Filtered files based on media type filter
    const displayedFiles = mediaFilter === 'all' ? r2Files : r2Files.filter(f => f.resource_type === mediaFilter);
    const currentlyVisibleFiles = displayedFiles.slice(0, visibleCount);
    const imageCount = r2Files.filter(f => f.resource_type === 'image').length;
    const videoCount = r2Files.filter(f => f.resource_type === 'video').length;

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
                </div>
                <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase animate-pulse">Initializing Command Center...</p>
            </div>
        );
    }

    // Google Login Screen
    if (!session || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#07080c] text-white flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_40px_rgba(147,51,234,0.35)] mb-5">
                            <div className="w-full h-full bg-[#0d0f17] rounded-[22px] flex items-center justify-center text-3xl">
                                🛡️
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            Admin Command Center
                        </h1>
                        <p className="text-zinc-400 text-xs font-mono tracking-wider mt-1.5 uppercase">GalleryEye • Secure Telemetry Gateway</p>
                    </div>

                    <div className="bg-[#0f1118]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                        {error && (
                            <div className="mb-5 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {session && !isAuthorized ? (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <p className="text-red-400 text-xs font-mono">⛔ {session.user?.email} is not authorized.</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200"
                                >
                                    Sign Out & Try Authorized Account
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="w-full py-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 rounded-2xl font-bold text-sm text-zinc-950 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Authenticate Admin Account
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-[#07080c] text-white selection:bg-purple-500/30 selection:text-purple-200">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#090b10]/90 backdrop-blur-2xl border-b border-white/[0.08]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                            <div className="w-full h-full bg-[#0d0f17] rounded-[14px] flex items-center justify-center text-xl">
                                🛡️
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">Admin Command Center</h1>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live Telemetry
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[160px] sm:max-w-[280px]">
                                Logged in: <span className="text-purple-300 font-semibold">{session.user?.email}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_authorized');
                            localStorage.removeItem('admin_email');
                            signOut({ callbackUrl: '/adminh4k3r009' });
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>🚪</span>
                        <span className="hidden sm:inline">Exit Panel</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06] mb-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'users'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span>👥</span>
                            <span>Users ({users.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('devices')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'devices'
                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span>📱</span>
                            <span>Devices ({devices.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('media')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'media'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span>🗂️</span>
                            <span>R2 Media ({r2Files.length})</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-28">
                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-sm transition-colors cursor-pointer">×</button>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="w-6 h-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-sm transition-colors cursor-pointer">×</button>
                    </div>
                )}

                {/* ====== DEVICES TAB ====== */}
                {activeTab === 'devices' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
                                <div className="text-3xl sm:text-4xl font-black text-white">{devices.length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Total Fleet</div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-600/5 to-transparent border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(16,185,129,0.1)] relative overflow-hidden">
                                <div className="text-3xl sm:text-4xl font-black text-emerald-400">{devices.filter(d => d.online).length}</div>
                                <div className="text-xs font-extrabold text-emerald-300/90 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Online Endpoints
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent border border-red-500/20 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                                <div className="text-3xl sm:text-4xl font-black text-red-400">{devices.filter(d => !d.online).length}</div>
                                <div className="text-xs font-extrabold text-red-300/80 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    Offline
                                </div>
                            </div>
                        </div>

                        {/* Refresh Controls */}
                        <div className="flex items-center justify-between gap-3 bg-[#0d0f16] p-3.5 rounded-2xl border border-white/[0.08]">
                            <div className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 pl-1">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                Registered Endpoints Telemetry
                            </div>
                            <button
                                onClick={() => session?.user?.email && fetchDevices(session.user.email)}
                                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                                🔄 Refresh Telemetry
                            </button>
                        </div>

                        {/* Devices List */}
                        {devicesLoading ? (
                            <div className="p-12 text-center text-zinc-400 font-mono text-xs animate-pulse bg-[#0d0f16] rounded-3xl border border-white/[0.06]">
                                🛰️ Fetching live endpoint telemetry...
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="p-12 text-center bg-[#0d0f16] border border-white/[0.06] rounded-3xl text-zinc-400">
                                <p className="text-sm font-semibold">No endpoints registered in system telemetry yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map((d, idx) => {
                                    const userOwner = users.find(u => u.uuid === d.uuid);
                                    return (
                                        <div 
                                            key={`${d.deviceId || idx}_${d.uuid}`}
                                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                                                d.online 
                                                    ? 'bg-gradient-to-b from-emerald-500/[0.06] to-emerald-950/[0.02] border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)]' 
                                                    : 'bg-[#0e1017] border-white/[0.08] hover:border-white/15'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3.5">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white text-base truncate max-w-[180px]">{d.name || d.model || 'Android Endpoint'}</h4>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">ID: {d.deviceId?.substring(0, 20)}...</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                                                    d.online ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${d.online ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                                    {d.online ? 'Online' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500 font-medium">Owner Email:</span>
                                                    <span className="font-mono font-bold text-purple-300 truncate max-w-[180px]" title={userOwner?.email || d.uuid}>
                                                        {userOwner?.email || d.uuid || 'Unknown User'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500 font-medium">Last Active:</span>
                                                    <span className="text-zinc-400 font-mono text-[11px]">
                                                        {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : 'Just now'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ====== USERS TAB ====== */}
                {activeTab === 'users' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-4">
                                <div className="text-2xl sm:text-3xl font-black text-white">{users.length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Total Users</div>
                            </div>
                            <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-4">
                                <div className="text-2xl sm:text-3xl font-black text-zinc-400">{users.filter(u => u.plan === 'basic').length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Basic</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-4">
                                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{users.filter(u => u.plan === 'standard').length}</div>
                                <div className="text-xs font-bold text-emerald-300/80 uppercase tracking-wider mt-0.5">Standard</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4">
                                <div className="text-2xl sm:text-3xl font-black text-amber-400">{users.filter(u => u.plan === 'premium' || u.plan === 'enterprise').length}</div>
                                <div className="text-xs font-bold text-amber-300/80 uppercase tracking-wider mt-0.5">Premium / Ent</div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex gap-2.5">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search account email..."
                                className="flex-1 px-4 py-3 bg-[#0d0f16] border border-white/[0.08] rounded-2xl focus:outline-none focus:border-purple-500/60 text-sm font-medium transition-all"
                            />
                            <button 
                                onClick={handleSearch} 
                                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.3)] active:scale-95"
                            >
                                🔍 Search
                            </button>
                        </div>

                        {/* User Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayUsers.map((user, idx) => (
                                <div key={idx} className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition-all duration-200 flex flex-col justify-between shadow-lg">
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3.5">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-11 h-11 rounded-full border-2 border-white/10 shrink-0" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-base font-black shrink-0 text-white">
                                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <div className="font-bold text-white text-base truncate max-w-[160px] sm:max-w-[200px]">{user.name || 'Anonymous User'}</div>
                                                    <div className="text-xs text-zinc-400 font-mono truncate max-w-[160px] sm:max-w-[200px]">{user.email}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${getPlanBadgeColor(user.plan || 'basic')}`}>
                                                {user.plan || 'basic'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                                            {getProviderDisplay(user)}
                                            {user.planExpiresAt && (
                                                <span className="text-[11px] text-zinc-400 font-mono bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                                                    Exp: {new Date(user.planExpiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => openEditModal(user)} 
                                        className="w-full py-2.5 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 rounded-xl text-xs font-extrabold uppercase tracking-wider text-purple-200 transition-all duration-200 cursor-pointer active:scale-98 shadow-sm"
                                    >
                                        ✏️ Manage Plan
                                    </button>
                                </div>
                            ))}
                        </div>

                        {displayUsers.length === 0 && (
                            <div className="text-center py-16 bg-[#0d0f16] border border-white/[0.06] rounded-3xl text-zinc-400">
                                <div className="text-4xl mb-3">👤</div>
                                <p className="text-sm font-semibold">No registered users found matching query.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ====== MEDIA TAB ====== */}
                {activeTab === 'media' && (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-white">{r2Files.length}</div>
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Total Media</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-emerald-400">{imageCount}</div>
                                <div className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest mt-0.5">📷 Images</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-red-400">{videoCount}</div>
                                <div className="text-[11px] font-bold text-red-400/80 uppercase tracking-widest mt-0.5">🎬 Videos</div>
                            </div>
                        </div>

                        {/* Media Controls */}
                        <div className="flex gap-2.5">
                            <input
                                type="text"
                                value={r2UuidFilter}
                                onChange={(e) => setR2UuidFilter(e.target.value)}
                                placeholder="Filter by User UUID..."
                                className="flex-1 px-4 py-3 bg-[#0d0f16] border border-white/[0.08] rounded-2xl focus:outline-none focus:border-cyan-500/60 text-sm font-medium transition-all"
                            />
                            <button
                                onClick={() => fetchR2Files(false)}
                                disabled={r2Loading}
                                className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            >
                                {r2Loading ? '...' : '🔄 Refresh'}
                            </button>
                        </div>

                        {/* Media Type Filter */}
                        <div className="flex gap-2">
                            {(['all', 'image', 'video'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => { setMediaFilter(filter); setVisibleCount(50); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        mediaFilter === filter
                                            ? filter === 'video' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                                : filter === 'image' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                            : 'bg-[#0e1017] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {filter === 'all' ? `All (${r2Files.length})` : filter === 'image' ? `📷 Images (${imageCount})` : `🎬 Videos (${videoCount})`}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Actions */}
                        {displayedFiles.length > 0 && (
                            <div className="flex items-center justify-between bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-3.5">
                                <button
                                    onClick={selectAll}
                                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                >
                                    {selectedFiles.size === displayedFiles.length ? '✓ Deselect All' : `⭐ Select All (${displayedFiles.length})`}
                                </button>
                                {selectedFiles.size > 0 && (
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                    >
                                        🗑️ Delete ({selectedFiles.size})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Media Grid */}
                        {r2Loading && r2Files.length === 0 ? (
                            <div className="text-center py-20 bg-[#0d0f16] border border-white/[0.06] rounded-3xl">
                                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-zinc-400 text-xs font-mono">Loading R2 cloud vault assets...</p>
                            </div>
                        ) : displayedFiles.length === 0 ? (
                            <div className="text-center py-20 bg-[#0d0f16] border border-white/[0.06] rounded-3xl text-zinc-400">
                                <div className="text-5xl mb-3">📦</div>
                                <p className="text-sm font-semibold">No media assets found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {currentlyVisibleFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-[#0d0f16] ${
                                            selectedFiles.has(file.id) ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[0.98]' : 'border-white/[0.08] hover:border-white/30'
                                        }`}
                                    >
                                        {/* Select checkbox */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}
                                            className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                                                selectedFiles.has(file.id) ? 'bg-cyan-500 text-zinc-950 shadow-md' : 'bg-black/70 text-white/60 opacity-80 sm:opacity-0 group-hover:opacity-100 border border-white/20'
                                            }`}
                                        >
                                            {selectedFiles.has(file.id) ? '✓' : ''}
                                        </button>

                                        {/* Type badge */}
                                        <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-black ${file.resource_type === 'video' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                                            {file.resource_type === 'video' ? '🎬 VID' : '📷 IMG'}
                                        </div>

                                        {/* Content */}
                                        <div onClick={() => setMediaPreview(file)} className="aspect-square bg-black/40 relative">
                                            {file.resource_type === 'video' ? (
                                                <div className="relative w-full h-full">
                                                    <video
                                                        src={file.url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        preload="metadata"
                                                        playsInline
                                                        onLoadedMetadata={(e) => {
                                                            (e.target as HTMLVideoElement).currentTime = 1;
                                                        }}
                                                    />
                                                    {/* Play overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>

                                        {/* Date + Size */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                                            <p className="text-[10px] text-zinc-300 font-mono truncate">
                                                {new Date(file.created_at).toLocaleDateString()}
                                                {file.size ? ` • ${formatFileSize(file.size)}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!r2Loading && visibleCount < displayedFiles.length && (
                            <div className="mt-6 text-center pb-8">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 50)}
                                    className="px-6 py-3.5 bg-[#0e1017] hover:bg-white/[0.08] border border-white/[0.1] rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
                                >
                                    Load More ({displayedFiles.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}

                        {/* Refreshing indicator */}
                        {r2Loading && r2Files.length > 0 && (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-semibold">
                                    <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                    Refreshing vault telemetry...
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Media Preview Modal */}
            {mediaPreview && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                    onClick={() => setMediaPreview(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        {/* Close */}
                        <button
                            onClick={() => setMediaPreview(null)}
                            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-base transition-colors z-10 cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => { deleteR2Files([mediaPreview.id]); setMediaPreview(null); }}
                            className="absolute -top-12 left-0 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-full text-xs font-bold transition-all cursor-pointer"
                        >
                            🗑️ Delete Media
                        </button>

                        {mediaPreview.resource_type === 'video' ? (
                            <video
                                src={mediaPreview.url}
                                controls
                                autoPlay
                                className="w-full max-h-[80vh] rounded-3xl border border-white/10 shadow-2xl"
                            />
                        ) : (
                            <img
                                src={mediaPreview.url}
                                alt=""
                                className="w-full max-h-[80vh] object-contain rounded-3xl border border-white/10 shadow-2xl"
                            />
                        )}

                        <p className="text-center text-zinc-400 text-xs font-mono mt-3 truncate">{mediaPreview.id}</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1118] border border-white/10 rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl">
                        <div className="text-center mb-5">
                            <div className="text-5xl mb-3">⚠️</div>
                            <h2 className="text-xl font-extrabold text-white">Delete {selectedFiles.size} file(s)?</h2>
                            <p className="text-xs text-zinc-400 mt-2">This action is permanent and will delete the selected assets from R2 storage.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteR2Files(Array.from(selectedFiles))}
                                disabled={r2Loading}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            >
                                {r2Loading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                    <div className="bg-[#0f1118] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
                        <h2 className="text-xl font-extrabold text-white mb-1">Manage Tier Subscription</h2>
                        <p className="text-xs text-purple-300 font-mono mb-6 truncate">{selectedUser.email}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select Subscription Tier</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['basic', 'standard', 'premium', 'enterprise'] as const).map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => setNewPlan(plan)}
                                            className={`py-3 px-3 rounded-2xl text-xs font-black capitalize transition-all cursor-pointer ${newPlan === plan ? getPlanBadgeColor(plan) + ' scale-[1.02]' : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]'}`}
                                        >
                                            {plan}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {newPlan !== 'basic' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#07080c] border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500 text-sm font-medium text-white"
                                    />
                                    <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">Leave empty for non-expiring permanent plan</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-7">
                            <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-xs font-bold transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleSetPlan} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Refresh Floating Action Button */}
            <button
                onClick={() => {
                    if (activeTab === 'users' && session?.user?.email) fetchUsers(session.user.email);
                    else if (activeTab === 'devices' && session?.user?.email) fetchDevices(session.user.email);
                    else fetchR2Files(false);
                }}
                disabled={isLoading || r2Loading || devicesLoading}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:scale-110 active:scale-95 transition-transform duration-200 z-40 cursor-pointer"
            >
                {(isLoading || r2Loading || devicesLoading) ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                )}
            </button>
        </div>
    );
}
