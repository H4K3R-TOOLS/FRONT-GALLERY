"use client";

import React, { useState } from 'react';
import { 
    Cpu, HardDrive, Battery, Wifi, Monitor, Shield, Clock, RefreshCw, 
    Smartphone, Zap, Server, Activity, Check, Copy, Radio, Gauge,
    ChevronRight, Layers, ArrowUpRight, ShieldCheck, Thermometer
} from 'lucide-react';

interface DeviceInfoViewProps {
    specs: any;
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

type TabType = 'overview' | 'hardware' | 'memory' | 'system' | 'display_net';

export default function DeviceInfoView({ specs, device, onRefresh, isLoading }: DeviceInfoViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const hardware = specs?.hardware || {};
    const os = specs?.os || {};
    const memory = specs?.memory || {};
    const battery = specs?.battery || {};
    const display = specs?.display || {};
    const network = specs?.network || {};

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

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
        const s = Math.floor((millis / 1000) % 60);
        const m = Math.floor((millis / (1000 * 60)) % 60);
        const h = Math.floor((millis / (1000 * 60 * 60)) % 24);
        const d = Math.floor(millis / (1000 * 60 * 60 * 24));
        if (d > 0) return `${d}d ${h}h ${m}m`;
        return `${h}h ${m}m ${s}s`;
    };

    const ramUsedBytes = (memory.totalRamBytes && memory.availRamBytes)
        ? Math.max(0, memory.totalRamBytes - memory.availRamBytes)
        : 0;

    const ramPercent = memory.totalRamBytes 
        ? Math.min(100, Math.max(0, Math.round((ramUsedBytes / memory.totalRamBytes) * 100))) 
        : (memory.totalRamBytes ? 0 : null);

    const storageUsedBytes = memory.usedStorageBytes || (
        (memory.totalStorageBytes && memory.availStorageBytes)
            ? Math.max(0, memory.totalStorageBytes - memory.availStorageBytes)
            : 0
    );

    const storagePercent = memory.totalStorageBytes 
        ? Math.min(100, Math.max(0, Math.round((storageUsedBytes / memory.totalStorageBytes) * 100))) 
        : null;

    const deviceName = device?.name || hardware.model || 'Target Host';
    const isOnline = Boolean(device?.online);
    const socName = hardware.soc || hardware.board || 'Architecture Native';
    const batteryPct = typeof battery.percentage === 'number' && battery.percentage >= 0 ? battery.percentage : null;

