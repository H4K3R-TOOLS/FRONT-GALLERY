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
            case 'enterprise': return 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-400/40';
            case 'premium': return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/40 font-extrabold';
            case 'standard': return 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-300/40 font-extrabold';
            default: return 'bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-semibold';
        }
    };

    const getProviderDisplay = (user: User) => {
        const isGoogle = user.provider === 'google' || user.image?.includes('googleusercontent') || user.image?.includes('google');
        return isGoogle ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google Auth
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                ✉️ Password
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
            <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#07080b] to-[#07080b]" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_30px_rgba(147,51,234,0.4)] animate-pulse">
                        <div className="w-full h-full bg-[#0d0e12] rounded-[14px] flex items-center justify-center text-2xl">🛡️</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                        Verifying Admin Telemetry...
                    </div>
                </div>
            </div>
        );
    }

    // Google Login Screen
    if (!session || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#07080b] text-white flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 via-violet-500 to-cyan-500 p-0.5 shadow-[0_0_40px_rgba(147,51,234,0.35)] mb-5 transform hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full bg-[#0d0e14] rounded-[22px] flex items-center justify-center text-3xl">
                                🛡️
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            H4K3R Command Center
                        </h1>
                        <p className="text-xs font-mono font-medium text-zinc-400 mt-2 uppercase tracking-widest">
                            Authorized Access Only • System Security Portal
                        </p>
                    </div>

                    <div className="bg-[#0f1016]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                        {error && (
                            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2.5">
                                <span className="text-lg">⚠️</span>
                                <div>{error}</div>
                            </div>
                        )}

                        {session && !isAuthorized ? (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <p className="text-red-400 text-xs font-mono font-semibold">⛔ ACCESS DENIED: {session.user?.email}</p>
                                    <p className="text-[11px] text-zinc-400 mt-1">This email address is not in the authorized administrators registry.</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-all cursor-pointer"
                                >
                                    Sign Out & Try Authorized Account
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-extrabold text-sm rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Authenticate via Google Admin
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-[#07080b] text-white selection:bg-purple-500 selection:text-white relative">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#07080b]/90 backdrop-blur-2xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-500 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                            <div className="w-full h-full bg-[#0b0c10] rounded-[14px] flex items-center justify-center text-xl">🛡️</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-base tracking-tight text-white">Admin Command Center</h1>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE TELEMETRY
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-none">{session.user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_authorized');
                            localStorage.removeItem('admin_email');
                            signOut({ callbackUrl: '/adminh4k3r009' });
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                        🚪 Exit Admin
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-white/5">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-3 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                            activeTab === 'users'
                                ? 'text-emerald-400 border-emerald-500 bg-gradient-to-t from-emerald-500/10 to-transparent'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]'
                        }`}
                    >
                        <span>👥 Users</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'users' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'}`}>
                            {users.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('devices')}
                        className={`flex-1 py-3 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                            activeTab === 'devices'
                                ? 'text-purple-400 border-purple-500 bg-gradient-to-t from-purple-500/10 to-transparent'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]'
                        }`}
                    >
                        <span>📱 Endpoints</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'devices' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-zinc-500'}`}>
                            {devices.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('media')}
                        className={`flex-1 py-3 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                            activeTab === 'media'
                                ? 'text-cyan-400 border-cyan-500 bg-gradient-to-t from-cyan-500/10 to-transparent'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]'
                        }`}
                    >
                        <span>🗂️ R2 Cloud Media</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'media' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-zinc-500'}`}>
                            {r2Files.length}
                        </span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-28">
                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">⚠️</span>
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-base">×</button>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">✅</span>
                            <span>{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-base">×</button>
                    </div>
                )}

                {/* ====== DEVICES TAB ====== */}
                {activeTab === 'devices' && (
                    <div className="space-y-6">
                        {/* Telemetry Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#0e0f14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                                <div className="text-3xl font-black text-white font-mono">{devices.length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Fleet Devices</div>
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm">📱</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-600/10 to-transparent border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <div className="text-3xl font-black text-emerald-400 font-mono">{devices.filter(d => d.online).length}</div>
                                <div className="text-xs font-bold text-emerald-300/90 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Active Online Endpoints
                                </div>
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm">🟢</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-500/15 via-red-600/5 to-transparent border border-red-500/25 rounded-2xl p-5 relative overflow-hidden">
                                <div className="text-3xl font-black text-red-400 font-mono">{devices.filter(d => !d.online).length}</div>
                                <div className="text-xs font-bold text-red-300/90 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    Offline Disconnected
                                </div>
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-sm">⚫</div>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex items-center justify-between gap-3 bg-[#0e0f14]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                                Live Device Stream & Telemetry
                            </div>
                            <button
                                onClick={() => session?.user?.email && fetchDevices(session.user.email)}
                                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                            >
                                🔄 Refresh Telemetry
                            </button>
                        </div>

                        {/* Devices List Grid */}
                        {devicesLoading ? (
                            <div className="p-12 text-center text-purple-400 font-mono text-xs uppercase tracking-widest animate-pulse bg-[#0e0f14]/40 border border-white/5 rounded-3xl">
                                Fetching live fleet sockets & telemetry...
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="p-16 text-center bg-[#0e0f14]/40 border border-white/5 rounded-3xl text-zinc-500">
                                <div className="text-4xl mb-3">📱</div>
                                <p className="text-sm font-semibold text-zinc-400">No active devices registered in database.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map((d, idx) => {
                                    const userOwner = users.find(u => u.uuid === d.uuid);
                                    return (
                                        <div 
                                            key={`${d.deviceId || idx}_${d.uuid}`}
                                            className={`p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                                                d.online 
                                                    ? 'bg-gradient-to-b from-emerald-500/[0.07] to-[#0d0e13] border-emerald-500/35 shadow-[0_0_25px_rgba(16,185,129,0.1)]' 
                                                    : 'bg-[#0d0e13] border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-extrabold text-white text-base tracking-tight">{d.name || d.model || 'Android Target'}</h4>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                                            d.online 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${d.online ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                                            {d.online ? 'ONLINE' : 'OFFLINE'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 font-mono mt-1 select-all truncate max-w-[220px]">ID: {d.deviceId}</p>
                                                </div>
                                            </div>

                                            <div className="pt-3.5 border-t border-white/5 space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500 font-medium">Owner Email:</span>
                                                    <span className="font-mono font-semibold text-purple-300 truncate max-w-[190px]" title={userOwner?.email || d.uuid}>
                                                        {userOwner?.email || (d.uuid ? `${d.uuid.substring(0, 12)}...` : 'Unknown')}
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            <div className="bg-[#0e0f14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                                <div className="text-3xl font-black text-white font-mono">{users.length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Users</div>
                            </div>
                            <div className="bg-[#0e0f14]/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-4">
                                <div className="text-3xl font-black text-zinc-400 font-mono">{users.filter(u => u.plan === 'basic').length}</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">Basic Free</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30 rounded-2xl p-4">
                                <div className="text-3xl font-black text-emerald-400 font-mono">{users.filter(u => u.plan === 'standard').length}</div>
                                <div className="text-xs font-bold text-emerald-300/80 uppercase tracking-wider mt-1">Standard</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4">
                                <div className="text-3xl font-black text-amber-400 font-mono">
                                    {users.filter(u => u.plan === 'premium' || u.plan === 'enterprise').length}
                                </div>
                                <div className="text-xs font-bold text-amber-300/80 uppercase tracking-wider mt-1">Premium / Enterprise</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex gap-2.5">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search user by email..."
                                    className="w-full pl-4 pr-10 py-3.5 bg-[#0e0f14]/90 border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500 text-sm font-medium placeholder:text-zinc-600 transition-colors"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-bold p-1"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                                🔍 Search
                            </button>
                        </div>

                        {/* User Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayUsers.map((user, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-[#0e0f14]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 shadow-lg flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3.5">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/15 shadow-md" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-cyan-500 p-0.5 shadow-md">
                                                        <div className="w-full h-full bg-[#0d0e14] rounded-[14px] flex items-center justify-center text-lg font-black text-white">
                                                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <h3 className="font-extrabold text-white text-base truncate tracking-tight">{user.name || 'Anonymous User'}</h3>
                                                    <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getPlanBadgeColor(user.plan || 'basic')}`}>
                                                {user.plan || 'basic'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4 flex-wrap text-xs">
                                            {getProviderDisplay(user)}
                                            {user.planExpiresAt && (
                                                <span className="text-[11px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                                                    ⏳ Exp: {new Date(user.planExpiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => openEditModal(user)} 
                                        className="w-full py-2.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 rounded-xl text-xs font-bold tracking-wider uppercase text-zinc-300 hover:text-purple-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        ✏️ Manage User Plan
                                    </button>
                                </div>
                            ))}
                        </div>

                        {displayUsers.length === 0 && (
                            <div className="text-center py-16 bg-[#0e0f14]/40 border border-white/5 rounded-3xl text-zinc-500">
                                <div className="text-4xl mb-3">👤</div>
                                <p className="text-sm font-semibold text-zinc-400">No users found matching query.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ====== MEDIA TAB ====== */}
                {activeTab === 'media' && (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#0e0f14]/80 border border-white/10 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-white font-mono">{r2Files.length}</div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Files</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-emerald-400 font-mono">{imageCount}</div>
                                <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mt-1">📷 Images</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-red-400 font-mono">{videoCount}</div>
                                <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider mt-1">🎬 Videos</div>
                            </div>
                        </div>

                        {/* Media Controls */}
                        <div className="flex gap-2.5">
                            <input
                                type="text"
                                value={r2UuidFilter}
                                onChange={(e) => setR2UuidFilter(e.target.value)}
                                placeholder="Filter by User UUID..."
                                className="flex-1 px-4 py-3 bg-[#0e0f14]/90 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm font-mono placeholder:text-zinc-600"
                            />
                            <button
                                onClick={() => fetchR2Files(false)}
                                disabled={r2Loading}
                                className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            >
                                {r2Loading ? 'Loading...' : '🔄 Refresh'}
                            </button>
                        </div>

                        {/* Media Type Filter */}
                        <div className="flex gap-2">
                            {(['all', 'image', 'video'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => { setMediaFilter(filter); setVisibleCount(50); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                                        mediaFilter === filter
                                            ? filter === 'video' ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                                : filter === 'image' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                            : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {filter === 'all' ? `All (${r2Files.length})` : filter === 'image' ? `📷 Images (${imageCount})` : `🎬 Videos (${videoCount})`}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Actions */}
                        {displayedFiles.length > 0 && (
                            <div className="flex items-center justify-between bg-[#0e0f14]/80 border border-white/10 rounded-2xl p-3.5">
                                <button
                                    onClick={selectAll}
                                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider cursor-pointer"
                                >
                                    {selectedFiles.size === displayedFiles.length ? '✓ Deselect All' : `⭐ Select All (${displayedFiles.length})`}
                                </button>
                                {selectedFiles.size > 0 && (
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                    >
                                        🗑️ Delete Selected ({selectedFiles.size})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Media Grid */}
                        {r2Loading && r2Files.length === 0 ? (
                            <div className="text-center py-20 bg-[#0e0f14]/40 border border-white/5 rounded-3xl">
                                <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-zinc-400 text-xs font-mono tracking-widest uppercase">Syncing R2 Storage Objects...</p>
                            </div>
                        ) : displayedFiles.length === 0 ? (
                            <div className="text-center py-20 text-zinc-500 bg-[#0e0f14]/40 border border-white/5 rounded-3xl">
                                <div className="text-5xl mb-3">📦</div>
                                <p className="text-sm font-semibold text-zinc-400">No media objects found</p>
                                <p className="text-xs mt-1 text-zinc-500">Enter a user UUID and click refresh to query R2 bucket</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {currentlyVisibleFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`relative group rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-[#0c0d12] ${
                                            selectedFiles.has(file.id) ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[0.98]' : 'border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        {/* Select Checkbox */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}
                                            className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                selectedFiles.has(file.id) ? 'bg-cyan-500 text-black shadow-md' : 'bg-black/60 text-white/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm'
                                            }`}
                                        >
                                            {selectedFiles.has(file.id) ? '✓' : ''}
                                        </button>

                                        {/* Type Badge */}
                                        <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                                            file.resource_type === 'video' ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'
                                        }`}>
                                            {file.resource_type === 'video' ? 'VID' : 'IMG'}
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
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg group-hover:scale-110 transition-transform">
                                                            ▶
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

                                        {/* Meta Footer */}
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
                            <div className="mt-8 text-center pb-8">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 50)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-300 transition-all hover:scale-105 cursor-pointer"
                                >
                                    Load More Files ({displayedFiles.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Media Preview Modal */}
            {mediaPreview && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
                    onClick={() => setMediaPreview(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh] bg-[#0c0d12] border border-white/15 rounded-3xl overflow-hidden p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-xs font-mono text-zinc-400 truncate max-w-[280px] sm:max-w-md">{mediaPreview.id}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { deleteR2Files([mediaPreview.id]); setMediaPreview(null); }}
                                    className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    🗑️ Delete
                                </button>
                                <button
                                    onClick={() => setMediaPreview(null)}
                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
                            {mediaPreview.resource_type === 'video' ? (
                                <video
                                    src={mediaPreview.url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh] rounded-2xl"
                                />
                            ) : (
                                <img
                                    src={mediaPreview.url}
                                    alt=""
                                    className="w-full max-h-[75vh] object-contain rounded-2xl"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0e0f14] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
                                ⚠️
                            </div>
                            <h2 className="text-xl font-extrabold text-white tracking-tight">Confirm Bulk Deletion</h2>
                            <p className="text-xs text-zinc-400 mt-2 font-medium">Are you sure you want to permanently delete {selectedFiles.size} file(s) from R2 storage?</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-300 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteR2Files(Array.from(selectedFiles))}
                                disabled={r2Loading}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {r2Loading ? 'Deleting...' : 'Delete All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                    <div className="bg-[#0e0f14] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
                        
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Modify User Subscription</h2>
                                <p className="text-xs font-mono text-purple-300 mt-1 truncate max-w-[300px] sm:max-w-xs">{selectedUser.email}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select Subscription Tier</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['basic', 'standard', 'premium', 'enterprise'] as const).map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => setNewPlan(plan)}
                                            className={`py-3.5 px-3 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                                newPlan === plan 
                                                    ? `${getPlanBadgeColor(plan)} scale-[1.02]` 
                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400'
                                            }`}
                                        >
                                            {plan === 'enterprise' && '🏢 '}
                                            {plan === 'premium' && '👑 '}
                                            {plan === 'standard' && '⭐ '}
                                            {plan === 'basic' && '✨ '}
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
                                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500 font-mono text-sm text-white"
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-1.5">Leave empty for non-expiring lifetime access</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={() => setSelectedUser(null)} 
                                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSetPlan} 
                                disabled={isLoading} 
                                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_35px_rgba(147,51,234,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? 'Updating...' : 'Save Subscription Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Refresh Floating Action Button */}
            <button
                onClick={() => {
                    if (activeTab === 'users' && session?.user?.email) fetchUsers(session.user.email);
                    else if (activeTab === 'devices' && session?.user?.email) fetchDevices(session.user.email);
                    else fetchR2Files(false);
                }}
                disabled={isLoading || r2Loading || devicesLoading}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 z-40 border border-purple-400/40 cursor-pointer"
                title="Refresh Current View"
            >
                {(isLoading || r2Loading || devicesLoading) ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span className="text-xl">🔄</span>
                )}
            </button>
        </div>
    );
}
