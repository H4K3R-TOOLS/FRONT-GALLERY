"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Video } from 'lucide-react';

interface VideoThumbnailProps {
    src: string;
    className?: string;
    alt?: string;
}

// Global memory cache for video thumbnail Data URLs to avoid re-generating
const thumbnailCache = new Map<string, string>();

export default function VideoThumbnail({ src, className = "w-full h-full object-cover", alt = "Video thumbnail" }: VideoThumbnailProps) {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) return;

        // 1. Check in-memory map cache
        if (thumbnailCache.has(src)) {
            setThumbUrl(thumbnailCache.get(src)!);
            return;
        }

        // 2. Check localStorage cache
        const cacheKey = `v_thumb_${encodeURIComponent(src.substring(src.lastIndexOf('/') + 1))}`;
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                thumbnailCache.set(src, cached);
                setThumbUrl(cached);
                return;
            }
        } catch { /* storage full */ }

        // 3. Generate thumbnail off-screen using Canvas + Media Fragment '#t=0.5'
        let isMounted = true;
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        // Use media fragment #t=0.5 for instant single-frame load
        const videoSrcWithFragment = src.includes('#') ? src : `${src}#t=0.5`;
        video.src = videoSrcWithFragment;

        const handleLoadedData = () => {
            if (!isMounted) return;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 320;
                canvas.height = video.videoHeight || 180;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    thumbnailCache.set(src, dataUrl);
                    setThumbUrl(dataUrl);
                    try {
                        localStorage.setItem(cacheKey, dataUrl);
                    } catch { /* storage full */ }
                }
            } catch (e) {
                // Cross-origin canvas export block or error -> fallback to graceful poster
                setHasError(true);
            } finally {
                cleanup();
            }
        };

        const handleError = () => {
            if (!isMounted) return;
            setHasError(true);
            cleanup();
        };

        const cleanup = () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
            video.removeAttribute('src');
            video.load();
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);

        // Fallback timeout to prevent lingering video element
        const timeout = setTimeout(() => {
            if (isMounted && !thumbUrl) {
                setHasError(true);
                cleanup();
            }
        }, 4000);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            cleanup();
        };
    }, [src]);

    // If thumbnail was extracted successfully, render a lightweight <img> tag
    if (thumbUrl) {
        return (
            <div className="relative w-full h-full">
                <img src={thumbUrl} alt={alt} className={className} loading="lazy" decoding="async" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
                        <Video className="w-5 h-5 text-white ml-0.5" />
                    </div>
                </div>
            </div>
        );
    }

    // Fallback poster style while loading or if cross-origin blocks canvas capture
    return (
        <div className="w-full h-full bg-gradient-to-br from-red-950/50 via-surface-2 to-black flex flex-col items-center justify-center p-3 text-center group-hover:from-red-900/50 transition-colors relative">
            <div className="w-11 h-11 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.3)] mb-1">
                <Video className="w-5 h-5 text-red-400 drop-shadow-md" />
            </div>
            <span className="text-[10px] font-mono text-fg-3 uppercase tracking-widest mt-1">Play Video</span>
        </div>
    );
}
