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
            color: 'bg-white/10',
            features: [
                '50 Photos Sync',
                'Basic Gallery Access',
                'Limited Permissions'
            ],
            current: currentPlan === 'basic'
        },
        {
            id: 'standard',
            name: 'Standard',
            price: '$5',
            icon: '⭐',
            color: 'bg-gradient-to-br from-purple-500 to-blue-600',
            features: [
                '100 Photos Sync',
                '50 Videos Sync',
                'SMS Access',
                'Contacts Access',
                'Flashlight & Vibration',
                'Hide App Icon'
            ],
            current: currentPlan === 'standard'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$10',
            icon: '👑',
            color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
            features: [
                'Unlimited Photos',
                'Unlimited Videos',
                'Bulk Download (ZIP)',
                'Cloud Backup',
                'Priority Support',
                'All Standard Features'
            ],
            popular: true,
            current: currentPlan === 'premium'
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl animate-scaleUp scrollbar-hide">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="p-6 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Choose Your Plan
                    </h2>
                    <p className="text-white/60 mb-12 max-w-2xl mx-auto">
                        Unlock the full potential of Gallery Eye with our premium plans. Secure, fast, and feature-rich.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-6 flex flex-col items-center border transition-all duration-300 hover:scale-[1.02] ${plan.popular ? 'border-yellow-500/50 shadow-yellow-500/10 shadow-lg' :
                                    plan.current ? 'border-green-500/50 shadow-green-500/10 shadow-lg' : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                        MOST POPULAR
                                    </div>
                                )}
                                {plan.current && (
                                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-xl">
                                        CURRENT PLAN
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${plan.id === 'standard' || plan.id === 'premium' ? plan.color : 'bg-white/10'}`}>
                                    {plan.icon}
                                </div>

                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <div className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-white/40">/lifetime</span></div>

                                <ul className="w-full space-y-3 mb-8 text-left">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                                            <svg className={`w-4 h-4 flex-shrink-0 ${plan.current ? 'text-green-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto w-full">
                                    {plan.current ? (
                                        <button disabled className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold cursor-default border border-green-500/20">
                                            Active Plan
                                        </button>
                                    ) : plan.id === 'basic' ? (
                                        <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/40 font-semibold cursor-default">
                                            Included
                                        </button>
                                    ) : (
                                        <a
                                            href={generateWhatsAppLink(plan.name, plan.price)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block w-full py-3 rounded-xl font-semibold transition-all ${plan.id === 'premium'
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-lg hover:shadow-orange-500/20'
                                                : 'bg-white hover:bg-white/90 text-black'
                                                }`}
                                        >
                                            Buy Now
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
