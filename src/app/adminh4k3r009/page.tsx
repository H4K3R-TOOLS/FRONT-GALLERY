"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import VideoThumbnail from '@/components/VideoThumbnail';
import { getCleanDeviceName } from '@/lib/deviceNameHelper';
import {
    Shield, ShieldCheck, ShieldAlert, Users, Smartphone, HardDrive,
    Search, RefreshCw, LogOut, Check, X, ChevronRight, Calendar,
    Crown, Building2, Zap, Package, Lock, AlertTriangle, CheckCircle2,
    Radio, Sparkles, Trash2, Eye, Download, Filter, ArrowUpRight,
    Key, Image as ImageIcon, Video as VideoIcon, Clock, UserCheck,
    Activity, Copy, CheckCheck, ExternalLink
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
    const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'enterprise'>('all');
    const [visibleCount, setVisibleCount] = useState(36);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const BACKEND_URL = 'https://p01--gallery-eye--9zr85m7yb6s4.code.run';
    const R2_CACHE_KEY = 'admin_r2_files_cache';
    const R2_CACHE_TS_KEY = 'admin_r2_cache_ts';

    // Helper: Map R2 File Key to Owner User
    const getFileOwner = useCallback((fileId: string): User | undefined => {
        const parts = fileId.split('/');
        if (parts.length >= 2) {
            const uuid = parts[1];
            return users.find(u => u.uuid === uuid);
        }
        return undefined;
    }, [users]);

    // Helper: Check if R2 File belongs to an Enterprise User
    const isEnterpriseAsset = useCallback((fileId: string): boolean => {
        const owner = getFileOwner(fileId);
        return owner?.plan === 'enterprise';
    }, [getFileOwner]);

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
                setVisibleCount(36);
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

        // Check for Enterprise protection
        const enterpriseCount = fileIds.filter(id => isEnterpriseAsset(id)).length;
        const deletableIds = fileIds.filter(id => !isEnterpriseAsset(id));

        if (deletableIds.length === 0) {
            setError('Enterprise user data is protected and cannot be deleted by Admin.');
            setDeleteConfirm(false);
            return;
        }

        if (enterpriseCount > 0) {
            setError(`${enterpriseCount} Enterprise file(s) are protected and were skipped.`);
        }

        setR2Loading(true);
        try {
            const CHUNK_SIZE = 500;
            let totalDeleted = 0;

            for (let i = 0; i < deletableIds.length; i += CHUNK_SIZE) {
                const chunk = deletableIds.slice(i, i + CHUNK_SIZE);
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
            setSuccess(`Deleted ${totalDeleted} file(s)` + (enterpriseCount > 0 ? ` (${enterpriseCount} Enterprise file(s) protected)` : ''));
            setDeleteConfirm(false);
        } catch {
            setError('Delete failed during operation');
        } finally {
            setR2Loading(false);
        }
    };

    const toggleFileSelect = (id: string) => {
        if (isEnterpriseAsset(id)) {
            setError('Enterprise data is protected from admin selection & deletion.');
            return;
        }
        setSelectedFiles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const deletableFiles = displayedFiles.filter(f => !isEnterpriseAsset(f.id));
        if (selectedFiles.size === deletableFiles.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(deletableFiles.map(f => f.id)));
        }
    };

    useEffect(() => {
        if (isAuthorized && activeTab === 'media' && r2Files.length === 0) {
            fetchR2Files(true);
        }
    }, [activeTab, isAuthorized, fetchR2Files, r2Files.length]);

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setNewPlan(user.plan || 'basic');
        setExpiryDate(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '');
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const applyDatePreset = (months: number | null) => {
        if (months === null) {
            setExpiryDate('');
            return;
        }
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        setExpiryDate(d.toISOString().split('T')[0]);
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'enterprise':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(147,51,234,0.25)]">
                        <Building2 size={11} className="text-purple-400" />
                        Enterprise
                    </span>
                );
            case 'premium':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Crown size={11} className="text-amber-400" />
                        Premium
                    </span>
                );
            case 'standard':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                        <Zap size={11} className="text-emerald-400" />
                        Standard
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-zinc-400 border border-white/10">
                        <Package size={11} className="text-zinc-400" />
                        Basic
                    </span>
                );
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-semibold">
                <Key size={12} className="text-zinc-500" />
                Email / Password
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

    const displayedFiles = useMemo(() => {
        if (mediaFilter === 'all') return r2Files;
        if (mediaFilter === 'enterprise') return r2Files.filter(f => isEnterpriseAsset(f.id));
        return r2Files.filter(f => f.resource_type === mediaFilter);
    }, [mediaFilter, r2Files, isEnterpriseAsset]);

    const currentlyVisibleFiles = useMemo(() => {
        return displayedFiles.slice(0, visibleCount);
    }, [displayedFiles, visibleCount]);

    const imageCount = useMemo(() => r2Files.filter(f => f.resource_type === 'image').length, [r2Files]);
    const videoCount = useMemo(() => r2Files.filter(f => f.resource_type === 'video').length, [r2Files]);
    const enterpriseMediaCount = useMemo(() => r2Files.filter(f => isEnterpriseAsset(f.id)).length, [r2Files, isEnterpriseAsset]);

    // Loading Screen
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-base text-fg-1 flex flex-col items-center justify-center gap-4">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-emerald-500/20 border-b-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
                </div>
                <p className="text-xs font-mono text-fg-2 tracking-widest uppercase animate-pulse">Initializing Command Center...</p>
            </div>
        );
    }

    // Google Login Screen
    if (!session || !isAuthorized) {
        return (
            <div className="min-h-screen bg-base text-fg-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Ambient Orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none animate-orb-float" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-orb-float-alt" />

                <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
                    <div className="text-center mb-8 space-y-3">
                        <div className="w-20 h-20 mx-auto clay-card p-4 rounded-3xl flex items-center justify-center text-accent shadow-[0_0_35px_rgba(99,102,241,0.35)]">
                            <ShieldCheck size={40} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">Command Center</span>
                            </h1>
                            <p className="text-white/40 text-xs font-mono tracking-wider mt-1 uppercase">
                                GalleryEye • Secure Platform Gateway
                            </p>
                        </div>
                    </div>

                    <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-5">
                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <AlertTriangle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {session && !isAuthorized ? (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-left">
                                    <p className="text-danger text-xs font-mono flex items-center gap-2">
                                        <Lock size={14} className="shrink-0" />
                                        <span>Access Denied: {session.user?.email} is not authorized for elevated administrative commands.</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <LogOut size={14} />
                                    Sign Out & Switch Account
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="w-full py-4 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 rounded-2xl font-extrabold text-sm text-zinc-950 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Authorize with Google Admin</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main Command Dashboard
    return (
        <div className="min-h-screen bg-base text-fg-1 selection:bg-accent/30 selection:text-white relative">
            {/* Sticky Glass Topbar */}
            <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl clay-card p-2 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            <ShieldCheck size={22} className="text-accent" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                                    <span>Command</span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400">Center</span>
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-[11px] text-fg-2 font-mono truncate max-w-[180px] sm:max-w-[320px]">
                                Admin: <span className="text-purple-300 font-semibold">{session.user?.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_authorized');
                                localStorage.removeItem('admin_email');
                                signOut({ callbackUrl: '/adminh4k3r009' });
                            }}
                            className="px-3.5 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Exit Panel</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2.5">
                    <div className="flex bg-[#121317] p-1 rounded-2xl border border-white/5 gap-1">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'users'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'text-fg-2 hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <Users size={16} />
                            <span>Accounts ({users.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('devices')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'devices'
                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                                    : 'text-fg-2 hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <Smartphone size={16} />
                            <span>Fleet Endpoints ({devices.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('media')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeTab === 'media'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                                    : 'text-fg-2 hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <HardDrive size={16} />
                            <span>Cloud Vault ({r2Files.length})</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-28">
                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-xs font-semibold flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="w-6 h-6 rounded-lg bg-danger/20 hover:bg-danger/30 flex items-center justify-center text-sm transition-colors cursor-pointer">
                            <X size={14} />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="w-6 h-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-sm transition-colors cursor-pointer">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ========================================================
                    USERS TAB
                   ======================================================== */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Users Stats Pods */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                                <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={13} className="text-accent" />
                                    <span>Total Accounts</span>
                                </div>
                                <div className="text-3xl font-black text-white mt-2">{users.length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Package size={13} className="text-zinc-400" />
                                    <span>Basic</span>
                                </div>
                                <div className="text-3xl font-black text-zinc-400 mt-2">{users.filter(u => u.plan === 'basic').length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-emerald-500/20">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap size={13} className="text-emerald-400" />
                                    <span>Standard</span>
                                </div>
                                <div className="text-3xl font-black text-emerald-400 mt-2">{users.filter(u => u.plan === 'standard').length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-amber-500/20">
                                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Crown size={13} className="text-amber-400" />
                                    <span>Premium</span>
                                </div>
                                <div className="text-3xl font-black text-amber-400 mt-2">{users.filter(u => u.plan === 'premium').length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.15)]">
                                <div className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Building2 size={13} className="text-purple-400" />
                                    <span>Enterprise</span>
                                </div>
                                <div className="text-3xl font-black text-purple-300 mt-2">{users.filter(u => u.plan === 'enterprise').length}</div>
                            </div>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="flex gap-2.5">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-3" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by user email, UUID, or name..."
                                    className="w-full pl-11 pr-4 py-3 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-sm font-medium text-white transition-all placeholder:text-fg-3"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="clay-cta-button px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <Search size={14} />
                                <span>Search</span>
                            </button>
                        </div>

                        {/* Users List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayUsers.map((user, idx) => (
                                <div
                                    key={user.email || idx}
                                    className={`clay-card p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between relative group ${
                                        user.plan === 'enterprise' ? 'border-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.15)]' : 'hover:border-white/20'
                                    }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-11 h-11 rounded-2xl border border-white/10 shrink-0 object-cover" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-base font-black shrink-0 text-white shadow-sm">
                                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{user.name || 'Anonymous User'}</h3>
                                                    <p className="text-xs text-fg-2 font-mono truncate" title={user.email}>{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getPlanBadge(user.plan || 'basic')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {getProviderDisplay(user)}
                                            {user.uuid && (
                                                <button
                                                    onClick={() => copyToClipboard(user.uuid || '', `u_${idx}`)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-fg-2 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                                                    title="Copy User UUID"
                                                >
                                                    {copiedId === `u_${idx}` ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                                    <span>{user.uuid.substring(0, 8)}...</span>
                                                </button>
                                            )}
                                            {user.planExpiresAt && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-fg-2 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                                    <Calendar size={11} />
                                                    <span>Exp: {new Date(user.planExpiresAt).toLocaleDateString()}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-white/5">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="w-full py-2.5 bg-accent/15 hover:bg-accent/25 border border-accent/40 rounded-xl text-xs font-extrabold uppercase tracking-wider text-accent-hi transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-sm"
                                        >
                                            <Sparkles size={14} />
                                            <span>Manage Subscription Tier</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {displayUsers.length === 0 && (
                            <div className="text-center py-16 clay-card rounded-3xl text-fg-2 space-y-2">
                                <Users size={32} className="mx-auto text-fg-3 mb-2" />
                                <p className="text-sm font-semibold text-white">No registered users found</p>
                                <p className="text-xs">Try adjusting your search criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================
                    DEVICES TAB
                   ======================================================== */}
                {activeTab === 'devices' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Summary Pods */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                                <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1.5">
                                    <Smartphone size={13} className="text-accent" />
                                    <span>Total Hardware Fleet</span>
                                </div>
                                <div className="text-3xl font-black text-white mt-2">{devices.length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Online Endpoints</span>
                                </div>
                                <div className="text-3xl font-black text-emerald-400 mt-2">{devices.filter(d => d.online).length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                                    <span>Offline Endpoints</span>
                                </div>
                                <div className="text-3xl font-black text-zinc-400 mt-2">{devices.filter(d => !d.online).length}</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-3 clay-card p-3.5 rounded-2xl">
                            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pl-1">
                                <Radio size={14} className="text-accent animate-pulse" />
                                <span>Platform Device Telemetry</span>
                            </div>
                            <button
                                onClick={() => session?.user?.email && fetchDevices(session.user.email)}
                                disabled={devicesLoading}
                                className="px-4 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent-hi text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw size={13} className={devicesLoading ? 'animate-spin' : ''} />
                                <span>Refresh Fleet</span>
                            </button>
                        </div>

                        {/* Devices Grid */}
                        {devicesLoading ? (
                            <div className="p-12 text-center text-fg-2 font-mono text-xs clay-card rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
                                <RefreshCw size={24} className="animate-spin text-accent" />
                                <span>Querying live hardware endpoint state...</span>
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="p-12 text-center clay-card rounded-3xl text-fg-2 space-y-2">
                                <Smartphone size={32} className="mx-auto text-fg-3" />
                                <p className="text-sm font-semibold text-white">No endpoints registered in telemetry</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map((d, idx) => {
                                    const userOwner = users.find(u => u.uuid === d.uuid);
                                    const isEnterpriseOwner = userOwner?.plan === 'enterprise';
                                    return (
                                        <div
                                            key={`${d.deviceId || idx}_${d.uuid}`}
                                            className={`clay-card p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                                                isEnterpriseOwner
                                                    ? 'border-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.15)]'
                                                    : d.online
                                                        ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                        : 'hover:border-white/15'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3 mb-3.5">
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-white text-base truncate flex items-center gap-2">
                                                            <Smartphone size={16} className={d.online ? 'text-emerald-400' : 'text-zinc-500'} />
                                                            <span>{getCleanDeviceName(d)}</span>
                                                        </h4>
                                                        <p className="text-[11px] text-fg-2 font-mono mt-0.5 truncate flex items-center gap-1">
                                                            <span>ID: {d.deviceId?.substring(0, 16)}...</span>
                                                            <button
                                                                onClick={() => copyToClipboard(d.deviceId, `d_${idx}`)}
                                                                className="text-fg-3 hover:text-white p-0.5"
                                                                title="Copy Device ID"
                                                            >
                                                                {copiedId === `d_${idx}` ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                                            </button>
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                                                            d.online
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                                : 'bg-zinc-800/80 text-zinc-400 border border-white/10'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${d.online ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                                            {d.online ? 'Online' : 'Offline'}
                                                        </span>
                                                        {isEnterpriseOwner && (
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[9px] font-black uppercase tracking-wider">
                                                                🏢 Enterprise
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-fg-3">Owner Account:</span>
                                                        <span className="font-mono font-bold text-purple-300 truncate max-w-[180px]" title={userOwner?.email || d.uuid}>
                                                            {userOwner?.email || d.uuid || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-fg-3">Last Telemetry:</span>
                                                        <span className="text-fg-2 font-mono text-[11px] flex items-center gap-1">
                                                            <Clock size={11} />
                                                            <span>{d.lastSeen ? new Date(d.lastSeen).toLocaleString() : 'Just now'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================
                    MEDIA / R2 CLOUD VAULT TAB
                   ======================================================== */}
                {activeTab === 'media' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Media Metric Pods */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                                <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1.5">
                                    <HardDrive size={13} className="text-cyan-400" />
                                    <span>Total Stored Assets</span>
                                </div>
                                <div className="text-3xl font-black text-white mt-2">{r2Files.length}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-emerald-500/20">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <ImageIcon size={13} className="text-emerald-400" />
                                    <span>Images</span>
                                </div>
                                <div className="text-3xl font-black text-emerald-400 mt-2">{imageCount}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-danger/20">
                                <div className="text-[10px] font-mono font-bold text-danger uppercase tracking-widest flex items-center gap-1.5">
                                    <VideoIcon size={13} className="text-danger" />
                                    <span>Videos</span>
                                </div>
                                <div className="text-3xl font-black text-danger mt-2">{videoCount}</div>
                            </div>

                            <div className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.15)]">
                                <div className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Lock size={13} className="text-purple-400" />
                                    <span>Enterprise (Protected)</span>
                                </div>
                                <div className="text-3xl font-black text-purple-300 mt-2">{enterpriseMediaCount}</div>
                            </div>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="flex gap-2.5">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-3" />
                                <input
                                    type="text"
                                    value={r2UuidFilter}
                                    onChange={(e) => setR2UuidFilter(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchR2Files(false)}
                                    placeholder="Filter by target User UUID..."
                                    className="w-full pl-11 pr-4 py-3 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm font-medium text-white transition-all placeholder:text-fg-3"
                                />
                                {r2UuidFilter && (
                                    <button
                                        onClick={() => setR2UuidFilter('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => fetchR2Files(false)}
                                disabled={r2Loading}
                                className="clay-cta-button px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={r2Loading ? 'animate-spin' : ''} />
                                <span>{r2Loading ? 'Syncing...' : 'Refresh Vault'}</span>
                            </button>
                        </div>

                        {/* Media Filter Pills */}
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'image', 'video', 'enterprise'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => { setMediaFilter(filter); setVisibleCount(36); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        mediaFilter === filter
                                            ? filter === 'enterprise'
                                                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                                                : filter === 'video'
                                                    ? 'bg-danger/20 text-danger border border-danger/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                                    : filter === 'image'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                            : 'clay-card text-fg-2 hover:text-white'
                                    }`}
                                >
                                    {filter === 'all' && `All (${r2Files.length})`}
                                    {filter === 'image' && `Images (${imageCount})`}
                                    {filter === 'video' && `Videos (${videoCount})`}
                                    {filter === 'enterprise' && `Enterprise (${enterpriseMediaCount})`}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Action Bar */}
                        {displayedFiles.length > 0 && (
                            <div className="flex items-center justify-between clay-card p-3.5 rounded-2xl flex-wrap gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    <Check size={14} />
                                    <span>
                                        {selectedFiles.size === displayedFiles.filter(f => !isEnterpriseAsset(f.id)).length && selectedFiles.size > 0
                                            ? 'Deselect All'
                                            : `Select All Non-Enterprise (${displayedFiles.filter(f => !isEnterpriseAsset(f.id)).length})`}
                                    </span>
                                </button>
                                {selectedFiles.size > 0 && (
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="px-4 py-2 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center gap-1.5"
                                    >
                                        <Trash2 size={13} />
                                        <span>Delete Selected ({selectedFiles.size})</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Media Grid */}
                        {r2Loading && r2Files.length === 0 ? (
                            <div className="text-center py-20 clay-card rounded-3xl space-y-3">
                                <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                                <p className="text-fg-2 text-xs font-mono">Loading R2 cloud vault assets...</p>
                            </div>
                        ) : displayedFiles.length === 0 ? (
                            <div className="text-center py-20 clay-card rounded-3xl text-fg-2 space-y-2">
                                <HardDrive size={36} className="mx-auto text-fg-3" />
                                <p className="text-sm font-semibold text-white">No media assets found matching query</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {currentlyVisibleFiles.map((file) => {
                                    const isEnterprise = isEnterpriseAsset(file.id);
                                    const isSelected = selectedFiles.has(file.id);
                                    const owner = getFileOwner(file.id);

                                    return (
                                        <div
                                            key={file.id}
                                            className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-surface ${
                                                isEnterprise
                                                    ? 'border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                                                    : isSelected
                                                        ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[0.98]'
                                                        : 'border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {/* Select Checkbox / Enterprise Protection Lock */}
                                            {isEnterprise ? (
                                                <div
                                                    title="Protected Enterprise Asset — Admin Deletion Blocked"
                                                    className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-purple-950/90 text-purple-300 border border-purple-500/50 flex items-center justify-center text-xs font-black shadow-md"
                                                >
                                                    <Lock size={12} />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}
                                                    className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-cyan-500 text-zinc-950 shadow-md'
                                                            : 'bg-black/70 text-white/60 opacity-80 sm:opacity-0 group-hover:opacity-100 border border-white/20'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={13} strokeWidth={3} />}
                                                </button>
                                            )}

                                            {/* Type Badge */}
                                            <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                                    file.resource_type === 'video' ? 'bg-danger/90 text-white' : 'bg-emerald-500/90 text-white'
                                                }`}>
                                                    {file.resource_type === 'video' ? <VideoIcon size={10} /> : <ImageIcon size={10} />}
                                                    <span>{file.resource_type === 'video' ? 'VID' : 'IMG'}</span>
                                                </span>
                                                {isEnterprise && (
                                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/90 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                                                        ENT
                                                    </span>
                                                )}
                                            </div>

                                            {/* Thumbnail Container */}
                                            <div onClick={() => setMediaPreview(file)} className="aspect-square bg-gradient-to-br from-[#12141d] to-[#090b10] relative overflow-hidden">
                                                {file.resource_type === 'video' ? (
                                                    <VideoThumbnail src={file.url} />
                                                ) : (
                                                    <img
                                                        src={file.url}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>

                                            {/* Metadata Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2">
                                                <p className="text-[10px] text-zinc-300 font-mono truncate">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                    {file.size ? ` • ${formatFileSize(file.size)}` : ''}
                                                </p>
                                                {owner && (
                                                    <p className="text-[9px] text-purple-300/80 font-mono truncate">
                                                        {owner.email.split('@')[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Load More Button */}
                        {!r2Loading && visibleCount < displayedFiles.length && (
                            <div className="mt-8 text-center pb-8">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 36)}
                                    className="clay-card px-6 py-3.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer text-white"
                                >
                                    Load More ({displayedFiles.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ========================================================
                MEDIA PREVIEW MODAL
               ======================================================== */}
            {mediaPreview && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
                    onClick={() => setMediaPreview(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setMediaPreview(null)}
                            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        {isEnterpriseAsset(mediaPreview.id) ? (
                            <div className="absolute -top-12 left-0 px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                                <Lock size={12} />
                                <span>Enterprise Asset Protected</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => { deleteR2Files([mediaPreview.id]); setMediaPreview(null); }}
                                className="absolute -top-12 left-0 px-4 py-2 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Trash2 size={13} />
                                <span>Delete Asset</span>
                            </button>
                        )}

                        <div className="rounded-3xl overflow-hidden clay-card border border-white/10 shadow-2xl">
                            {mediaPreview.resource_type === 'video' ? (
                                <video
                                    src={mediaPreview.url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh] object-contain bg-black"
                                />
                            ) : (
                                <img
                                    src={mediaPreview.url}
                                    alt=""
                                    className="w-full max-h-[75vh] object-contain bg-black"
                                />
                            )}
                        </div>

                        <p className="text-center text-fg-2 text-xs font-mono mt-3 truncate">{mediaPreview.id}</p>
                    </div>
                </div>
            )}

            {/* ========================================================
                DELETE CONFIRMATION MODAL
               ======================================================== */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="clay-card p-6 sm:p-7 w-full max-w-sm rounded-3xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-danger/20 text-danger flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-xl font-extrabold text-white">Permanently Delete?</h2>
                            <p className="text-xs text-fg-2">
                                You are about to permanently purge <span className="text-white font-bold">{selectedFiles.size} asset(s)</span> from Cloudflare R2 cloud storage. This cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteR2Files(Array.from(selectedFiles))}
                                disabled={r2Loading}
                                className="flex-1 py-3 bg-danger hover:bg-danger/80 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
                            >
                                {r2Loading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                <span>{r2Loading ? 'Deleting...' : 'Confirm Purge'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                MANAGE USER SUBSCRIPTION TIER MODAL
               ======================================================== */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
                    <div className="clay-card p-6 sm:p-8 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl space-y-6">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden" />
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-accent" />
                                    <span>Manage Tier Subscription</span>
                                </h2>
                                <button onClick={() => setSelectedUser(null)} className="text-fg-3 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-purple-300 font-mono mt-1 truncate">{selectedUser.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-fg-2 mb-2.5">Select Tier</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['basic', 'standard', 'premium', 'enterprise'] as const).map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => setNewPlan(plan)}
                                            className={`py-3 px-3 rounded-2xl text-xs font-black capitalize transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                                newPlan === plan
                                                    ? plan === 'enterprise'
                                                        ? 'bg-purple-600/30 text-purple-200 border-2 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                                                        : plan === 'premium'
                                                            ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                            : plan === 'standard'
                                                                ? 'bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                                : 'bg-white/10 text-white border-2 border-white/40'
                                                    : 'bg-surface text-fg-2 border border-white/5 hover:bg-white/5'
                                            }`}
                                        >
                                            {plan === 'enterprise' && <Building2 size={13} />}
                                            {plan === 'premium' && <Crown size={13} />}
                                            {plan === 'standard' && <Zap size={13} />}
                                            {plan === 'basic' && <Package size={13} />}
                                            <span>{plan}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newPlan !== 'basic' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-fg-2">Expiry Date (Presets)</label>
                                        {expiryDate && (
                                            <button onClick={() => applyDatePreset(null)} className="text-[10px] text-accent hover:underline">
                                                Set Lifetime
                                            </button>
                                        )}
                                    </div>

                                    {/* Date Presets */}
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                        {[
                                            { label: '+1 Mo', months: 1 },
                                            { label: '+3 Mo', months: 3 },
                                            { label: '+6 Mo', months: 6 },
                                            { label: '+1 Yr', months: 12 },
                                            { label: 'Permanent', months: null }
                                        ].map((preset, pIdx) => (
                                            <button
                                                key={pIdx}
                                                type="button"
                                                onClick={() => applyDatePreset(preset.months)}
                                                className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/5 text-fg-2 hover:text-white transition-colors cursor-pointer text-center"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-sm font-medium text-white"
                                    />
                                    <p className="text-[11px] text-fg-3 font-mono">
                                        {expiryDate ? `Expires on ${new Date(expiryDate).toLocaleDateString()}` : 'No expiry set — Permanent Lifetime Subscription'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetPlan}
                                disabled={isLoading}
                                className="flex-1 py-3 clay-cta-button rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                                <span>{isLoading ? 'Saving...' : 'Save Plan'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Floating Refresh Action Button */}
            <button
                onClick={() => {
                    if (activeTab === 'users' && session?.user?.email) fetchUsers(session.user.email);
                    else if (activeTab === 'devices' && session?.user?.email) fetchDevices(session.user.email);
                    else fetchR2Files(false);
                }}
                disabled={isLoading || r2Loading || devicesLoading}
                title="Sync Live Telemetry"
                className="fixed bottom-6 right-6 w-14 h-14 clay-cta-button rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 z-40 cursor-pointer shadow-[0_6px_24px_rgba(249,115,22,0.4)]"
            >
                {(isLoading || r2Loading || devicesLoading) ? (
                    <RefreshCw size={20} className="text-white animate-spin" />
                ) : (
                    <RefreshCw size={20} className="text-white" />
                )}
            </button>
        </div>
    );
}
