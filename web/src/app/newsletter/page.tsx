import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Mail } from "lucide-react";
import { PartnerDirectory, PartneredWith } from "@/components/Partners";
import { MembershipCta } from "@/components/MembershipCta";
import "./newsletter.css";

/**
 * Read-only source audit, 2026-10-17:
 * federation.surfaces: secretimperium.com -> tenant_slug=imperium.
 * omni_businesses: slug=imperium, website=secretimperium.com,
 * id=18a15b57-11e2-4bed-bfd6-5694b344658a.
 * newsletter_posts has zero rows for that business. The legacy newsletters
 * table has no tenant ownership column; never use it as an all-brand feed here.
 * Keep this honest empty state until a tenant-scoped public publication
 * contract is verified. No auth, subscription capture, or database writes.
 */
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
          <div className="in-empty-state">
            <div className="in-empty-icon" aria-hidden="true"><Mail size={26} strokeWidth={1.2} /></div>
            <div className="in-empty-copy">
              <h3>No public letters are available yet.</h3>
              <p>There is still plenty to read in The Archive: short essays, original quotes, and practical ideas you can put to use today.</p>
              <Link href="/archive/" className="in-paper-link"><BookOpen size={18} aria-hidden="true" /> Browse The Archive <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
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
