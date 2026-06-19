// Single coupling point for the assessment suite. To port the system to another
// site, this is the ONLY file you must edit — repoint these values at the new
// brand. On Imperium it sources from @/lib/brand.
import { BRAND, STRIPE_CHECKOUT_URL } from "@/lib/brand";

export interface AssessmentConfig {
  /** Where the post-result "join" CTA points. */
  ctaUrl: string;
  /** Label on the CTA button. */
  ctaLabel: string;
  /** Headline on the post-result CTA card. */
  ctaHeadline: string;
  /** Sub-text on the post-result CTA card. */
  ctaSubtext: string;
  /** Absolute site origin, used to build share links (no trailing slash). */
  siteUrl: string;
  /** Brand name used in share copy. */
  brandName: string;
}

export const ASSESSMENT_CONFIG: AssessmentConfig = {
  ctaUrl: STRIPE_CHECKOUT_URL,
  ctaLabel: `Join for ${BRAND.priceLabel}`,
  ctaHeadline: "This is the surface. Imperium is the system.",
  ctaSubtext:
    "Daily strategic intelligence and the 28 Principles — the operating system for the sovereign-minded.",
  siteUrl: BRAND.siteUrl,
  brandName: BRAND.shortName,
};
