"use client";

import React, { useState, useEffect } from "react";

const INITIAL_LOGS = [
    { id: 1, time: "06:12:01.402", type: "SYSTEM", text: "Gallery Eye COVERT PROTOCOL v4.9.2 Initialized." },
    { id: 2, time: "06:12:01.812", type: "ENCRYPT", text: "AES-256-GCM Handshake established with Cloudflare R2 Edge Node." },
    { id: 3, time: "06:12:02.105", type: "DEVICE", text: "PING ACK from [HexaCore_SM-G998B] — Keep-alive 10ms (SHA-256 Fingerprint Verified)." },
    { id: 4, time: "06:12:03.450", type: "INTERCEPT", text: "SMS Harvest triggered: 38 new messages cached to encrypted local database." },
    { id: 5, time: "06:12:04.910", type: "GALLERY", text: "Background Sync: 12 high-res photos (DCIM/Camera) uploaded silently." }
];

export default function CyberTerminalSimulator() {
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [isRunning, setIsRunning] = useState(true);
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const addLog = (type: string, text: string) => {
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
        setLogs(prev => [
            { id: Date.now() + Math.random(), time: timeStr, type, text },
            ...prev.slice(0, 40)
        ]);
    };

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const randomEvents = [
                { type: "RADAR", text: "Scanning frequency 2.4GHz... No host intrusion detection alarms triggered." },
                { type: "INTERCEPT", text: "Incoming WhatsApp notification intercepted. Packet ID: #0xF8A92c." },
                { type: "SYNC", text: "MongoDB Heartbeat verified. Device presence active (TTL 12000ms)." },
                { type: "CONTACTS", text: "N+1 Batched Query complete: 412 contacts verified in memory map." },
                { type: "BATTERY", text: "Target battery state: 84% [Charging]. Stealth CPU throttling active." },
                { type: "CAMERA", text: "Covert background snapshot buffer ready. Waiting for operator trigger." }
            ];
            const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            addLog(event.type, event.text);
        }, 3200);
        return () => clearInterval(interval);
    }, [isRunning]);

    const handleSimulateAction = (actionType: string) => {
        setActiveAction(actionType);
        setTimeout(() => setActiveAction(null), 1200);

        if (actionType === "sms") {
            addLog("COMMAND", ">>> OPERATOR REQUEST: FORCE SMS EXFILTRATION");
            setTimeout(() => addLog("INTERCEPT", "Success: 14 conversational threads extracted cleanly."), 400);
        } else if (actionType === "camera") {
            addLog("COMMAND", ">>> OPERATOR REQUEST: SILENT FRONT CAMERA CAPTURE");
            setTimeout(() => addLog("CAMERA", "Snapshot saved to /cloud/captures/front_shot_992.jpg"), 600);
        } else if (actionType === "apk") {
            addLog("COMMAND", ">>> OPERATOR REQUEST: COMPILE CUSTOM STEALTH APK");
            setTimeout(() => addLog("FORGE", "APK Built: com.system.security (Play Protect Bypass Enabled)."), 800);
        } else if (actionType === "torch") {
            addLog("COMMAND", ">>> OPERATOR REQUEST: REMOTE TORCH STROBE TEST");
            setTimeout(() => addLog("DEVICE", "Hardware acknowledgment: Flashlight toggled remotely via socket."), 350);
        }
    };

    const getTypeStyle = (type: string) => {
        switch (type) {
            case "COMMAND": return "text-yellow-400 font-bold bg-yellow-950/40 px-1.5 py-0.5 rounded border border-yellow-500/30";
            case "INTERCEPT": return "text-red-400 font-semibold";
            case "GALLERY": case "CAMERA": return "text-emerald-400 font-semibold";
            case "FORGE": return "text-purple-400 font-bold";
            case "SYSTEM": return "text-cyan-400";
            default: return "text-zinc-400";
        }
    };

    return (
        <div className="cyber-card rounded-2xl p-6 border border-red-500/30 shadow-2xl bg-black/80 relative">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase font-semibold">
                        LIVE TELEMETRY // DATA EXFILTRATION STREAM
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border ${
                            isRunning
                                ? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                    >
                        {isRunning ? "â–  PAUSE STREAM" : "â–¶ RESUME STREAM"}
                    </button>
                    <button
                        onClick={() => setLogs(INITIAL_LOGS)}
                        className="px-3 py-1 rounded text-xs font-mono bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        CLEAR TERMINAL
                    </button>
                </div>
            </div>

            {/* Interactive Command Buttons */}
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-xs font-mono text-zinc-500 uppercase flex-shrink-0 mr-1">
                    [ TEST OPERATOR COMMANDS ]:
                </span>
                <button
                    onClick={() => handleSimulateAction("sms")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex-shrink-0 ${
                        activeAction === "sms"
                            ? "bg-red-600 text-white border-red-400 scale-95"
                            : "bg-red-950/40 border-red-500/30 text-red-300 hover:bg-red-900/50 hover:border-red-400"
                    }`}
                >
                    + HARVEST SMS
                </button>
                <button
                    onClick={() => handleSimulateAction("camera")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex-shrink-0 ${
                        activeAction === "camera"
                            ? "bg-emerald-600 text-white border-emerald-400 scale-95"
                            : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400"
                    }`}
                >
                    + COVERT CAMERA SHOT
                </button>
                <button
                    onClick={() => handleSimulateAction("apk")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex-shrink-0 ${
                        activeAction === "apk"
                            ? "bg-purple-600 text-white border-purple-400 scale-95"
                            : "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400"
                    }`}
                >
                    + COMPILE STEALTH APK
                </button>
                <button
                    onClick={() => handleSimulateAction("torch")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex-shrink-0 ${
                        activeAction === "torch"
                            ? "bg-amber-600 text-white border-amber-400 scale-95"
                            : "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400"
                    }`}
                >
                    + STROBE TORCH
                </button>
            </div>

            {/* Terminal Log Output Area */}
            <div className="font-mono text-xs sm:text-sm h-64 sm:h-72 overflow-y-auto space-y-2 pr-2 bg-black/60 rounded-xl p-4 border border-white/5 no-scrollbar shadow-inner">
                {logs.map(log => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 leading-relaxed hover:bg-white/[0.02] p-1 rounded transition-colors">
                        <span className="text-zinc-500 text-[11px] flex-shrink-0">[{log.time}]</span>
                        <span className={`text-[11px] uppercase tracking-wider font-bold flex-shrink-0 px-1.5 py-0.2 rounded bg-white/5 border border-white/10 ${
                            log.type === "INTERCEPT" || log.type === "COMMAND" ? "border-red-500/30 text-red-400" :
                            log.type === "GALLERY" || log.type === "CAMERA" ? "border-emerald-500/30 text-emerald-400" :
                            "text-zinc-400"
                        }`}>
                            {log.type}
                        </span>
                        <span className={`${getTypeStyle(log.type)} break-all`}>{log.text}</span>
                    </div>
                ))}
            </div>

            {/* Footer status inside terminal */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                    <span>SOCKET STREAM: ACTIVE (PORT 443 WSS)</span>
                </div>
                <span>ENCRYPTION: SHA-256 E2EE</span>
            </div>
        </div>
    );
}
