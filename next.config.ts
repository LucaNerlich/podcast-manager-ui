import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        reactCompiler: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/apps',
                destination: '/',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
