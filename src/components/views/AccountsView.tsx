"use client";

import React, { useState } from 'react';
import { 
    Mail, Phone, User, Copy, Check, RefreshCw, Smartphone, 
    ShieldCheck, Hash, AtSign, SimCard
} from 'lucide-react';

interface AccountsViewProps {
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function AccountsView({ device, onRefresh, isLoading }: AccountsViewProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const gmails = device?.gmails && Array.isArray(device.gmails) && device.gmails.length > 0
        ? device.gmails
        : (device?.gmail ? [device.gmail] : []);

    const phoneNumbers = device?.phoneNumbers && Array.isArray(device.phoneNumbers) && device.phoneNumbers.length > 0
        ? device.phoneNumbers
        : (device?.phoneNumber ? [device.phoneNumber] : []);

    const ownerName = device?.ownerName || device?.name || 'Device Owner';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Gmail & Phone Number Intelligence
                            {device?.online && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-white/50">Authenticated Google Accounts, Device Owner & SIM Line Numbers</p>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 font-semibold text-xs transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Accounts
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="clay-card p-6 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5 text-rose-400">
                            <AtSign className="w-5 h-5" />
                            <h3 className="font-bold text-sm tracking-wide text-white">Google Accounts (Gmail)</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {gmails.length} Detected
                        </span>
                    </div>

                    <div className="space-y-3">
                        {gmails.length > 0 ? (
                            gmails.map((email: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                    <div className="flex items-center gap-3 truncate mr-2">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                                            {email[0]?.toUpperCase() || 'G'}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-mono text-sm font-semibold text-white truncate">{email}</p>
                                            <p className="text-[10px] text-white/40">Primary Sync Account</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(email, `email_${idx}`)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                        title="Copy Email"
                                    >
                                        {copiedKey === `email_${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-white/40 text-xs">
                                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No Google account returned yet. Click Refresh Accounts.
                            </div>
                        )}
                    </div>
                </div>

                <div className="clay-card p-6 space-y-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5 text-emerald-400">
                            <Phone className="w-5 h-5" />
                            <h3 className="font-bold text-sm tracking-wide text-white">SIM & Mobile Numbers</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {phoneNumbers.length} Detected
                        </span>
                    </div>

                    <div className="space-y-3">
                        {phoneNumbers.length > 0 ? (
                            phoneNumbers.map((num: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                    <div className="flex items-center gap-3 truncate mr-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                            #{idx + 1}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-mono text-sm font-bold text-emerald-300 truncate">{num}</p>
                                            <p className="text-[10px] text-white/40">SIM Line Number</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(num, `phone_${idx}`)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                        title="Copy Number"
                                    >
                                        {copiedKey === `phone_${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-white/40 text-xs">
                                <Phone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No SIM phone number returned yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="clay-card p-5 border border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="flex items-center gap-2.5 text-indigo-400 pb-2 border-b border-white/5 mb-3">
                    <User className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wide text-white">Device Owner Profile</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div>
                        <p className="text-xs text-white/50 mb-0.5">Profile Display Name</p>
                        <p className="text-base font-bold text-white">{ownerName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verified Account Profile</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
