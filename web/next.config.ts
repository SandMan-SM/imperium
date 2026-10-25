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
      // The curriculum moved out of the retired storefront and now lives at
      // /principles/, where the member surface and the free sample unit are.
      { source: "/28principles", destination: "/principles/", permanent: true },
      ...["assessments", "archetype", "personality", "iq", "eq", "shop", "account"].map((section) => ({
        source: `/${section}/:path*`, destination: "/archive/", permanent: false,
      })),
      // /login and /signup stay reachable. A member who has just paid needs
      // to open an account and sign back in — the membership is keyed to the
      // email used at checkout — and redirecting them to the archive left the
      // purchase with nowhere to land.
      ...["cart", "checkout", "subscribe", "portal"].map((section) => ({
        source: `/${section}`, destination: "/archive/", permanent: false,
      })),
    ];
  },
};

export default nextConfig;
