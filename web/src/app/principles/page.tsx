import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCta } from "@/components/MembershipCta";
import { PrinciplesLibrary } from "@/components/PrinciplesLibrary";

export const metadata: Metadata = {
  title: "The 28 Principles — the Imperium Elite curriculum",
  description:
    "The full Imperium Elite curriculum: twenty-eight principles in five phases, each with the lesson and a reflection to work through. Unit one is free to read.",
  alternates: { canonical: "https://secretimperium.com/principles/" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "The 28 Principles · Imperium Elite",
    description: "Twenty-eight principles in five phases, worked through in sequence. Unit one is free to read.",
    url: "https://secretimperium.com/principles/",
  },
  twitter: {
    card: "summary_large_image",
    title: "The 28 Principles · Imperium Elite",
    description: "Twenty-eight principles in five phases, worked through in sequence.",
  },
};

export default function PrinciplesPage() {
  return (
    <div className="archive-site">
      <section className="member-hero">
        <div className="archive-wrap">
          <p className="editorial-kicker">IMPERIUM ELITE · THE CURRICULUM</p>
          <h1>
            The 28 <em>Principles.</em>
          </h1>
          <p className="member-hero-deck">
            Twenty-eight principles in five phases — from purpose and identity to strategy and legacy. Each unit is a short
            lesson and a reflection you can put to work the same day.
          </p>
        </div>
      </section>

      <section className="archive-wrap member-section">
        <Suspense fallback={<div className="member-loading"><span>Loading the curriculum…</span></div>}>
          <PrinciplesLibrary />
        </Suspense>
      </section>

      <MembershipCta id="principles-membership" />
    </div>
  );
}
