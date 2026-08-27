"use client";

import React, { useState, useMemo } from 'react';
import { Users, Search, RefreshCw, Download } from 'lucide-react';

interface ContactsViewProps {
    contactsList: any[];
    fetchContacts: () => void;
    isFetchingContacts: boolean;
    downloadContactsAsVcf: () => void;
}

export default function ContactsView({
    contactsList,
    fetchContacts,
    isFetchingContacts,
    downloadContactsAsVcf
}: ContactsViewProps) {
    const [contactsSearchQuery, setContactsSearchQuery] = useState('');

    const filteredContacts = useMemo(() => {
        if (!contactsSearchQuery.trim()) return contactsList;
        const q = contactsSearchQuery.toLowerCase();
        return contactsList.filter(
            item => (item.name && item.name.toLowerCase().includes(q)) ||
                    (item.phones && item.phones.some((p: any) => (p.number || p).toString().includes(q)))
        );
    }, [contactsList, contactsSearchQuery]);

    return (
        <div className="space-y-5 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Streamlined Floating Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex-shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
                        <Users size={18} className="text-emerald-400" />
                    </div>
                    <div className="relative flex-1 sm:w-64">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input 
                            type="text" 
                            placeholder="Search contacts by name..." 
                            value={contactsSearchQuery}
                            onChange={(e) => setContactsSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500/50 w-full transition-all text-white placeholder:text-white/30"
                        />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">
                        {filteredContacts.length} Contacts
                    </span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchContacts} 
                        disabled={isFetchingContacts} 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isFetchingContacts ? "animate-spin" : ""} /> Sync Contacts
                    </button>
                    <button 
                        onClick={downloadContactsAsVcf} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        <Download size={14} /> Export vCard
                    </button>
                </div>
            </div>
            
            {/* Streamlined Contacts Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {filteredContacts.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-white/30 font-medium gap-4">
                        <Users size={44} strokeWidth={1} className="text-white/20" />
                        <p className="text-sm">No contacts found. Click Sync Contacts to fetch.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {filteredContacts.map((item: any, i: number) => {
                            const phone = item.phones?.[0]?.number || item.phones?.[0] || 'No number';
                            return (
                                <div key={item.id || i} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 border border-white/10 hover:border-emerald-500/30 flex items-center justify-between gap-3 group hover:shadow-[0_4px_25px_rgba(16,185,129,0.1)]">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 flex items-center justify-center text-emerald-400 font-bold text-base border border-emerald-500/20 shadow-inner flex-shrink-0">
                                            {item.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-sm text-white/90 truncate group-hover:text-emerald-400 transition-colors">{item.name}</h4>
                                            <span className="text-[11px] text-white/50 font-mono tracking-wide mt-0.5 truncate">{phone}</span>
                                        </div>
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
