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
                base:     '#131417',
                surface:  { DEFAULT: '#18191c', hover: '#1c1d21', pressed: '#151618' },
                accent:   { DEFAULT: '#6366f1', hi: '#818cf8', lo: '#4f46e5' },
                success:  '#10b981',
                danger:   '#ef4444',
                warning:  '#f59e0b',
                fg:       { 1: '#f1f3f5', 2: '#9ca3af', 3: '#6b7280' },
            },
            boxShadow: {
                // Neumorphic Outer Shadows (Raised)
                'neo': '6px 6px 12px #0c0d0e, -6px -6px 12px #24252a',
                'neo-sm': '3px 3px 6px #0c0d0e, -3px -3px 6px #24252a',
                'neo-lg': '10px 10px 20px #0c0d0e, -10px -10px 20px #24252a',
                
                // Neumorphic Inner Shadows (Pressed)
                'neo-inner': 'inset 4px 4px 8px #0c0d0e, inset -4px -4px 8px #24252a',
                'neo-inner-sm': 'inset 2px 2px 4px #0c0d0e, inset -2px -2px 4px #24252a',
                
                // Accent glows
                'accent-glow': '0 0 20px rgba(99,102,241,0.4)',
                'success-glow': '0 0 20px rgba(16,185,129,0.4)',
                'danger-glow': '0 0 20px rgba(239,68,68,0.4)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            },
            animation: {
                'float': 'float 4s ease-in-out infinite',
                'fade-in': 'fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
                'pulse-soft': 'pulse-soft 2s infinite',
                'marquee': 'marquee 35s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { transform: 'translateY(20px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
        },
    },
    plugins: [],
}

export default config

