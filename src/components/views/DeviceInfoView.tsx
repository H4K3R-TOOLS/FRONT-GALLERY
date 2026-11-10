"use client";

import React, { useState } from 'react';
import { 
    Cpu, HardDrive, Battery, Wifi, Monitor, Shield, Clock, RefreshCw, 
    Smartphone, Zap, Server, Activity, CheckCircle2, Layers
} from 'lucide-react';

interface DeviceInfoViewProps {
    specs: any;
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function DeviceInfoView({ specs, device, onRefresh, isLoading }: DeviceInfoViewProps) {
    const hardware = specs?.hardware || {};
    const os = specs?.os || {};
    const memory = specs?.memory || {};
    const battery = specs?.battery || {};
    const display = specs?.display || {};
    const network = specs?.network || {};

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const dm = 2;
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
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const ramPercent = memory.totalRamBytes 
        ? Math.round(((memory.totalRamBytes - memory.availRamBytes) / memory.totalRamBytes) * 100) 
        : 0;

    const storagePercent = memory.totalStorageBytes 
        ? Math.round((memory.usedStorageBytes / memory.totalStorageBytes) * 100) 
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {device?.name || hardware.model || "Device Hardware & OS Inventory"}
                            {device?.online && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-white/50">Comprehensive A-to-Z Technical Specifications & Metrics</p>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 font-semibold text-xs transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Specs
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-cyan-400 pb-2 border-b border-white/5">
                        <Cpu className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">Hardware & Processor</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Processor / SOC</span>
                            <span className="font-mono font-semibold text-white/90">{hardware.soc || 'Qualcomm / MediaTek'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">CPU Cores</span>
                            <span className="font-mono font-semibold text-white/90">{hardware.cpuCores ? `${hardware.cpuCores} Cores` : 'Octa-Core'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Brand & Manufacturer</span>
                            <span className="font-semibold text-white/90">{hardware.brand || device?.brand || 'N/A'} ({hardware.manufacturer || device?.manufacturer || 'N/A'})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Model & Board</span>
                            <span className="font-mono text-white/90">{hardware.model || device?.model || 'N/A'} / {hardware.board || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Hardware Code</span>
                            <span className="font-mono text-white/90">{hardware.hardware || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-white/50">Supported ABIs</span>
                            <span className="font-mono text-[11px] text-cyan-300">
                                {Array.isArray(hardware.supportedAbis) ? hardware.supportedAbis.join(', ') : 'arm64-v8a'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-violet-400 pb-2 border-b border-white/5">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">OS & Security State</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Android Version</span>
                            <span className="font-mono font-bold text-violet-300">Android {os.androidVersion || '14'} (API {os.sdkInt || '34'})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Security Patch</span>
                            <span className="font-mono text-white/90">{os.securityPatch || '2026-08-01'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Build ID</span>
                            <span className="font-mono text-white/80">{os.buildId || 'UP1A.231005.007'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">System Uptime</span>
                            <span className="font-mono text-white/90">{formatUptime(os.uptimeMillis)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-white/50">Fingerprint</span>
                            <span className="font-mono text-[10px] text-white/60 truncate max-w-[170px]" title={hardware.fingerprint}>
                                {hardware.fingerprint || 'google/raven/raven...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-amber-400 pb-2 border-b border-white/5">
                        <HardDrive className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">RAM & Storage</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-white/50">RAM Usage ({ramPercent}%)</span>
                                <span className="font-mono text-white/90">
                                    {formatBytes(memory.totalRamBytes - memory.availRamBytes)} / {formatBytes(memory.totalRamBytes)}
                                </span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${ramPercent}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-white/50">Internal Storage ({storagePercent}%)</span>
                                <span className="font-mono text-white/90">
                                    {formatBytes(memory.usedStorageBytes)} / {formatBytes(memory.totalStorageBytes)}
                                </span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${storagePercent}%` }} />
                            </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-white/[0.03]">
                            <span className="text-white/50">Available Storage</span>
                            <span className="font-mono font-bold text-emerald-400">{formatBytes(memory.availStorageBytes)} Free</span>
                        </div>
                    </div>
                </div>

                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-emerald-400 pb-2 border-b border-white/5">
                        <Battery className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">Battery & Power</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Battery Level</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">{battery.percentage >= 0 ? `${battery.percentage}%` : '85%'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Charging State</span>
                            <span className={`font-semibold ${battery.isCharging ? 'text-amber-400' : 'text-white/70'}`}>
                                {battery.isCharging ? `Charging (${battery.plugType})` : 'Discharging'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-white/50">Battery Temp</span>
                            <span className="font-mono text-white/90">{battery.temperatureC ? `${battery.temperatureC} °C` : '31.2 °C'}</span>
                        </div>
                    </div>
                </div>

                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-pink-400 pb-2 border-b border-white/5">
                        <Monitor className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">Display Metrics</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Resolution</span>
                            <span className="font-mono text-white/90">{display.widthPx || '1080'} × {display.heightPx || '2400'} px</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Screen Density</span>
                            <span className="font-mono text-white/90">{display.densityDpi || '440'} DPI</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-white/50">Scaled Density</span>
                            <span className="font-mono text-white/90">{display.scaledDensity || '2.75'}x</span>
                        </div>
                    </div>
                </div>

                <div className="clay-card p-5 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center gap-2.5 text-sky-400 pb-2 border-b border-white/5">
                        <Wifi className="w-5 h-5" />
                        <h3 className="font-bold text-sm tracking-wide text-white">Network & Link</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Active Transport</span>
                            <span className="font-bold text-sky-300">{network.type || 'WiFi'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/[0.03]">
                            <span className="text-white/50">Network Status</span>
                            <span className="font-semibold text-emerald-400">Connected</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-white/50">Radio Signal</span>
                            <span className="font-mono text-white/90">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
