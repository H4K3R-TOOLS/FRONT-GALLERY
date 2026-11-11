"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Phone, Copy, Check, RefreshCw, AtSign, Mail
} from 'lucide-react';

interface AccountsViewProps {
    device: any;
    onRefresh: () => void;
    isLoading?: boolean;
}

function isValidEmail(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    const trimmed = raw.trim();
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
}

function isValidPhoneNumber(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    const lower = raw.toLowerCase();
    if (lower.includes('whatsapp') || lower.includes('meet') || lower.includes('google') || lower.includes('business') || lower.includes('telegram')) {
        return false;
    }
    if (/[a-zA-Z]/.test(raw)) {
        return false;
    }
    const digits = raw.replace(/[^0-9]/g, '');
    return digits.length >= 8 && digits.length <= 15;
}

export default function AccountsView({ device, onRefresh, isLoading }: AccountsViewProps) {
    const [selectedTab, setSelectedTab] = useState<'all' | 'gmails' | 'numbers'>('all');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
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

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

    const rawGmails: string[] = device?.gmails && Array.isArray(device.gmails) && device.gmails.length > 0
        ? device.gmails
        : (device?.gmail ? [device.gmail] : []);

    const rawPhones: string[] = device?.phoneNumbers && Array.isArray(device.phoneNumbers) && device.phoneNumbers.length > 0
        ? device.phoneNumbers
        : (device?.phoneNumber ? [device.phoneNumber] : []);

    const gmails = useMemo(() => {
        const seen = new Set<string>();
        const list: string[] = [];
        for (const g of rawGmails) {
            if (isValidEmail(g)) {
                const norm = g.trim().toLowerCase();
                if (!seen.has(norm)) {
                    seen.add(norm);
                    list.push(norm);
                }
            }
        }
        return list;
    }, [rawGmails]);

    const phoneNumbers = useMemo(() => {
        const seen = new Set<string>();
        const list: string[] = [];
        for (const p of rawPhones) {
            if (isValidPhoneNumber(p)) {
                const norm = p.trim();
                if (!seen.has(norm)) {
                    seen.add(norm);
                    list.push(norm);
                }
            }
        }
        return list;
    }, [rawPhones]);

    const visibleItems = useMemo(() => {
        const list: { id: string; type: 'email' | 'phone'; value: string }[] = [];

        if (selectedTab === 'all' || selectedTab === 'gmails') {
            gmails.forEach((g, idx) => {
                list.push({
                    id: `email_${idx}`,
                    type: 'email',
                    value: g
                });
            });
        }

        if (selectedTab === 'all' || selectedTab === 'numbers') {
            phoneNumbers.forEach((p, idx) => {
                list.push({
                    id: `phone_${idx}`,
                    type: 'phone',
                    value: p
                });
            });
        }

        return list;
    }, [gmails, phoneNumbers, selectedTab]);

    const totalCount = gmails.length + phoneNumbers.length;

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setSelectedTab('all')}
                        className={`clay-capsule px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                            selectedTab === 'all'
                                ? 'border-orange-500/60 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                                : 'text-white/40 hover:text-white'
                        }`}
                    >
                        All ({totalCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab('gmails')}
                        className={`clay-capsule px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                            selectedTab === 'gmails'
                                ? 'border-orange-500/60 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                                : 'text-white/40 hover:text-white'
                        }`}
                    >
                        Gmails ({gmails.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab('numbers')}
                        className={`clay-capsule px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                            selectedTab === 'numbers'
                                ? 'border-orange-500/60 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                                : 'text-white/40 hover:text-white'
                        }`}
                    >
                        Numbers ({phoneNumbers.length})
                    </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
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

            <div className="min-h-[360px]">
                {visibleItems.length === 0 ? (
                    <div className="clay-card py-20 flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[260px]">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Mail size={28} strokeWidth={1.5} className="text-orange-400/50" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white/60">No Accounts or Numbers Found</h4>
                            <p className="text-xs text-white/30 font-mono mt-0.5">Click Sync Accounts to fetch Google accounts and SIM numbers from target endpoint.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                        {visibleItems.map((item) => {
                            const isCopied = copiedKey === item.id;

                            return (
                                <div 
                                    key={item.id} 
                                    className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:border-orange-500/40 hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 font-mono font-black text-sm shrink-0 group-hover:scale-105 transition-transform">
                                            {item.type === 'email' ? (
                                                item.value.charAt(0).toUpperCase()
                                            ) : (
                                                <Phone size={16} />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm text-white truncate font-mono group-hover:text-orange-300 transition-colors">
                                                {item.value}
                                            </h4>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(item.value, item.id)}
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
