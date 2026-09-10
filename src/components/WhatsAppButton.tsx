"use client";

import React, { useState } from 'react';
import { Users, MessageSquare, X } from 'lucide-react';
import VideoModal from './VideoModal';

export default function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);

    const phoneNumber = "923460257488";
    const message = "Hello, I need help with GalleryEye.";
    const directUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    const groupUrl = "https://chat.whatsapp.com/Gqo2wNiAlbi8UwKLrkgOOa?s=cl&p=a&mlu=4&ilr=4";

    return (
        <>
            {/* WhatsApp Floating Action Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#128C7E] to-[#25D366] rounded-2xl sm:rounded-3xl shadow-[0_10px_35px_rgba(37,211,102,0.45)] border-2 border-emerald-300/40 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
                title="WhatsApp Support & Community"
                aria-label="WhatsApp Support & Community"
            >
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-emerald-400/20 animate-ping pointer-events-none opacity-40 group-hover:opacity-75" />
                <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 relative z-10"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>

            {/* Options Modal */}
            {isOpen && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
                >
                    <div 
                        className="bg-[#0f1115] border border-white/15 w-full max-w-sm rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.98)] overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 border-emerald-500/40 shrink-0">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-tight">Need Assistance?</h3>
                                    <p className="text-[10px] text-white/40 font-mono">Connect directly with our team</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Options List */}
                        <div className="p-3.5 sm:p-4 space-y-2.5">
                            {/* 1. Join Group Option */}
                            <a
                                href={groupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="clay-capsule w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:border-emerald-500/40 transition-colors text-left cursor-pointer group"
                            >
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                                        Join Community Group
                                    </div>
                                    <div className="text-[10px] text-white/40 font-mono truncate">
                                        Get updates & chat with community
                                    </div>
                                </div>
                            </a>

                            {/* 2. Tutorial Video Option */}
                            <VideoModal videoId="yk9hTwzmV2A" variant="button" />

                            {/* 3. Direct Contact Option */}
                            <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="clay-capsule w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:border-cyan-500/40 transition-colors text-left cursor-pointer group"
                            >
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                        Direct Support
                                    </div>
                                    <div className="text-[10px] text-white/40 font-mono truncate">
                                        Chat 1-on-1 with support team
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

