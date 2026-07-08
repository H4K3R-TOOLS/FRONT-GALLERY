import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                data: ['Space Grotesk', 'monospace'],
            },
            colors: {
                base:     '#060b1a',
                surface:  '#0d1426',
                elevated: '#111d35',
                overlay:  '#162040',
                accent:   '#5b5ef4',
                cyan:     '#22d3ee',
            },
            boxShadow: {
                'accent': '0 8px 32px rgba(91,94,244,0.25)',
                'accent-sm': '0 4px 16px rgba(91,94,244,0.20)',
                'surface': '0 4px 20px rgba(6,11,26,0.70)',
                'deep': '0 8px 40px rgba(6,11,26,0.80)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'accent-gradient': 'linear-gradient(135deg, #5b5ef4 0%, #818cf8 100%)',
                'surface-gradient': 'linear-gradient(180deg, #0d1426 0%, #060b1a 100%)',
            },
            animation: {
                'shimmer': 'shimmer 1.6s infinite',
                'pulse-online': 'pulse-online 2s infinite',
                'float': 'float 4s ease-in-out infinite',
                'fade-in': 'fadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
                'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1) both',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'pulse-online': {
                    '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
                    '50%':     { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
                },
                float: {
                    '0%,100%': { transform: 'translateY(0px)' },
                    '50%':     { transform: 'translateY(-12px)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to:   { opacity: '1' },
                },
                slideUp: {
                    from: { transform: 'translateY(24px)', opacity: '0' },
                    to:   { transform: 'translateY(0)',    opacity: '1' },
                },
                scaleIn: {
                    from: { transform: 'scale(0.92)', opacity: '0' },
                    to:   { transform: 'scale(1)',    opacity: '1' },
                },
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
                'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'out': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
}

export default config
