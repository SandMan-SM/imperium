/**
 * Tyrone Ngouamo's coaching offers — the one place their numbers are written
 * down.
 *
 * Each offer carried its price in five places: the offer itself, the copy on
 * the referral page, the line in llms.txt, the script that created the Stripe
 * objects behind it, and the catalogue row the site sold from. They all
 * agreed, and nothing kept them agreeing. A price edited in one place and not
 * in the others leaves a checkout charging the old amount, and the buyer
 * finds out at the last step.
 *
 * So the amounts live here, in cents, and every word the site writes about
 * them is derived from these numbers: the price on the page, the name of the
 * catalogue row, the product Stripe shows, the line in llms.txt. The
 * catalogue and the Stripe account are copies of this file, and
 * `scripts/check_coaching_offers.mjs` proves that they still agree with it.
 *
 * The membership price has the same problem and the same answer — it lives in
 * `src/lib/membership.ts`, and nothing outside that file writes it out.
 *
 * This module holds no secrets and imports nothing, so the server pages, the
 * client components and the scripts beside the app can all read it. It uses
 * no syntax Node cannot strip, so a script can import it directly.
 */

/** A dollar figure without noise on it: "150", or "99.50" when it has cents. */
function dollars(cents: number): string {
  const value = cents / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** One coaching offer, in the form the site and the scripts both need. */
export interface CoachingOffer {
  /** The id the offer is sold under. */
  id: string;
  /** The catalogue row this offer is sold from. */
  catalogueId: string;
  /** What the buyer pays, in cents. */
  amountCents: number;
  /** The amount as the buyer reads it: "$150". */
  price: string;
  /** The amount as a number, for the machine-readable surfaces: "150". */
  priceNumber: string;
  /** The offer's name, without the amount. */
  label: string;
  /**
   * The name used where the offer is offered rather than sold — the share
   * card on the referral page, where the link is pasted into a message and
   * the shorter the better.
   */
  shareLabel: string;
  /** The name shown on the page. */
  name: string;
  /** The name the catalogue row and the Stripe product carry. */
  catalogueName: string;
  /** What the buyer pays, per interval. */
  priceNote: string;
  /** One line, plain. */
  summary: string;
  /** What is inside. */
  includes: string[];
  /** The Stripe payment link. This is the checkout. */
  checkoutUrl: string;
  /** The interval the price is billed on, when it is billed again. */
  recurring: "month" | null;
  /** The description the Stripe product carries. */
  description: string;
}

/** What an offer is written as, before the amounts are derived from it. */
interface CoachingOfferSeed {
  id: string;
  catalogueId: string;
  /** What the buyer pays, in cents. The one number this offer has. */
  amountCents: number;
  /** The name, without the amount. */
  label: string;
  /** The shorter name, for the share card. */
  shareLabel?: string;
  /** How the amount is worded after the name on the page. */
  pageAmountNote?: string;
  /** How the amount is worded after the name in the catalogue. */
  catalogueAmountNote?: string;
  priceNote: string;
  summary: string;
  includes: string[];
  checkoutUrl: string;
  recurring?: "month";
  description: string;
}

/**
 * Builds an offer from what it is written as.
 *
 * The amount is written once, in cents, and the name of the offer is built
 * from it — so the name cannot say one price while the checkout charges
 * another.
 */
function offer(seed: CoachingOfferSeed): CoachingOffer {
  const price = `$${dollars(seed.amountCents)}`;
  const named = (note?: string) =>
    note ? `${seed.label} — ${price} ${note}` : seed.label;

  return {
    id: seed.id,
    catalogueId: seed.catalogueId,
    amountCents: seed.amountCents,
    price,
    priceNumber: dollars(seed.amountCents),
    label: seed.label,
    shareLabel: seed.shareLabel ?? seed.label,
    name: named(seed.pageAmountNote),
    catalogueName: named(seed.catalogueAmountNote),
    priceNote: seed.priceNote,
    summary: seed.summary,
    includes: seed.includes,
    checkoutUrl: seed.checkoutUrl,
    recurring: seed.recurring ?? null,
    description: seed.description,
  };
}

/** An hour of training with Tyrone. */
export const PERSONAL_TRAINING = offer({
  id: "personal-training",
  catalogueId: "a6a2bf38-4462-44b4-ba6a-0b5d32243e05",
  amountCents: 15000,
  label: "Personal Training — 1 Hour with Tyrone",
  shareLabel: "Personal Training — 1 hour",
  priceNote: "one session",
  summary:
    "Sixty minutes working on your training — programming, form, and the accountability to keep showing up.",
  includes: [
    "A 60-minute session, in person in Utah or live by video",
    "Programming built around your goal, schedule and equipment",
    "Form coaching, with corrections you can use the same week",
    "Written session notes, so nothing lives only in memory",
    "A follow-up check-in after the session",
  ],
  checkoutUrl: "https://buy.stripe.com/dRm14mfOseDOgX9cTt5AQ0E",
  description:
    "60-minute session with Tyrone Ngouamo. Programming, form, accountability. In-person (Utah) or remote via video. Includes session notes and a follow-up check-in.",
});

/** The full meal plan, paid for in one go. */
export const CUSTOM_MEAL_PLAN = offer({
  id: "custom-meal-plan",
  catalogueId: "6159b3d4-71b3-466f-82e1-23447689d8a2",
  amountCents: 29700,
  label: "Custom Meal Plan — Full Build-Out",
  shareLabel: "Custom Meal Plan — full build-out",
  priceNote: "one payment",
  summary:
    "A plan you can actually cook on a normal week — every meal, the shopping list, and what to swap when life changes.",
  includes: [
    "An intake call to understand your goal, schedule and budget",
    "Macro targets set for your body and your day",
    "A meal-by-meal week, laid out plainly",
    "A grocery list you can take to the store",
    "A swap matrix — what to replace a meal with when you cannot stick to it",
    "A follow-up to adjust the plan once you have lived with it",
  ],
  checkoutUrl: "https://buy.stripe.com/cNi7sKau8fHSdKXcTt5AQ0F",
  description:
    "Intake call, macro target, meal-by-meal week, grocery list, swap matrix, and follow-up. Built around your goal, schedule, and budget.",
});

/** The same plan, spread over three monthly payments. */
export const MEAL_PLAN_PAYMENT_PLAN = offer({
  id: "meal-plan-payment-plan",
  catalogueId: "69ff6f01-06d8-44d1-8537-0e0cf9a2d7cf",
  amountCents: 9900,
  label: "Meal Plan Payment Plan",
  pageAmountNote: "a month",
  catalogueAmountNote: "x 3",
  priceNote: "a month, cancel any time",
  summary:
    "The same build-out, spread over three monthly payments. Nothing is owed after the third month.",
  includes: [
    "Everything in the full build-out, delivered on the same timeline",
    "One payment a month instead of one large one",
    "Cancel at any point — there is no contract after month three",
    "Billed by Stripe, with a receipt for every month",
  ],
  checkoutUrl: "https://buy.stripe.com/14AfZg8m0dzK36jdXx5AQ0G",
  recurring: "month",
  description:
    "Same Custom Meal Plan build-out, paid in three monthly installments. No long-term commitment after month three.",
});

/** Every coaching offer, in the order the page shows them. */
export const COACHING_OFFERS: CoachingOffer[] = [
  PERSONAL_TRAINING,
  CUSTOM_MEAL_PLAN,
  MEAL_PLAN_PAYMENT_PLAN,
];

/** The offer with this id, when there is one. */
export function coachingOffer(id: string): CoachingOffer | undefined {
  return COACHING_OFFERS.find((entry) => entry.id === id);
}
