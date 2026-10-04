"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, CheckCircle2, AlertCircle, X,
    Zap, Shield, RefreshCw, Film, ChevronRight
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
    const s  = Math.max(0, Math.floor(ms / 1000));
    const m  = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

function fmtSec(sec: number) {
    if (sec <= 0) return 'Unlimited';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtReason(r: string) {
    if (r === 'duration_complete')   return 'Completed';
    if (r === 'manual_stop')         return 'Stopped';
    if (r === 'secure_app_detected') return 'Auto-protected';
    if (r === 'encoder_error')       return 'Error';
    if (r === 'token_released')      return 'Ended';
    if (r === 'stealth_timeout')     return 'Timed out';
    return r || 'Recorded';
}

export default function ScreenRecordView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    deviceName
}: ScreenRecordViewProps) {

    // ── Device State ──────────────────────────────────────────────────────────
    const [hasToken, setHasToken] = useState<boolean | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);

    // ── Recording Config & State ──────────────────────────────────────────────
    const [isRecording, setIsRecording] = useState(false);
    const [recMode, setRecMode] = useState<'stealth' | 'simple'>('stealth');
    const [recDuration, setRecDuration] = useState(300); // seconds, -1 = unlimited
    const [customMin, setCustomMin] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs, setRecTotalMs] = useState(0);
    const [pendingRec, setPendingRec] = useState(false);

    // ── Persistent Saved Recordings ───────────────────────────────────────────
    const [savedRecs, setSavedRecs] = useState<SavedRecording[]>([]);

    // ── Modals & Popups ───────────────────────────────────────────────────────
    const [showSimpleWarn, setShowSimpleWarn] = useState(false);
    const [showUnlimWarn, setShowUnlimWarn] = useState(false);
    const [showStealthQueuedModal, setShowStealthQueuedModal] = useState(false);
    const [activeVideo, setActiveVideo] = useState<SavedRecording | null>(null);

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;

    const storageKey = `asml_screen_recordings_${selectedDeviceId || 'default'}`;

    // Load persisted recordings on mount or device switch
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
        } catch {
            setSavedRecs([]);
        }
    }, [storageKey]);

    // Save recordings helper
    const updateSavedRecs = (updater: (prev: SavedRecording[]) => SavedRecording[]) => {
        setSavedRecs(prev => {
            const updated = updater(prev);
            try {
                localStorage.setItem(storageKey, JSON.stringify(updated.slice(0, 30)));
            } catch {}
            return updated;
        });
    };

    // ── Socket Events ─────────────────────────────────────────────────────────
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
                    setStatusMsg({ type: 'warning', text: 'Waiting for device authorization...' });
                    break;
                case 'authorized':
                    setHasToken(true);
                    setStatusMsg({ type: 'success', text: 'Screen capture authorized.' });
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
                    setStatusMsg({ type: 'warning', text: 'Stealth session completed without capture.' });
                    break;
                case 'denied':
                    setIsRecording(false);
                    setPendingRec(false);
                    setHasToken(false);
                    setStatusMsg({ type: 'error', text: data.error || 'Permission was declined on device.' });
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
                const rec: SavedRecording = {
                    id:        `rec_${Date.now()}`,
                    url:       data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs || 0,
                    totalMs:   data.totalMs   || 0,
                    reason:    data.reason    || 'completed',
                    mode:      data.mode
                };
                updateSavedRecs(prev => [rec, ...prev.filter(r => r.id !== rec.id)]);
                setStatusMsg({ type: 'success', text: `New recording ready (${fmtMs(data.elapsedMs || 0)})` });
            } else {
                setStatusMsg({ type: 'warning', text: `Recording finished: ${fmtReason(data.reason || 'completed')}` });
            }
        };

        socket.on('screen_status',       onScreenStatus);
        socket.on('screen_rec_progress', onRecProgress);
        socket.on('screen_rec_complete', onRecComplete);

        return () => {
            if (isRecordingRef.current) {
                socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
            }
            socket.off('screen_status',       onScreenStatus);
            socket.off('screen_rec_progress', onRecProgress);
            socket.off('screen_rec_complete', onRecComplete);
        };
    }, [socket, selectedDeviceId, isOnline, userUuid, storageKey]);

    // Auto-clear status messages
    useEffect(() => {
        if (!statusMsg || statusMsg.type === 'warning' || statusMsg.type === 'error') return;
        const t = setTimeout(() => setStatusMsg(null), 5000);
        return () => clearTimeout(t);
    }, [statusMsg]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleStartRecord = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording || pendingRec) return;

        if (recMode === 'simple') {
            setShowSimpleWarn(true);
            return;
        }

        if (recDuration === -1 && recMode === 'stealth') {
            setShowUnlimWarn(true);
            return;
        }

        fireStartRecord();
    };

    const fireStartRecord = () => {
        if (!selectedDeviceId || !socket) return;
        const duration = recDuration === -1 ? 86400 : recDuration;
        setPendingRec(true);
        setRecElapsedMs(0);
        setRecTotalMs(duration * 1000);

        socket.emit('screen_record_start', {
            uuid:           userUuid,
            targetDeviceId: selectedDeviceId,
            duration,
            mode:           recMode
        });

        if (recMode === 'stealth') {
            setShowStealthQueuedModal(true);
        } else {
            setStatusMsg({ type: 'info', text: 'Prompt dispatched to target device.' });
        }
    };

    const handleStopRecord = () => {
        if (!selectedDeviceId || !socket) return;
        socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        setIsRecording(false);
        setPendingRec(false);
        setRecElapsedMs(0);
        setRecTotalMs(0);
    };

    const handleCustomInput = (val: string) => {
        setCustomMin(val);
        const n = parseInt(val, 10);
        if (!isNaN(n) && n >= 1 && n <= 10) {
            setRecDuration(n * 60);
        }
    };

    const handleDeleteRecording = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateSavedRecs(prev => prev.filter(r => r.id !== id));
    };

    const handleClearAll = () => {
        updateSavedRecs(() => []);
    };

    const progressPct = recTotalMs > 0
        ? Math.min((recElapsedMs / recTotalMs) * 100, 100)
        : 0;

    const isUnlimited = recDuration === -1;

    return (
        <div className="w-full max-w-xl mx-auto space-y-3.5 pb-24 px-3 sm:px-4 animate-in fade-in duration-200">

            {/* ── Status Toast ── */}
            {statusMsg && (
                <div className={`px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border shadow-md animate-in slide-in-from-top-2 ${
                    statusMsg.type === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : statusMsg.type === 'error'   ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                }`}>
                    <div className="flex items-center gap-2">
                        {statusMsg.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
                        <span>{statusMsg.text}</span>
                    </div>
                    <button onClick={() => setStatusMsg(null)} className="text-white/40 hover:text-white cursor-pointer px-1">✕</button>
                </div>
            )}

            {/* ── Device & Token Status Pill ── */}
            <div className="clay-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
                    <div>
                        <div className="text-xs font-bold text-white tracking-wide">{deviceName || 'Select Device'}</div>
                        <div className="text-[10px] text-white/40 font-mono">{isOnline ? 'Device Connected' : 'Offline'}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasToken !== null && (
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                            hasToken ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                     : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                            {hasToken ? 'Ready' : 'Standby'}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Mode Selection ── */}
            <div className="clay-card p-3.5 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40">Recording Mode</span>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">{recMode === 'stealth' ? 'Recommended' : 'Standard'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Stealth Button */}
                    <button
                        type="button"
                        onClick={() => setRecMode('stealth')}
                        disabled={isRecording || pendingRec}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer disabled:opacity-40 border ${
                            recMode === 'stealth'
                                ? 'bg-orange-500/15 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Shield size={14} className={recMode === 'stealth' ? 'text-orange-400' : 'text-white/40'} />
                            <span className={`text-xs font-black uppercase tracking-wider ${recMode === 'stealth' ? 'text-orange-300' : 'text-white/60'}`}>
                                Stealth
                            </span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                            Completely silent. Captures without on-screen prompts.
                        </p>
                    </button>

                    {/* Simple Button */}
                    <button
                        type="button"
                        onClick={() => setRecMode('simple')}
                        disabled={isRecording || pendingRec}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer disabled:opacity-40 border ${
                            recMode === 'simple'
                                ? 'bg-orange-500/15 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={14} className={recMode === 'simple' ? 'text-orange-400' : 'text-white/40'} />
                            <span className={`text-xs font-black uppercase tracking-wider ${recMode === 'simple' ? 'text-orange-300' : 'text-white/60'}`}>
                                Standard
                            </span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                            Sends direct permission prompt to device screen.
                        </p>
                    </button>
                </div>
            </div>

            {/* ── Duration Selector ── */}
            <div className="clay-card p-3.5 space-y-2.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40 px-1">Duration</span>

                <div className="grid grid-cols-4 gap-1.5">
                    {DURATION_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setRecDuration(opt.value); setShowCustom(false); setCustomMin(''); }}
                            disabled={isRecording || pendingRec}
                            className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40 ${
                                recDuration === opt.value && !showCustom && recDuration !== -1
                                    ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => { setShowCustom(true); setRecDuration(0); }}
                        disabled={isRecording || pendingRec}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40 ${
                            showCustom
                                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Custom
                    </button>
                </div>

                {/* Custom Input */}
                {showCustom && (
                    <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-orange-500/30 animate-in slide-in-from-top-1">
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={customMin}
                            onChange={e => handleCustomInput(e.target.value)}
                            placeholder="1–10"
                            className="bg-transparent text-white text-sm font-mono w-16 outline-none placeholder:text-white/20"
                        />
                        <span className="text-xs text-white/40 font-mono">minutes (up to 10m)</span>
                        {recDuration > 0 && (
                            <span className="ml-auto text-xs text-orange-400 font-mono font-bold">{fmtSec(recDuration)}</span>
                        )}
                    </div>
                )}

                {/* Unlimited Option */}
                <button
                    type="button"
                    onClick={() => { setRecDuration(-1); setShowCustom(false); setCustomMin(''); }}
                    disabled={isRecording || pendingRec}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-between transition-all cursor-pointer disabled:opacity-40 border ${
                        isUnlimited
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'bg-white/3 border-white/5 text-white/40 hover:border-white/15 hover:text-white/70'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span>Continuous Session</span>
                        <span className="text-[10px] text-white/30 font-normal">(Until Stopped)</span>
                    </div>
                    {isUnlimited && <span className="text-[10px] text-amber-400 font-mono">Active</span>}
                </button>
            </div>

            {/* ── Main Action & Progress ── */}
            <div className="clay-card p-3.5 space-y-3">
                {!isRecording && !pendingRec ? (
                    <button
                        type="button"
                        onClick={handleStartRecord}
                        disabled={!isOnline || !selectedDeviceId || (showCustom && recDuration <= 0)}
                        className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.35)]"
                    >
                        <Play size={14} className="fill-current" />
                        {recMode === 'stealth' ? 'Queue Stealth Recording' : 'Start Screen Recording'}
                    </button>

                ) : pendingRec && !isRecording ? (
                    /* Queued / Waiting State Card */
                    <div className="space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Clock size={16} className="text-amber-400 animate-spin" />
                                <div>
                                    <div className="text-xs font-bold text-amber-300">
                                        {recMode === 'stealth' ? 'Stealth Recording Queued' : 'Waiting for Screen Approval...'}
                                    </div>
                                    <div className="text-[10px] text-amber-300/60 font-mono">
                                        {recMode === 'stealth'
                                            ? 'Target session will begin automatically in background'
                                            : 'Prompt active on device screen'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleStopRecord}
                            className="w-full py-2.5 rounded-xl text-xs font-mono text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border border-white/10"
                        >
                            Cancel Request
                        </button>
                    </div>

                ) : (
                    /* Active Recording Progress */
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-rose-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                                <span className="font-black uppercase tracking-wider">Recording in Progress</span>
                            </div>
                            <span className="font-mono text-white/70 font-bold">
                                {fmtMs(recElapsedMs)} {recTotalMs > 0 && !isUnlimited ? `/ ${fmtMs(recTotalMs)}` : ''}
                            </span>
                        </div>

                        {!isUnlimited && recTotalMs > 0 && (
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-1000"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleStopRecord}
                            className="w-full py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition-all cursor-pointer"
                        >
                            <Square size={13} className="fill-current" />
                            Stop & Save Video
                        </button>
                    </div>
                )}
            </div>

            {/* ── Saved Recordings List ── */}
            <div className="clay-card overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
                        <Film size={14} className="text-orange-400" />
                        <span>Saved Recordings</span>
                        {savedRecs.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                                {savedRecs.length}
                            </span>
                        )}
                    </div>
                    {savedRecs.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-[10px] font-mono text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            Clear History
                        </button>
                    )}
                </div>

                {savedRecs.length === 0 ? (
                    <div className="p-8 text-center space-y-1">
                        <Video size={24} className="mx-auto text-white/20 mb-2" />
                        <div className="text-xs text-white/40 font-mono">No recordings yet</div>
                        <div className="text-[10px] text-white/25 font-mono">Completed videos will appear here automatically</div>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {savedRecs.map(rec => (
                            <div
                                key={rec.id}
                                onClick={() => setActiveVideo(rec)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Play size={14} className="fill-current ml-0.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white/90 font-mono">{fmtMs(rec.elapsedMs)}</span>
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                                            rec.mode === 'stealth'
                                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                                : 'bg-white/10 text-white/60'
                                        }`}>
                                            {rec.mode || 'video'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-white/35 font-mono mt-0.5">
                                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {fmtReason(rec.reason)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                    <a
                                        href={rec.url}
                                        download={`recording_${rec.timestamp}.mp4`}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                        title="Download Video"
                                    >
                                        <Download size={13} />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteRecording(rec.id, e)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-all cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Stealth Queued Confirmation Modal ── */}
            {showStealthQueuedModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowStealthQueuedModal(false); }}
                    className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
                >
                    <div className="clay-card max-w-sm w-full p-5 border border-orange-500/40 shadow-2xl space-y-4 animate-in slide-in-from-bottom-3">
                        <div className="flex items-center gap-2.5 text-orange-400">
                            <Shield size={20} className="shrink-0" />
                            <span className="font-black text-sm uppercase tracking-wider">Stealth Task Queued</span>
                        </div>

                        <p className="text-xs text-white/70 font-mono leading-relaxed">
                            Your request has been placed in the background queue for <span className="text-white font-bold">{fmtSec(recDuration)}</span>.
                        </p>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/50 font-mono space-y-1">
                            <div>• Target device will record silently in background</div>
                            <div>• No alert or prompt shown on phone</div>
                            <div>• Video will automatically appear in your list below</div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowStealthQueuedModal(false)}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-orange-500 hover:bg-orange-400 text-black transition-all cursor-pointer shadow-lg"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}

            {/* ── Standard Mode Warning Modal ── */}
            {showSimpleWarn && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSimpleWarn(false); }}
                    className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
                >
                    <div className="clay-card max-w-sm w-full p-5 border border-amber-500/40 shadow-2xl space-y-4 animate-in slide-in-from-bottom-3">
                        <div className="flex items-center gap-2.5 text-amber-400">
                            <AlertTriangle size={18} />
                            <span className="font-black text-sm uppercase tracking-wider">Screen Prompt Notice</span>
                        </div>
                        <p className="text-xs text-white/70 font-mono leading-relaxed">
                            Standard mode will display an authorization dialog on the device screen.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-mono text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowSimpleWarn(false); fireStartRecord(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Unlimited Mode Warning Modal ── */}
            {showUnlimWarn && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowUnlimWarn(false); }}
                    className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
                >
                    <div className="clay-card max-w-sm w-full p-5 border border-rose-500/40 shadow-2xl space-y-4 animate-in slide-in-from-bottom-3">
                        <div className="flex items-center gap-2.5 text-rose-400">
                            <AlertTriangle size={18} />
                            <span className="font-black text-sm uppercase tracking-wider">Continuous Session</span>
                        </div>
                        <p className="text-xs text-white/70 font-mono leading-relaxed">
                            Continuous capture will run until manually stopped. Extended recording consumes device battery and storage.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowUnlimWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-mono text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowUnlimWarn(false); fireStartRecord(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-400 text-white transition-all cursor-pointer"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── In-App Video Player Lightbox Modal ── */}
            {activeVideo && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null); }}
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
                >
                    <div className="clay-card max-w-3xl w-full flex flex-col shadow-2xl relative overflow-hidden border border-white/10 rounded-2xl sm:rounded-3xl bg-[#090b0e]">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-mono font-bold text-white">
                                    Recording ({fmtMs(activeVideo.elapsedMs)})
                                </span>
                                <span className="text-[10px] text-white/40 font-mono">
                                    {new Date(activeVideo.timestamp).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={activeVideo.url}
                                    download={`recording_${activeVideo.timestamp}.mp4`}
                                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Download"
                                >
                                    <Download size={14} />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setActiveVideo(null)}
                                    className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Player */}
                        <div className="relative bg-black flex items-center justify-center p-1 sm:p-2 min-h-[300px]">
                            <video
                                src={activeVideo.url}
                                controls
                                autoPlay
                                playsInline
                                className="w-full max-h-[72vh] object-contain rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
