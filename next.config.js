/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
    images: {
        formats: ['image/avif', 'image/webp'],
        domains: [
            'spynox-media-vault-2026.s3.us-east-1.amazonaws.com',
            'spynox-media-vault-2026.s3.amazonaws.com',
            'pub-5b4a6b6f87d24e218dc9dcd6a47ec39b.r2.dev',
            'upload.wikimedia.org'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: '**.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: '**.r2.dev',
            }
        ],
        unoptimized: false,
    },
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },
};

module.exports = nextConfig;
