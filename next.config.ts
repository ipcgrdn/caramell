import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    localPatterns: [
      {
        pathname: '/screenshots/**',
      },
      {
        pathname: '/templates/thumbnails/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
};

export default nextConfig;
