import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Public offers paused during the Archive rebrand; retain backing routes and APIs.
  async redirects() {
    return [
      { source: "/28principles", destination: "/archive/", permanent: true },
      ...["assessments", "archetype", "personality", "iq", "eq", "shop", "account"].map((section) => ({
        source: `/${section}/:path*`, destination: "/archive/", permanent: false,
      })),
      ...["cart", "checkout", "login", "signup", "subscribe", "portal"].map((section) => ({
        source: `/${section}`, destination: "/archive/", permanent: false,
      })),
    ];
  },
};

export default nextConfig;
