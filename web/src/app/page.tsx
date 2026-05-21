import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { WhyImperium } from "@/components/WhyImperium";
import { PrinciplesTeaser } from "@/components/PrinciplesTeaser";
import { Testimonials } from "@/components/Testimonials";
import { FeaturedProduct } from "@/components/FeaturedProduct";
import { NewsletterOptin } from "@/components/NewsletterOptin";
import { UrgencyBanner } from "@/components/SocialProofBar";
import { GoldDivider, MarqueeStrip } from "@/components/fx";
import HomeStatsStrip from "@/components/HomeStatsStrip";

export const metadata: Metadata = {
  title: "Imperium Elite — Build the Mind. Command the Future.",
  description: "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox. Join 2,400+ sovereign-minded operators for $20/month.",
  openGraph: {
    title: "Imperium Elite — Build the Mind. Command the Future.",
    description: "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox. Join 2,400+ sovereign-minded operators for $20/month.",
    type: "website",
    url: "https://imperium-green.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium Elite — Build the Mind. Command the Future.",
    description: "A structured 28-principle leadership framework. Daily intelligence delivered to your inbox.",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Urgency Banner Only */}
      <UrgencyBanner />

      {/* 1. Hero — cinematic entry */}
      <Hero />

      {/* Momentum strip — between hero and pillars */}
      <MarqueeStrip
        words={[
          "BUILD THE MIND",
          "COMMAND THE FUTURE",
          "THE DOCTRINE",
          "INTELLIGENCE NETWORK",
          "INNER CIRCLE",
        ]}
      />

      {/* 2. Why Imperium — 3 pillars */}
      <WhyImperium />

      <GoldDivider className="my-2" />

      {/* 3. The 28 Principles — teaser with paywall */}
      <PrinciplesTeaser />

      {/* 4. Stats — animated count strip */}
      <HomeStatsStrip />

      {/* 5. Testimonials — dual marquee */}
      <Testimonials />

      {/* 6. Featured Product — $20 subscription spotlight */}
      <FeaturedProduct />

      {/* 7. Newsletter optin */}
      <div id="newsletter">
        <NewsletterOptin />
      </div>

      {/* Add spacing above footer */}
      <div className="h-16"></div>

      <footer className="relative py-10">
        <GoldDivider className="absolute top-0 inset-x-0" width="max-w-5xl" />
        <div className="container mx-auto px-4 max-w-6xl pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xl font-bold tracking-[0.3em] text-imperium-gold uppercase mb-1">Imperium</div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Powered by Omni AI</p>
            </div>
            <nav className="flex flex-col items-center gap-4 text-xs text-white/40 uppercase tracking-widest">
              <a href="/28principles" className="hover:text-white transition-colors">28 Principles</a>
              <a href="/shop" className="hover:text-white transition-colors">Arsenal Shop</a>
              <a href="/#newsletter" className="hover:text-white transition-colors">Intelligence</a>
              <div className="flex gap-4 mt-2">
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              </div>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
