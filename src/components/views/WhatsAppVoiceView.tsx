"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    RefreshCw, Trash2, Download, Play, Pause,
    Mic, X, ChevronRight, Search, CheckCheck,
    CheckSquare, Square, ArrowLeft, Radio,
    Sparkles, Volume2
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface WaVoice {
    id: string;
    url: string;
    folderName: string;
    contactName?: string;
    created_at: string;
    size?: number;
    name: string;
    deviceId?: string;
    isNew?: boolean;
}

interface GroupedVoices {
    [folderName: string]: WaVoice[];
}

interface WhatsAppVoiceViewProps {
    socket?: any;
    selectedDeviceId: string | null;
    userUuid: string;
    setDeleteConfirmation: (data: { isOpen: boolean; ids: string[] }) => void;
}

const BASE_URL = 'https://p01--gallery-eye--9zr85m7yb6s4.code.run';

// ──────────────────────────────────────────────────────────────────────────────
// Modern Tactile Waveform Audio Player
// ──────────────────────────────────────────────────────────────────────────────
function ModernWavePlayer({ url, isGlobalPlaying, onPlayToggle, onEnded }: {
    url: string;
    isGlobalPlaying: boolean;
    onPlayToggle: () => void;
    onEnded: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isGlobalPlaying) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    }, [isGlobalPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration || 0);
        const onEnded2 = () => {
            setProgress(0);
            onEnded();
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded2);
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded2);
        };
    }, [onEnded]);

    const formatTime = (s: number) => {
        if (!isFinite(s) || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.currentTime = ratio * duration;
        setProgress(ratio * duration);
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
    const barCount = 30;

    return (
        <div className="flex items-center gap-3 w-full select-none">
            <audio ref={audioRef} src={url} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={onPlayToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer active:scale-95 ${
                    isGlobalPlaying
                        ? 'bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.6)] scale-105'
                        : 'bg-white/10 hover:bg-[#25D366]/20 text-[#25D366] border border-white/10 hover:border-[#25D366]/40'
                }`}
            >
                {isGlobalPlaying
                    ? <Pause className="w-4 h-4 fill-black text-black" />
                    : <Play className="w-4 h-4 fill-current ml-0.5" />
                }
            </button>

            {/* Waveform Visualization Bars & Scrub Track */}
            <div
                className="flex-1 flex flex-col justify-center py-2 cursor-pointer group"
                onClick={handleSeek}
            >
                <div className="flex items-end gap-[2px] sm:gap-[3px] h-7 w-full">
                    {Array.from({ length: barCount }).map((_, i) => {
                        const barPct = (i / barCount) * 100;
                        const isFilled = barPct <= progressPct;

                        // Deterministic natural audio wave pattern
                        const seed = Math.sin((i + 1) * 1.6);
                        const baseHeight = 25 + Math.abs(seed) * 70;
                        const dynamicHeight = isGlobalPlaying
                            ? Math.min(100, Math.max(20, baseHeight + (Math.sin(Date.now() / 150 + i) * 15)))
                            : baseHeight;

                        return (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-150 ${
                                    isFilled
                                        ? 'bg-gradient-to-t from-[#128C7E] to-[#25D366] shadow-[0_0_6px_rgba(37,211,102,0.4)]'
                                        : 'bg-white/15 group-hover:bg-white/25'
                                }`}
                                style={{ height: `${dynamicHeight}%` }}
                            />
                        );
                    })}
                </div>

                {/* Micro Progress Line under bars */}
                <div className="w-full h-[2px] bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div
                        className="h-full bg-[#25D366] transition-all duration-75"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Time Indicator */}
            <div className="shrink-0 text-right font-mono text-[11px] text-white/50 w-12">
                {isGlobalPlaying ? formatTime(progress) : formatTime(duration)}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Elegant Chat Avatar with Glowing Initials
