import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ArchiveCard } from "@/components/ArchiveCard";
import { SuccessEmpireActions } from "@/components/SuccessEmpireActions";
import { PartneredWith } from "@/components/Partners";
import { archiveCategories, archiveEntries } from "@/lib/archive";
import { getArchiveArtwork } from "@/lib/archive-art";

export const metadata: Metadata = {
  title: { absolute: "Success Empire — Apply to join · Imperium" },
  description: "Apply to join Success Empire. Share what you want to build or change, start a conversation, and explore Imperium’s open library of principles and practical ideas.",
  alternates: { canonical: "https://secretimperium.com/" },
  openGraph: { title: "Success Empire · Imperium", description: "Build with intention. Apply to join Success Empire and start the conversation.", url: "https://secretimperium.com/", siteName: "Imperium", type: "website", images: [{ url: "https://secretimperium.com/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Success Empire — Build with intention. Apply to join." }] },
  twitter: { card: "summary_large_image", title: "Success Empire · Imperium", description: "Build with intention. Apply to join Success Empire and start the conversation.", images: ["https://secretimperium.com/twitter-image"] },
};

const featuredSlugs = ["law-of-deliberate-action", "compounding-discipline", "find-the-real-constraint"];
const topicDescriptions: Record<string, string> = { Principles: "Foundations for a considered life.", Quotes: "A few words. A fresh perspective.", "Work ethic": "The craft of doing good work.", Strategy: "Frameworks for clearer decisions.", Reflections: "Pause, reconsider, and grow." };

export default function Home() {
  const featured = featuredSlugs.map((slug) => archiveEntries.find((entry) => entry.slug === slug)!);
  return <div className="archive-site">
    <section className="luxury-hero success-empire-home" aria-labelledby="home-title">
      <Image className="luxury-hero-background" src="/editorial/hero-acropolis-v1.webp" alt="A monumental Greek colonnade overlooking a sunlit Mediterranean landscape" fill priority sizes="100vw" />
      <div className="luxury-hero-shade" />
      <div className="archive-wrap luxury-hero-content"><p className="editorial-kicker">IMPERIUM / SUCCESS EMPIRE</p><h1 id="home-title">Success Empire<span>.</span></h1><p className="luxury-hero-deck">Build with intention.<br /><em>Begin with a conversation.</em></p><p className="luxury-hero-description">Apply to join Success Empire. Tell us who you are, what you’re working toward, and what you’d like to build or change.</p><SuccessEmpireActions area="home-hero" light /><div className="luxury-hero-footnote"><span>{archiveEntries.length} READINGS</span><span>5 SUBJECTS</span><span>THE ARCHIVE IS OPEN</span></div></div>
      <div className="luxury-hero-caption">TIMELESS IDEAS. EVERYDAY PRACTICE.</div>
    </section>

    <PartneredWith />

    <section className="editorial-featured archive-wrap" aria-labelledby="featured-title"><div className="archive-section-top"><div><p className="editorial-kicker">SELECTED FROM THE ARCHIVE</p><h2 id="featured-title">Three places to begin.</h2></div><p className="archive-section-description">A principle to live by. A standard to build.<br className="hidden sm:block" /> A clearer way to see the next step.</p></div><div className="archive-grid featured-archive-grid">{featured.map((entry) => <ArchiveCard key={entry.slug} entry={entry} />)}</div><div className="archive-view-all"><Link href="/archive/" className="editorial-button editorial-button-outline">See the full archive <ArrowRight size={18} aria-hidden="true" /></Link><span>{archiveEntries.length} resources across five subjects</span></div></section>

    <section id="collections" className="editorial-collections" aria-labelledby="collections-title"><div className="archive-wrap"><div className="archive-section-top"><div><p className="editorial-kicker">FOLLOW YOUR CURIOSITY</p><h2 id="collections-title">A subject for every season.</h2></div><p className="archive-section-description">Pick what speaks to where you are.</p></div><div className="editorial-topics">{archiveCategories.map((category) => { const entries = archiveEntries.filter((entry) => entry.category === category); const art = getArchiveArtwork(entries[0]); return <Link key={category} href={`/archive/?category=${encodeURIComponent(category)}`} className="editorial-topic"><div className="editorial-topic-image"><Image src={art.src} alt={art.alt} fill sizes="(max-width: 640px) 50vw, 20vw" /></div><div className="editorial-topic-title"><h3>{category}</h3><ArrowUpRight size={17} aria-hidden="true" /></div><p>{topicDescriptions[category]}</p><span>{entries.length} readings</span></Link>; })}</div></div></section>

    <section className="editorial-closing"><Image src="/editorial/principles/compounding-discipline.webp" alt="" fill sizes="100vw" /><div className="editorial-closing-shade" /><div className="archive-wrap editorial-closing-content"><p className="editorial-kicker">JOIN SUCCESS EMPIRE</p><h2>A deliberate move.<br /><em>A new conversation.</em></h2><p>What do you want to build next? Share your direction in a short application, or text us to learn more about Success Empire.</p><SuccessEmpireActions area="home-closing" light /></div></section>
  </div>;
}
