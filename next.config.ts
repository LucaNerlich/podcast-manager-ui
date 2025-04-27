import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['localhost'],
    },
};

export default nextConfig;
