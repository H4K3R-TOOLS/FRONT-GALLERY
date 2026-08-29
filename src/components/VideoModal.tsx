"use client";

import React, { useState } from 'react';

interface VideoModalProps {
    videoId: string;
    label?: string;
    variant?: 'thumbnail' | 'button' | 'card'; // thumbnail for login, button for menu, card for dashboard
}

const VideoModal = ({ videoId, label = "Watch Tutorial", variant = 'thumbnail' }: VideoModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {variant === 'thumbnail' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg"
                >
                    <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs font-semibold text-white/90">{label}</p>
                    </div>
                </button>
            ) : variant === 'card' ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="clay-card p-5 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[140px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span>Step-by-Step Guide</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-base font-extrabold text-white tracking-wide font-mono">Watch Tutorial</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono uppercase tracking-wider">3 MIN GUIDE</span>
                            </div>
                        </div>
                        <div className="clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center text-rose-400 border-rose-500/30 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-rose-500 fill-rose-500 ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-rose-300 transition-colors">
                        <span>Learn endpoint setup & control</span>
                        <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-rose-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-semibold">How to use</div>
                        <div className="text-xs text-white/50">Watch video tutorial</div>
                    </div>
                </button>
            )}

            {isOpen && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl animate-fadeIn p-4 sm:p-6"
                >
                    {/* Top Floating Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="fixed top-6 right-6 z-[10000] px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer active:scale-95 border border-red-400/40"
                    >
                        <span>✕ Close Video</span>
                    </button>

                    <div className="w-full max-w-4xl flex flex-col gap-3 z-[10000]">
                        {/* Header Bar right above video */}
                        <div className="flex items-center justify-between px-2 text-white">
                            <span className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <span>Gallery Eye Step-by-Step Tutorial</span>
                            </span>
                        </div>

                        {/* Video Container */}
                        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-scaleIn bg-black relative">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="Tutorial Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoModal;