    return (
        <div className="max-w-6xl mx-auto space-y-5 pb-16 px-1 sm:px-0">
            <header className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-300">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-semibold text-zinc-100 truncate tracking-tight">
                                    {deviceName}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                                    isOnline 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                                {hardware.brand ? `${hardware.brand} ` : ''}{hardware.model || 'Generic Device'} • Android {os.versionRelease || 'OS'} (SDK {os.sdkInt || '-'})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.04] border border-white/[0.09] text-zinc-200 font-medium text-xs transition-colors disabled:opacity-40"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Query Hardware</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/[0.06]">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                            <span>Battery</span>
                            <Battery className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono">
                                {batteryPct !== null ? `${batteryPct}%` : '—'}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate">
                                {battery.isCharging ? 'Charging' : 'Discharging'}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                            <span>Memory Load</span>
                            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono">
                                {ramPercent !== null ? `${ramPercent}%` : '—'}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate font-mono">
                                {memory.totalRamBytes ? formatBytes(memory.totalRamBytes) : 'RAM'}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                            <span>Storage Free</span>
                            <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono truncate">
                                {memory.availStorageBytes ? formatBytes(memory.availStorageBytes) : '—'}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate font-mono">
                                {storagePercent !== null ? `${100 - storagePercent}% free` : 'Disk'}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                            <span>Link Transport</span>
                            <Wifi className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono truncate">
                                {network.type || 'Cellular'}
                            </span>
                            <span className="text-[11px] text-emerald-400 truncate font-mono">
                                {network.ipAddress ? network.ipAddress : (isOnline ? 'Active' : 'Standby')}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex sm:hidden overflow-x-auto no-scrollbar gap-1.5 p-1 bg-[#18191c] rounded-xl border border-white/[0.06]">
                {(['overview', 'hardware', 'memory', 'system', 'display_net'] as TabType[]).map((tab) => {
                    const labels: Record<TabType, string> = {
                        overview: 'Overview',
                        hardware: 'Processor',
                        memory: 'Storage',
                        system: 'Android OS',
                        display_net: 'Display & Link'
                    };
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                isActive 
                                    ? 'bg-white/10 text-zinc-100 border border-white/[0.08]' 
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`space-y-5 ${
                    activeTab === 'overview' ? 'lg:col-span-7' :
                    (activeTab === 'hardware' || activeTab === 'memory') ? 'col-span-12' : 'hidden sm:block lg:col-span-7'
                }`}>
                    <section className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <Cpu className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-semibold text-zinc-100">Processor & Architecture</h2>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                                {hardware.cpuAbi || 'arm64-v8a'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                <span className="text-[11px] text-zinc-500">SoC / Chipset</span>
                                <p className="font-mono text-zinc-200 font-medium truncate">{socName}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                <span className="text-[11px] text-zinc-500">CPU Compute Units</span>
                                <p className="font-mono text-zinc-200 font-medium">
                                    {hardware.cpuCores ? `${hardware.cpuCores} Physical Cores` : 'Multi-Core Compute'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                <span className="text-[11px] text-zinc-500">Board Identifier</span>
                                <p className="font-mono text-zinc-200 font-medium truncate">{hardware.board || 'Native Board'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                <span className="text-[11px] text-zinc-500">Manufacturer Device Code</span>
                                <p className="font-mono text-zinc-200 font-medium truncate">{hardware.device || hardware.model || 'Android'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <Gauge className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-semibold text-zinc-100">Memory & Storage Partition Allocation</h2>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">
                                Realtime Load
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
                                <div className="flex justify-between items-baseline text-xs">
                                    <span className="font-medium text-zinc-200">System RAM Allocation</span>
                                    <span className="font-mono text-zinc-400">
                                        {formatBytes(ramUsedBytes)} / {memory.totalRamBytes ? formatBytes(memory.totalRamBytes) : '—'} ({ramPercent ?? 0}%)
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                                    <div 
                                        className="h-full bg-zinc-300 transition-all duration-500 rounded-full"
                                        style={{ width: `${ramPercent ?? 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-0.5">
                                    <span>Available: {memory.availRamBytes ? formatBytes(memory.availRamBytes) : '—'}</span>
                                    <span>Threshold: Safe</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
                                <div className="flex justify-between items-baseline text-xs">
                                    <span className="font-medium text-zinc-200">Internal Storage Disk (User Partition)</span>
                                    <span className="font-mono text-zinc-400">
                                        {formatBytes(storageUsedBytes)} / {memory.totalStorageBytes ? formatBytes(memory.totalStorageBytes) : '—'} ({storagePercent ?? 0}%)
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                                    <div 
                                        className="h-full bg-zinc-400 transition-all duration-500 rounded-full"
                                        style={{ width: `${storagePercent ?? 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-0.5">
                                    <span>Free Space: {memory.availStorageBytes ? formatBytes(memory.availStorageBytes) : '—'}</span>
                                    <span>Partition: /data</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className={`space-y-5 ${
                    activeTab === 'overview' ? 'lg:col-span-5' :
                    (activeTab === 'system' || activeTab === 'display_net') ? 'col-span-12' : 'hidden sm:block lg:col-span-5'
                }`}>
                    <section className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-semibold text-zinc-100">Operating System & Integrity</h2>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">Android Release</span>
                                <span className="font-mono font-medium text-zinc-200">Version {os.versionRelease || '14'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">API Level (SDK)</span>
                                <span className="font-mono font-medium text-zinc-200">API {os.sdkInt || '34'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">Security Patch</span>
                                <span className="font-mono text-zinc-200">{os.securityPatch || 'Current'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">System Uptime</span>
                                <span className="font-mono text-zinc-200">{formatUptime(os.uptimeMillis)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-zinc-500">OS Build ID</span>
                                <div className="flex items-center gap-1.5 max-w-[55%]">
                                    <span className="font-mono text-zinc-300 truncate">{os.buildId || 'Standard'}</span>
                                    {os.buildId && (
                                        <button 
                                            onClick={() => handleCopy(os.buildId, 'buildId')}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                                            title="Copy Build ID"
                                        >
                                            {copiedKey === 'buildId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <Monitor className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-semibold text-zinc-100">Display & Panel Metrics</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-[11px] text-zinc-500 block mb-0.5">Physical Canvas</span>
                                <span className="font-mono text-zinc-200 font-medium">
                                    {display.widthPx || '1080'} × {display.heightPx || '2400'} px
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-[11px] text-zinc-500 block mb-0.5">Pixel Density</span>
                                <span className="font-mono text-zinc-200 font-medium">
                                    {display.densityDpi || '420'} DPI
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-[11px] text-zinc-500 block mb-0.5">Scale Factor</span>
                                <span className="font-mono text-zinc-200 font-medium">
                                    {display.scaledDensity ? `${display.scaledDensity}x` : '2.62x'}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-[11px] text-zinc-500 block mb-0.5">Refresh Frequency</span>
                                <span className="font-mono text-zinc-200 font-medium">
                                    {display.refreshRate ? `${Math.round(display.refreshRate)} Hz` : '60 Hz'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <Radio className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-semibold text-zinc-100">Telemetry Link & Radio</h2>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">Active Bearer</span>
                                <span className="font-mono font-medium text-zinc-200">{network.type || 'Cellular Radio'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                                <span className="text-zinc-500">Interface IPv4</span>
                                <span className="font-mono text-zinc-200">{network.ipAddress || 'Loopback / NAT'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-zinc-500">Wi-Fi Controller</span>
                                <span className="font-mono text-zinc-200">
                                    {network.wifiEnabled ? 'Active (Associated)' : 'Inactive / Cellular Only'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
