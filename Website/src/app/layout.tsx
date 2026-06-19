import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import AdminPreviewDebug from "@/components/AdminPreviewDebug";
import InboundTracker from "@/components/InboundTracker";
import SponsorEmbed from "@/components/SponsorEmbed";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const SITE_URL = "https://secretimperium.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Imperium Elite — Build the Mind. Command the Future.",
    template: "%s · Imperium Elite",
  },
  description:
    "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox. Join 2,800+ sovereign-minded operators for $20/month.",
  alternates: { canonical: SITE_URL },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  openGraph: {
    title: "Imperium Elite — Build the Mind. Command the Future.",
    description:
      "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox. Join 2,800+ sovereign-minded operators for $20/month.",
    url: SITE_URL,
    siteName: "Imperium Elite",
    type: "website",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium Elite — Build the Mind. Command the Future.",
    description:
      "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Imperium Elite",
  url: SITE_URL,
  description:
    "Strategic intelligence platform. The 28-principle leadership framework. Daily dispatch.",
  founder: { "@type": "Person", name: "Sitani Mafi", url: "https://sitanimafi.live" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="imperium-org-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <InboundTracker />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <Header />
            <AdminPreviewDebug />
            {/* Offset main content by the fixed header height to avoid content being cut off */}
            <main className="pt-[72px] min-h-screen bg-imperium-bg">
              {children}
            </main>
            {/* Federation sponsor banner. Suppressed on commerce + account flows. */}
            <Suspense fallback={null}>
              <SponsorEmbed />
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
