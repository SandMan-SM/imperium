import type { Metadata } from "next";
import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Join the Imperium inner circle. Get first access to the 28-principle framework, daily intelligence, and new drops — straight to your inbox.",
  alternates: { canonical: `${BRAND.siteUrl}/subscribe` },
  openGraph: {
    title: "Subscribe · Imperium Elite",
    description:
      "Join the Imperium inner circle. First access to the 28-principle framework, daily intelligence, and new drops.",
    url: `${BRAND.siteUrl}/subscribe`,
    siteName: "Imperium Elite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscribe · Imperium Elite",
    description:
      "Join the Imperium inner circle. First access, daily intelligence, and new drops.",
  },
  robots: { index: true, follow: true },
};

export default function SubscribePage() {
  return (
    <main className="fixed inset-0 z-[60] overflow-hidden bg-imperium-bg">
      {/* Brand background image + dark on-brand gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(240,200,90,0.12), transparent 55%), linear-gradient(180deg, rgba(3,7,18,0.82), rgba(3,7,18,0.95))",
        }}
      />
      {/* Film-grain texture */}
      <div className="texture-grain absolute inset-0 pointer-events-none" aria-hidden />

      {/* Centered vertical column */}
      <div className="relative h-full w-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-16 text-center">
          {/* Logo / wordmark — escape hatch to home */}
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.4em] text-gradient-gold uppercase transition-opacity hover:opacity-80"
          >
            Imperium
          </Link>

          {/* Accent kicker */}
          <span className="section-kicker mt-10">Join the inner circle</span>

          {/* Display headline */}
          <h1 className="text-display text-gradient-gold mt-5 text-4xl sm:text-5xl md:text-6xl">
            GET IN FIRST
          </h1>

          {/* Two-line description */}
          <p className="text-body mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
            First access to the 28-principle framework, daily strategic intelligence,
            and new drops — delivered straight to your inbox before anyone else.
          </p>

          {/* Inline subscribe form */}
          <SubscribeForm />
        </div>
      </div>
    </main>
  );
}
