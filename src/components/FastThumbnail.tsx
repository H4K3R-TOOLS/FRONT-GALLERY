"use client";

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

/**
 * Direct GPU Media Component:
 * - Matches modal preview behavior for instant, zero-delay rendering
 * - No opacity-0 blocking state: browser paints image chunks progressively as they arrive
 * - Smooth fallback if direct image fails to load
 */
export function FastImage({
    src,
    alt = '',
    className = "w-full h-full object-cover",
    priority = false,
    ...props
}: FastImageProps) {
    const [hasError, setHasError] = useState<boolean>(false);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c0d11] flex items-center justify-center">
            {hasError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-black/40">
                    <ImageIcon className="w-6 h-6 text-white/20 mb-1" />
                    <span className="text-[9px] font-mono text-white/30">Preview Unavailable</span>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => setHasError(true)}
                    className={className}
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
 * Permanent Media Card:
 * Renders children directly without DOM unmounting or CSS content-visibility layout locks.
 */
export function WindowedMediaCard({
    children,
    className = "aspect-square relative",
}: WindowedMediaCardProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

