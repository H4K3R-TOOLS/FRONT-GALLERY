'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap, Crown, Package, ChevronRight, X, Sparkles } from 'lucide-react';

interface QuickTutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Step {
    id: string;
    targetIds: string[];
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
}

const steps: Step[] = [
    {
        id: 'access-app',
        targetIds: ['tutorial-access-app', 'tutorial-access-app-nav'],
        title: 'Step 1: Install & Link Android App',
        description: 'To get started, click "+ Access a New Device" to download our secure Android APK and link your phone using your unique account UUID.',
        icon: Smartphone,
        badge: 'Setup'
    },
    {
        id: 'device-selector',
        targetIds: ['tutorial-device-card', 'tutorial-device-selector'],
        title: 'Step 2: Monitor & Switch Devices',
        description: 'Check real-time online/offline status, view active endpoints, or switch between your connected Android devices instantly from this panel.',
        icon: Smartphone,
        badge: 'Telemetry'
    },
    {
        id: 'tools-selector',
        targetIds: ['tutorial-tools-selector', 'tutorial-synced-media'],
        title: 'Step 3: Explore Remote Tools',
        description: 'Select any remote command tool like Gallery Sync, Remote Camera, SMS Logs, Contacts, Flashlight, or Live Audio Note from the top navbar dropdown.',
        icon: Zap,
        badge: 'Command Center'
    },
    {
        id: 'plans-card',
        targetIds: ['tutorial-plans-card', 'tutorial-account-btn'],
        title: 'Step 4: Unlock Pro Capabilities',
        description: 'Inspect or upgrade your subscription tier right here to unlock multi-device limits, background syncing, and high-speed encrypted transfers.',
        icon: Crown,
        badge: 'Upgrade'
    }
];

export default function QuickTutorial({ isOpen, onClose }: QuickTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentStep = steps[currentStepIndex];

    const updatePosition = () => {
        if (!isOpen || !currentStep) return;

        let foundEl: HTMLElement | null = null;
        for (const tid of currentStep.targetIds) {
            const el = document.getElementById(tid);
            if (el) {
                foundEl = el;
                break;
            }
        }

        if (foundEl) {
            foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                if (foundEl) {
                    setTargetRect(foundEl.getBoundingClientRect());
                }
            }, 300);
            setTargetRect(foundEl.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isOpen, currentStepIndex]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        try {
            localStorage.setItem('galleryeye_quick_tutorial_done', 'true');
        } catch {}
        onClose();
    };

    // Calculate popover style
    const getPopoverStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed'
            };
        }

        const popoverWidth = 340;
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

        let left = targetRect.left;
        if (left + popoverWidth > screenWidth - 20) {
            left = Math.max(20, screenWidth - popoverWidth - 20);
        }

        // Check vertical space
        const spaceBelow = screenHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;

        if (spaceBelow >= 210 || spaceBelow > spaceAbove) {
            return {
                top: Math.min(screenHeight - 220, targetRect.bottom + 12),
                left: left,
                position: 'fixed'
            };
        } else {
            return {
                top: Math.max(20, targetRect.top - 205),
                left: left,
                position: 'fixed'
            };
        }
    };

    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 z-[5000] pointer-events-auto select-none overflow-hidden">
            {/* Click Catcher: Blocks all clicks/touches outside while allowing target element inside box-shadow cutout to be 100% sharp and clear */}
            <div 
                className={`absolute inset-0 ${targetRect ? 'bg-transparent' : 'bg-black/82'} pointer-events-auto transition-colors duration-300`}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            />

            {/* Spotlight Cutout / Glowing Highlight Box around the target element */}
            {targetRect && (
                <div 
                    style={{
                        top: targetRect.top - 6,
                        left: targetRect.left - 6,
                        width: targetRect.width + 12,
                        height: targetRect.height + 12,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.82), 0 0 35px rgba(91, 94, 244, 0.6), inset 0 0 15px rgba(91, 94, 244, 0.3)'
                    }}
                    className="fixed z-[5001] rounded-2xl border-2 border-accent bg-transparent pointer-events-none transition-all duration-300 animate-pulse"
                />
            )}

            {/* Popover Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep.id}
                    ref={popoverRef}
                    style={getPopoverStyle()}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="w-[340px] max-w-[90vw] z-[5002] p-5 rounded-[1.6rem] bg-[#121316] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col justify-between gap-4"
                >
                    {/* Header: Step Pill & Close Button */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-accent/20 border border-accent/40 text-[10px] font-bold text-accent-light uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-accent-light" />
                                {currentStepIndex + 1} of {steps.length}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-400 font-mono tracking-tight uppercase">
                                • {currentStep.badge}
                            </span>
                        </div>
                        <button
                            onClick={handleComplete}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            title="Skip Tutorial"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 shadow-inner">
                                <Icon className="w-4 h-4" />
                            </div>
                            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
                                {currentStep.title}
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium pl-1">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Footer Actions: Skip & Next/Finish */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
                        <button
                            onClick={handleComplete}
                            className="text-xs font-semibold text-zinc-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        >
                            Skip Tour
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-purple-500 hover:from-accent-light hover:to-purple-400 text-white font-bold text-xs uppercase tracking-wider shadow-accent-glow transition-all active:scale-95 cursor-pointer"
                        >
                            <span>{currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
