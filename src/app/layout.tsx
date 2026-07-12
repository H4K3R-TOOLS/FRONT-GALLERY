import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Provider from './provider'
import { Analytics } from '@vercel/analytics/next'

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
    title: 'Gallery Eye - Secure Gallery Sync & Remote Access',
    description: 'Sync your gallery across devices securely. Access photos, videos, SMS, and contacts remotely with Gallery Eye - the ultimate private gallery management tool.',
    keywords: ['gallery sync', 'remote access', 'photo backup', 'secure gallery', 'gallery eye', 'private photos'],
    authors: [{ name: 'Gallery Eye Team' }],
    creator: 'Gallery Eye',
    publisher: 'Gallery Eye',
    robots: 'index, follow',
    icons: {
        icon: 'https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png',
        shortcut: 'https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png',
        apple: 'https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://gallery-eye.vercel.app',
        siteName: 'Gallery Eye',
        title: 'Gallery Eye - Secure Gallery Sync & Remote Access',
        description: 'Sync your gallery across devices securely. Access photos, videos, SMS, and contacts remotely.',
        images: [
            {
                url: 'https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png',
                width: 512,
                height: 512,
                alt: 'Gallery Eye Logo',
            }
        ],
    },
    twitter: {
        card: 'summary',
        title: 'Gallery Eye - Secure Gallery Sync',
        description: 'Sync your gallery across devices securely. Access photos, videos, SMS remotely.',
        images: ['https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png'],
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
                <link rel="icon" href="https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png" />
                <link rel="apple-touch-icon" href="https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png" />
                <meta name="theme-color" content="#5b5ef4" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className={plusJakartaSans.className}>
                <Provider session={session}>
                    {children}
                </Provider>
                <Analytics />
            </body>
        </html>
    )
}
