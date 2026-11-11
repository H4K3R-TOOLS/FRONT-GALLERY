"use client";

import React, { useState, useMemo } from 'react';
import { 
    Cpu, HardDrive, Battery, Wifi, Monitor, Shield, Clock, RefreshCw, 
    Smartphone, Zap, Server, Activity, Layers, Search, Copy, Check, Radio
} from 'lucide-react';

interface DeviceInfoViewProps {
    specs: any;
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function DeviceInfoView({ specs, device, onRefresh, isLoading }: DeviceInfoViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    const isFetching = isLoading || localLoading;
    const isOnline = Boolean(device?.online);

    const handleRefresh = () => {
        if (!isOnline || isFetching) return;
        setLocalLoading(true);
        onRefresh();
        setTimeout(() => setLocalLoading(false), 2000);
    };

    const handleCopy = (text: string, idx: number) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 1800);
    };

    const hardware = specs?.hardware || {};
    const os = specs?.os || {};
    const memory = specs?.memory || {};
    const battery = specs?.battery || {};
    const display = specs?.display || {};
    const network = specs?.network || {};

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
    const ramPercent = ramTotal > 0 ? Math.round((ramUsed / ramTotal) * 100) : 0;

    const storageTotal = Number(memory.totalStorageBytes) || 0;
    const storageAvail = Number(memory.availStorageBytes) || 0;
    const storageUsed = Number(memory.usedStorageBytes) || (storageTotal > storageAvail ? storageTotal - storageAvail : 0);
    const storagePercent = storageTotal > 0 ? Math.round((storageUsed / storageTotal) * 100) : 0;

    const batteryLevel = typeof battery.percentage === 'number' && battery.percentage >= 0 ? `${battery.percentage}%` : 'N/A';

    const specItems = useMemo(() => {
        return [
            { id: 1, label: 'Processor (SoC)', value: hardware.soc || 'Qualcomm / MediaTek', icon: Cpu, category: 'Hardware' },
            { id: 2, label: 'CPU Cores', value: hardware.cpuCores ? `${hardware.cpuCores} Cores` : 'Octa-Core', icon: Zap, category: 'Hardware' },
            { id: 3, label: 'Architecture', value: hardware.architecture || 'arm64-v8a', icon: Cpu, category: 'Hardware' },
            { id: 4, label: 'Hardware Board', value: hardware.board || hardware.hardware || 'Standard Board', icon: Server, category: 'Hardware' },
            { id: 5, label: 'Model & Brand', value: `${hardware.brand || ''} ${hardware.model || ''}`.trim() || 'Android Device', icon: Smartphone, category: 'Hardware' },
            { id: 6, label: 'Android OS', value: os.release ? `Android ${os.release}` : 'Android', icon: Shield, category: 'Software' },
            { id: 7, label: 'API / SDK Level', value: os.sdkInt ? `API ${os.sdkInt}` : 'N/A', icon: Layers, category: 'Software' },
            { id: 8, label: 'Security Patch', value: os.securityPatch || 'N/A', icon: Shield, category: 'Software' },
            { id: 9, label: 'System Uptime', value: formatUptime(os.uptimeMillis), icon: Clock, category: 'System' },
            { id: 10, label: 'Total RAM', value: formatBytes(ramTotal), icon: Zap, category: 'Memory' },
            { id: 11, label: 'Available RAM', value: ramAvail > 0 ? `${formatBytes(ramAvail)} Free` : 'N/A', icon: Zap, category: 'Memory' },
            { id: 12, label: 'Total Storage', value: formatBytes(storageTotal), icon: HardDrive, category: 'Storage' },
            { id: 13, label: 'Free Storage', value: storageAvail > 0 ? `${formatBytes(storageAvail)} Free` : 'N/A', icon: HardDrive, category: 'Storage' },
            { id: 14, label: 'Battery Level', value: batteryLevel, icon: Battery, category: 'Battery' },
            { id: 15, label: 'Charging State', value: battery.isCharging ? `Charging (${battery.plugType || 'AC'})` : 'Discharging', icon: Battery, category: 'Battery' },
            { id: 16, label: 'Battery Temp', value: battery.temperatureC ? `${battery.temperatureC} °C` : 'N/A', icon: Activity, category: 'Battery' },
            { id: 17, label: 'Cell Voltage', value: battery.voltageMv ? `${(battery.voltageMv / 1000).toFixed(2)} V` : 'N/A', icon: Zap, category: 'Battery' },
            { id: 18, label: 'Display Resolution', value: display.widthPx && display.heightPx ? `${display.widthPx} × ${display.heightPx} px` : 'N/A', icon: Monitor, category: 'Display' },
            { id: 19, label: 'Screen Density', value: display.densityDpi ? `${display.densityDpi} DPI` : 'N/A', icon: Monitor, category: 'Display' },
            { id: 20, label: 'Refresh Rate', value: display.refreshRateHz ? `${Math.round(display.refreshRateHz)} Hz` : '60 Hz', icon: Activity, category: 'Display' },
            { id: 21, label: 'Network Link', value: network.type || 'Connected', icon: Wifi, category: 'Network' },
            { id: 22, label: 'IP Address', value: network.ipAddress || 'Auto / DHCP', icon: Radio, category: 'Network' }
        ];
    }, [hardware, os, memory, battery, display, network, ramTotal, ramAvail, storageTotal, storageAvail, batteryLevel]);

    const filteredSpecs = useMemo(() => {
        if (!searchQuery.trim()) return specItems;
        const q = searchQuery.toLowerCase();
        return specItems.filter(item => 
            item.label.toLowerCase().includes(q) || 
            String(item.value).toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );
    }, [specItems, searchQuery]);

    const hasSpecsData = Boolean(specs && Object.keys(specs).length > 0);

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70" />
                    <input 
                        type="text" 
                        placeholder="Search device specifications..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="clay-capsule w-full pl-9 pr-24 py-2.5 rounded-2xl text-xs font-mono font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 transition-all shadow-inner"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-300">
                        {filteredSpecs.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className={`clay-pill px-3 py-1.5 flex items-center gap-1.5 ${
                        isOnline 
                            ? 'clay-pill-emerald text-emerald-200' 
                            : 'bg-white/[0.04] border border-white/5 text-white/40'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
                        }`} />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>

                    <button 
                        type="button"
                        onClick={handleRefresh} 
                        disabled={!isOnline || isFetching} 
                        className={`clay-cta-button px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                            !isOnline || isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                    >
                        <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> 
                        <span>{isFetching ? 'Syncing...' : 'Sync Specs'}</span>
                    </button>
                </div>
            </div>

            {hasSpecsData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                        <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                            <Battery size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-white/40 font-mono uppercase block">Battery</span>
                            <span className="text-xs font-bold text-white font-mono truncate block">{batteryLevel}</span>
                        </div>
                    </div>

                    <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                        <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                            <Zap size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-white/40 font-mono uppercase block">RAM</span>
                            <span className="text-xs font-bold text-white font-mono truncate block">{ramPercent > 0 ? `${ramPercent}% Used` : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                        <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                            <HardDrive size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-white/40 font-mono uppercase block">Storage</span>
                            <span className="text-xs font-bold text-white font-mono truncate block">{storagePercent > 0 ? `${storagePercent}% Used` : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                        <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                            <Shield size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-white/40 font-mono uppercase block">Platform</span>
                            <span className="text-xs font-bold text-white font-mono truncate block">{os.release ? `Android ${os.release}` : 'Android'}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-[400px]">
                {!hasSpecsData ? (
                    <div className="clay-card py-20 flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[260px]">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Cpu size={28} strokeWidth={1.5} className="text-orange-400/50" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white/60">No Hardware Specs Found</h4>
                            <p className="text-xs text-white/30 font-mono mt-0.5">Click Sync Specs to retrieve hardware registers from target endpoint.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                        {filteredSpecs.map((item) => {
                            const IconComponent = item.icon;
                            const isCopied = copiedIndex === item.id;

                            return (
                                <div 
                                    key={item.id} 
                                    className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:border-orange-500/40 hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                                            <IconComponent size={16} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] text-white/40 font-mono tracking-wide truncate">
                                                {item.label}
                                            </span>
                                            <h4 className="font-bold text-xs sm:text-sm text-white truncate font-mono mt-0.5 group-hover:text-orange-300 transition-colors">
                                                {item.value}
                                            </h4>
                                        </div>
                                    </div>

                                    {item.value !== 'N/A' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(item.value, item.id)}
                                            className="clay-button-sm p-2 rounded-xl text-white/60 hover:text-white shrink-0 transition-colors cursor-pointer"
                                            title="Copy Specification Value"
                                        >
                                            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
