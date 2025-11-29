'use client';

import { useEffect } from 'react';

interface MediaFile {
    id: string;
    url: string;
    type: 'image' | 'video';
    created_at: string;
}

interface Props {
    media: MediaFile[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export default function MediaLightbox({ media, currentIndex, onClose, onNavigate }: Props) {
    const current = media[currentIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < media.length - 1) onNavigate(currentIndex + 1);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, media.length, onClose, onNavigate]);

    const downloadSingle = async () => {
        try {
            const a = document.createElement('a');
            a.href = current.url;
            a.download = `media_${Date.now()}${current.type === 'video' ? '.mp4' : '.jpg'}`;
            a.target = '_blank';
            a.click();
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Content */}
            <div className="relative z-10 max-w-7xl max-h-[90vh] w-full mx-4">
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-center">
                    <div className="text-white">
                        <span className="text-sm">{currentIndex + 1} / {media.length}</span>
                        <span className="ml-4 text-sm text-gray-400">{current.type}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadSingle}
                            className="glass-effect px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="glass-effect px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Media Container */}
                <div className="flex items-center justify-center h-full">
                    {current.type === 'image' ? (
                        <img
                            src={current.url}
                            alt=""
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        />
                    ) : (
                        <video
                            src={current.url}
                            controls
                            autoPlay
                            className="max-w-full max-h-[85vh] rounded-lg"
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                    <button
                        onClick={() => onNavigate(currentIndex - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 glass-effect p-3 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                {currentIndex < media.length - 1 && (
                    <button
                        onClick={() => onNavigate(currentIndex + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 glass-effect p-3 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
