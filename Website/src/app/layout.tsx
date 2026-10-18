import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Header } from "@/components/Header";
import { ArchiveFooter } from "@/components/ArchiveFooter";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import InboundTracker from "@/components/InboundTracker";
import { archiveEntries } from "@/lib/archive";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = "https://secretimperium.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Archive — Free Principles, Quotes & Resources · Imperium",
    template: "%s · Imperium",
  },
  description:
    `Explore ${archiveEntries.length} free resources on principles, quotes, work ethic, strategy, and reflection. A practical library for thinking, working, and living well. No account required.`,
  alternates: { canonical: SITE_URL },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    title: "The Archive — Free Principles, Quotes & Resources · Imperium",
    description:
      `Read ${archiveEntries.length} free resources on principles, quotes, work ethic, strategy, and reflection. Practical ideas for thinking, working, and living well.`,
    url: SITE_URL,
    siteName: "Imperium",
    type: "website",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Archive — Free Principles, Quotes & Resources · Imperium",
    description:
      `Read ${archiveEntries.length} free resources on principles, quotes, work ethic, strategy, and reflection. Practical ideas for thinking, working, and living well.`,
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Imperium",
  url: SITE_URL,
  description:
    "A free library of principles, quotes, and practical ideas for thinking, working, and living well.",
  founder: { "@type": "Person", name: "Sitani Mafi", url: "https://sitanimafi.com" },
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
      <body className="editorial-public">
        <Suspense fallback={null}>
          <InboundTracker />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-[calc(100vh-88px)] bg-[#f7f5ef] text-[#252820]">
              {children}
            </main>
            <ArchiveFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
