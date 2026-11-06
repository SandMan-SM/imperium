import { MEMBERSHIP_PRICE_MONTHLY, MEMBERSHIP_PRICE_MONTHLY_SPACED } from "@/lib/membership";

/**
 * Single source of truth for brand facts. Never inline these in JSX —
 * import from here so price, links, and stats stay consistent site-wide.
 *
 * The price is derived from `lib/membership.ts`, which holds the number the
 * Stripe price is built from. It used to be written out here in two forms
 * and in half a dozen components, and nothing kept the copies agreeing.
 */
export const BRAND = {
    name: "Imperium",
    shortName: "Imperium",
    siteUrl: "https://secretimperium.com",
    founder: "Sitani Mafi",
    tagline: "Principles for life. Perspective for work.",
    description:
        "An open library of principles, quotes, work ethic, strategy, and reflections for a deliberate life.",
    priceMonthly: MEMBERSHIP_PRICE_MONTHLY,
    priceLabel: MEMBERSHIP_PRICE_MONTHLY_SPACED,
    subscriberCount: "2,800+",
} as const;

/** Canonical Stripe checkout link for the $20/month subscription. */
export const STRIPE_CHECKOUT_URL =
    "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07";
