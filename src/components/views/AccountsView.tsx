"use client";

import React, { useState, useMemo } from 'react';
import { 
    Mail, Phone, User, Copy, Check, RefreshCw, Smartphone, 
    ShieldCheck, Hash, AtSign, Radio, Search
} from 'lucide-react';

interface AccountsViewProps {
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

export default function AccountsView({ device, onRefresh, isLoading }: AccountsViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    const isFetching = isLoading || localLoading;
    const isOnline = Boolean(device?.online);

    const handleRefresh = () => {
        if (!isOnline || isFetching) return;
        setLocalLoading(true);
        onRefresh();
        setTimeout(() => setLocalLoading(false), 2000);
    };

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

    const gmails: string[] = device?.gmails && Array.isArray(device.gmails) && device.gmails.length > 0
        ? device.gmails
        : (device?.gmail ? [device.gmail] : []);

    const phoneNumbers: string[] = device?.phoneNumbers && Array.isArray(device.phoneNumbers) && device.phoneNumbers.length > 0
        ? device.phoneNumbers
        : (device?.phoneNumber ? [device.phoneNumber] : []);

    const carrier = device?.carrier || '';
    const ownerName = device?.ownerName || device?.name || 'Device Owner';

    const accountItems = useMemo(() => {
        const list: { id: string; type: 'email' | 'phone'; title: string; subtitle: string; icon: any }[] = [];
        gmails.forEach((g, idx) => {
            list.push({
                id: `email_${idx}`,
                type: 'email',
                title: g,
                subtitle: idx === 0 ? 'Primary Google Account' : 'Google Sync Account',
                icon: AtSign
            });
        });
        phoneNumbers.forEach((p, idx) => {
            list.push({
                id: `phone_${idx}`,
                type: 'phone',
                title: p,
                subtitle: carrier ? `SIM Line • ${carrier}` : 'Verified Mobile Identity',
                icon: Phone
            });
        });
        return list;
    }, [gmails, phoneNumbers, carrier]);

    const filteredAccounts = useMemo(() => {
        if (!searchQuery.trim()) return accountItems;
        const q = searchQuery.toLowerCase();
        return accountItems.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.subtitle.toLowerCase().includes(q)
        );
    }, [accountItems, searchQuery]);

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70" />
                    <input 
                        type="text" 
                        placeholder="Search accounts & phone numbers..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="clay-capsule w-full pl-9 pr-24 py-2.5 rounded-2xl text-xs font-mono font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 transition-all shadow-inner"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-300">
                        {filteredAccounts.length}
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
                        <span>{isFetching ? 'Syncing...' : 'Sync Accounts'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <User size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Owner</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{ownerName}</span>
                    </div>
                </div>

                <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <Radio size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Network</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{carrier || (isOnline ? 'Connected' : 'Offline')}</span>
                    </div>
                </div>

                <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <AtSign size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Google</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{gmails.length} Synced</span>
                    </div>
                </div>

                <div className="clay-capsule p-3 rounded-2xl flex items-center gap-3">
                    <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                        <Phone size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">Mobile</span>
                        <span className="text-xs font-bold text-white font-mono truncate block">{phoneNumbers.length} Detected</span>
                    </div>
                </div>
            </div>

            <div className="min-h-[400px]">
                {filteredAccounts.length === 0 ? (
                    <div className="clay-card py-20 flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[260px]">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Mail size={28} strokeWidth={1.5} className="text-orange-400/50" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white/60">No Accounts Found</h4>
                            <p className="text-xs text-white/30 font-mono mt-0.5">Click Sync Accounts to fetch Google accounts and SIM numbers from target endpoint.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                        {filteredAccounts.map((item) => {
                            const IconComponent = item.icon;
                            const isCopied = copiedKey === item.id;

                            return (
                                <div 
                                    key={item.id} 
                                    className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:border-orange-500/40 hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 font-mono font-black text-sm shrink-0 group-hover:scale-105 transition-transform">
                                            {item.type === 'email' ? (
                                                item.title.charAt(0).toUpperCase()
                                            ) : (
                                                <Phone size={16} />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm text-white truncate font-mono group-hover:text-orange-300 transition-colors">
                                                {item.title}
                                            </h4>
                                            <span className="text-[10px] text-white/40 font-mono tracking-wide truncate mt-0.5">
                                                {item.subtitle}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(item.title, item.id)}
                                        className="clay-button-sm p-2 rounded-xl text-white/60 hover:text-white shrink-0 transition-colors cursor-pointer"
                                        title={`Copy ${item.type === 'email' ? 'Email' : 'Number'}`}
                                    >
                                        {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
