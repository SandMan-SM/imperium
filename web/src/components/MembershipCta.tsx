import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { BRAND, STRIPE_CHECKOUT_URL } from "@/lib/brand";

/**
 * The membership call to action.
 *
 * The Archive is the free public surface. This block is the only place on
 * the live site that offers the paid tier, so it points at the canonical
 * Stripe payment link from `lib/brand.ts` — never a hardcoded URL — and
 * states exactly what the Stripe product sells, so the page and the
 * checkout page cannot disagree.
 */
const inclusions = [
  {
    title: "The 28 Principles curriculum",
    body: "The full core principles with reflection prompts, worked through in sequence.",
  },
  {
    title: "Weekly Insights",
    body: "A short letter each week on discipline, strategy, and the work in front of you.",
  },
  {
    title: "The Imperium community",
    body: "A network of people working on the same ideas, at the same level of intent.",
  },
  {
    title: "Optional accountability calls",
    body: "Monthly group calls for members who want their progress kept in check.",
  },
];

export function MembershipCta({ id = "membership" }: { id?: string }) {
  return (
    <section id={id} className="membership-cta" aria-labelledby={`${id}-title`}>
      <div className="archive-wrap membership-cta-grid">
        <div className="membership-cta-copy">
          <p className="editorial-kicker">IMPERIUM ELITE</p>
          <h2 id={`${id}-title`}>Go past the free library.</h2>
          <p>
            Every resource in The Archive stays free, forever. Membership adds the
            full curriculum, the weekly letter, the community, and the calls — for
            members who want to work through it rather than skim it.
          </p>
          <div className="membership-cta-actions">
            <a className="editorial-button" href={STRIPE_CHECKOUT_URL} data-track="membership_join" data-track-area="membership">
              Join Imperium Elite — {BRAND.priceMonthly}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link className="membership-cta-preview" href="/principles/">
              Preview the curriculum
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <span className="membership-cta-note">Secure checkout by Stripe. Cancel any time.</span>
          </div>
        </div>
        <ul className="membership-cta-list">
          {inclusions.map((item) => (
            <li key={item.title}>
              <Check size={15} aria-hidden="true" />
              <span>
                <strong>{item.title}</strong> — {item.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
