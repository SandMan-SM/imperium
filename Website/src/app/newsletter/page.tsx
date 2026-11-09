import Image from "next/image";
import {PUBLIC_NEWSLETTER_ARTICLES} from "@/lib/newsletter-public";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PartnerDirectory, PartneredWith } from "@/components/Partners";
import { MembershipCta } from "@/components/MembershipCta";
import "./newsletter.css";

/** Tenant-local public publications only. Legacy unscoped newsletters remain
 * excluded; partner and membership experiences retain their existing behavior. */
export default function NewsletterPage() {
  return (
    <div className="in-newsletter">
      <section className="in-hero in-wrap" aria-labelledby="newsletter-title">
        <div className="in-hero-copy">
          <p className="in-kicker">IMPERIUM / LETTERS &amp; PARTNERS</p>
          <h1 id="newsletter-title">The Imperium<br />Newsletter<span>.</span></h1>
          <p className="in-hero-description">Letters on clear thinking, meaningful work, and everyday life. A place for Imperium&apos;s published editions and the partners in our network.</p>
          <div className="in-hero-actions">
            <a href="#partners" className="in-button">Meet our partners <ArrowRight size={18} aria-hidden="true" /></a>
            <a href="#letters" className="in-text-link">Published letters <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <p className="in-archive-note">Looking for principles and practical resources? <Link href="/archive/">Explore The Archive.</Link></p>
        </div>
        <figure className="in-hero-figure">
          <div className="in-hero-image">
            <Image src="/editorial/collections/quotes.webp" alt="A classical marble bust and a closed vellum book in a Greek arched alcove overlooking the Mediterranean." fill priority sizes="(max-width: 800px) calc(100vw - 40px), 48vw" />
          </div>
          <figcaption>Imperium editorial artwork</figcaption>
        </figure>
      </section>

      <PartneredWith />

      <section id="letters" className="in-letters" aria-labelledby="letters-heading">
        <div className="in-wrap">
          <div className="in-section-heading">
            <div><p className="in-kicker">THE NEWSLETTER</p><h2 id="letters-heading">Published letters.</h2></div>
            <p>Perspectives to return to.<br />Ideas to put into practice.</p>
          </div>
          <div className="in-public-articles">
            {PUBLIC_NEWSLETTER_ARTICLES.map(article => <article className="in-public-card" key={article.slug}>
              <Link href={`/newsletter/${article.slug}/`} className="in-public-image" tabIndex={-1} aria-hidden="true"><Image src={article.image} alt="" width={article.imageWidth} height={article.imageHeight} sizes="(max-width:800px) calc(100vw - 40px), 420px"/></Link>
              <div><p className="in-kicker">{article.category} · <time dateTime={article.publishedAt}>November 9, 2026</time></p><h3><Link href={`/newsletter/${article.slug}/`}>{article.title}</Link></h3><p>{article.description}</p><Link href={`/newsletter/${article.slug}/`} className="in-paper-link">Read the article <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <MembershipCta id="membership" />

      <section id="partners" className="in-partner-directory" aria-labelledby="newsletter-partners-heading">
        <div className="in-wrap">
          <div className="in-section-heading">
            <div><p className="in-kicker">THE IMPERIUM NETWORK</p><h2 id="newsletter-partners-heading">Meet our partners.</h2></div>
            <p>Explore the businesses, creators, and organizations<br />featured alongside Imperium.</p>
          </div>
          <PartnerDirectory />
        </div>
      </section>
    </div>
  );
}
