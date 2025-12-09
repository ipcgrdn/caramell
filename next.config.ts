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
  },
};

export default nextConfig;
