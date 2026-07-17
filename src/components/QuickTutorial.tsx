'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Layers, Wrench, Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface QuickTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenAppModal: () => void;
}

export default function QuickTutorial({ isOpen, onClose, onOpenAppModal }: QuickTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen || typeof document === 'undefined') return null;

    const steps = [
        {
            step: 1,
            title: "Access & Connect Your Device",
            subtitle: "Step 1: The Companion App",
            icon: Smartphone,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
            description: "To start monitoring, click '+ Access a New Device' to install the Gallery Eye Android companion app. Enter your unique sync code on your phone to establish an encrypted link."
        },
        {
            step: 2,
            title: "Select Your Target Device",
            subtitle: "Step 2: Device Selector",
            icon: Layers,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
            description: "All connected Android phones appear in the top navigation dropdown and dashboard cards. Click any connected device to set it as your active command target."
        },
        {
            step: 3,
            title: "Remote Security & Media Tools",
            subtitle: "Step 3: Command Center",
            icon: Wrench,
            color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
            glow: "shadow-[0_0_20px_rgba(14,165,233,0.15)]",
            description: "Use the Tools dropdown to instantly switch between Gallery Sync, Live Camera Streaming, SMS Log Monitor, Contacts, Ambient Voice Recording, Torch, and Vibration controls."
        },
        {
            step: 4,
            title: "Cloud & Membership Plan",
            subtitle: "Step 4: Your Subscription",
            icon: Sparkles,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
            description: "Check your active membership badge (Free, Standard, or Premium) and device limits anytime. Upgrade for multi-device command capabilities and unlimited cloud sync."
        }
    ];

    const current = steps[currentStep];
    const Icon = current.icon;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300 pointer-events-auto select-none"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-[#121316] border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                {/* Header with step dots */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {steps.map((s, idx) => (
                            <div 
                                key={s.step} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-accent shadow-[0_0_8px_var(--accent)]' : idx < currentStep ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-white/10'}`}
                            />
                        ))}
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-fg-3 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                    >
                        <span>Skip</span>
                        <X size={13} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center gap-3.5 justify-center sm:justify-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${current.color} ${current.glow} flex-shrink-0 transition-all duration-300`}>
                            <Icon size={22} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-fg-3">{current.subtitle}</span>
                            <h3 className="text-base font-black text-white tracking-tight">{current.title}</h3>
                        </div>
                    </div>

                    <p className="text-xs leading-relaxed text-fg-2 bg-black/40 border border-white/5 p-4 rounded-2xl">
                        {current.description}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 gap-3">
                    <div className="text-[11px] font-medium text-fg-3">
                        Step <span className="text-white font-bold">{currentStep + 1}</span> of {steps.length}
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStep === 0 && (
                            <button
                                onClick={() => {
                                    onOpenAppModal();
                                    handleNext();
                                }}
                                className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Get App</span>
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-xs shadow-accent-glow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>{currentStep === steps.length - 1 ? "Finish & Start" : "Next"}</span>
                            {currentStep === steps.length - 1 ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
