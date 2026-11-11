"use client";

import React, { useState } from 'react';
import { 
    Cpu, HardDrive, Battery, Wifi, Monitor, Shield, Clock, RefreshCw, 
    Smartphone, Zap, Server, Activity, CheckCircle2, Layers, AlertCircle,
    Copy, Check, Info, Radio, Sparkles
} from 'lucide-react';

interface DeviceInfoViewProps {
    specs: any;
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function DeviceInfoView({ specs, device, onRefresh, isLoading }: DeviceInfoViewProps) {
    const [localRefreshing, setLocalRefreshing] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const isBusy = isLoading || localRefreshing;
    const isOnline = Boolean(device?.online);

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleRefresh = () => {
        if (!isOnline || isBusy) return;
        setLocalRefreshing(true);
        onRefresh();
        setTimeout(() => setLocalRefreshing(false), 2000);
    };

    const hardware = specs?.hardware || {};
    const os = specs?.os || {};
    const memory = specs?.memory || {};
    const battery = specs?.battery || {};
    const display = specs?.display || {};
    const network = specs?.network || {};

    const hasData = Boolean(specs && Object.keys(specs).length > 0);

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatUptime = (millis: number) => {
        if (!millis) return 'N/A';
        const seconds = Math.floor((millis / 1000) % 60);
        const minutes = Math.floor((millis / (1000 * 60)) % 60);
        const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
        const days = Math.floor(millis / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const ramTotal = Number(memory.totalRamBytes) || 0;
    const ramAvail = Number(memory.availRamBytes) || 0;
    const ramUsed = ramTotal > ramAvail ? ramTotal - ramAvail : 0;
    const ramPercent = ramTotal > 0 ? Math.min(100, Math.max(0, Math.round((ramUsed / ramTotal) * 100))) : 0;

    const storageTotal = Number(memory.totalStorageBytes) || 0;
    const storageAvail = Number(memory.availStorageBytes) || 0;
    const storageUsed = Number(memory.usedStorageBytes) || (storageTotal > storageAvail ? storageTotal - storageAvail : 0);
    const storagePercent = storageTotal > 0 ? Math.min(100, Math.max(0, Math.round((storageUsed / storageTotal) * 100))) : 0;

    const batteryLevel = typeof battery.percentage === 'number' && battery.percentage >= 0 ? battery.percentage : null;

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6 pb-20">
            <header className="rounded-2xl border border-white/[0.07] bg-[#0c121e]/90 p-4 sm:p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                                    {device?.name || hardware.model || 'Device Diagnostic Station'}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide border ${
                                    isOnline 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 truncate mt-0.5">
                                {hardware.brand ? `${hardware.brand} ${hardware.model} • ` : ''}
                                {os.release ? `Android ${os.release} (API ${os.sdkInt || 'N/A'})` : 'A-to-Z Technical Telemetry'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                        <button
                            onClick={handleRefresh}
                            disabled={!isOnline || isBusy}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all border ${
                                !isOnline 
                                    ? 'bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed'
                                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 active:scale-[0.98]'
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                            <span>{isBusy ? 'Querying Device...' : 'Refresh Telemetry'}</span>
                        </button>
                    </div>
                </div>

                {!isOnline && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Target device is currently offline. Showing cached hardware specifications from last connection.</span>
                    </div>
                )}
            </header>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-2">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Battery Power</span>
                        <Battery className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
                        </span>
                        {battery.isCharging && (
                            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Charging</span>
                        )}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                            className="h-full bg-emerald-400 transition-all duration-300"
                            style={{ width: `${batteryLevel ?? 0}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-2">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>RAM Utilization</span>
                        <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {ramPercent > 0 ? `${ramPercent}%` : 'N/A'}
                        </span>
                        <span className="font-mono text-xs text-white/40 tabular-nums">
                            {ramTotal > 0 ? `${formatBytes(ramUsed)} used` : ''}
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                            className="h-full bg-cyan-400 transition-all duration-300"
                            style={{ width: `${ramPercent}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-2">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Internal Storage</span>
                        <HardDrive className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {storagePercent > 0 ? `${storagePercent}%` : 'N/A'}
                        </span>
                        <span className="font-mono text-xs text-white/40 tabular-nums">
                            {storageAvail > 0 ? `${formatBytes(storageAvail)} free` : ''}
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                            className="h-full bg-violet-400 transition-all duration-300"
                            style={{ width: `${storagePercent}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-2">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Network Link</span>
                        <Wifi className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-white truncate">
                            {network.type || 'Connected'}
                        </span>
                    </div>
                    <p className="text-[11px] text-white/40 font-mono truncate">
                        {network.ipAddress || (isOnline ? 'Link Active' : 'Offline')}
                    </p>
                </div>
            </section>

            {!hasData ? (
                <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0c121e]/40 text-center space-y-3">
                    <Cpu className="w-10 h-10 text-cyan-400/40 mx-auto" />
                    <h3 className="text-base font-semibold text-white">No Telemetry Cached</h3>
                    <p className="text-xs text-white/50 max-w-md mx-auto">
                        Hardware registers have not reported yet. Click Refresh Telemetry while the target device is connected to query specs.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <Cpu className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">Processor & SoC</h2>
                            </div>
                            <span className="text-[11px] font-mono text-cyan-400/80">SOC</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Processor / SoC</dt>
                                <dd className="font-mono text-white/90 text-right truncate max-w-[55%]">{hardware.soc || 'Standard SoC'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">CPU Cores</dt>
                                <dd className="font-mono text-white/90">{hardware.cpuCores ? `${hardware.cpuCores} Cores` : 'Octa-Core'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Architecture</dt>
                                <dd className="font-mono text-white/90 truncate max-w-[55%]">{hardware.architecture || 'arm64-v8a'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Board & Hardware</dt>
                                <dd className="font-mono text-white/90 truncate max-w-[55%]">{hardware.board || hardware.hardware || 'Unknown'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Device Model</dt>
                                <dd className="font-mono text-white/90 truncate max-w-[55%]">{hardware.model || 'Unknown'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Shield className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">OS & Platform</h2>
                            </div>
                            <span className="text-[11px] font-mono text-indigo-400/80">ANDROID</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Android Version</dt>
                                <dd className="font-mono font-semibold text-white/90">{os.release || 'Unknown'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">API / SDK Level</dt>
                                <dd className="font-mono text-white/90">{os.sdkInt ? `API ${os.sdkInt}` : 'N/A'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Security Patch</dt>
                                <dd className="font-mono text-white/90">{os.securityPatch || 'N/A'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Build Fingerprint</dt>
                                <dd className="font-mono text-[11px] text-white/80 truncate max-w-[55%]" title={os.fingerprint || ''}>
                                    {os.fingerprint ? `${os.fingerprint.substring(0, 16)}...` : 'Stock OS'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">System Uptime</dt>
                                <dd className="font-mono text-white/90">{formatUptime(os.uptimeMillis)}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-violet-400">
                                <HardDrive className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">Memory & Storage</h2>
                            </div>
                            <span className="text-[11px] font-mono text-violet-400/80">STORAGE</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Total RAM</dt>
                                <dd className="font-mono font-semibold text-white/90">{formatBytes(memory.totalRamBytes)}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Available RAM</dt>
                                <dd className="font-mono text-emerald-400">{formatBytes(memory.availRamBytes)} free</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Internal Storage</dt>
                                <dd className="font-mono font-semibold text-white/90">{formatBytes(memory.totalStorageBytes)}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Free Storage</dt>
                                <dd className="font-mono text-emerald-400">{formatBytes(memory.availStorageBytes)} free</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Low RAM State</dt>
                                <dd className="font-mono text-white/90">{memory.isLowMemory ? 'YES (Low RAM)' : 'Normal'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Battery className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">Battery & Power</h2>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-400/80">POWER</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Charge Level</dt>
                                <dd className="font-mono font-bold text-emerald-400">
                                    {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Power Source</dt>
                                <dd className="font-mono text-white/90">{battery.plugType || 'Battery'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">State of Charge</dt>
                                <dd className={`font-medium ${battery.isCharging ? 'text-amber-400' : 'text-white/80'}`}>
                                    {battery.isCharging ? 'Charging' : 'Discharging'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Core Temperature</dt>
                                <dd className="font-mono text-white/90">
                                    {battery.temperatureC ? `${battery.temperatureC} °C` : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Cell Voltage</dt>
                                <dd className="font-mono text-white/90">
                                    {battery.voltageMv ? `${(battery.voltageMv / 1000).toFixed(2)} V` : 'N/A'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-pink-400">
                                <Monitor className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">Display & Screen</h2>
                            </div>
                            <span className="text-[11px] font-mono text-pink-400/80">OPTICS</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Resolution</dt>
                                <dd className="font-mono font-semibold text-white/90">
                                    {display.widthPx && display.heightPx ? `${display.widthPx} × ${display.heightPx} px` : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Pixel Density</dt>
                                <dd className="font-mono text-white/90">{display.densityDpi ? `${display.densityDpi} DPI` : 'N/A'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Refresh Rate</dt>
                                <dd className="font-mono text-white/90">{display.refreshRateHz ? `${Math.round(display.refreshRateHz)} Hz` : '60 Hz'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Scale Factor</dt>
                                <dd className="font-mono text-white/90">{display.scaledDensity ? `${display.scaledDensity}x` : '1.0x'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Orientation</dt>
                                <dd className="font-mono text-white/90">{display.orientation || 'Portrait'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2 text-sky-400">
                                <Wifi className="w-4 h-4" />
                                <h2 className="text-xs font-bold tracking-wider uppercase text-white">Network & Link</h2>
                            </div>
                            <span className="text-[11px] font-mono text-sky-400/80">LINK</span>
                        </div>
                        <dl className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Active Interface</dt>
                                <dd className="font-mono font-semibold text-white/90">{network.type || 'N/A'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Link State</dt>
                                <dd className="font-mono text-emerald-400">{isOnline ? 'Active Connection' : 'Disconnected'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Link Speed</dt>
                                <dd className="font-mono text-white/90">{network.linkSpeedMbps ? `${network.linkSpeedMbps} Mbps` : 'High Speed'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Local IP Address</dt>
                                <dd className="font-mono text-white/90">{network.ipAddress || 'Auto / DHCP'}</dd>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                                <dt className="text-white/45">Radio Roaming</dt>
                                <dd className="font-mono text-white/90">{network.isRoaming ? 'Roaming' : 'Home Network'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}
