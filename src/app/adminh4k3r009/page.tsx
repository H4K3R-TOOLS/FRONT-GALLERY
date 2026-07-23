"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { 
    Shield, 
    Users, 
    Smartphone, 
    HardDrive, 
    Search, 
    RefreshCw, 
    LogOut, 
    Check, 
    Trash2, 
    X, 
    AlertTriangle, 
    Camera, 
    Film, 
    Edit3, 
    Calendar, 
    Sparkles, 
    Wifi, 
    WifiOff, 
    Crown, 
    Zap, 
    Building2,
    Copy,
    Filter,
    CheckCircle2
} from 'lucide-react';

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
    const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'standard' | 'premium' | 'enterprise'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    // R2 Media Functions
    const fetchR2Files = useCallback(async (useCache = false) => {
        if (!session?.user?.email) return;

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
                try {
                    localStorage.setItem(R2_CACHE_KEY, JSON.stringify(data));
                    localStorage.setItem(R2_CACHE_TS_KEY, Date.now().toString());
                } catch { /* storage full */ }
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
            fetchR2Files(true);
        }
    }, [activeTab, isAuthorized]);

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setNewPlan(user.plan || 'basic');
        setExpiryDate(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getPlanBadgeConfig = (plan: string) => {
        switch (plan) {
            case 'enterprise': 
                return {
                    label: '🏢 ENTERPRISE',
                    badgeStyle: 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 text-white border-purple-400/40 shadow-[0_0_18px_rgba(147,51,234,0.5)]',
                    cardGlow: 'border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-[#0e0f15] to-[#0a0a0e]'
                };
            case 'premium': 
                return {
                    label: '👑 PREMIUM',
                    badgeStyle: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300/40 shadow-[0_0_18px_rgba(245,158,11,0.5)]',
                    cardGlow: 'border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-[#0e0f15] to-[#0a0a0e]'
                };
            case 'standard': 
                return {
                    label: '⭐ STANDARD',
                    badgeStyle: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-black border-emerald-300/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
                    cardGlow: 'border-emerald-500/25 bg-gradient-to-b from-emerald-950/15 via-[#0e0f15] to-[#0a0a0e]'
                };
            default: 
                return {
                    label: '✨ FREE',
                    badgeStyle: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/60 shadow-inner',
                    cardGlow: 'border-white/10 bg-white/[0.02]'
                };
        }
    };

    const getProviderDisplay = (user: User) => {
        const isGoogle = user.provider === 'google' || user.image?.includes('googleusercontent') || user.image?.includes('google');
        return isGoogle ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-medium tracking-wide">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google Auth
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[11px] font-medium tracking-wide">
                📧 Direct Credentials
            </span>
        );
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const baseUsers = searchResults.length > 0 ? searchResults : users;
    const displayUsers = planFilter === 'all' 
        ? baseUsers 
        : baseUsers.filter(u => (u.plan || 'basic').toLowerCase() === planFilter);

    const displayedFiles = mediaFilter === 'all' ? r2Files : r2Files.filter(f => f.resource_type === mediaFilter);
    const currentlyVisibleFiles = displayedFiles.slice(0, visibleCount);
    const imageCount = r2Files.filter(f => f.resource_type === 'image').length;
    const videoCount = r2Files.filter(f => f.resource_type === 'video').length;

    // Loading Screen
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#030305] text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-400 animate-spin blur-sm opacity-70" />
                        <div className="relative w-full h-full rounded-2xl bg-[#0b0c10] border border-white/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase animate-pulse">Initializing Control Center...</p>
                </div>
            </div>
        );
    }

    // Unauthenticated / Auth Check Screen
    if (!session || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center p-4 relative overflow-hidden">
                {/* Ambient Radial Mesh Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-purple-600/15 via-emerald-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

                {/* Double Bezel Login Container */}
                <div className="relative w-full max-w-md">
                    {/* Outer Shell */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                        {/* Inner Core */}
                        <div className="bg-[#09090d]/90 rounded-[calc(2.5rem-0.75rem)] p-7 sm:p-9 border border-white/5 relative overflow-hidden">
                            {/* Accent Glow Hairline */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[1px]" />
                            
                            <div className="text-center mb-8">
                                <div className="relative inline-block mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 via-emerald-500/10 to-blue-600/20 border border-purple-500/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(147,51,234,0.2)] mx-auto">
                                        <Shield className="w-10 h-10 text-purple-400" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#09090d] animate-pulse" />
                                </div>
                                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-2">
                                    SYSTEM CONTROL CENTER
                                </div>
                                <h1 className="text-2xl font-black tracking-tight text-white">
                                    GalleryEye Admin
                                </h1>
                                <p className="text-xs text-zinc-400 mt-1 font-medium">Authorized Personnel Authentication Required</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-medium flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {session && !isAuthorized ? (
                                <div className="space-y-4 text-center">
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left">
                                        <p className="text-rose-300 text-xs font-semibold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            Unauthorized Account
                                        </p>
                                        <p className="text-[11px] text-rose-300/70 font-mono mt-1 truncate">{session.user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4 text-zinc-400" />
                                        Sign Out & Switch Account
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => signIn('google')}
                                    className="w-full py-4 px-6 bg-white hover:bg-zinc-100 text-black font-extrabold text-sm rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign in with Google Account
                                </button>
                            )}

                            <p className="text-[10px] text-zinc-500 text-center mt-6 tracking-wide">
                                Protected by GalleryEye Admin Encryption Protocol
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-[#030305] text-white selection:bg-purple-500 selection:text-white relative">
            {/* Ambient Glowing Background Orbs */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Header Navbar */}
            <header className="sticky top-0 z-40 bg-[#06060a]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo & Status */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-[1px] shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                                    <div className="w-full h-full bg-[#09090d] rounded-[calc(0.75rem-1px)] flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#06060a] animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-extrabold text-base tracking-tight text-white">Admin Command</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-black text-purple-300 uppercase tracking-widest">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px] sm:max-w-[280px]">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Exit Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_authorized');
                                localStorage.removeItem('admin_email');
                                signOut({ callbackUrl: '/adminh4k3r009' });
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Exit Panel</span>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 border-t border-white/5 pt-2 pb-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'users'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Users Fleet</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'users' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-zinc-400'}`}>
                                {users.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('devices')}
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'devices'
                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.15)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <Smartphone className="w-4 h-4" />
                            <span>Telemetry Fleet</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'devices' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-zinc-400'}`}>
                                {devices.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('media')}
                            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'media'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <HardDrive className="w-4 h-4" />
                            <span>R2 Vault</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'media' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-zinc-400'}`}>
                                {r2Files.length}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
                {/* System Messages Alerts */}
                {error && (
                    <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="p-1 text-rose-400 hover:text-white transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="p-1 text-emerald-400 hover:text-white transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ====== DEVICES TAB ====== */}
                {activeTab === 'devices' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl p-5 shadow-xl">
                                <div className="flex items-center justify-between text-zinc-400 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider">Total Fleet</span>
                                    <Smartphone className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div className="text-4xl font-black text-white tracking-tight">{devices.length}</div>
                                <p className="text-[11px] text-zinc-500 mt-1">Registered Endpoints</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-600/5 to-transparent border border-emerald-500/30 rounded-3xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <div className="flex items-center justify-between text-emerald-400 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                                        Online Now
                                    </span>
                                    <Wifi className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-4xl font-black text-emerald-400 tracking-tight">{devices.filter(d => d.online).length}</div>
                                <p className="text-[11px] text-emerald-400/60 mt-1">Active Socket Connections</p>
                            </div>

                            <div className="bg-gradient-to-br from-rose-500/15 via-rose-600/5 to-transparent border border-rose-500/20 rounded-3xl p-5 shadow-xl">
                                <div className="flex items-center justify-between text-rose-400 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                        Offline
                                    </span>
                                    <WifiOff className="w-5 h-5 text-rose-400" />
                                </div>
                                <div className="text-4xl font-black text-rose-400 tracking-tight">{devices.filter(d => !d.online).length}</div>
                                <p className="text-[11px] text-rose-400/60 mt-1">Disconnected Endpoints</p>
                            </div>
                        </div>

                        {/* Controls Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">Live Fleet Telemetry</h3>
                                <p className="text-xs text-zinc-400">Real-time status of all paired device endpoints</p>
                            </div>
                            <button
                                onClick={() => session?.user?.email && fetchDevices(session.user.email)}
                                disabled={devicesLoading}
                                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${devicesLoading ? 'animate-spin' : ''}`} />
                                <span>Refresh Telemetry</span>
                            </button>
                        </div>

                        {/* Devices Grid */}
                        {devicesLoading ? (
                            <div className="p-12 text-center text-zinc-400 font-mono text-xs animate-pulse flex flex-col items-center gap-3">
                                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                                Loading live fleet telemetry...
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl text-zinc-400">
                                <Smartphone className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm font-semibold">No devices registered in the system yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map((d, idx) => {
                                    const userOwner = users.find(u => u.uuid === d.uuid);
                                    return (
                                        <div 
                                            key={`${d.deviceId || idx}_${d.uuid}`}
                                            className={`p-5 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                                                d.online 
                                                    ? 'bg-gradient-to-b from-emerald-950/20 to-[#080b09] border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]' 
                                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-extrabold text-white text-base tracking-tight">
                                                            {d.name || d.model || 'Android Endpoint'}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[11px] text-zinc-400 font-mono">ID: {d.deviceId?.substring(0, 16)}...</span>
                                                        <button 
                                                            onClick={() => d.deviceId && copyToClipboard(d.deviceId)}
                                                            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                                                            title="Copy Device ID"
                                                        >
                                                            {copiedId === d.deviceId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                                                    d.online 
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${d.online ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                                    {d.online ? 'Online' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-400">Owner Account:</span>
                                                    <span className="font-mono font-bold text-purple-300 truncate max-w-[180px]" title={userOwner?.email || d.uuid}>
                                                        {userOwner?.email || (d.uuid ? `${d.uuid.substring(0, 12)}...` : 'Unknown User')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-400">Last Telemetry:</span>
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
                    <div className="space-y-6">
                        {/* Users Summary Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-4">
                                <div className="text-2xl font-black text-white">{users.length}</div>
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Total Users</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-2xl font-black text-zinc-400">{users.filter(u => (u.plan || 'basic').toLowerCase() === 'basic').length}</div>
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">✨ Free</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                <div className="text-2xl font-black text-emerald-400">{users.filter(u => (u.plan || '').toLowerCase() === 'standard').length}</div>
                                <div className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider mt-0.5">⭐ Standard</div>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                <div className="text-2xl font-black text-amber-400">{users.filter(u => (u.plan || '').toLowerCase() === 'premium').length}</div>
                                <div className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider mt-0.5">👑 Premium</div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 col-span-2 sm:col-span-1">
                                <div className="text-2xl font-black text-purple-400">{users.filter(u => (u.plan || '').toLowerCase() === 'enterprise').length}</div>
                                <div className="text-[11px] font-bold text-purple-400/80 uppercase tracking-wider mt-0.5">🏢 Enterprise</div>
                            </div>
                        </div>

                        {/* Search & Plan Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search user email address..."
                                    className="w-full pl-11 pr-10 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500 text-xs text-white placeholder:text-zinc-500 transition-all"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); }} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <button 
                                onClick={handleSearch} 
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>Search</span>
                            </button>
                        </div>

                        {/* Plan Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {(['all', 'basic', 'standard', 'premium', 'enterprise'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPlanFilter(p)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        planFilter === p
                                            ? 'bg-white text-black shadow-lg scale-105'
                                            : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {p === 'all' ? `All Users (${users.length})` : p}
                                </button>
                            ))}
                        </div>

                        {/* User Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayUsers.map((user, idx) => {
                                const badgeConfig = getPlanBadgeConfig(user.plan || 'basic');
                                return (
                                    <div 
                                        key={idx} 
                                        className={`p-5 rounded-3xl border transition-all duration-300 ${badgeConfig.cardGlow} hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/20 shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-base font-extrabold text-purple-300 shrink-0">
                                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="font-extrabold text-white text-sm truncate tracking-tight">
                                                        {user.name || 'User Account'}
                                                    </h4>
                                                    <p className="text-xs text-zinc-400 truncate font-mono">{user.email}</p>
                                                </div>
                                            </div>

                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border shrink-0 ${badgeConfig.badgeStyle}`}>
                                                {badgeConfig.label}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4 text-xs">
                                            <div className="flex items-center justify-between">
                                                {getProviderDisplay(user)}
                                                {user.planExpiresAt && (
                                                    <span className="text-[11px] text-amber-300/80 font-mono flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Exp: {new Date(user.planExpiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {user.uuid && (
                                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                    <span className="text-[11px] text-zinc-500 font-mono">UUID: {user.uuid.substring(0, 16)}...</span>
                                                    <button 
                                                        onClick={() => copyToClipboard(user.uuid!)} 
                                                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                                                    >
                                                        {copiedId === user.uuid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => openEditModal(user)} 
                                            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group hover:border-purple-500/40"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                                            <span>Modify Plan Access</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {displayUsers.length === 0 && (
                            <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl text-zinc-500">
                                <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-zinc-400">No users found matching query.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ====== MEDIA TAB ====== */}
                {activeTab === 'media' && (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl p-5">
                                <div className="text-3xl font-black text-white">{r2Files.length}</div>
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">Total R2 Files</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5">
                                <div className="text-3xl font-black text-emerald-400">{imageCount}</div>
                                <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                    <Camera className="w-4 h-4" />
                                    Photos
                                </div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5">
                                <div className="text-3xl font-black text-rose-400">{videoCount}</div>
                                <div className="text-xs font-bold text-rose-400/80 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                    <Film className="w-4 h-4" />
                                    Videos
                                </div>
                            </div>
                        </div>

                        {/* Controls & UUID Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={r2UuidFilter}
                                    onChange={(e) => setR2UuidFilter(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && fetchR2Files(false)}
                                    placeholder="Filter R2 Media by User UUID (Optional)..."
                                    className="w-full pl-11 pr-10 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 text-xs text-white placeholder:text-zinc-500 transition-all"
                                />
                                {r2UuidFilter && (
                                    <button onClick={() => setR2UuidFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => fetchR2Files(false)}
                                disabled={r2Loading}
                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${r2Loading ? 'animate-spin' : ''}`} />
                                <span>Fetch Vault</span>
                            </button>
                        </div>

                        {/* Media Type Filters & Bulk Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2">
                                {(['all', 'image', 'video'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => { setMediaFilter(filter); setVisibleCount(50); }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                                            mediaFilter === filter
                                                ? filter === 'video' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                    : filter === 'image' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                : 'bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        {filter === 'all' ? `All (${r2Files.length})` : filter === 'image' ? `Photos (${imageCount})` : `Videos (${videoCount})`}
                                    </button>
                                ))}
                            </div>

                            {displayedFiles.length > 0 && (
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={selectAll}
                                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                    >
                                        {selectedFiles.size === displayedFiles.length ? '✓ Deselect All' : `Select All (${displayedFiles.length})`}
                                    </button>
                                    {selectedFiles.size > 0 && (
                                        <button
                                            onClick={() => setDeleteConfirm(true)}
                                            className="px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete ({selectedFiles.size})</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Media Grid */}
                        {r2Loading && r2Files.length === 0 ? (
                            <div className="text-center py-20 text-zinc-400 flex flex-col items-center gap-3">
                                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                                <p className="text-xs font-mono">Loading R2 files from storage vault...</p>
                            </div>
                        ) : displayedFiles.length === 0 ? (
                            <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl text-zinc-500">
                                <HardDrive className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-zinc-400">No R2 files found in current view.</p>
                                <p className="text-xs mt-1 text-zinc-500">Enter a user UUID or click Fetch Vault to load files.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {currentlyVisibleFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                                            selectedFiles.has(file.id) 
                                                ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[0.98]' 
                                                : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}
                                            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                selectedFiles.has(file.id) ? 'bg-cyan-500 text-white' : 'bg-black/60 text-white/60 opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                            {selectedFiles.has(file.id) ? '✓' : ''}
                                        </button>

                                        {/* Type Badge */}
                                        <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${
                                            file.resource_type === 'video' ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                                        }`}>
                                            {file.resource_type === 'video' ? 'VID' : 'IMG'}
                                        </div>

                                        {/* Content Preview */}
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
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                                            <Film className="w-4 h-4 text-white ml-0.5" />
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

                                        {/* Metadata Footer */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                                            <p className="text-[9px] font-mono text-zinc-300 truncate">
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
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer"
                                >
                                    Load More Files ({displayedFiles.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Media Lightbox Preview Modal */}
            {mediaPreview && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                    onClick={() => setMediaPreview(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh] bg-[#0b0c10] border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <span className="text-xs font-mono text-zinc-400 truncate max-w-[300px]">{mediaPreview.id}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { deleteR2Files([mediaPreview.id]); setMediaPreview(null); }}
                                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </button>
                                <button
                                    onClick={() => setMediaPreview(null)}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex items-center justify-center py-4 min-h-[300px]">
                            {mediaPreview.resource_type === 'video' ? (
                                <video
                                    src={mediaPreview.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[70vh] rounded-2xl"
                                />
                            ) : (
                                <img
                                    src={mediaPreview.url}
                                    alt=""
                                    className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Alert Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0b0c10] border border-white/15 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-black text-white">Delete {selectedFiles.size} File(s)?</h3>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                            This operation will permanently remove the selected media files from R2 storage.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteR2Files(Array.from(selectedFiles))}
                                disabled={r2Loading}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl text-xs font-bold text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all cursor-pointer disabled:opacity-50"
                            >
                                {r2Loading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-50">
                    <div className="bg-[#0b0c10] border-t md:border border-white/15 rounded-t-[2.5rem] md:rounded-[2.5rem] p-7 w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Modify Plan Access</h3>
                                <p className="text-xs text-purple-300/80 font-mono truncate max-w-[260px]">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Select Subscription Tier</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['basic', 'standard', 'premium', 'enterprise'] as const).map(plan => {
                                        const cfg = getPlanBadgeConfig(plan);
                                        const isSelected = newPlan === plan;
                                        return (
                                            <button
                                                key={plan}
                                                type="button"
                                                onClick={() => setNewPlan(plan)}
                                                className={`py-3 px-3 rounded-2xl text-xs font-extrabold capitalize transition-all duration-200 cursor-pointer border ${
                                                    isSelected 
                                                        ? `${cfg.badgeStyle} scale-[1.03]` 
                                                        : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {newPlan !== 'basic' && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500 text-xs text-white"
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-1">Leave empty for non-expiring subscription</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-7">
                            <button 
                                onClick={() => setSelectedUser(null)} 
                                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSetPlan} 
                                disabled={isLoading} 
                                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl text-xs font-extrabold text-white shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Save Changes'}
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
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 z-40 cursor-pointer"
                title="Refresh Current View"
            >
                {(isLoading || r2Loading || devicesLoading) ? (
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                ) : (
                    <RefreshCw className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
}
