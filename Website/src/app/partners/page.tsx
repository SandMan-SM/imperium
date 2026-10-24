import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PartnerDirectory } from "@/components/Partners";
import { partners } from "@/lib/partners";

const description = "Explore the businesses, creators, and organizations featured in the Imperium partner directory and newsletter, with their real brands and official websites.";

export const metadata: Metadata = {
  title: "Our Partners",
  description,
  alternates: { canonical: "https://secretimperium.com/partners/" },
  openGraph: {
    title: "Our Partners · Imperium",
    description,
    url: "https://secretimperium.com/partners/",
    siteName: "Imperium",
    type: "website",
    images: [{ url: "/partners/opengraph-image", width: 1200, height: 630, alt: "Our Partners · Imperium — a directory of businesses, creators, and organizations" }],
  },
  twitter: { card: "summary_large_image", title: "Our Partners · Imperium", description, images: ["/partners/opengraph-image"] },
};

export default function PartnersPage() {
  return (
    <div className="ip-partner-page">
      <section className="ip-partner-page-hero" aria-labelledby="partners-title">
        <Image src="/editorial/hero-acropolis-v1.webp" alt="" fill priority sizes="100vw" />
        <div className="ip-partner-page-hero-shade" />
        <div className="archive-wrap ip-partner-page-hero-inner">
          <p className="ip-partner-page-kicker">THE IMPERIUM DIRECTORY</p>
          <h1 id="partners-title">Our partners.</h1>
          <p className="ip-partner-page-intro">Businesses, creators, and organizations in our wider circle. Explore the same {partners.length} partners featured in the Imperium newsletter, and visit the work behind each name.</p>
        </div>
      </section>
      <section className="archive-wrap ip-partner-page-directory" aria-labelledby="directory-title">
        <div className="ip-partner-page-directory-heading">
          <h2 id="directory-title">The partner directory</h2>
          <p>{partners.length} brands and publications</p>
        </div>
        <PartnerDirectory />
        <div className="ip-partner-newsletter-note">
          <p>Every partner in the directory is also featured in the newsletter.</p>
          <Link href="/newsletter/">Explore the newsletter <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
