import type { MetadataRoute } from "next";

const SITE_URL = "https://secretimperium.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/admin",
          "/account",
          "/checkout",
          "/cart",
          "/portal/private",
          // A member's referral link is a personal URL — meant to be
          // followed by one person, never indexed.
          "/ref",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
