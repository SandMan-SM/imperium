import type { Metadata } from "next";
import { ProductShowcase } from "@/components/ProductShowcase";
import { NewsletterOptin } from "@/components/NewsletterOptin";

export const metadata: Metadata = {
    title: "The Arsenal — Imperium Elite",
    description: "Physical manifestations of the Imperium directive. Wear the identity. Signal the doctrine.",
};

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hero */}
            <div className="relative border-b border-imperium-gold/20 pt-[84px] pb-10 sm:pb-14 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-imperium-gold/[0.04] rounded-full blur-[80px] pointer-events-none" />

                {/* Background Logo Backdrop */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none overflow-hidden">
                    <span className="text-[15rem] sm:text-[20rem] md:text-[30rem] font-bold tracking-tighter text-white">I</span>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6">
                    <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-imperium-gold text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Limited Production Run</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-6xl text-white mb-3 sm:mb-4 leading-tight" style={{ paddingTop: '6px' }}>
                        The <span className="font-display italic text-gold-gradient">Arsenal</span>
                    </h1>
                    <p className="text-white/40 font-light max-w-sm mx-auto text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
                        Physical manifestations of the Imperium directive. Wear the identity. Signal the doctrine.
                    </p>
                </div>
            </div>

            <ProductShowcase />

            {/* Daily Intelligence Newsletter */}
            <div className="py-16 sm:py-20 border-t border-imperium-gold/20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <NewsletterOptin />
                    <p className="text-center text-[10px] sm:text-[11px] text-white/20 font-bold tracking-widest uppercase mt-6">
                        Free to join · $20/month for full access · Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
}
