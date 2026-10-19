"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import VideoThumbnail from '@/components/VideoThumbnail';
import {
    ShieldCheck, Users, Smartphone, HardDrive,
    Search, RefreshCw, LogOut, Check, X, Calendar,
    Crown, Building2, Zap, Package, Lock, AlertTriangle, CheckCircle2,
    Radio, Sparkles, Trash2, Eye, Key, Image as ImageIcon, Video as VideoIcon,
    Copy, CheckCheck, Folder, ArrowLeft, ChevronRight
} from 'lucide-react';
import { FastImage, WindowedMediaCard } from '@/components/FastThumbnail';

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
    const [hasSearched, setHasSearched] = useState(false);
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
    const [visibleCount, setVisibleCount] = useState(30);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Selected User Folder for Grouped Media View
    const [selectedUserFolder, setSelectedUserFolder] = useState<{
        uuid: string;
        user?: User;
        total: number;
        images: number;
        videos: number;
        enterprise: boolean;
    } | null>(null);
    const [folderSearchQuery, setFolderSearchQuery] = useState('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spynox.collyes2.workers.dev';
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
        const trimmed = searchQuery.trim();
        if (!trimmed || !session?.user?.email) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        setIsLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/users/search?email=${encodeURIComponent(trimmed)}&q=${encodeURIComponent(trimmed)}`, {
                headers: { 'x-admin-email': session.user.email }
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            } else {
                setSearchResults([]);
            }
        } catch {
            setError('Search failed');
            setSearchResults([]);
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
    const fetchR2Files = useCallback(async (useCache = false, specificUuid?: string) => {
        if (!session?.user?.email) return;

        if (useCache && !specificUuid) {
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
            const targetUuid = specificUuid || r2UuidFilter.trim();
            const url = targetUuid
                ? `${BACKEND_URL}/admin/r2-files?uuid=${encodeURIComponent(targetUuid)}`
                : `${BACKEND_URL}/admin/r2-files`;
            const res = await fetch(url, {
                headers: { 'x-admin-email': session.user.email }
            });
            if (res.ok) {
                const data = await res.json();
                if (specificUuid) {
                    setR2Files(prev => {
                        const others = prev.filter(f => !f.id.startsWith(`gallery_sync/${specificUuid}/`));
                        return [...others, ...data];
                    });
                } else {
                    setR2Files(data);
                    try {
                        localStorage.setItem(R2_CACHE_KEY, JSON.stringify(data));
                        localStorage.setItem(R2_CACHE_TS_KEY, Date.now().toString());
                    } catch { /* ignore */ }
                }
                setVisibleCount(30);
            }
        } catch {
            setError('Failed to fetch media assets');
        } finally {
            setR2Loading(false);
        }
    }, [session, r2UuidFilter, BACKEND_URL]);

    const openUserFolder = async (folder: {
        uuid: string;
        user?: User;
        total: number;
        images: number;
        videos: number;
        enterprise: boolean;
    }) => {
        setSelectedUserFolder(folder);
        setSelectedFiles(new Set());
        setVisibleCount(30);
        const existingCount = r2Files.filter(f => f.id.startsWith(`gallery_sync/${folder.uuid}/`)).length;
        if (existingCount === 0) {
            await fetchR2Files(false, folder.uuid);
        }
    };

    const deleteR2Files = async (fileIds: string[]) => {
        if (!session?.user?.email || fileIds.length === 0) return;

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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                        <Building2 size={10} className="text-purple-400" />
                        Enterprise
                    </span>
                );
            case 'premium':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        <Crown size={10} className="text-amber-400" />
                        Premium
                    </span>
                );
            case 'standard':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        <Zap size={10} className="text-emerald-400" />
                        Standard
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-zinc-400 border border-white/10 shrink-0">
                        <Package size={10} className="text-zinc-400" />
                        Basic
                    </span>
                );
        }
    };

    const getProviderDisplay = (user: User) => {
        const isGoogle = user.provider === 'google' || user.image?.includes('googleusercontent') || user.image?.includes('google');
        return isGoogle ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
                <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Google
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-semibold">
                <Key size={10} className="text-zinc-500" />
                Password
            </span>
        );
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const displayUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (hasSearched) {
            return searchResults;
        }
        if (!query) return users;
        return users.filter(u =>
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.name && u.name.toLowerCase().includes(query)) ||
            (u.uuid && u.uuid.toLowerCase().includes(query))
        );
    }, [users, searchQuery, hasSearched, searchResults]);

    const userFolders = useMemo(() => {
        const map = new Map<string, {
            uuid: string;
            user?: User;
            total: number;
            images: number;
            videos: number;
            enterprise: boolean;
        }>();

        // 1. Group loaded files
        r2Files.forEach(file => {
            const parts = file.id.split('/');
            const uuid = parts.length >= 2 ? parts[1] : 'unknown';
            if (!map.has(uuid)) {
                const owner = users.find(u => u.uuid === uuid);
                map.set(uuid, {
                    uuid,
                    user: owner,
                    total: 0,
                    images: 0,
                    videos: 0,
                    enterprise: owner?.plan === 'enterprise'
                });
            }
            const item = map.get(uuid)!;
            item.total += 1;
            if (file.resource_type === 'video') item.videos += 1;
            else item.images += 1;
        });

        // 2. Also register users from user list so folders show up even before files load
        users.forEach(u => {
            if (u.uuid && !map.has(u.uuid)) {
                map.set(u.uuid, {
                    uuid: u.uuid,
                    user: u,
                    total: 0,
                    images: 0,
                    videos: 0,
                    enterprise: u.plan === 'enterprise'
                });
            }
        });

        const list = Array.from(map.values());
        if (!folderSearchQuery.trim()) {
            return list.sort((a, b) => b.total - a.total);
        }
        const q = folderSearchQuery.trim().toLowerCase();
        return list
            .filter(f =>
                f.uuid.toLowerCase().includes(q) ||
                (f.user?.email && f.user.email.toLowerCase().includes(q)) ||
                (f.user?.name && f.user.name.toLowerCase().includes(q))
            )
            .sort((a, b) => b.total - a.total);
    }, [r2Files, users, folderSearchQuery]);

    const activeUserFiles = useMemo(() => {
        if (!selectedUserFolder) return [];
        return r2Files.filter(f => f.id.startsWith(`gallery_sync/${selectedUserFolder.uuid}/`));
    }, [r2Files, selectedUserFolder]);

    const displayedFiles = useMemo(() => {
        const source = selectedUserFolder ? activeUserFiles : r2Files;
        if (mediaFilter === 'all') return source;
        if (mediaFilter === 'enterprise') return source.filter(f => isEnterpriseAsset(f.id));
        return source.filter(f => f.resource_type === mediaFilter);
    }, [mediaFilter, selectedUserFolder, activeUserFiles, r2Files, isEnterpriseAsset]);

    const currentlyVisibleFiles = useMemo(() => {
        return displayedFiles.slice(0, visibleCount);
    }, [displayedFiles, visibleCount]);

    const currentScopeFiles = useMemo(() => {
        return selectedUserFolder ? activeUserFiles : r2Files;
    }, [selectedUserFolder, activeUserFiles, r2Files]);

    const imageCount = useMemo(() => currentScopeFiles.filter(f => f.resource_type === 'image').length, [currentScopeFiles]);
    const videoCount = useMemo(() => currentScopeFiles.filter(f => f.resource_type === 'video').length, [currentScopeFiles]);
    const enterpriseMediaCount = useMemo(() => currentScopeFiles.filter(f => isEnterpriseAsset(f.id)).length, [currentScopeFiles, isEnterpriseAsset]);

    // Loading Screen
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-base text-fg-1 flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-[11px] font-mono text-fg-2 tracking-widest uppercase">Initializing Command Center...</p>
            </div>
        );
    }

    // Google Login Screen
    if (!session || !isAuthorized) {
        return (
            <div className="min-h-screen bg-base text-fg-1 flex items-center justify-center p-4 w-full overflow-x-hidden">
                <div className="w-full max-w-sm relative z-10 animate-in fade-in duration-200">
                    <div className="text-center mb-6 space-y-2">
                        <div className="w-16 h-16 mx-auto clay-card p-3 rounded-2xl flex items-center justify-center text-accent shadow-[0_0_25px_rgba(99,102,241,0.25)]">
                            <ShieldCheck size={32} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400">Command Center</span>
                            </h1>
                            <p className="text-white/40 text-[11px] font-mono tracking-wider mt-1 uppercase">
                                GalleryEye • Secure Gateway
                            </p>
                        </div>
                    </div>

                    <div className="clay-card p-5 sm:p-7 rounded-3xl space-y-4">
                        {error && (
                            <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-xs font-semibold flex items-center gap-2">
                                <AlertTriangle size={15} className="shrink-0" />
                                <span className="break-words">{error}</span>
                            </div>
                        )}

                        {session && !isAuthorized ? (
                            <div className="text-center space-y-3">
                                <div className="p-3 bg-danger/10 border border-danger/20 rounded-2xl text-left">
                                    <p className="text-danger text-xs font-mono flex items-center gap-2">
                                        <Lock size={13} className="shrink-0" />
                                        <span className="break-all">Access Denied: {session.user?.email}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <LogOut size={13} />
                                    Sign Out & Switch Account
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="w-full py-3.5 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 rounded-2xl font-extrabold text-xs sm:text-sm text-zinc-950 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Authorize with Google</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main Command Dashboard
    return (
        <div className="min-h-screen bg-base text-fg-1 selection:bg-accent/30 selection:text-white relative w-full overflow-x-hidden">
            {/* Sticky Compact Topbar */}
            <header className="sticky top-0 z-40 bg-[#131417]/95 backdrop-blur-md border-b border-white/5 shadow-md">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl clay-card p-1.5 flex items-center justify-center text-accent shrink-0">
                            <ShieldCheck size={18} className="text-accent" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h1 className="font-extrabold text-xs sm:text-base tracking-tight text-white truncate">
                                    <span>Command</span> <span className="text-accent">Center</span>
                                </h1>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-[10px] text-fg-2 font-mono truncate max-w-[130px] sm:max-w-[280px]">
                                {session.user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            onClick={() => {
                                if (activeTab === 'users' && session?.user?.email) fetchUsers(session.user.email);
                                else if (activeTab === 'devices' && session?.user?.email) fetchDevices(session.user.email);
                                else fetchR2Files(false);
                            }}
                            disabled={isLoading || r2Loading || devicesLoading}
                            title="Refresh Data"
                            className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-fg-2 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={(isLoading || r2Loading || devicesLoading) ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Sync</span>
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_authorized');
                                localStorage.removeItem('admin_email');
                                signOut({ callbackUrl: '/adminh4k3r009' });
                            }}
                            className="p-2 sm:px-3 sm:py-1.5 bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Exit Panel"
                        >
                            <LogOut size={13} />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>
                </div>

                {/* Mobile-Friendly Tabs */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2">
                    <div className="grid grid-cols-3 bg-[#101115] p-1 rounded-2xl border border-white/5 gap-1">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                                activeTab === 'users'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                    : 'text-fg-2 hover:text-white'
                            }`}
                        >
                            <Users size={14} className="shrink-0" />
                            <span className="truncate">
                                <span className="sm:hidden">Users</span>
                                <span className="hidden sm:inline">Accounts</span> ({users.length})
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('devices')}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                                activeTab === 'devices'
                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                                    : 'text-fg-2 hover:text-white'
                            }`}
                        >
                            <Smartphone size={14} className="shrink-0" />
                            <span className="truncate">
                                <span className="sm:hidden">Fleet</span>
                                <span className="hidden sm:inline">Fleet Endpoints</span> ({devices.length})
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('media')}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                                activeTab === 'media'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                    : 'text-fg-2 hover:text-white'
                            }`}
                        >
                            <HardDrive size={14} className="shrink-0" />
                            <span className="truncate">
                                <span className="sm:hidden">Vault</span>
                                <span className="hidden sm:inline">Cloud Vault</span> ({r2Files.length})
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28">
                {/* Alerts */}
                {error && (
                    <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 min-w-0">
                            <AlertTriangle size={15} className="shrink-0" />
                            <span className="break-words truncate">{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="p-1 rounded-lg bg-danger/20 hover:bg-danger/30 shrink-0 cursor-pointer">
                            <X size={12} />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={15} className="shrink-0" />
                            <span className="break-words truncate">{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 shrink-0 cursor-pointer">
                            <X size={12} />
                        </button>
                    </div>
                )}

                {/* ========================================================
                    USERS TAB
                   ======================================================== */}
                {activeTab === 'users' && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                        {/* Users Stats Pods */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px]">
                                <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1">
                                    <Users size={12} className="text-accent" />
                                    <span>Total</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{users.length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px]">
                                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <Package size={12} className="text-zinc-400" />
                                    <span>Basic</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-zinc-400 mt-1">{users.filter(u => u.plan === 'basic').length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-emerald-500/20">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                    <Zap size={12} className="text-emerald-400" />
                                    <span>Standard</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{users.filter(u => u.plan === 'standard').length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-amber-500/20">
                                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                    <Crown size={12} className="text-amber-400" />
                                    <span>Premium</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{users.filter(u => u.plan === 'premium').length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] col-span-2 sm:col-span-1 border-purple-500/30">
                                <div className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1">
                                    <Building2 size={12} className="text-purple-400" />
                                    <span>Enterprise</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">{users.filter(u => u.plan === 'enterprise').length}</div>
                            </div>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="flex gap-2">
                            <div className="relative flex-1 min-w-0">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setHasSearched(false);
                                        setSearchResults([]);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search email, UUID, or name..."
                                    className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-xs sm:text-sm font-medium text-white transition-all placeholder:text-fg-3"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="clay-cta-button px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
                            >
                                <Search size={13} />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>

                        {/* Users List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {displayUsers.map((user, idx) => (
                                <div
                                    key={user.email || idx}
                                    className={`clay-card p-4 rounded-2xl transition-all flex flex-col justify-between relative ${
                                        user.plan === 'enterprise' ? 'border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.1)]' : 'hover:border-white/15'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2.5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-10 h-10 rounded-xl border border-white/10 shrink-0 object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-sm font-black shrink-0 text-white shadow-sm">
                                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">{user.name || 'Anonymous User'}</h3>
                                                    <p className="text-[11px] text-fg-2 font-mono truncate" title={user.email}>{user.email}</p>
                                                </div>
                                            </div>
                                            {getPlanBadge(user.plan || 'basic')}
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {getProviderDisplay(user)}
                                            {user.uuid && (
                                                <button
                                                    onClick={() => copyToClipboard(user.uuid || '', `u_${idx}`)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-fg-2 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
                                                    title="Copy User UUID"
                                                >
                                                    {copiedId === `u_${idx}` ? <CheckCheck size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                                    <span>{user.uuid.substring(0, 8)}...</span>
                                                </button>
                                            )}
                                            {user.planExpiresAt && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-fg-2 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                    <Calendar size={10} />
                                                    <span>Exp: {new Date(user.planExpiresAt).toLocaleDateString()}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-white/5">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="w-full py-2 bg-accent/15 hover:bg-accent/25 border border-accent/40 rounded-xl text-xs font-bold uppercase tracking-wider text-accent-hi transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                                        >
                                            <Sparkles size={13} />
                                            <span>Manage Subscription</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {displayUsers.length === 0 && (
                            <div className="text-center py-12 clay-card rounded-3xl text-fg-2 space-y-3">
                                <Users size={28} className="mx-auto text-fg-3 mb-1" />
                                <p className="text-xs font-semibold text-white">
                                    {searchQuery ? `No active records matching "${searchQuery}"` : 'No registered users found'}
                                </p>
                                {searchQuery && searchQuery.includes('@') ? (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal({
                                                email: searchQuery.toLowerCase().trim(),
                                                name: searchQuery.split('@')[0],
                                                plan: 'basic',
                                                created_at: new Date()
                                            } as any)}
                                            className="px-5 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
                                        >
                                            <Sparkles size={14} />
                                            <span>Provision & Upgrade Plan for {searchQuery.trim()}</span>
                                        </button>
                                        <p className="text-[10px] text-fg-3 font-mono mt-2">
                                            Assign plan now — user will automatically inherit this tier upon Google login
                                        </p>
                                    </div>
                                ) : searchQuery ? (
                                    <p className="text-[11px] text-fg-3 font-mono">Enter user's full email address (e.g. user@gmail.com) to provision</p>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================
                    DEVICES TAB
                   ======================================================== */}
                {activeTab === 'devices' && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                        {/* Summary Pods */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px]">
                                <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1">
                                    <Smartphone size={12} className="text-accent" />
                                    <span>Total Fleet</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{devices.length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-emerald-500/30">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Online Endpoints</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{devices.filter(d => d.online).length}</div>
                            </div>

                            <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px]">
                                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                    <span>Offline</span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-zinc-400 mt-1">{devices.filter(d => !d.online).length}</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-2 clay-card p-3 rounded-2xl">
                            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pl-1">
                                <Radio size={13} className="text-accent animate-pulse" />
                                <span>Fleet Telemetry</span>
                            </div>
                            <button
                                onClick={() => session?.user?.email && fetchDevices(session.user.email)}
                                disabled={devicesLoading}
                                className="px-3 py-1.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent-hi text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw size={12} className={devicesLoading ? 'animate-spin' : ''} />
                                <span>Refresh</span>
                            </button>
                        </div>

                        {/* Realtime Fleet Status */}
                        <div className="clay-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${devices.some(d => d.online) ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                <span className="text-white/80 font-semibold">Live Hardware Telemetry Synchronized</span>
                            </div>
                            <span className="text-fg-3 text-[11px]">
                                {devicesLoading ? 'Polling endpoints...' : `${devices.filter(d => d.online).length} online / ${devices.length} registered`}
                            </span>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    MEDIA / S3 CLOUD VAULT TAB — USER FOLDERS SYSTEM
                   ======================================================== */}
                {activeTab === 'media' && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                        
                        {/* ── VIEW A: ALL USER FOLDERS GRID ── */}
                        {!selectedUserFolder ? (
                            <div className="space-y-4 sm:space-y-5">
                                {/* Media Metric Pods */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                                    <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-cyan-500/20">
                                        <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                                            <Folder size={13} className="text-cyan-400" />
                                            <span>User Vaults</span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                                            {userFolders.filter(f => f.total > 0).length || userFolders.length}
                                        </div>
                                    </div>

                                    <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px]">
                                        <div className="text-[10px] font-mono font-bold text-fg-2 uppercase tracking-widest flex items-center gap-1.5">
                                            <HardDrive size={13} className="text-white/60" />
                                            <span>Total Assets</span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-white mt-1">{r2Files.length}</div>
                                    </div>

                                    <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-emerald-500/20">
                                        <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <ImageIcon size={13} className="text-emerald-400" />
                                            <span>Images</span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                                            {r2Files.filter(f => f.resource_type === 'image').length}
                                        </div>
                                    </div>

                                    <div className="clay-card p-3 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[85px] border-danger/20">
                                        <div className="text-[10px] font-mono font-bold text-danger uppercase tracking-widest flex items-center gap-1.5">
                                            <VideoIcon size={13} className="text-danger" />
                                            <span>Videos</span>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-danger mt-1">
                                            {r2Files.filter(f => f.resource_type === 'video').length}
                                        </div>
                                    </div>
                                </div>

                                {/* Folder Search Bar */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1 min-w-0">
                                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" />
                                        <input
                                            type="text"
                                            value={folderSearchQuery}
                                            onChange={(e) => setFolderSearchQuery(e.target.value)}
                                            placeholder="Search user vaults by email, name, or UUID..."
                                            className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 text-xs sm:text-sm font-medium text-white transition-all placeholder:text-fg-3"
                                        />
                                        {folderSearchQuery && (
                                            <button
                                                onClick={() => setFolderSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fetchR2Files(false)}
                                        disabled={r2Loading}
                                        className="clay-cta-button px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95 disabled:opacity-50"
                                        title="Scan Cloud Storage"
                                    >
                                        <RefreshCw size={13} className={r2Loading ? 'animate-spin' : ''} />
                                        <span className="hidden sm:inline">{r2Loading ? 'Scanning...' : 'Scan Vaults'}</span>
                                    </button>
                                </div>

                                {/* User Folders Grid */}
                                {r2Loading && userFolders.length === 0 ? (
                                    <div className="text-center py-16 clay-card rounded-3xl space-y-2">
                                        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                                        <p className="text-fg-2 text-xs font-mono">Scanning user vaults from cloud storage...</p>
                                    </div>
                                ) : userFolders.length === 0 ? (
                                    <div className="text-center py-16 clay-card rounded-3xl text-fg-2 space-y-2">
                                        <Folder size={36} className="mx-auto text-cyan-500/40" />
                                        <p className="text-sm font-bold text-white">No user media folders detected</p>
                                        <p className="text-xs text-white/40 font-mono">When devices sync photos, their folder will automatically appear here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                                        {userFolders.map((folder) => {
                                            const owner = folder.user;
                                            const email = owner?.email || 'Unregistered UUID';
                                            const name = owner?.name || email.split('@')[0];
                                            const hasMedia = folder.total > 0;

                                            return (
                                                <div
                                                    key={folder.uuid}
                                                    onClick={() => openUserFolder(folder)}
                                                    className="clay-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3.5 transition-all hover:scale-[1.015] active:scale-[0.985] cursor-pointer group hover:border-cyan-500/40 relative overflow-hidden shadow-lg"
                                                >
                                                    {/* Top Row: Icon + Badges */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-all shrink-0">
                                                            <Folder className="w-5 h-5 text-cyan-400" />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                            {owner?.plan && getPlanBadge(owner.plan)}
                                                            <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                                                                hasMedia 
                                                                    ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' 
                                                                    : 'text-white/40 bg-white/5 border-white/10'
                                                            }`}>
                                                                {folder.total} {folder.total === 1 ? 'item' : 'items'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* User Info */}
                                                    <div className="min-w-0 space-y-1">
                                                        <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-cyan-300 transition-colors">
                                                            {name}
                                                        </h4>
                                                        <p className="text-xs text-white/50 font-mono truncate">
                                                            {email}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono pt-0.5">
                                                            <span>UUID:</span>
                                                            <span className="truncate">{folder.uuid}</span>
                                                        </div>
                                                    </div>

                                                    {/* Footer: Media Breakdown + Open Action */}
                                                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                                                        <span className="text-white/40 text-[11px]">
                                                            {folder.images} imgs • {folder.videos} vids
                                                        </span>
                                                        <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                            <span>Open Vault</span>
                                                            <ChevronRight size={13} />
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── VIEW B: INSIDE SELECTED USER'S VAULT ── */
                            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
                                {/* Navigation & User Header */}
                                <div className="clay-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUserFolder(null)}
                                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 active:scale-95 shrink-0"
                                            title="Back to All User Folders"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-base font-black text-white truncate">
                                                    {selectedUserFolder.user?.name || selectedUserFolder.user?.email || 'User Vault'}
                                                </h3>
                                                {selectedUserFolder.user?.plan && getPlanBadge(selectedUserFolder.user.plan)}
                                            </div>
                                            <p className="text-[11px] text-zinc-400 font-mono truncate">
                                                UUID: {selectedUserFolder.uuid} • {displayedFiles.length} assets visible
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUserFolder(null)}
                                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                        >
                                            All Folders
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fetchR2Files(false, selectedUserFolder.uuid)}
                                            disabled={r2Loading}
                                            className="clay-cta-button px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                                        >
                                            <RefreshCw size={12} className={r2Loading ? 'animate-spin' : ''} />
                                            <span>{r2Loading ? 'Syncing...' : 'Sync Vault'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Pills */}
                                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap">
                                    {(['all', 'image', 'video', 'enterprise'] as const).map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => { setMediaFilter(filter); setVisibleCount(30); }}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                                mediaFilter === filter
                                                    ? filter === 'enterprise'
                                                        ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50'
                                                        : filter === 'video'
                                                            ? 'bg-danger/20 text-danger border border-danger/40'
                                                            : filter === 'image'
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                                    : 'clay-card text-fg-2 hover:text-white'
                                            }`}
                                        >
                                            {filter === 'all' && `All (${currentScopeFiles.length})`}
                                            {filter === 'image' && `Images (${imageCount})`}
                                            {filter === 'video' && `Videos (${videoCount})`}
                                            {filter === 'enterprise' && `Enterprise (${enterpriseMediaCount})`}
                                        </button>
                                    ))}
                                </div>

                                {/* Bulk Action Bar */}
                                {displayedFiles.length > 0 && (
                                    <div className="flex items-center justify-between clay-card p-3 rounded-2xl flex-wrap gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Check size={13} />
                                            <span>
                                                {selectedFiles.size === displayedFiles.filter(f => !isEnterpriseAsset(f.id)).length && selectedFiles.size > 0
                                                    ? 'Deselect All'
                                                    : `Select All Non-Enterprise (${displayedFiles.filter(f => !isEnterpriseAsset(f.id)).length})`}
                                            </span>
                                        </button>
                                        {selectedFiles.size > 0 && (
                                            <button
                                                onClick={() => setDeleteConfirm(true)}
                                                className="px-3.5 py-1.5 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                                            >
                                                <Trash2 size={12} />
                                                <span>Delete ({selectedFiles.size})</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Media Grid with FastImage & WindowedMediaCard Virtualization */}
                                {r2Loading && activeUserFiles.length === 0 ? (
                                    <div className="text-center py-16 clay-card rounded-3xl space-y-2">
                                        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                                        <p className="text-fg-2 text-xs font-mono">Loading user media assets...</p>
                                    </div>
                                ) : displayedFiles.length === 0 ? (
                                    <div className="text-center py-16 clay-card rounded-3xl text-fg-2 space-y-2">
                                        <HardDrive size={32} className="mx-auto text-fg-3" />
                                        <p className="text-xs font-semibold text-white">No media assets found in this folder</p>
                                        <p className="text-[11px] text-white/40 font-mono">No synchronized photos or videos match your active filter.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                                        {currentlyVisibleFiles.map((file, idx) => {
                                            const isEnterprise = isEnterpriseAsset(file.id);
                                            const isSelected = selectedFiles.has(file.id);
                                            const owner = getFileOwner(file.id);

                                            return (
                                                <WindowedMediaCard key={file.id} overscan={350} className="w-full aspect-square">
                                                    <div
                                                        className={`relative w-full h-full group rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-surface ${
                                                            isEnterprise
                                                                ? 'border-purple-500/40'
                                                                : isSelected
                                                                    ? 'border-cyan-400 scale-[0.98]'
                                                                    : 'border-white/5 hover:border-white/20'
                                                        }`}
                                                    >
                                                        {/* Select Checkbox / Enterprise Protection Lock */}
                                                        {isEnterprise ? (
                                                            <div
                                                                title="Protected Enterprise Asset"
                                                                className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-lg bg-purple-950/90 text-purple-300 border border-purple-500/50 flex items-center justify-center text-xs font-black shadow-md"
                                                            >
                                                                <Lock size={11} />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}
                                                                className={`absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                                                                    isSelected
                                                                        ? 'bg-cyan-500 text-zinc-950 shadow-md'
                                                                        : 'bg-black/70 text-white/60 opacity-90 border border-white/20'
                                                                }`}
                                                            >
                                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                                            </button>
                                                        )}

                                                        {/* Type Badge */}
                                                        <div className="absolute top-1.5 right-1.5 z-10 flex flex-col items-end gap-1 pointer-events-none">
                                                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                                                                file.resource_type === 'video' ? 'bg-danger/90 text-white' : 'bg-emerald-500/90 text-white'
                                                            }`}>
                                                                {file.resource_type === 'video' ? <VideoIcon size={9} /> : <ImageIcon size={9} />}
                                                                <span>{file.resource_type === 'video' ? 'VID' : 'IMG'}</span>
                                                            </span>
                                                        </div>

                                                        {/* Thumbnail Container with FastImage & Video Frame */}
                                                        <div onClick={() => setMediaPreview(file)} className="w-full h-full bg-[#0c0d10] relative overflow-hidden">
                                                            {file.resource_type === 'video' ? (
                                                                <VideoThumbnail src={file.url} />
                                                            ) : (
                                                                <FastImage
                                                                    src={file.url}
                                                                    alt=""
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    priority={idx < 12}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Metadata Overlay */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-1.5 pointer-events-none">
                                                            <p className="text-[9px] text-zinc-300 font-mono truncate">
                                                                {new Date(file.created_at).toLocaleDateString()}
                                                                {file.size ? ` • ${formatFileSize(file.size)}` : ''}
                                                            </p>
                                                            {owner && (
                                                                <p className="text-[8px] text-purple-300/80 font-mono truncate">
                                                                    {owner.email.split('@')[0]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </WindowedMediaCard>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Load More Button */}
                                {!r2Loading && visibleCount < displayedFiles.length && (
                                    <div className="mt-6 text-center pb-6">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 30)}
                                            className="clay-card px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer text-white"
                                        >
                                            Load More ({displayedFiles.length - visibleCount} remaining)
                                        </button>
                                    </div>
                                )}
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
                    className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
                    onClick={() => setMediaPreview(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-2">
                            {isEnterpriseAsset(mediaPreview.id) ? (
                                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                                    <Lock size={11} />
                                    <span>Enterprise Protected</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { deleteR2Files([mediaPreview.id]); setMediaPreview(null); }}
                                    className="px-3 py-1 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <Trash2 size={11} />
                                    <span>Delete</span>
                                </button>
                            )}

                            <button
                                onClick={() => setMediaPreview(null)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden clay-card border border-white/10 shadow-2xl flex-1 flex items-center justify-center bg-black">
                            {mediaPreview.resource_type === 'video' ? (
                                <video
                                    src={mediaPreview.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full max-h-[75vh] object-contain"
                                />
                            ) : (
                                <img
                                    src={mediaPreview.url}
                                    alt=""
                                    className="w-full max-h-[75vh] object-contain"
                                />
                            )}
                        </div>

                        <p className="text-center text-fg-2 text-[10px] font-mono mt-2 truncate">{mediaPreview.id}</p>
                    </div>
                </div>
            )}

            {/* ========================================================
                DELETE CONFIRMATION MODAL
               ======================================================== */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="clay-card p-5 sm:p-6 w-full max-w-sm rounded-3xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="text-center space-y-1.5">
                            <div className="w-10 h-10 rounded-2xl bg-danger/20 text-danger flex items-center justify-center mx-auto mb-2">
                                <AlertTriangle size={20} />
                            </div>
                            <h2 className="text-base font-extrabold text-white">Permanently Delete?</h2>
                            <p className="text-xs text-fg-2">
                                Delete <span className="text-white font-bold">{selectedFiles.size} asset(s)</span> from Cloudflare R2 storage. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteR2Files(Array.from(selectedFiles))}
                                disabled={r2Loading}
                                className="flex-1 py-2.5 bg-danger hover:bg-danger/80 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {r2Loading ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                <span>{r2Loading ? 'Deleting...' : 'Delete'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                MANAGE USER SUBSCRIPTION TIER MODAL
               ======================================================== */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150">
                    <div className="clay-card p-5 sm:p-7 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto sm:hidden" />
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
                                    <Sparkles size={16} className="text-accent" />
                                    <span>Manage Tier</span>
                                </h2>
                                <button onClick={() => setSelectedUser(null)} className="text-fg-3 hover:text-white p-1">
                                    <X size={15} />
                                </button>
                            </div>
                            <p className="text-xs text-purple-300 font-mono mt-0.5 truncate">{selectedUser.email}</p>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-2 mb-2">Select Tier</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['basic', 'standard', 'premium', 'enterprise'] as const).map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => setNewPlan(plan)}
                                            className={`py-2.5 px-2 rounded-2xl text-xs font-black capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                newPlan === plan
                                                    ? plan === 'enterprise'
                                                        ? 'bg-purple-600/30 text-purple-200 border-2 border-purple-500'
                                                        : plan === 'premium'
                                                            ? 'bg-amber-500/30 text-amber-200 border-2 border-amber-500'
                                                            : plan === 'standard'
                                                                ? 'bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500'
                                                                : 'bg-white/10 text-white border-2 border-white/40'
                                                    : 'bg-surface text-fg-2 border border-white/5 hover:bg-white/5'
                                            }`}
                                        >
                                            {plan === 'enterprise' && <Building2 size={12} />}
                                            {plan === 'premium' && <Crown size={12} />}
                                            {plan === 'standard' && <Zap size={12} />}
                                            {plan === 'basic' && <Package size={12} />}
                                            <span>{plan}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newPlan !== 'basic' && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-fg-2">Expiry Date</label>
                                        {expiryDate && (
                                            <button onClick={() => applyDatePreset(null)} className="text-[10px] text-accent hover:underline">
                                                Set Lifetime
                                            </button>
                                        )}
                                    </div>

                                    {/* Quick Preset Buttons */}
                                    <div className="grid grid-cols-5 gap-1">
                                        {[
                                            { label: '+1M', months: 1 },
                                            { label: '+3M', months: 3 },
                                            { label: '+6M', months: 6 },
                                            { label: '+1Y', months: 12 },
                                            { label: 'Life', months: null }
                                        ].map((preset, pIdx) => (
                                            <button
                                                key={pIdx}
                                                type="button"
                                                onClick={() => applyDatePreset(preset.months)}
                                                className="py-1 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/5 text-fg-2 hover:text-white transition-colors cursor-pointer text-center"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-surface border border-white/10 rounded-2xl focus:outline-none focus:border-accent text-xs sm:text-sm font-medium text-white"
                                    />
                                    <p className="text-[10px] text-fg-3 font-mono">
                                        {expiryDate ? `Expires on ${new Date(expiryDate).toLocaleDateString()}` : 'Permanent Lifetime Subscription'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2.5 pt-1">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetPlan}
                                disabled={isLoading}
                                className="flex-1 py-2.5 clay-cta-button rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                                <span>{isLoading ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
