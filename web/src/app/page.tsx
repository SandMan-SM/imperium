import { Hero } from "@/components/Hero";
import { WhyImperium } from "@/components/WhyImperium";
import { PrinciplesTeaser } from "@/components/PrinciplesTeaser";
import { Testimonials } from "@/components/Testimonials";
import { FeaturedProduct } from "@/components/FeaturedProduct";
import { NewsletterOptin } from "@/components/NewsletterOptin";
import { SocialProofBar, UrgencyBanner, SocialProofStats } from "@/components/SocialProofBar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Urgency Banner Only */}
      <UrgencyBanner />

      {/* 1. Hero — cinematic entry */}
      <Hero />

      {/* 2. Why Imperium — 3 pillars */}
      <WhyImperium />

      {/* 3. The 28 Principles — teaser with paywall */}
      <PrinciplesTeaser />

      {/* Updated Social Proof Stats with Metrics */}
      <SocialProofBar />

      {/* 4. Testimonials — dual marquee */}
      <Testimonials />

      {/* 5. Featured Product — $20 subscription spotlight */}
      <FeaturedProduct />

      {/* 6. Newsletter optin */}
      <div id="newsletter">
        <NewsletterOptin />
      </div>

      {/* Add spacing above footer */}
      <div className="h-16"></div>

      <footer className="py-10 border-t border-imperium-gold/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xl font-bold tracking-[0.3em] text-imperium-gold uppercase mb-1">Imperium</div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Powered by Omni AI</p>
            </div>
            <p className="text-xs text-white/40 max-w-md text-center leading-relaxed uppercase tracking-wide">
              Imperium exists to develop disciplined, strategic, and self-led individuals through structured principles of advanced human development.
            </p>
            <div className="flex flex-col items-end gap-2 text-xs text-white/40 uppercase tracking-widest">
              <a href="/28principles" className="hover:text-white transition-colors surface-card">28 Principles</a>
              <a href="/shop" className="hover:text-white transition-colors surface-card">Arsenal Shop</a>
              <a href="/#newsletter" className="hover:text-white transition-colors surface-card">Intelligence</a>
              <div className="flex gap-4 mt-2">
                <a href="/terms" className="hover:text-white transition-colors surface-card">Terms</a>
                <a href="/privacy" className="hover:text-white transition-colors surface-card">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
