"use client";

import React, { useState, useMemo } from 'react';
import { Users, Search, RefreshCw, Download, Phone, Copy, Check, User } from 'lucide-react';

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
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const filteredContacts = useMemo(() => {
        if (!contactsSearchQuery.trim()) return contactsList;
        const q = contactsSearchQuery.toLowerCase();
        return contactsList.filter(
            item => (item.name && item.name.toLowerCase().includes(q)) ||
                    (item.phones && item.phones.some((p: any) => (p.number || p).toString().includes(q)))
        );
    }, [contactsList, contactsSearchQuery]);

    const handleCopyPhone = (phone: string, idx: number) => {
        navigator.clipboard.writeText(phone);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 1800);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Standalone Search & Actions Top Bar (NO Bulky Header) ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search Capsule */}
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70" />
                    <input 
                        type="text" 
                        placeholder="Search contacts by name or number..." 
                        value={contactsSearchQuery}
                        onChange={(e) => setContactsSearchQuery(e.target.value)}
                        className="clay-capsule w-full pl-9 pr-24 py-2.5 rounded-2xl text-xs font-mono font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 transition-all shadow-inner"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-300">
                        {filteredContacts.length}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                        type="button"
                        onClick={fetchContacts} 
                        disabled={isFetchingContacts} 
                        className={`clay-cta-button px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                            isFetchingContacts ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                    >
                        <RefreshCw size={13} className={isFetchingContacts ? "animate-spin" : ""} /> 
                        <span>{isFetchingContacts ? 'Syncing...' : 'Sync Contacts'}</span>
                    </button>
                    
                    {filteredContacts.length > 0 && (
                        <button 
                            type="button"
                            onClick={downloadContactsAsVcf} 
                            className="clay-capsule px-3.5 py-2.5 rounded-xl text-white/70 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Export all contacts as vCard (.vcf)"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">Export vCard</span>
                        </button>
                    )}
                </div>
            </div>
            
            {/* ── Contacts Cards Grid ── */}
            <div className="min-h-[400px]">
                {filteredContacts.length === 0 ? (
                    <div className="clay-card py-20 flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[260px]">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Users size={28} strokeWidth={1.5} className="text-orange-400/50" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white/60">No Contacts Found</h4>
                            <p className="text-xs text-white/30 font-mono mt-0.5">Click Sync Contacts to extract phonebook entries from target endpoint.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                        {filteredContacts.map((item: any, i: number) => {
                            const phone = item.phones?.[0]?.number || item.phones?.[0] || 'No number';
                            const isCopied = copiedIndex === i;

                            return (
                                <div 
                                    key={item.id || i} 
                                    className="clay-capsule p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all hover:border-orange-500/40 hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 font-mono font-black text-sm shrink-0 group-hover:scale-105 transition-transform">
                                            {item.name?.charAt(0).toUpperCase() || <User size={16} />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-orange-300 transition-colors">
                                                {item.name || 'Unnamed Contact'}
                                            </h4>
                                            <span className="text-[10px] text-white/40 font-mono tracking-wide truncate mt-0.5">
                                                {phone}
                                            </span>
                                        </div>
                                    </div>

                                    {phone !== 'No number' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopyPhone(phone, i)}
                                            className="clay-button-sm p-2 rounded-xl text-white/60 hover:text-white shrink-0 transition-colors cursor-pointer"
                                            title="Copy Phone Number"
                                        >
                                            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
