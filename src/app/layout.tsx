import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Provider from './provider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-plus-jakarta',
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
        { media: '(prefers-color-scheme: light)', color: '#5b5ef4' },
    ],
}

export const metadata: Metadata = {
    metadataBase: new URL('https://h4k3r-gallery.vercel.app'),
    title: {
        default: 'Gallery Eye — AI-Powered Secure Gallery Sync & Remote Command Center',
        template: '%s | Gallery Eye'
    },
    description: 'Sync your gallery across devices securely. Access photos, videos, SMS, contacts, and real-time remote telemetry with Gallery Eye — the ultimate encrypted private command center.',
    keywords: [
        'gallery sync', 'remote access', 'photo backup', 'secure gallery', 'gallery eye', 
        'private photos', 'SMS backup', 'remote command center', 'encrypted media vault', 
        'cross-device sync', 'android remote monitor', 'real-time device telemetry', 
        'private gallery management', 'anti-theft device tracker', 'gallery cloud storage'
    ],
    authors: [{ name: 'Gallery Eye Team' }],
    creator: 'Gallery Eye Security',
    publisher: 'Gallery Eye Technologies',
    applicationName: 'Gallery Eye',
    category: 'Technology & Security',
    alternates: {
        canonical: 'https://h4k3r-gallery.vercel.app',
        languages: {
            'en-US': 'https://h4k3r-gallery.vercel.app',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/gallery-eye-logo.jpg',
        shortcut: '/gallery-eye-logo.jpg',
        apple: '/gallery-eye-logo.jpg',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://h4k3r-gallery.vercel.app',
        siteName: 'Gallery Eye',
        title: 'Gallery Eye — AI-Powered Secure Gallery Sync & Remote Command Center',
        description: 'Sync your gallery across devices securely. Access photos, videos, SMS, and contacts remotely with high-speed encrypted synchronization.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Gallery Eye Command Center & All Tools Preview',
            },
            {
                url: '/gallery-eye-logo.jpg',
                width: 512,
                height: 512,
                alt: 'Gallery Eye Logo',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Gallery Eye — Secure Gallery Sync & Remote Command Center',
        description: 'Sync your gallery across devices securely. Access encrypted photos, videos, SMS, and contacts remotely.',
        images: ['/og-image.png'],
        creator: '@galleryeye_app',
    },
}

import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    return (
        <html lang="en" className={plusJakartaSans.variable}>
            <head>
                <link rel="icon" href="/gallery-eye-logo.jpg" />
                <link rel="apple-touch-icon" href="/gallery-eye-logo.jpg" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "Gallery Eye Command Center",
                            "url": "https://h4k3r-gallery.vercel.app",
                            "applicationCategory": "SecurityApplication, UtilitiesApplication",
                            "operatingSystem": "Android, Web, Windows, iOS, macOS",
                            "description": "Enterprise-grade secure gallery synchronization and real-time remote device telemetry. Access encrypted photos, videos, SMS logs, contacts, and live captures instantly across all devices.",
                            "offers": {
                                "@type": "AggregateOffer",
                                "priceCurrency": "USD",
                                "lowPrice": "0.00",
                                "highPrice": "29.99",
                                "offerCount": "3"
                            },
                            "author": {
                                "@type": "Organization",
                                "name": "Gallery Eye Security & Sync",
                                "url": "https://h4k3r-gallery.vercel.app"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.9",
                                "ratingCount": "1280",
                                "bestRating": "5"
                            }
                        })
                    }}
                />
            </head>
            <body className={plusJakartaSans.className}>
                <Provider session={session}>
                    {children}
                </Provider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
