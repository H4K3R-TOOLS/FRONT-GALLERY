"use client";

import { Check, X, Shield, Zap, Crown, Star, Camera, Mic, MessageSquare, Users, Bell, Flashlight, Vibrate, Download, EyeOff, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'standard' | 'premium';
    userEmail: string;
    userUuid: string;
}

export default function PlansModal({ isOpen, onClose, currentPlan, userEmail, userUuid }: PlansModalProps) {
    const getWhatsAppLink = (planName: string, price: string) => {
        const msg = `🔐 *Gallery Eye — Plan Upgrade*\n\n📧 Email: ${userEmail}\n🆔 UUID: ${userUuid}\n📋 Plan: ${planName} (${price})\n\nI'd like to upgrade to the ${planName} plan. Please process my request! 🙏✨`;
        return `https://wa.me/923460257488?text=${encodeURIComponent(msg)}`;
    };

    const plans = [
        {
            id: 'basic',
            name: 'Free',
            price: '$0',
            period: 'forever',
            accent: '#64748b',
            glowColor: 'rgba(100,116,139,0.1)',
            icon: <Shield size={22} />,
            badge: null,
            features: [
                { icon: <Camera size={13} />, text: '50 Photos Only', included: true },
                { icon: <Smartphone size={13} />, text: '1 Device', included: true },
                { icon: <Download size={13} />, text: 'Gallery Viewer', included: true },
                { icon: <Star size={13} />, text: 'Video Sync', included: false },
                { icon: <MessageSquare size={13} />, text: 'SMS & Contacts', included: false },
                { icon: <Bell size={13} />, text: 'Notification Reader', included: false },
                { icon: <Camera size={13} />, text: 'Camera & Microphone', included: false },
                { icon: <EyeOff size={13} />, text: 'Hide App Icon', included: false },
            ],
        },
        {
            id: 'standard',
            name: 'Standard',
            price: '$5',
            period: '/ year',
            accent: '#10b981',
            glowColor: 'rgba(16,185,129,0.12)',
            icon: <Zap size={22} />,
            badge: 'POPULAR',
            features: [
                { icon: <Star size={13} />, text: 'Unlimited Photos & Videos', included: true },
                { icon: <Smartphone size={13} />, text: 'Up to 5 Devices', included: true },
                { icon: <MessageSquare size={13} />, text: 'SMS & Contacts Sync', included: true },
                { icon: <Bell size={13} />, text: 'Notification Reader', included: true },
                { icon: <Flashlight size={13} />, text: 'Torch & Vibration', included: true },
                { icon: <Download size={13} />, text: 'ZIP & Bulk Download', included: true },
                { icon: <Camera size={13} />, text: 'Camera & Microphone', included: false },
                { icon: <EyeOff size={13} />, text: 'Hide App Icon', included: false },
            ],
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$10',
            period: '/ year',
            accent: '#f59e0b',
            glowColor: 'rgba(245,158,11,0.12)',
            icon: <Crown size={22} />,
            badge: 'ALL ACCESS',
            features: [
                { icon: <Star size={13} />, text: 'Everything in Standard', included: true },
                { icon: <Smartphone size={13} />, text: 'Up to 10 Devices', included: true },
                { icon: <Camera size={13} />, text: 'Live Camera Streaming', included: true },
                { icon: <Mic size={13} />, text: 'Live Microphone & Recording', included: true },
                { icon: <EyeOff size={13} />, text: 'Hide App Icon', included: true },
                { icon: <Download size={13} />, text: 'All Downloads Unlocked', included: true },
                { icon: <Users size={13} />, text: 'All Permissions Unlocked', included: true },
                { icon: <Shield size={13} />, text: 'Priority Support', included: true },
            ],
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4 transform-gpu" onClick={onClose}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-3xl bg-gradient-to-b from-[#15161a] to-[#0f1013] border border-white/[0.08] rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-10px_60px_rgba(0,0,0,0.5)] max-h-[92vh] overflow-hidden transform-gpu"
                        onClick={(e) => e.stopPropagation()}
                    >
                    {/* Top ambient glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

                    {/* Scrollable content */}
                    <div className="overflow-y-auto max-h-[92vh] p-5 sm:p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-7 relative">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                                    <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">Choose Your Plan</span>
                                </h2>
                                <p className="text-sm text-white/35 mt-1 font-medium">Select the plan that fits your needs</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-all hover:scale-105"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {plans.map((plan, idx) => {
                                const isActive = currentPlan === plan.id;
                                const isPremiumPlan = plan.id === 'premium';
                                const isFreePlan = plan.id === 'basic';
                                const canUpgrade = !isActive && (
                                    (plan.id === 'standard' && currentPlan === 'basic') ||
                                    (plan.id === 'premium' && (currentPlan === 'basic' || currentPlan === 'standard'))
                                );

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 group ${
                                            isPremiumPlan
                                                ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] to-amber-900/[0.03]'
                                                : isActive
                                                    ? 'border-white/20 bg-white/[0.04]'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {/* Premium glow */}
                                        {isPremiumPlan && (
                                            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                                        )}

                                        {/* Badge */}
                                        {plan.badge && (
                                            <div
                                                className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg text-[9px] font-black tracking-[0.15em] uppercase"
                                                style={{
                                                    background: plan.accent,
                                                    color: isPremiumPlan ? '#000' : '#fff',
                                                }}
                                            >
                                                {plan.badge}
                                            </div>
                                        )}

                                        {/* Plan header */}
                                        <div className="flex items-center gap-3 mb-4 mt-1 relative">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                                style={{
                                                    background: plan.glowColor,
                                                    borderColor: `${plan.accent}30`,
                                                    color: plan.accent,
                                                    boxShadow: isPremiumPlan ? `0 0 20px ${plan.glowColor}` : 'none',
                                                }}
                                            >
                                                {plan.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black text-white">{plan.price}</span>
                                                    <span className="text-[11px] text-white/30">{plan.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active badge */}
                                        {isActive && (
                                            <div
                                                className="mb-4 py-1.5 rounded-lg text-center text-[10px] font-black tracking-wider border"
                                                style={{
                                                    background: `${plan.accent}15`,
                                                    borderColor: `${plan.accent}30`,
                                                    color: plan.accent,
                                                }}
                                            >
                                                ✓ CURRENT PLAN
                                            </div>
                                        )}

                                        {/* Divider */}
                                        <div className="h-px bg-white/[0.06] mb-4" />

                                        {/* Features */}
                                        <div className="space-y-2.5 mb-5">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <div className={`flex-shrink-0 ${f.included ? '' : 'opacity-20'}`} style={{ color: f.included ? plan.accent : undefined }}>
                                                        {f.included ? <Check size={13} /> : <X size={13} className="text-white" />}
                                                    </div>
                                                    <span className={`text-xs leading-tight ${f.included ? 'text-white/70' : 'text-white/20 line-through'}`}>
                                                        {f.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        {canUpgrade ? (
                                            <a
                                                href={getWhatsAppLink(plan.name, `${plan.price}${plan.period}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full py-3 rounded-xl text-center text-sm font-bold transition-all duration-300"
                                                style={{
                                                    background: plan.accent,
                                                    color: isPremiumPlan ? '#000' : '#fff',
                                                    boxShadow: `0 0 20px ${plan.accent}40`,
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px ${plan.accent}60`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${plan.accent}40`; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                ⚡ Upgrade to {plan.name}
                                            </a>
                                        ) : isActive ? null : (
                                            <div className="py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-[11px] font-bold text-white/20">
                                                Included in your plan
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <p className="text-center text-[11px] text-white/20 mt-6 font-medium">
                            Payments are processed manually via WhatsApp • Plans activate within minutes
                        </p>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
