"use client";

import React, { useState, useMemo } from 'react';
import { MessageSquare, Search, RefreshCw, Download } from 'lucide-react';

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

    const filteredSms = useMemo(() => {
        if (!smsSearchQuery.trim()) return smsList;
        const q = smsSearchQuery.toLowerCase();
        return smsList.filter(
            item => (item.address && item.address.toLowerCase().includes(q)) ||
                    (item.body && item.body.toLowerCase().includes(q))
        );
    }, [smsList, smsSearchQuery]);

    return (
        <div className="space-y-5 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Streamlined Floating Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex-shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] flex-shrink-0">
                        <MessageSquare size={18} className="text-sky-400" />
                    </div>
                    <div className="relative flex-1 sm:w-64">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input 
                            type="text" 
                            placeholder="Search SMS conversations..." 
                            value={smsSearchQuery}
                            onChange={(e) => setSmsSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500/50 w-full transition-all text-white placeholder:text-white/30"
                        />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] font-bold text-sky-400 uppercase tracking-wider flex-shrink-0">
                        {filteredSms.length} SMS
                    </span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchSms} 
                        disabled={isFetchingSms} 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isFetchingSms ? "animate-spin" : ""} /> Sync SMS
                    </button>
                    <button 
                        onClick={downloadSmsAsCsv} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Streamlined Message Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {filteredSms.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-white/30 font-medium gap-4">
                        <MessageSquare size={44} strokeWidth={1} className="text-white/20" />
                        <p className="text-sm">No SMS messages found. Click Sync SMS to fetch.</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredSms.map((item: any, i: number) => (
                            <div key={item.id || i} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 border border-white/10 flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-bold text-sm text-sky-400 font-mono">{item.address || 'Unknown Sender'}</span>
                                        <span className="text-[11px] text-white/40 font-mono">{new Date(item.date).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed break-words">{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
