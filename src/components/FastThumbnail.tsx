"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Video, RefreshCw } from 'lucide-react';

/**
 * Returns clean direct S3 media URL with native async decoding and lazy loading.
 */
export function getFastThumbnailUrl(url: string, width = 300, height = 300): string {
    if (!url) return '';
    // If Cloudinary transformation is explicitly available, use it; otherwise use direct S3 URL
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto:eco,f_auto/`);
    }
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
 * High-performance direct S3 image component with:
 * - Direct AWS S3 streaming with 200 OK
 * - Zero third-party proxy dependencies (works without external CDNs)
 * - Async GPU texture decoding
 * - Subtle shimmer placeholder while loading
 */
export function FastImage({
    src,
    alt = '',
    className = "w-full h-full object-cover",
    width = 300,
    height = 300,
    priority = false,
    ...props
}: FastImageProps) {
    const [currentSrc, setCurrentSrc] = useState<string>(src);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        setCurrentSrc(src);
        setIsLoaded(false);
        setHasError(false);
    }, [src]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c0d11] flex items-center justify-center">
            {/* Shimmer placeholder until loaded */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-white/[0.04] animate-pulse flex items-center justify-center">
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
                    onError={() => setHasError(true)}
                    className={`${className} transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
 * DOM Windowing Component (Viewport Unloading):
 * Initially renders content immediately. When scrolled away beyond overscan buffer,
 * unmounts off-screen elements to prevent browser memory exhaustion.
 */
export function WindowedMediaCard({
    children,
    className = "aspect-square relative",
    placeholderClassName = "aspect-square relative rounded-2xl bg-[#0f1117] border border-white/5 flex items-center justify-center p-2",
    overscan = 500
}: WindowedMediaCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Initial state is true so initial screen items are always mounted immediately!
    const [isInView, setIsInView] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsInView(entry.isIntersecting);
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
        <div ref={containerRef} className={className}>
            {isInView ? (
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
