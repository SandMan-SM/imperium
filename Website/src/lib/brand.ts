/**
 * Single source of truth for brand facts. Never inline these in JSX —
 * import from here so price, links, and stats stay consistent site-wide.
 */
export const BRAND = {
    name: "Imperium",
    shortName: "Imperium",
    siteUrl: "https://secretimperium.com",
    founder: "Sitani Mafi",
    tagline: "Principles for life. Perspective for work.",
    description:
        "An open library of principles, quotes, work ethic, strategy, and reflections for a deliberate life.",
    priceMonthly: "$20/month",
    priceLabel: "$20 / month",
    subscriberCount: "2,800+",
} as const;

/** Canonical Stripe checkout link for the $20/month subscription. */
export const STRIPE_CHECKOUT_URL =
    "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07";
