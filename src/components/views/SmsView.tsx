"use client";

import React, { useState, useMemo } from 'react';
import { MessageSquare, Search, RefreshCw, Download, Copy, Check, Clock, User } from 'lucide-react';

interface SmsViewProps {
    smsList: any[];
    fetchSms: () => void;
    isFetchingSms: boolean;
    downloadSmsAsCsv: () => void;
}

export default function SmsView({
    smsList,
    fetchSms,
    isFetchingSms,
    downloadSmsAsCsv
}: SmsViewProps) {
    const [smsSearchQuery, setSmsSearchQuery] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const filteredSms = useMemo(() => {
        if (!smsSearchQuery.trim()) return smsList;
        const q = smsSearchQuery.toLowerCase();
        return smsList.filter(
            item => (item.address && item.address.toLowerCase().includes(q)) ||
                    (item.body && item.body.toLowerCase().includes(q))
        );
    }, [smsList, smsSearchQuery]);

    const handleCopyText = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 1800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Standalone Search & Actions Top Bar (NO Bulky Header) ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search Capsule */}
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70" />
                    <input 
                        type="text" 
                        placeholder="Search SMS conversations & text..." 
                        value={smsSearchQuery}
                        onChange={(e) => setSmsSearchQuery(e.target.value)}
                        className="clay-capsule w-full pl-9 pr-20 py-2.5 rounded-2xl text-xs font-mono font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 transition-all shadow-inner"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-300">
                        {filteredSms.length}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                        type="button"
                        onClick={fetchSms} 
                        disabled={isFetchingSms} 
                        className={`clay-cta-button px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                            isFetchingSms ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                    >
                        <RefreshCw size={13} className={isFetchingSms ? "animate-spin" : ""} /> 
                        <span>{isFetchingSms ? 'Syncing...' : 'Sync SMS'}</span>
                    </button>
                    
                    {filteredSms.length > 0 && (
                        <button 
                            type="button"
                            onClick={downloadSmsAsCsv} 
                            className="clay-capsule px-3.5 py-2.5 rounded-xl text-white/70 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Export SMS conversation logs as CSV"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── SMS Message Feed Reel ── */}
            <div className="min-h-[400px]">
                {filteredSms.length === 0 ? (
                    <div className="clay-card py-20 flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[260px]">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <MessageSquare size={28} strokeWidth={1.5} className="text-orange-400/50" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white/60">No SMS Messages Found</h4>
                            <p className="text-xs text-white/30 font-mono mt-0.5">Click Sync SMS to fetch message logs from target endpoint.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSms.map((item: any, i: number) => {
                            const isCopied = copiedIndex === i;
                            const formattedDate = item.date 
                                ? new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                : 'Unknown Time';

                            return (
                                <div 
                                    key={item.id || i} 
                                    className="clay-capsule p-4 rounded-2xl flex flex-col gap-2.5 transition-all hover:border-orange-500/40 group"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400 font-mono text-xs font-black">
                                                <MessageSquare size={13} />
                                            </div>
                                            <span className="font-bold text-xs sm:text-sm text-orange-300 font-mono">
                                                {item.address || 'Unknown Address'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                                                <Clock size={10} />
                                                {formattedDate}
                                            </span>
                                            {item.body && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyText(item.body, i)}
                                                    className="clay-button-sm p-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                                                    title="Copy Message Text"
                                                >
                                                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Body Box */}
                                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white/85 leading-relaxed font-sans break-words whitespace-pre-wrap shadow-inner">
                                        {item.body || <span className="italic text-white/30">No text content</span>}
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
