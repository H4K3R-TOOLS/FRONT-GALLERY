/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
    images: {
        formats: ['image/avif', 'image/webp'],
        domains: ['pub-5b4a6b6f87d24e218dc9dcd6a47ec39b.r2.dev', 'upload.wikimedia.org'],
        unoptimized: false,
    },
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },
};

module.exports = nextConfig;
