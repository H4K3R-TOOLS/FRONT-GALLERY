"use client";

import React from 'react';
import { 
    Check, X, Shield, Zap, Crown, Building2, 
    ArrowRight, Smartphone, MessageSquare, 
    Bell, Camera, Mic, EyeOff, Download, Radio, Sparkles
} from 'lucide-react';

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
    userEmail: string;
    userUuid: string;
}

export default function PlansModal({ isOpen, onClose, currentPlan, userEmail, userUuid }: PlansModalProps) {
    if (!isOpen) return null;

    const getWhatsAppLink = (planName: string, price: string) => {
        const msg = `🔐 *Gallery Eye — Plan Upgrade*\n\n📧 Email: ${userEmail}\n🆔 UUID: ${userUuid}\n📋 Plan: ${planName} (${price})\n\nI'd like to upgrade to the ${planName} plan. Please process my request! 🙏✨`;
        return `https://wa.me/923460257488?text=${encodeURIComponent(msg)}`;
    };

    const plans = [
        {
            id: 'basic',
            name: 'Free Starter',
            tagline: 'Basic personal media sync',
            price: '$0',
            period: 'forever free',
            subtext: 'No credit card required',
            theme: 'slate',
            accent: '#94a3b8',
            icon: Shield,
            badge: null,
            features: [
                { text: '50 Photos Cloud Sync Limit', included: true },
                { text: '1 Connected Target Device', included: true },
                { text: 'Full Web Gallery Viewer', included: true },
                { text: 'Live Video Stream Sync', included: false },
                { text: 'SMS & Call Log Extraction', included: false },
                { text: 'Real-time Alerts Interceptor', included: false },
                { text: 'Dual Camera & Mic Stream', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard Pro',
            tagline: 'Multi-device surveillance suite',
            price: '$5',
            period: '/ year',
            subtext: 'Billed annually ($0.41/mo)',
            theme: 'emerald',
            accent: '#10b981',
            glowColor: 'rgba(16,185,129,0.25)',
            icon: Zap,
            badge: 'POPULAR CHOICE',
            badgeStyle: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            features: [
                { text: 'Unlimited Photos & Video Sync', included: true },
                { text: 'Up to 5 Target Endpoints', included: true },
                { text: 'SMS, Chats & Contacts Tracker', included: true },
                { text: 'Notification Monitor & Logger', included: true },
                { text: 'Torch Pulse & Vibration Remote', included: true },
                { text: 'ZIP Bulk Archive Downloader', included: true },
                { text: 'Dual Camera & Mic Stream', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium Elite',
            tagline: 'Full hardware control & live sensors',
            price: '$10',
            period: '/ year',
            subtext: 'Billed annually ($0.83/mo)',
            theme: 'amber',
            accent: '#f59e0b',
            glowColor: 'rgba(245,158,11,0.35)',
            icon: Crown,
            badge: 'ALL ACCESS VIP',
            badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
            isHero: true,
            features: [
                { text: 'Everything in Standard Pro', included: true },
                { text: 'Up to 10 Target Endpoints', included: true },
                { text: 'Live Dual Camera Streaming', included: true },
                { text: 'Live Mic Audio & Background Rec', included: true },
                { text: '100% Stealth Icon Cloaking', included: true },
                { text: 'All Tools & Hardware Unlocked', included: true },
                { text: 'Instant WebSocket Telemetry Relay', included: true },
                { text: 'VIP Priority WhatsApp Desk', included: true },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise VIP',
            tagline: 'Dedicated fleet infrastructure',
            price: 'Custom',
            period: 'custom SLA',
            subtext: 'Tailored for scale & ops',
            theme: 'purple',
            accent: '#a855f7',
            glowColor: 'rgba(168,85,247,0.35)',
            icon: Building2,
            badge: 'UNLIMITED FLEET',
            badgeStyle: 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
            features: [
                { text: 'Everything in Premium Elite', included: true },
                { text: 'Unlimited Target Endpoints', included: true },
                { text: 'Maximum Bandwidth & Relay Speed', included: true },
                { text: 'Unlimited Cloud Storage Vault', included: true },
                { text: 'Custom Domain & Whitelabel', included: true },
                { text: 'Full Audio, Video & GPS Fleet Suite', included: true },
                { text: '24/7 Dedicated Ops Engineer', included: true },
                { text: 'Custom Signed Android APK Builds', included: true },
            ],
        },
    ];

    return (
        <div 
            className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-6xl bg-[#0d0e12] p-4 sm:p-7 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.98)] max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Floating Minimal Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-20"
                    title="Close Modal"
                >
                    <X size={16} />
                </button>

                {/* 4 Professional Cyber-SaaS Pricing Towers */}
                <div className="overflow-y-auto pr-1 custom-scrollbar pt-2 sm:pt-1 pb-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        {plans.map((plan) => {
                            const isActive = currentPlan === plan.id;
                            const isHero = plan.isHero;
                            const isEnterprise = plan.id === 'enterprise';
                            const isStandard = plan.id === 'standard';
                            const IconComponent = plan.icon;

                            const canUpgrade = !isActive && (
                                (plan.id === 'standard' && currentPlan === 'basic') ||
                                (plan.id === 'premium' && (currentPlan === 'basic' || currentPlan === 'standard')) ||
                                (plan.id === 'enterprise' && (currentPlan === 'basic' || currentPlan === 'standard' || currentPlan === 'premium'))
                            );

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 group ${
                                        isActive
                                            ? 'bg-[#15171e] border-2 border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.25)]'
                                            : isHero
                                                ? 'bg-[#161410] border-2 border-amber-500/50 shadow-[0_15px_45px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:-translate-y-1'
                                                : isEnterprise
                                                    ? 'bg-[#14121a] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_35px_rgba(147,51,234,0.15)] hover:-translate-y-1'
                                                    : isStandard
                                                        ? 'bg-[#111714] border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_10px_35px_rgba(16,185,129,0.15)] hover:-translate-y-1'
                                                        : 'bg-[#121318] border border-white/10 hover:border-white/20 hover:-translate-y-1'
                                    }`}
                                >
                                    {/* Top Floating Badge */}
                                    {plan.badge && (
                                        <div className="absolute -top-2.5 right-4 z-10">
                                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${plan.badgeStyle}`}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        {/* Card Header: Icon + Plan Name */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div 
                                                className="w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 bg-black/40 shadow-inner"
                                                style={{
                                                    borderColor: `${plan.accent}40`,
                                                    color: plan.accent,
                                                }}
                                            >
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-base sm:text-lg font-black text-white truncate tracking-tight">{plan.name}</h3>
                                                <p className="text-[10px] text-zinc-400 font-medium truncate">
                                                    {plan.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pricing Block */}
                                        <div className="my-4 pb-4 border-b border-white/[0.08]">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                                                    {plan.price}
                                                </span>
                                                <span className="text-xs font-mono font-bold text-zinc-400">
                                                    {plan.period}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-400 mt-1">
                                                {plan.subtext}
                                            </div>
                                        </div>

                                        {/* Active Status Highlight */}
                                        {isActive && (
                                            <div className="mb-4 py-1.5 px-3 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/15 border border-orange-500/50 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                                ● Currently Active Tier
                                            </div>
                                        )}

                                        {/* Professional Feature Checklist */}
                                        <div className="space-y-2.5 mb-6">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                            f.included 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                                : 'bg-white/5 text-white/20 border border-white/5'
                                                        }`}
                                                    >
                                                        {f.included ? <Check size={10} strokeWidth={3} /> : <X size={9} strokeWidth={2} />}
                                                    </div>
                                                    <span className={`text-xs font-medium leading-tight ${
                                                        f.included ? 'text-zinc-200' : 'text-zinc-400 line-through opacity-60'
                                                    }`}>
                                                        {f.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        {canUpgrade ? (
                                            <a
                                                href={getWhatsAppLink(plan.name, `${plan.price} ${plan.period}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                                                    isHero
                                                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)]'
                                                        : isEnterprise
                                                            ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                                                            : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                                                }`}
                                            >
                                                <span>Upgrade to {plan.name}</span>
                                                <ArrowRight size={14} />
                                            </a>
                                        ) : isActive ? (
                                            <div className="py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center text-[10px] font-mono font-black uppercase tracking-wider text-white/40">
                                                Current Plan
                                            </div>
                                        ) : (
                                            <div className="py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-[10px] font-mono font-bold uppercase tracking-wider text-white/25">
                                                Included in Tier
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
