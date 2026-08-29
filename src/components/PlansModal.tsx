"use client";

import React from 'react';
import { 
    Check, X, Shield, Zap, Crown, Building2, 
    Smartphone, Sparkles, ArrowRight, Lock, CheckCircle2, Star
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
            devices: '1 Endpoint',
            badge: null,
            icon: Shield,
            gradient: 'from-zinc-600 via-zinc-700 to-zinc-900 border-zinc-500/30 text-zinc-200',
            cardBg: 'bg-[#14161c] border-white/10 hover:border-white/20',
            accentColor: 'text-zinc-300',
            features: [
                { text: '50 Photos Sync Limit', included: true },
                { text: '1 Target Device', included: true },
                { text: 'Basic Gallery Viewer', included: true },
                { text: 'Live Video Extraction', included: false },
                { text: 'SMS & Contacts Tracker', included: false },
                { text: 'Notification Interceptor', included: false },
                { text: 'Live Camera Streaming', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard Pro',
            price: '$5',
            period: '/ year',
            devices: 'Up to 5 Endpoints',
            badge: 'POPULAR',
            badgeClass: 'bg-emerald-500 text-black font-black shadow-[0_0_12px_rgba(16,185,129,0.5)]',
            icon: Zap,
            gradient: 'from-emerald-500 via-emerald-600 to-teal-800 border-emerald-400/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            cardBg: 'bg-[#101915] border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]',
            accentColor: 'text-emerald-400',
            features: [
                { text: 'Unlimited Photos & Videos', included: true },
                { text: 'Up to 5 Target Devices', included: true },
                { text: 'SMS & Contacts Sync', included: true },
                { text: 'Notification Interceptor', included: true },
                { text: 'Torch & Vibration Pulse', included: true },
                { text: 'ZIP Bulk Downloader', included: true },
                { text: 'Live Camera Streaming', included: false },
                { text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium Elite',
            price: '$10',
            period: '/ year',
            devices: 'Up to 10 Endpoints',
            badge: '★ ALL ACCESS',
            badgeClass: 'bg-amber-400 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]',
            icon: Crown,
            gradient: 'from-amber-500 via-orange-600 to-red-600 border-amber-400/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]',
            cardBg: 'bg-[#1a160e] border-amber-500/40 hover:border-amber-500/70 shadow-[0_15px_35px_rgba(245,158,11,0.15)]',
            accentColor: 'text-amber-400',
            features: [
                { text: 'Everything in Standard', included: true },
                { text: 'Up to 10 Target Devices', included: true },
                { text: 'Live Camera Dual Streaming', included: true },
                { text: 'Live Mic Audio Stream', included: true },
                { text: 'Stealth Icon Cloaking', included: true },
                { text: 'All Tools & Actions Unlocked', included: true },
                { text: 'Realtime Telemetry Relay', included: true },
                { text: 'Priority WhatsApp VIP Desk', included: true },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise VIP',
            price: 'Custom',
            period: 'custom SLA',
            devices: 'Unlimited Endpoints',
            badge: 'UNLIMITED',
            badgeClass: 'bg-purple-500 text-white font-black shadow-[0_0_15px_rgba(168,85,247,0.6)]',
            icon: Building2,
            gradient: 'from-purple-500 via-indigo-600 to-violet-800 border-purple-400/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]',
            cardBg: 'bg-[#16111f] border-purple-500/40 hover:border-purple-500/70 shadow-[0_15px_35px_rgba(168,85,247,0.15)]',
            accentColor: 'text-purple-400',
            features: [
                { text: 'Everything in Premium', included: true },
                { text: 'Unlimited Target Devices', included: true },
                { text: 'Maximum Relay Bandwidth', included: true },
                { text: 'Unlimited Cloud Storage', included: true },
                { text: 'Custom Domain / Whitelabel', included: true },
                { text: 'Full Audio & Video Suite', included: true },
                { text: '24/7 Dedicated Team Desk', included: true },
                { text: 'Custom APK Engine Builds', included: true },
            ],
        },
    ];

    return (
        <div 
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-[#101217] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] max-w-5xl w-full flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative max-h-[94dvh] sm:max-h-[92dvh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Top Bar with Title Pill & Close Action ── */}
                <div className="px-4 sm:px-7 py-3 sm:py-3.5 border-b border-white/10 bg-black/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]" />
                            <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-orange-200">
                                Subscription & Licensing Studio
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 flex items-center justify-center text-white/60 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Close Studio"
                    >
                        <X size={16} className="sm:w-4 sm:h-4" />
                    </button>
                </div>

                {/* ── Main Scrollable Body ── */}
                <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-5 sm:space-y-6 custom-scrollbar">
                    
                    {/* Header Banner */}
                    <div className="bg-[#14161c] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 text-center sm:text-left">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                                <Sparkles size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                    Expand Your Surveillance Fleet
                                </h3>
                                <p className="text-xs text-white/50 font-mono mt-0.5">
                                    Instant activation via WhatsApp • Zero downtime endpoint scaling
                                </p>
                            </div>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Your Active Tier:</span>
                            <span className="text-xs font-mono font-black text-orange-300 uppercase">
                                {currentPlan.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* 4-Tier Grid */}
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
                                    className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${plan.cardBg} ${
                                        isActive ? 'ring-2 ring-orange-500/80 shadow-[0_0_25px_rgba(249,115,22,0.2)]' : ''
                                    }`}
                                >
                                    {/* Top Badge */}
                                    {plan.badge && (
                                        <div className="absolute -top-2.5 right-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${plan.badgeClass}`}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        {/* Squircle Preset-style Icon + Title */}
                                        <div className="flex items-center gap-3 mb-3.5">
                                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center border shrink-0 ${plan.gradient}`}>
                                                <IconComponent size={20} className="drop-shadow" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs sm:text-sm font-black text-white truncate uppercase tracking-wider">
                                                    {plan.name}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Smartphone size={10} className="text-white/40" />
                                                    <span className="text-[10px] font-mono font-bold text-white/50">{plan.devices}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing Box */}
                                        <div className="bg-[#14161b] border border-white/5 p-2.5 rounded-2xl mb-3.5 flex items-baseline justify-between">
                                            <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest">Rate</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl sm:text-2xl font-black text-white font-mono">{plan.price}</span>
                                                <span className="text-[10px] text-white/40 font-mono">{plan.period}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {isActive && (
                                            <div className="mb-3 py-1 px-2 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/15 border border-orange-500/40 text-orange-300">
                                                ✓ CURRENT ACTIVE PLAN
                                            </div>
                                        )}

                                        {/* Feature Capsules */}
                                        <div className="space-y-1.5 mb-4">
                                            {plan.features.map((f, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`p-1.5 px-2 rounded-xl border flex items-center gap-2 ${
                                                        f.included 
                                                            ? 'bg-[#14161b] border-white/5 text-zinc-200' 
                                                            : 'bg-[#101216] border-transparent text-zinc-600'
                                                    }`}
                                                >
                                                    <div 
                                                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                                                            f.included 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                                                : 'bg-white/5 text-white/10'
                                                        }`}
                                                    >
                                                        {f.included ? <Check size={10} strokeWidth={3} /> : <X size={9} strokeWidth={2} />}
                                                    </div>
                                                    <span className={`text-[10px] sm:text-[11px] font-medium leading-tight truncate ${f.included ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>
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
                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(168,85,247,0.4)]'
                                                        : isPremium
                                                            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-[0_4px_20px_rgba(245,158,11,0.5)]'
                                                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.4)]'
                                                }`}
                                            >
                                                <span>Upgrade Plan</span>
                                                <ArrowRight size={13} />
                                            </a>
                                        ) : isActive ? (
                                            <div className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] font-mono font-bold text-white/40">
                                                Active on this Device
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

                    {/* Bottom Security Assurance Note */}
                    <div className="bg-[#14161c] border border-white/5 rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-[11px] font-mono text-white/40">
                            🛡️ 100% Encrypted Transactions • Manual Provisioning via WhatsApp • Instant Account Activation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
