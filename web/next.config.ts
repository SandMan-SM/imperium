import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Exclude API routes from the build
  async rewrites() {
    return [];
  },
};

export default nextConfig;
