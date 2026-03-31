"use client";

import { useState, useEffect } from 'react';

interface User {
    email: string;
    name?: string;
    uuid?: string;
    plan: 'basic' | 'standard' | 'premium';
    planExpiresAt?: string | null;
    created_at?: string;
    image?: string;
    provider?: string;
}

interface StorageFile {
    key: string;
    url: string;
    size: number;
    lastModified: string;
    type: 'image' | 'video' | 'zip';
}

export default function AdminPage() {
    const [adminSecret, setAdminSecret] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Selected user for editing
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPlan, setNewPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
    const [expiryDate, setExpiryDate] = useState('');

    // Storage Manager
    const [showStorage, setShowStorage] = useState(false);
    const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
    const [storageTotalMB, setStorageTotalMB] = useState('0');
    const [storageLoading, setStorageLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const BACKEND_URL = 'https://backend-api-gallery.onrender.com';

    const handleLogin = async (secretOverride?: string) => {
        const secretToUse = secretOverride || adminSecret;
        if (!secretToUse) { setError('Admin secret required'); return; }
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/admin/users`, { headers: { 'x-admin-secret': secretToUse } });
            if (res.ok) {
                setUsers(await res.json());
                setIsAuthenticated(true);
                localStorage.setItem('adminSecret', secretToUse);
            } else { 
                setError('Invalid admin secret'); 
                localStorage.removeItem('adminSecret');
            }
        } catch (e) { setError('Failed to connect to server'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        const saved = localStorage.getItem('adminSecret');
        if (saved) {
            setAdminSecret(saved);
            handleLogin(saved);
        }
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) { setSearchResults([]); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/users/search?email=${encodeURIComponent(searchQuery)}`, { headers: { 'x-admin-secret': adminSecret } });
            if (res.ok) setSearchResults(await res.json());
        } catch (e) { setError('Search failed'); }
        finally { setIsLoading(false); }
    };

    const handleSetPlan = async () => {
        if (!selectedUser) return;
        setIsLoading(true); setError(''); setSuccess('');
        try {
            const res = await fetch(`${BACKEND_URL}/admin/set-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                body: JSON.stringify({ email: selectedUser.email, plan: newPlan, expiresAt: expiryDate || null })
            });
            if (res.ok) {
                setSuccess(`Plan updated for ${selectedUser.email}`);
                setSelectedUser(null);
                const usersRes = await fetch(`${BACKEND_URL}/admin/users`, { headers: { 'x-admin-secret': adminSecret } });
                if (usersRes.ok) setUsers(await usersRes.json());
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to update plan');
            }
        } catch (e) { setError('Failed to update plan'); }
        finally { setIsLoading(false); }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setNewPlan(user.plan || 'basic');
        setExpiryDate(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '');
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black';
            case 'standard': return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
            default: return 'bg-white/20 text-white/60';
        }
    };

    const getProviderDisplay = (user: User) => {
        const isGoogle = user.provider === 'google' || user.image?.includes('googleusercontent') || user.image?.includes('google');
        if (isGoogle) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                </span>
            );
        }
        return (<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white/50 text-xs">📧 Email</span>);
    };

    // ---- Storage Manager ----
    const loadStorageFiles = async () => {
        setStorageLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/storage`, { headers: { 'x-admin-secret': adminSecret } });
            if (res.ok) { const data = await res.json(); setStorageFiles(data.files); setStorageTotalMB(data.totalSizeMB); }
        } catch (e) { setError('Failed to load storage'); }
        finally { setStorageLoading(false); }
    };

    const handleDeleteSelected = async () => {
        if (selectedFiles.size === 0) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/storage/delete`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                body: JSON.stringify({ keys: Array.from(selectedFiles) })
            });
            if (res.ok) { const d = await res.json(); setSuccess(`Deleted ${d.deleted} files`); setSelectedFiles(new Set()); loadStorageFiles(); }
        } catch (e) { setError('Delete failed'); }
        finally { setDeleteLoading(false); }
    };

    const handleClearAll = async () => {
        setDeleteLoading(true); setShowClearConfirm(false);
        try {
            const res = await fetch(`${BACKEND_URL}/admin/storage/delete`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
                body: JSON.stringify({ clearAll: true })
            });
            if (res.ok) { const d = await res.json(); setSuccess(d.message); setStorageFiles([]); setStorageTotalMB('0'); setSelectedFiles(new Set()); }
        } catch (e) { setError('Clear all failed'); }
        finally { setDeleteLoading(false); }
    };

    const toggleFileSelect = (key: string) => {
        setSelectedFiles(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
    };

    const selectAll = () => {
        if (selectedFiles.size === storageFiles.length) setSelectedFiles(new Set());
        else setSelectedFiles(new Set(storageFiles.map(f => f.key)));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        switch (type) { case 'video': return '🎬'; case 'zip': return '📦'; default: return '🖼️'; }
    };

    const displayUsers = searchResults.length > 0 ? searchResults : users;

    // ---- LOGIN SCREEN ----
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20 mb-4">🛡️</div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Admin Panel</h1>
                        <p className="text-white/40 text-sm mt-1">H4K3R Control Center</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        {error && (<div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>)}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Secret Key</label>
                                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter secret..." className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-center text-lg tracking-widest" />
                            </div>
                            <button onClick={handleLogin} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                {isLoading ? (<span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connecting...</span>) : 'Access Panel'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ---- STORAGE MANAGER VIEW ----
    if (showStorage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white">
                <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setShowStorage(false); setSelectedFiles(new Set()); }} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-lg">←</button>
                            <div>
                                <h1 className="font-bold text-lg">Storage</h1>
                                <p className="text-xs text-white/40">{storageFiles.length} files • {storageTotalMB} MB</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {selectedFiles.size > 0 && (
                                <button onClick={handleDeleteSelected} disabled={deleteLoading} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50">
                                    {deleteLoading ? '...' : `🗑 ${selectedFiles.size}`}
                                </button>
                            )}
                            <button onClick={() => setShowClearConfirm(true)} className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors">Clear All</button>
                        </div>
                    </div>
                    {storageFiles.length > 0 && (
                        <div className="px-4 pb-3 flex items-center gap-3">
                            <button onClick={selectAll} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                {selectedFiles.size === storageFiles.length ? '✓ Deselect All' : '☐ Select All'}
                            </button>
                            <button onClick={loadStorageFiles} disabled={storageLoading} className="text-xs text-white/40 hover:text-white/60 transition-colors">
                                {storageLoading ? '↻ Loading...' : '↻ Refresh'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {storageLoading && storageFiles.length === 0 ? (
                        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
                    ) : storageFiles.length === 0 ? (
                        <div className="text-center py-20 text-white/40"><div className="text-5xl mb-4">📂</div><p className="text-lg">Storage is empty</p></div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {storageFiles.map((file) => (
                                <div key={file.key} onClick={() => toggleFileSelect(file.key)} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all ${selectedFiles.has(file.key) ? 'ring-2 ring-purple-500 scale-95' : 'hover:scale-[0.97]'}`}>
                                    {file.type === 'image' ? (
                                        <img src={file.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center">
                                            <span className="text-3xl">{getFileIcon(file.type)}</span>
                                            <span className="text-[10px] text-white/40 mt-1 px-1 truncate max-w-full">{file.key.split('/').pop()}</span>
                                        </div>
                                    )}
                                    <div className={`absolute inset-0 transition-all ${selectedFiles.has(file.key) ? 'bg-purple-600/40' : 'bg-black/0 group-hover:bg-black/30'}`} />
                                    <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${selectedFiles.has(file.key) ? 'bg-purple-500 text-white' : 'bg-black/50 text-white/60 opacity-0 group-hover:opacity-100'}`}>
                                        {selectedFiles.has(file.key) ? '✓' : ''}
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white/70">{formatSize(file.size)}</div>
                                    {file.type !== 'image' && (<div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white/70 uppercase">{file.type}</div>)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showClearConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1a1a2e] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm">
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-3">⚠️</div>
                                <h2 className="text-xl font-bold text-red-400">Clear All Storage?</h2>
                                <p className="text-sm text-white/50 mt-2">This will permanently delete <strong>{storageFiles.length} files</strong> ({storageTotalMB} MB). This CANNOT be undone!</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors">Cancel</button>
                                <button onClick={handleClearAll} disabled={deleteLoading} className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50">{deleteLoading ? 'Deleting...' : 'DELETE ALL'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {(error || success) && (
                    <div className="fixed bottom-6 left-4 right-4 z-50">
                        {error && (<div className="p-3 bg-red-500/90 rounded-xl text-sm text-center font-medium mb-2" onClick={() => setError('')}>{error}</div>)}
                        {success && (<div className="p-3 bg-green-500/90 rounded-xl text-sm text-center font-medium" onClick={() => setSuccess('')}>{success}</div>)}
                    </div>
                )}
            </div>
        );
    }

    // ---- MAIN DASHBOARD ----
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white">
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl">🛡️</div>
                        <div>
                            <h1 className="font-bold text-lg">Admin</h1>
                            <p className="text-xs text-white/40">{users.length} users</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setShowStorage(true); loadStorageFiles(); }} className="px-3 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium hover:from-cyan-600/50 hover:to-blue-600/50 transition-all">
                            📁 Storage
                        </button>
                        <button onClick={() => { localStorage.removeItem('adminSecret'); setIsAuthenticated(false); setAdminSecret(''); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6 pb-24">
                {error && (<div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center justify-between">{error}<button onClick={() => setError('')} className="text-xl">×</button></div>)}
                {success && (<div className="p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 text-sm flex items-center justify-between">{success}<button onClick={() => setSuccess('')} className="text-xl">×</button></div>)}

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"><div className="text-3xl font-bold">{users.length}</div><div className="text-sm text-white/50">Total</div></div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"><div className="text-3xl font-bold text-white/50">{users.filter(u => u.plan === 'basic').length}</div><div className="text-sm text-white/40">Basic</div></div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-4"><div className="text-3xl font-bold text-purple-400">{users.filter(u => u.plan === 'standard').length}</div><div className="text-sm text-purple-400/60">Standard</div></div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4"><div className="text-3xl font-bold text-yellow-400">{users.filter(u => u.plan === 'premium').length}</div><div className="text-sm text-yellow-400/60">Premium</div></div>
                </div>

                <div className="flex gap-2">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search email..." className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-sm" />
                    <button onClick={handleSearch} className="px-5 py-3 bg-purple-600 rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors">🔍</button>
                </div>

                <div className="space-y-3">
                    {displayUsers.map((user, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {user.image ? (<img src={user.image} alt="" className="w-12 h-12 rounded-full border-2 border-white/10" />) : (<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold">{user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}</div>)}
                                    <div className="overflow-hidden">
                                        <div className="font-semibold truncate max-w-[180px]">{user.name || 'No Name'}</div>
                                        <div className="text-xs text-white/50 truncate max-w-[180px]">{user.email}</div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPlanBadgeColor(user.plan || 'basic')}`}>{user.plan || 'basic'}</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                {getProviderDisplay(user)}
                                {user.planExpiresAt && (<span className="text-xs text-white/40">Expires: {new Date(user.planExpiresAt).toLocaleDateString()}</span>)}
                            </div>
                            <button onClick={() => openEditModal(user)} className="w-full py-2.5 bg-gradient-to-r from-purple-600/50 to-blue-600/50 border border-purple-500/30 rounded-xl text-sm font-medium hover:from-purple-600/70 hover:to-blue-600/70 transition-all">✏️ Edit Plan</button>
                        </div>
                    ))}
                </div>

                {displayUsers.length === 0 && (<div className="text-center py-12 text-white/40"><div className="text-4xl mb-3">👤</div><p>No users found</p></div>)}
            </div>

            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
                    <div className="bg-[#1a1a2e] border-t md:border border-white/20 rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />
                        <h2 className="text-xl font-bold mb-2">Edit Plan</h2>
                        <p className="text-sm text-white/50 mb-6 truncate">{selectedUser.email}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-3">Select Plan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['basic', 'standard', 'premium'] as const).map(plan => (
                                        <button key={plan} onClick={() => setNewPlan(plan)} className={`py-3 px-2 rounded-xl text-sm font-bold capitalize transition-all ${newPlan === plan ? getPlanBadgeColor(plan) + ' scale-105 shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}>{plan}</button>
                                    ))}
                                </div>
                            </div>
                            {newPlan !== 'basic' && (
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Expiry Date</label>
                                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500" />
                                    <p className="text-xs text-white/40 mt-1">Leave empty for no expiry</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors">Cancel</button>
                            <button onClick={handleSetPlan} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50">{isLoading ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={handleLogin} disabled={isLoading} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-transform z-40">
                {isLoading ? (<div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>)}
            </button>
        </div>
    );
}
