"use client";

import React, { useState } from 'react';
import { X, Play, Video, Sparkles, Film } from 'lucide-react';

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
                    className="w-full group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg cursor-pointer"
                >
                    <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="clay-cta-button w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-xs font-bold text-white/90">{label}</p>
                    </div>
                </button>
            ) : variant === 'card' ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="clay-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[130px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span>Step-by-Step Guide</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide font-mono">Watch Tutorial</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono uppercase tracking-wider">3 MIN GUIDE</span>
                            </div>
                        </div>
                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 border-rose-500/30 group-hover:scale-110 transition-transform shrink-0">
                            <Play className="w-4 h-4 text-rose-400 fill-rose-400 ml-0.5" />
                        </div>
                    </div>
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-rose-300 transition-colors">
                        <span>Learn endpoint setup & control</span>
                        <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-rose-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="clay-capsule w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:border-orange-500/40 transition-colors text-left cursor-pointer group"
                >
                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 border-rose-500/30 group-hover:scale-105 transition-transform shrink-0">
                        <Play className="w-4 h-4 text-rose-400 fill-rose-400 ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">How to Use</div>
                        <div className="text-[10px] text-white/40 font-mono">Watch video tutorial</div>
                    </div>
                </button>
            )}

            {/* ── Redesigned 3D Claymorphic Tutorial Modal ── */}
            {isOpen && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto"
                >
                    <div className="clay-card max-w-4xl w-full flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden border border-white/10 rounded-[2rem] sm:rounded-[2.5rem]">
                        
                        {/* Top Bar with Title & Close Action */}
                        <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="clay-pill px-3 py-1 bg-rose-500/15 border border-rose-500/30 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                                    <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-rose-200">
                                        Step-by-Step Video Guide
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="clay-button-sm w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Close Video"
                            >
                                <X size={16} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        {/* Video Frame */}
                        <div className="p-3 sm:p-5 bg-black/60">
                            <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                    title="Tutorial Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>

                        {/* Footer Subtext */}
                        <div className="px-5 sm:px-7 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] font-mono text-white/40">
                            <span className="flex items-center gap-1.5 text-rose-300">
                                <Film size={13} />
                                <span>Spynox Setup Walkthrough</span>
                            </span>
                            <span>High-Definition • 1080p</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoModal;
