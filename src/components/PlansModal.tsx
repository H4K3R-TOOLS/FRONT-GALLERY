"use client";

import React from 'react';
import { 
    Check, X, Shield, Zap, Crown, Star, Camera, Mic, MessageSquare, 
    Users, Bell, Flashlight, Vibrate, Download, EyeOff, Smartphone, 
    Building2, Sparkles, ArrowUpRight
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
            price: '$0',
            period: 'forever',
            accent: '#94a3b8',
            glowColor: 'rgba(148,163,184,0.15)',
            icon: Shield,
            badge: null,
            features: [
                { icon: Camera, text: '50 Photos Only', included: true },
                { icon: Smartphone, text: '1 Paired Device', included: true },
                { icon: Download, text: 'Basic Gallery Viewer', included: true },
                { icon: Star, text: 'Video Sync', included: false },
                { icon: MessageSquare, text: 'SMS & Contacts', included: false },
                { icon: Bell, text: 'Notification Reader', included: false },
                { icon: Camera, text: 'Camera & Microphone', included: false },
                { icon: EyeOff, text: 'Stealth App Mode', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard Tier',
            price: '$5',
            period: '/ year',
            accent: '#10b981',
            glowColor: 'rgba(16,185,129,0.2)',
            icon: Zap,
            badge: 'POPULAR',
            features: [
                { icon: Star, text: 'Unlimited Photos & Videos', included: true },
                { icon: Smartphone, text: 'Up to 5 Devices', included: true },
                { icon: MessageSquare, text: 'SMS & Contacts Sync', included: true },
                { icon: Bell, text: 'Notification Interceptor', included: true },
                { icon: Flashlight, text: 'Torch & Vibration Pulse', included: true },
                { icon: Download, text: 'ZIP & Bulk Download', included: true },
                { icon: Camera, text: 'Live Camera Streaming', included: false },
                { icon: EyeOff, text: 'Stealth App Mode', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium VIP',
            price: '$10',
            period: '/ year',
            accent: '#f59e0b',
            glowColor: 'rgba(245,158,11,0.25)',
            icon: Crown,
            badge: 'ALL ACCESS',
            features: [
                { icon: Star, text: 'Everything in Standard', included: true },
                { icon: Smartphone, text: 'Up to 10 Devices', included: true },
                { icon: Camera, text: 'Live HD Camera Streaming', included: true },
                { icon: Mic, text: 'Live Mic & Audio Vault', included: true },
                { icon: EyeOff, text: 'Stealth Icon Cloaking', included: true },
                { icon: Download, text: 'Fast Batch ZIP Extraction', included: true },
                { icon: Users, text: 'All Tools & Sensors', included: true },
                { icon: Shield, text: 'VIP Priority Relays', included: true },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            period: 'custom',
            accent: '#a855f7',
            glowColor: 'rgba(168,85,247,0.25)',
            icon: Building2,
            badge: 'UNLIMITED',
            features: [
                { icon: Star, text: 'Everything in Premium', included: true },
                { icon: Smartphone, text: 'Unlimited Endpoints', included: true },
                { icon: Zap, text: 'Dedicated Relay Pipeline', included: true },
                { icon: Download, text: 'Unlimited Storage Sync', included: true },
                { icon: Camera, text: 'Realtime Multi-Streams', included: true },
                { icon: Mic, text: 'HD Stereo Audio Capture', included: true },
                { icon: Shield, text: '24/7 Dedicated Support', included: true },
                { icon: Crown, text: 'Enterprise SLA Uptime', included: true },
            ],
        },
    ];

    return (
        <div 
            className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-5xl bg-[#0f1115] border border-white/15 rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.98)] max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 sm:p-7 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="clay-icon-pod w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-orange-400 border-orange-500/40">
                            <Crown size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <span>Subscription</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">Tiers & Plans</span>
                            </h2>
                            <p className="text-xs text-white/40 font-mono">Unlock advanced surveillance modules & streaming relays</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="clay-button-sm w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-4 sm:p-7 custom-scrollbar overscroll-contain flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        {plans.map((plan) => {
                            const isActive = currentPlan === plan.id;
                            const isPremiumPlan = plan.id === 'premium';
                            const isEnterprisePlan = plan.id === 'enterprise';
                            const isStandardPlan = plan.id === 'standard';
                            const PlanIcon = plan.icon;

                            const canUpgrade = !isActive && (
                                (plan.id === 'standard' && currentPlan === 'basic') ||
                                (plan.id === 'premium' && (currentPlan === 'basic' || currentPlan === 'standard')) ||
                                (plan.id === 'enterprise' && (currentPlan === 'basic' || currentPlan === 'standard' || currentPlan === 'premium'))
                            );

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                                        isEnterprisePlan
                                            ? 'bg-purple-950/20 border-2 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                                            : isPremiumPlan
                                                ? 'bg-amber-950/20 border-2 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                                                : isStandardPlan
                                                    ? 'bg-emerald-950/20 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                                    : isActive
                                                        ? 'bg-white/5 border-2 border-white/20'
                                                        : 'bg-[#14161b] border border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Top Badge */}
                                    {plan.badge && (
                                        <div 
                                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest border"
                                            style={{
                                                background: plan.accent,
                                                borderColor: '#fff',
                                                color: '#000',
                                                boxShadow: `0 0 12px ${plan.accent}`
                                            }}
                                        >
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div>
                                        {/* Plan Header */}
                                        <div className="flex items-center gap-3 mb-3.5 mt-1">
                                            <div
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
                                                style={{
                                                    background: plan.glowColor,
                                                    borderColor: `${plan.accent}40`,
                                                    color: plan.accent,
                                                }}
                                            >
                                                <PlanIcon size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-white truncate">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-lg font-black text-white font-mono">{plan.price}</span>
                                                    <span className="text-[10px] text-white/40 font-mono">{plan.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active State Pill */}
                                        {isActive && (
                                            <div 
                                                className="mb-3 py-1 px-2 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider border"
                                                style={{
                                                    background: `${plan.accent}20`,
                                                    borderColor: `${plan.accent}50`,
                                                    color: plan.accent,
                                                }}
                                            >
                                                ✓ CURRENT ACTIVE PLAN
                                            </div>
                                        )}

                                        <div className="h-px bg-white/10 mb-3" />

                                        {/* Feature Checklist */}
                                        <div className="space-y-2 mb-5">
                                            {plan.features.map((f, idx) => {
                                                const FIcon = f.icon;
                                                return (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <div className={`shrink-0 ${f.included ? '' : 'opacity-25'}`} style={{ color: f.included ? plan.accent : '#fff' }}>
                                                            {f.included ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={2} />}
                                                        </div>
                                                        <span className={`text-[11px] font-medium leading-tight ${f.included ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>
                                                            {f.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div>
                                        {canUpgrade ? (
                                            <a
                                                href={getWhatsAppLink(plan.name, `${plan.price} ${plan.period}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 rounded-xl text-center text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                                                style={{
                                                    background: plan.accent,
                                                    color: '#000',
                                                    boxShadow: `0 0 16px ${plan.accent}60`
                                                }}
                                            >
                                                <span>Upgrade Plan</span>
                                                <ArrowUpRight size={14} />
                                            </a>
                                        ) : isActive ? (
                                            <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                                                Active Tier
                                            </div>
                                        ) : (
                                            <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-center text-[10px] font-mono font-bold text-white/30 uppercase tracking-wider">
                                                Included In Plan
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="text-center pt-6 text-[10px] font-mono text-white/30 flex items-center justify-center gap-2">
                        <Sparkles size={12} className="text-orange-400" />
                        <span>Manual WhatsApp activation • Instant verification & live upgrade within minutes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
