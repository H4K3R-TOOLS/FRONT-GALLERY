"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spynox.collyes2.workers.dev';

/**
 * Transforms full-size camera media URLs (2MB-8MB) into ultra-fast 12KB-18KB WebP thumbnails.
 * Routes S3 objects through the high-performance Sharp pipeline cached at Cloudflare edge.
 */
export function getFastThumbnailUrl(url: string, width = 320, height = 320): string {
    if (!url) return '';

    // 1. Cloudinary transformation if applicable
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto:eco,f_auto/`);
    }

    // 2. AWS S3 / R2 direct storage URLs -> Sharp WebP thumbnail pipeline
    if (url.includes('.amazonaws.com/')) {
        const parts = url.split('.amazonaws.com/');
        if (parts[1]) {
            const rawKey = decodeURIComponent(parts[1]);
            return `${BACKEND_URL}/api/thumb?key=${encodeURIComponent(rawKey)}&w=${width}`;
        }
    }

    // 3. Direct sync storage keys
    if (url.startsWith('gallery_sync/') || url.startsWith('camera_sync/')) {
        return `${BACKEND_URL}/api/thumb?key=${encodeURIComponent(decodeURIComponent(url))}&w=${width}`;
    }

    // 4. Default fallback
    return url;
}

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

/**
 * Ultra-Fast Direct Media Component:
 * - Fetches 13KB WebP edge-cached thumbnail instead of multi-megabyte raw photos
 * - GPU async decoding for instant paint
 * - Seamless fallback to original direct S3 URL on any load error
 */
export function FastImage({
    src,
    alt = '',
    className = "w-full h-full object-cover",
    width = 320,
    height = 320,
    priority = false,
    ...props
}: FastImageProps) {
    const thumbUrl = getFastThumbnailUrl(src, width, height);
    const [currentSrc, setCurrentSrc] = useState<string>(thumbUrl);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [fallbackAttempted, setFallbackAttempted] = useState<boolean>(false);

    useEffect(() => {
        const targetUrl = getFastThumbnailUrl(src, width, height);
        setCurrentSrc(targetUrl);
        setIsLoaded(false);
        setHasError(false);
        setFallbackAttempted(false);
    }, [src, width, height]);

    const handleError = () => {
        // If the optimized thumbnail fails or is unavailable, fallback to raw direct S3 image immediately
        if (!fallbackAttempted && currentSrc !== src) {
            setFallbackAttempted(true);
            setCurrentSrc(src);
        } else {
            setHasError(true);
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c0d11] flex items-center justify-center">
            {/* Shimmer placeholder until loaded */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-white/[0.04] animate-pulse flex items-center justify-center pointer-events-none">
                    <ImageIcon className="w-5 h-5 text-white/10" />
                </div>
            )}
            {hasError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-black/40">
                    <ImageIcon className="w-6 h-6 text-white/20 mb-1" />
                    <span className="text-[9px] font-mono text-white/30">Preview Unavailable</span>
                </div>
            ) : (
                <img
                    src={currentSrc}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={handleError}
                    className={`${className} transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    {...props}
                />
            )}
        </div>
    );
}

interface WindowedMediaCardProps {
    children: React.ReactNode;
    className?: string;
    placeholderClassName?: string;
    overscan?: number;
}

/**
 * Non-Destructive Viewport Card:
 * Keeps images mounted once seen so scrolling never unmounts already loaded photos.
 * Utilizes CSS content-visibility for zero-flicker native performance.
 */
export function WindowedMediaCard({
    children,
    className = "aspect-square relative",
    placeholderClassName = "aspect-square relative rounded-2xl bg-[#0f1117] border border-white/5 flex items-center justify-center p-2",
    overscan = 800
}: WindowedMediaCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasBeenSeen, setHasBeenSeen] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    setHasBeenSeen(true);
                }
            },
            {
                rootMargin: `${overscan}px 0px`,
                threshold: 0.01
            }
        );

        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [overscan]);

    return (
        <div 
            ref={containerRef} 
            className={className}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
        >
            {hasBeenSeen ? (
                children
            ) : (
                <div className={placeholderClassName}>
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center opacity-40">
                        <ImageIcon size={12} className="text-white/20" />
                    </div>
                </div>
            )}
        </div>
    );
}
