import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ArchiveCard } from "@/components/ArchiveCard";
import { PartneredWith } from "@/components/Partners";
import { archiveCategories, archiveEntries } from "@/lib/archive";
import { getArchiveArtwork } from "@/lib/archive-art";

export const metadata: Metadata = {
  title: { absolute: "The Archive — Principles, perspective & practice · Imperium" },
  description: "A free library of principles, original quotes, and practical ideas for thinking clearly, working well, and living with intention. Choose a topic and start reading.",
  alternates: { canonical: "https://secretimperium.com/" },
  openGraph: { title: "The Archive · Imperium", description: "Principles, perspective, and practice. A free library for the way you think, work, and live.", url: "https://secretimperium.com/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Archive by Imperium — Principles, perspective and practice" }] },
  twitter: { card: "summary_large_image", title: "The Archive · Imperium", description: "A free library for the way you think, work, and live.", images: ["/twitter-image"] },
};

const featuredSlugs = ["law-of-deliberate-action", "compounding-discipline", "find-the-real-constraint"];
const topicDescriptions: Record<string, string> = { Principles: "Foundations for a considered life.", Quotes: "A few words. A fresh perspective.", "Work ethic": "The craft of doing good work.", Strategy: "Frameworks for clearer decisions.", Reflections: "Pause, reconsider, and grow." };

export default function Home() {
  const featured = featuredSlugs.map((slug) => archiveEntries.find((entry) => entry.slug === slug)!);
  return <div className="archive-site">
    <section className="luxury-hero" aria-labelledby="home-title">
      <Image className="luxury-hero-background" src="/editorial/hero-acropolis-v1.png" alt="A monumental Greek colonnade overlooking a sunlit Mediterranean landscape" fill priority sizes="100vw" />
      <div className="luxury-hero-shade" />
      <div className="archive-wrap luxury-hero-content"><p className="editorial-kicker">AN OPEN LIBRARY BY IMPERIUM</p><h1 id="home-title">The Archive<span>.</span></h1><p className="luxury-hero-deck">Principles for life.<br /><em>Perspective for work.</em></p><p className="luxury-hero-description">Short essays, original quotes, and practical ideas on discipline, clear thinking, and living well. Choose a subject. Find something useful. Put it into practice.</p><div className="luxury-hero-actions"><Link href="/archive/" className="editorial-button">Explore the archive <ArrowRight size={18} aria-hidden="true" /></Link><Link href="/archive/law-of-deliberate-action/" className="editorial-hero-link">Start with a principle <ArrowUpRight size={17} aria-hidden="true" /></Link></div><div className="luxury-hero-footnote"><span>{archiveEntries.length} READINGS</span><span>5 SUBJECTS</span><span>FREE TO EXPLORE</span></div></div>
      <div className="luxury-hero-caption">TIMELESS IDEAS. EVERYDAY PRACTICE.</div>
    </section>

    <PartneredWith />

    <section className="editorial-featured archive-wrap" aria-labelledby="featured-title"><div className="archive-section-top"><div><p className="editorial-kicker">SELECTED FROM THE ARCHIVE</p><h2 id="featured-title">Three places to begin.</h2></div><p className="archive-section-description">A principle to live by. A standard to build.<br className="hidden sm:block" /> A clearer way to see the next step.</p></div><div className="archive-grid featured-archive-grid">{featured.map((entry) => <ArchiveCard key={entry.slug} entry={entry} />)}</div><div className="archive-view-all"><Link href="/archive/" className="editorial-button editorial-button-outline">See the full archive <ArrowRight size={18} aria-hidden="true" /></Link><span>{archiveEntries.length} resources across five subjects</span></div></section>

    <section id="collections" className="editorial-collections" aria-labelledby="collections-title"><div className="archive-wrap"><div className="archive-section-top"><div><p className="editorial-kicker">FOLLOW YOUR CURIOSITY</p><h2 id="collections-title">A subject for every season.</h2></div><p className="archive-section-description">Pick what speaks to where you are.</p></div><div className="editorial-topics">{archiveCategories.map((category) => { const entries = archiveEntries.filter((entry) => entry.category === category); const art = getArchiveArtwork(entries[0]); return <Link key={category} href={`/archive/?category=${encodeURIComponent(category)}`} className="editorial-topic"><div className="editorial-topic-image"><Image src={art.src} alt={art.alt} fill sizes="(max-width: 640px) 50vw, 20vw" /></div><div className="editorial-topic-title"><h3>{category}</h3><ArrowUpRight size={17} aria-hidden="true" /></div><p>{topicDescriptions[category]}</p><span>{entries.length} readings</span></Link>; })}</div></div></section>

    <section className="editorial-closing"><Image src="/editorial/hero-acropolis-v1.png" alt="" fill sizes="100vw" /><div className="editorial-closing-shade" /><div className="archive-wrap editorial-closing-content"><p className="editorial-kicker">THE IDEA BEHIND IMPERIUM</p><h2>Read something.<br /><em>Live it a little.</em></h2><p>Good ideas earn their place in the way we think, work, and treat the world around us. The Archive brings them together—so you can find one worth taking with you.</p><Link href="/mission-statement/" className="editorial-underlined">About the library <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
  </div>;
}