// ──────────────────────────────────────────────────────────────────────────────
function ModernAvatar({ name, hasNew }: { name: string; hasNew?: boolean }) {
    const initials = name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() || '')
        .join('') || name.slice(0, 2).toUpperCase() || 'WA';

    const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

    return (
        <div className="relative shrink-0">
            <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-lg border border-white/10 transition-transform group-hover:scale-105"
                style={{
                    background: `linear-gradient(135deg, hsl(${hue},65%,30%), hsl(${(hue + 45) % 360},65%,18%))`
                }}
            >
                {initials}
            </div>
            {hasNew && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#25D366] ring-2 ring-[#131417] shadow-[0_0_10px_#25D366] animate-pulse" />
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function WhatsAppVoiceView({
    socket,
    selectedDeviceId,
    userUuid,
    setDeleteConfirmation
}: WhatsAppVoiceViewProps) {
    const [voices, setVoices] = useState<WaVoice[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Live Sync states
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<{ uploaded: number; total: number; folder: string; file?: string; partIndex?: number; totalParts?: number } | null>(null);

    // Navigation & Filtering
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterNewOnly, setFilterNewOnly] = useState(false);

    // Playback state
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Selection mode
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // ── Fetch Voices ──
    const fetchVoices = useCallback(async () => {
        if (!userUuid || !selectedDeviceId) return;
        setIsFetching(true);
        setFetchError(null);
        try {
            const res = await fetch(
                `${BASE_URL}/whatsapp-voices?uuid=${encodeURIComponent(userUuid)}&deviceId=${encodeURIComponent(selectedDeviceId)}&limit=500`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const items: WaVoice[] = (data.items || []).map((item: any) => ({
                id: item.id,
                url: item.url,
                folderName: item.folderName || 'Unknown Chat',
                contactName: item.contactName || item.folderName || 'Unknown',
                created_at: item.created_at,
                size: item.size,
                name: item.name || item.id?.split('/').pop() || 'voice.ogg',
                deviceId: item.deviceId || selectedDeviceId,
                isNew: Boolean(item.isNew)
            }));
            setVoices(items);
        } catch (err: any) {
            setFetchError(err.message || 'Failed to load audio');
        } finally {
            setIsFetching(false);
        }
    }, [userUuid, selectedDeviceId]);

    // ── Trigger Device Sync ──
    const handleTriggerSync = () => {
        if (!selectedDeviceId || !socket) return;
        setIsSyncing(true);
        setSyncProgress({ uploaded: 0, total: 0, folder: selectedFolder || 'Scanning...' });
        socket.emit('trigger_wa_voice_sync', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            folderName: selectedFolder || 'all',
            limit: -1
        });
    };

    // ── Socket Events ──
    useEffect(() => {
        if (!socket) return;

        const onProgress = (data: any) => {
            if (data.deviceId && selectedDeviceId && data.deviceId !== selectedDeviceId) return;
            setIsSyncing(true);
            setSyncProgress({
                uploaded: data.uploaded || 0,
                total: data.total || 0,
                folder: data.folder || data.currentFolder || 'WhatsApp',
                file: data.file || data.currentFile,
                partIndex: data.partIndex,
                totalParts: data.totalParts
            });
        };

        const onComplete = (data: any) => {
            if (data.deviceId && selectedDeviceId && data.deviceId !== selectedDeviceId) return;
            setIsSyncing(false);
            setSyncProgress(null);
            fetchVoices();
        };

        const onVoiceReady = (data: any) => {
            if (data.deviceId && selectedDeviceId && data.deviceId !== selectedDeviceId) return;
            setVoices(prev => {
                const exists = prev.some(v => v.id === data.id || v.url === data.url);
                if (exists) return prev;
                const newVoice: WaVoice = {
                    id: data.id,
                    url: data.url,
                    folderName: data.folderName || 'WhatsApp',
                    name: data.name || 'voice.ogg',
                    created_at: data.created_at || new Date().toISOString(),
                    deviceId: data.deviceId || selectedDeviceId || undefined,
                    isNew: true
                };
                return [newVoice, ...prev];
            });
        };

        socket.on('wa_voice_progress', onProgress);
        socket.on('wa_voice_complete', onComplete);
        socket.on('whatsapp_voice_ready', onVoiceReady);

        return () => {
            socket.off('wa_voice_progress', onProgress);
            socket.off('wa_voice_complete', onComplete);
            socket.off('whatsapp_voice_ready', onVoiceReady);
        };
    }, [socket, selectedDeviceId, fetchVoices]);

    useEffect(() => {
        fetchVoices();
        setSelectedFolder(null);
        setPlayingId(null);
        setSelected(new Set());
        setIsSelectMode(false);
    }, [selectedDeviceId, userUuid]);

    // ── Group voices by chat folder ──
    const grouped: GroupedVoices = voices.reduce((acc, v) => {
        if (!acc[v.folderName]) acc[v.folderName] = [];
        acc[v.folderName].push(v);
        return acc;
    }, {} as GroupedVoices);

    const totalNewCount = voices.filter(v => v.isNew).length;

    const clearAllNewBadges = () => {
        setVoices(prev => prev.map(v => ({ ...v, isNew: false })));
    };

    // Sort folders by message count
    const sortedFolders = Object.keys(grouped).sort(
        (a, b) => grouped[b].length - grouped[a].length
    );

    // Filter folders
    const filteredFolders = sortedFolders.filter(f => {
        const matchesSearch = f.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filterNewOnly) {
            return (grouped[f] || []).some(v => v.isNew);
        }
        return true;
    });

    // Current chat voices
    const currentVoicesRaw = selectedFolder
        ? [...(grouped[selectedFolder] || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        : [];
    const currentVoices = filterNewOnly ? currentVoicesRaw.filter(v => v.isNew) : currentVoicesRaw;

    // ── Delete ──
    const handleDelete = (ids: string[]) => {
        setDeleteConfirmation({ isOpen: true, ids });
        setVoices(prev => prev.filter(v => !ids.includes(v.id)));
        setSelected(new Set());
        setIsSelectMode(false);
    };

    // ── Download ──
    const handleDownload = async (voice: WaVoice) => {
        try {
            const proxyUrl = `/api/download?url=${encodeURIComponent(voice.url)}&filename=${encodeURIComponent(voice.name)}`;
            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = voice.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            window.open(voice.url, '_blank');
        }
    };

    // ── Select Toggle ──
    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    // ── Format Date ──
    const fmtDate = (d: string) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;
        if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const fmtTime = (d: string) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ── Empty State ──
    if (!selectedDeviceId) {
        return (
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-3 px-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Radio className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest text-center">
                    Connect a device to stream audio
                </p>
            </div>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. CHAT LIST VIEW (Clean, Modern, Mobile-First)
    // ──────────────────────────────────────────────────────────────────────────
    if (!selectedFolder) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-3.5 pb-24 px-2 sm:px-4 animate-in fade-in duration-200">

                {/* ── Top Ambient Bar (No Tacky Banners) ── */}
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366] animate-pulse" />
                        <span className="text-xs font-mono text-white/70 font-semibold tracking-wide">
                            {sortedFolders.length} Chats · {voices.length} Audio Notes
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleTriggerSync}
                            disabled={isSyncing}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                isSyncing
                                    ? 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/40'
                                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#25D366]' : 'text-[#25D366]'}`} />
                            <span>{isSyncing ? 'Syncing...' : 'Sync Device'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={fetchVoices}
                            disabled={isFetching}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── Real-time Ingestion HUD ── */}
                {isSyncing && (
                    <div className="p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex flex-col gap-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#25D366] flex items-center gap-1.5 font-bold">
                                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                {syncProgress?.partIndex && syncProgress?.totalParts
                                    ? `Part ${syncProgress.partIndex}/${syncProgress.totalParts} Syncing`
                                    : 'Ingesting Voice Notes'}
                            </span>
                            <span className="text-white/60">
                                {syncProgress && syncProgress.total > 0
                                    ? `${syncProgress.uploaded} / ${syncProgress.total} audios`
                                    : 'Scanning...'}
                            </span>
                        </div>
                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#25D366] transition-all duration-300"
                                style={{
                                    width: syncProgress && syncProgress.total > 0
                                        ? `${Math.max(8, (syncProgress.uploaded / syncProgress.total) * 100)}%`
                                        : '30%'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Floating Search & Filter Pill ── */}
                <div className="flex items-center gap-2 bg-[#18191c]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-lg">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
                        <Search className="w-4 h-4 text-white/30 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none font-sans"
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white cursor-pointer">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 pr-1 border-l border-white/10 pl-2">
                        <button
                            type="button"
                            onClick={() => setFilterNewOnly(false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                !filterNewOnly
                                    ? 'bg-white/15 text-white shadow-sm'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterNewOnly(true)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                filterNewOnly
                                    ? 'bg-[#25D366] text-black shadow-[0_0_12px_rgba(37,211,102,0.4)]'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            {totalNewCount > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                            )}
                            New ({totalNewCount})
                        </button>
                        {totalNewCount > 0 && (
                            <button
                                type="button"
                                onClick={clearAllNewBadges}
                                className="px-2 py-1 text-[10px] font-mono text-white/30 hover:text-white cursor-pointer"
                                title="Mark read"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Conversations Stream ── */}
                {isFetching ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 text-[#25D366] animate-spin" />
                        <span className="text-xs font-mono text-white/40">Loading conversations...</span>
                    </div>
                ) : fetchError ? (
                    <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                        <p className="text-xs font-mono text-red-300">{fetchError}</p>
                        <button type="button" onClick={fetchVoices} className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white cursor-pointer">
                            Retry
                        </button>
                    </div>
                ) : filteredFolders.length === 0 ? (
                    <div className="p-16 text-center space-y-2">
                        <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
                            {filterNewOnly ? 'No new voices' : searchQuery ? 'No chats found' : 'No audio notes recorded'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredFolders.map((folderName) => {
                            const items = grouped[folderName] || [];
                            const latest = items[0];
                            const folderNewCount = items.filter(v => v.isNew).length;

                            return (
                                <div
                                    key={folderName}
                                    onClick={() => setSelectedFolder(folderName)}
                                    className="group relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#18191c]/60 hover:bg-[#18191c] border border-white/5 hover:border-white/15 transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-md"
                                >
                                    <ModernAvatar name={folderName} hasNew={folderNewCount > 0} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-white truncate tracking-tight">
                                                {folderName}
                                            </h3>
                                            <span className="text-[10px] font-mono text-white/35 shrink-0">
                                                {latest ? fmtDate(latest.created_at) : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 text-xs text-white/45 truncate">
                                                <Mic className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                                                <span className="truncate">Voice Note</span>
                                                <span className="text-white/20">·</span>
                                                <span className="font-mono text-[11px] text-white/35">
                                                    {items.length} {items.length === 1 ? 'audio' : 'audios'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Status */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {folderNewCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366] text-black shadow-[0_0_10px_rgba(37,211,102,0.4)] animate-pulse">
                                                +{folderNewCount}
                                            </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. CHAT DETAIL VIEW (Modern Direct Audio Player Feed)
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-2xl mx-auto space-y-3 pb-24 px-2 sm:px-4 animate-in fade-in slide-in-from-right-4 duration-200">

            {/* ── Sticky Chat Navigation Bar ── */}
            <div className="sticky top-2 z-30 flex items-center gap-3 p-3 rounded-2xl bg-[#18191c]/90 backdrop-blur-2xl border border-white/10 shadow-xl">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedFolder(null);
                        setPlayingId(null);
                        setIsSelectMode(false);
                        setSelected(new Set());
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                    title="Back to Chats"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <ModernAvatar name={selectedFolder} />

                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-white truncate tracking-tight">{selectedFolder}</h2>
                    <p className="text-[11px] font-mono text-[#25D366] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                        {currentVoices.length} {currentVoices.length === 1 ? 'Voice Note' : 'Voice Notes'}
                    </p>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => { setIsSelectMode(!isSelectMode); setSelected(new Set()); }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelectMode
                                ? 'bg-[#25D366]/20 border-[#25D366]/50 text-[#25D366]'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white'
                        }`}
                        title={isSelectMode ? 'Cancel' : 'Select'}
                    >
                        {isSelectMode ? <X size={15} /> : <CheckSquare size={15} />}
                    </button>
                </div>
            </div>

            {/* ── Bulk Delete Bar ── */}
            {isSelectMode && selected.size > 0 && (
                <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <span className="text-xs font-semibold text-red-300 font-mono">
                        {selected.size} selected
                    </span>
                    <button
                        type="button"
                        onClick={() => handleDelete(Array.from(selected))}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
                    >
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            )}

            {/* ── Audio Notes Feed ── */}
            <div className="space-y-2.5 pt-1">
                {currentVoices.length === 0 ? (
                    <div className="p-16 text-center text-xs font-mono text-white/30">
                        No audio notes in this chat
                    </div>
                ) : (
                    currentVoices.map((voice) => {
                        const isPlaying = playingId === voice.id;
                        const isChecked = selected.has(voice.id);

                        return (
                            <div
                                key={voice.id}
                                className={`flex items-start gap-2.5 transition-all ${isChecked ? 'opacity-100' : ''}`}
                            >
                                {isSelectMode && (
                                    <button
                                        type="button"
                                        onClick={() => toggleSelect(voice.id)}
                                        className="mt-3.5 shrink-0 cursor-pointer text-white/40 hover:text-white"
                                    >
                                        {isChecked
                                            ? <CheckSquare className="w-4 h-4 text-[#25D366]" />
                                            : <Square className="w-4 h-4 text-white/20" />
                                        }
                                    </button>
                                )}

                                {/* WhatsApp/Instagram Style Bubble */}
                                <div
                                    className={`flex-1 rounded-3xl p-3.5 transition-all border ${
                                        isPlaying
                                            ? 'bg-[#18191c] border-[#25D366]/40 shadow-[0_0_24px_rgba(37,211,102,0.15)] ring-1 ring-[#25D366]/20'
                                            : 'bg-[#18191c]/70 hover:bg-[#18191c] border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {/* Waveform Player */}
                                    <ModernWavePlayer
                                        url={voice.url}
                                        isGlobalPlaying={isPlaying}
                                        onPlayToggle={() => {
                                            if (voice.isNew) {
                                                setVoices(prev => prev.map(v => v.id === voice.id ? { ...v, isNew: false } : v));
                                            }
                                            setPlayingId(isPlaying ? null : voice.id);
                                        }}
                                        onEnded={() => setPlayingId(null)}
                                    />

                                    {/* Bottom Info Bar: NEW badge, time, double checkmarks & actions */}
                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.04]">
                                        <div className="flex items-center gap-2">
                                            {voice.isNew && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#25D366] text-black shadow-[0_0_8px_rgba(37,211,102,0.6)]">
                                                    NEW
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono text-white/40">
                                                {fmtDate(voice.created_at)} · {fmtTime(voice.created_at)}
                                            </span>
                                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleDownload(voice)}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                title="Download audio"
                                            >
                                                <Download size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete([voice.id])}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
