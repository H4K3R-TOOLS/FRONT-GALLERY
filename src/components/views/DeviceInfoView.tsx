"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Cpu, HardDrive, Battery, Wifi, Monitor, Shield, Clock, RefreshCw, 
    Smartphone, Zap, Server, Activity, Layers, Radio
} from 'lucide-react';

interface DeviceInfoViewProps {
    specs: any;
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function DeviceInfoView({ specs, device, onRefresh, isLoading }: DeviceInfoViewProps) {
    const [localLoading, setLocalLoading] = useState(false);
    const hasAutoSynced = useRef(false);

    const isFetching = isLoading || localLoading;
    const isOnline = Boolean(device?.online);

    useEffect(() => {
        if (isOnline && !hasAutoSynced.current) {
            hasAutoSynced.current = true;
            onRefresh();
        }
    }, [isOnline]);

    const handleRefresh = () => {
        if (!isOnline || isFetching) return;
        setLocalLoading(true);
        onRefresh();
        setTimeout(() => setLocalLoading(false), 2000);
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
    const ramText = ramTotal > 0 
        ? `${formatBytes(ramAvail)} Free / ${formatBytes(ramTotal)}`
        : 'N/A';

    const storageTotal = Number(memory.totalStorageBytes) || 0;
    const storageAvail = Number(memory.availStorageBytes) || 0;
    const storageText = storageTotal > 0 
        ? `${formatBytes(storageAvail)} Free / ${formatBytes(storageTotal)}`
        : 'N/A';

    const batteryLevel = typeof battery.percentage === 'number' && battery.percentage >= 0 
        ? `${battery.percentage}%` 
        : 'N/A';
    const batteryStateText = batteryLevel !== 'N/A'
        ? `${batteryLevel} • ${battery.isCharging ? 'Charging' : 'Discharging'}`
        : 'N/A';

    const modelName = `${hardware.brand || ''} ${hardware.model || ''}`.trim() || device?.name || 'Android Device';

    const detailedSpecs = [
        { id: 1, label: 'Processor (SoC)', value: hardware.soc || 'Qualcomm / MediaTek', icon: Cpu },
        { id: 2, label: 'CPU Cores', value: hardware.cpuCores ? `${hardware.cpuCores} Cores` : 'Octa-Core', icon: Zap },
        { id: 3, label: 'Architecture', value: hardware.architecture || 'arm64-v8a', icon: Cpu },
        { id: 4, label: 'Hardware Board', value: hardware.board || hardware.hardware || 'Standard Board', icon: Server },
        { id: 5, label: 'Android OS', value: os.release ? `Android ${os.release}` : 'Android', icon: Shield },
        { id: 6, label: 'API / SDK Level', value: os.sdkInt ? `API ${os.sdkInt}` : 'N/A', icon: Layers },
        { id: 7, label: 'Security Patch', value: os.securityPatch || 'N/A', icon: Shield },
        { id: 8, label: 'System Uptime', value: formatUptime(os.uptimeMillis), icon: Clock },
        { id: 9, label: 'Battery Temp', value: battery.temperatureC ? `${battery.temperatureC} °C` : 'N/A', icon: Activity },
        { id: 10, label: 'Cell Voltage', value: battery.voltageMv ? `${(battery.voltageMv / 1000).toFixed(2)} V` : 'N/A', icon: Zap },
        { id: 11, label: 'Display Resolution', value: display.widthPx && display.heightPx ? `${display.widthPx} × ${display.heightPx} px` : 'N/A', icon: Monitor },
        { id: 12, label: 'Screen Density', value: display.densityDpi ? `${display.densityDpi} DPI` : 'N/A', icon: Monitor },
        { id: 13, label: 'Refresh Rate', value: display.refreshRateHz ? `${Math.round(display.refreshRateHz)} Hz` : '60 Hz', icon: Activity },
        { id: 14, label: 'Network Link', value: network.type || 'Connected', icon: Wifi },
        { id: 15, label: 'IP Address', value: network.ipAddress || 'Auto / DHCP', icon: Radio }
    ];

    const hasSpecsData = Boolean(specs && Object.keys(specs).length > 0);

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            <div className="flex items-center justify-end">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="clay-capsule p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <Smartphone size={18} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Model Name</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{modelName}</span>
                    </div>
                </div>

                <div className="clay-capsule p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <Zap size={18} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Total & Available RAM</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{ramText}</span>
                    </div>
                </div>

                <div className="clay-capsule p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <HardDrive size={18} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Total & Free Storage</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{storageText}</span>
                    </div>
                </div>

                <div className="clay-capsule p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <Battery size={18} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Battery Level</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{batteryStateText}</span>
                    </div>
                </div>
            </div>

            <div className="min-h-[360px]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                        {detailedSpecs.map((item) => {
                            const IconComponent = item.icon;

                            return (
                                <div 
                                    key={item.id} 
                                    className="clay-capsule p-3.5 rounded-2xl flex items-center gap-3 transition-all hover:border-orange-500/40 hover:scale-[1.01] group"
                                >
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
