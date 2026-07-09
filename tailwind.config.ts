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
                sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                mono: ['Space Grotesk', 'Space Grotesk', 'monospace'],
            },
            colors: {
                base:     '#09090b',
                surface:  { DEFAULT: '#0f0f12', 2: '#18181b', 3: '#1e1e22', 4: '#27272a', 5: '#3f3f46' },
                elevated: '#18181b',
                overlay:  '#1e1e22',
                accent:   { DEFAULT: '#10b981', hi: '#34d399', lo: '#059669' },
                fg:       { 1: '#fafafa', 2: '#a1a1aa', 3: '#71717a', 4: '#52525b' },
            },
            boxShadow: {
                'e1': '0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.4)',
                'e2': '0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 12px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
                'e3': '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.7)',
                'e4': '0 1px 0 rgba(255,255,255,0.08) inset, 0 24px 64px rgba(0,0,0,0.65), 0 4px 8px rgba(0,0,0,0.8)',
                'accent': '0 8px 32px color-mix(in oklch, #10b981 40%, transparent), 0 1px 0 rgba(255,255,255,0.08) inset',
                'accent-sm': '0 4px 16px rgba(16,185,129,0.20)',
                'surface': '0 4px 20px rgba(0,0,0,0.70)',
                'deep': '0 8px 40px rgba(0,0,0,0.80)',
                'glow-accent': '0 0 30px rgba(16,185,129,0.25)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'accent-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                'surface-gradient': 'linear-gradient(180deg, #0f0f12 0%, #09090b 100%)',
                'mesh-hero': 'var(--mesh-hero)',
            },
            animation: {
                'shimmer': 'shimmer 1.6s infinite',
                'pulse-online': 'pulse-online 2s infinite',
                'fade-in': 'fadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
                'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1) both',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
                'slide-down': 'slide-down 0.3s cubic-bezier(0.32,0.72,0,1) both',
                'slide-in-bottom': 'slide-in-bottom 0.4s cubic-bezier(0.32,0.72,0,1) both',
                'card-tilt-in': 'card-tilt-in 0.5s cubic-bezier(0.32,0.72,0,1) both',
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
                'slide-down': {
                    from: { transform: 'translateY(-16px)', opacity: '0' },
                    to:   { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-bottom': {
                    from: { transform: 'translateY(100%)' },
                    to:   { transform: 'translateY(0)' },
                },
                'card-tilt-in': {
                    from: { transform: 'perspective(800px) rotateX(8deg) scale(0.95)', opacity: '0' },
                    to:   { transform: 'perspective(800px) rotateX(0deg) scale(1)', opacity: '1' },
                },
            },
            transitionDuration: {
                '1': '120ms',
                '2': '200ms',
                '3': '320ms',
                '4': '520ms',
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
                'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'out': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'emph': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            },
            borderRadius: {
                'xs': '0.375rem',
                'sm': '0.625rem',
                'md': '0.875rem',
                'lg': '1.125rem',
                'xl': '1.5rem',
                '2xl': '2rem',
            },
        },
    },
    plugins: [],
}

export default config
