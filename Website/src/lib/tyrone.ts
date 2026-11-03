/**
 * Tyrone Ngouamo's coaching offers — the single source of truth.
 *
 * The three offers live in the `products` catalogue with their own Stripe
 * product, price and payment link. This module mirrors those rows so the
 * page can be rendered statically and so the price on the page is the price
 * the buyer is charged. Nothing here may drift from the catalogue: the
 * Stripe link is the checkout, so a stale copy here is a wrong price.
 *
 * `scripts/stripe_tyrone_offers.mjs` creates the Stripe objects and writes
 * their ids back to the catalogue rows.
 */

export const COACH = {
    name: "Tyrone Ngouamo",
    role: "Strength and nutrition coach",
    location: "Utah",
    image: "/people/tyrone.webp",
    imageAlt:
        "Tyrone Ngouamo — a monogram card in the Imperium house style, his name set in serif italic.",
    remote: "Remote worldwide",
} as const;

export interface CoachingOffer {
    /** Matches the `id` of the catalogue row. */
    id: string;
    name: string;
    /** Display price. The Stripe price is the same amount. */
    price: string;
    /** What the buyer pays, per interval. */
    priceNote: string;
    /** One line, plain. */
    summary: string;
    /** What is inside. */
    includes: string[];
    /** The Stripe payment link. This is the checkout. */
    checkoutUrl: string;
    /** The catalogue row, for the reference line. */
    catalogueId: string;
}

export const OFFERS: CoachingOffer[] = [
    {
        id: "personal-training",
        name: "Personal Training — 1 Hour with Tyrone",
        price: "$150",
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
        catalogueId: "a6a2bf38-4462-44b4-ba6a-0b5d32243e05",
    },
    {
        id: "custom-meal-plan",
        name: "Custom Meal Plan — Full Build-Out",
        price: "$297",
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
        catalogueId: "6159b3d4-71b3-466f-82e1-23447689d8a2",
    },
    {
        id: "meal-plan-payment-plan",
        name: "Meal Plan Payment Plan — $99 a month",
        price: "$99",
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
        catalogueId: "69ff6f01-06d8-44d1-8537-0e0cf9a2d7cf",
    },
];

export const STEPS = [
    {
        title: "You buy the session.",
        body: "Checkout takes a minute. Your place is held the moment the payment clears, and you land on a page that says exactly what happens next.",
    },
    {
        title: "Tyrone reaches out.",
        body: "You get a message to set the date, the location or the video link, and — for a plan — an intake call before anything is written.",
    },
    {
        title: "The work starts.",
        body: "A session, or a plan built around your actual week. You are given it in writing, not just talked through once.",
    },
    {
        title: "It is checked.",
        body: "Session notes after a session. A follow-up after a plan. The point is not a purchase — it is a change you can keep.",
    },
] as const;

export const FOR_WHO = [
    {
        title: "You have started before and stopped.",
        body: "Most people do not need more information. You need someone who notices when you drift, and who says so.",
    },
    {
        title: "You are training without a plan.",
        body: "Sessions are spent guessing what to do next. An hour with a coach is cheaper than a month of the wrong programme.",
    },
    {
        title: "You are eating against a spreadsheet.",
        body: "A plan that assumes a perfect Tuesday is a plan that fails on a real Tuesday. This one is built to survive contact with your week.",
    },
] as const;

export const FAQ = [
    {
        question: "Is it in person or online?",
        answer: "Both. Tyrone trains in person in Utah and by video everywhere else. A video session is a full session — programming, form, and notes work the same over a screen.",
    },
    {
        question: "Do I need a membership to book?",
        answer: "No. The coaching offers are separate from the Imperium Elite membership and can be bought on their own.",
    },
    {
        question: "What happens after I pay?",
        answer: "You land on a confirmation page, and Tyrone messages you to set the session or the intake call. Nothing else is required from you to hold your place.",
    },
    {
        question: "Can I cancel the payment plan?",
        answer: "Yes. It is billed monthly by Stripe and you can cancel at any point. There is nothing owed after the third month.",
    },
    {
        question: "Is a refund available?",
        answer: "If a session has not been scheduled yet, tell us and the payment is returned. Once the session or the intake call has happened, the work has already been delivered.",
    },
] as const;

/**
 * The referral offer.
 *
 * The referral mechanic that now exists: a member's referral code lives in
 * their profile, the link they share carries that code, and the referral is
 * recorded against them when the person they referred takes the membership.
 * The commission is a share of that membership, written onto the referral
 * when the payment clears, and paid out by the Imperium team.
 *
 * The coaching offers are bought directly and carry no commission, so the
 * page does not imply one.
 */
export const REFERRAL = {
    membershipName: "Imperium Elite",
    membershipPrice: "$20 / month",
    membershipUrl: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
    commission: "30%",
    commissionNote: "30% of the membership — $6.00 on a $20.00 membership — paid once that membership's payment clears.",
    shareLine: "Strength, nutrition, and the principles behind both.",
    card: "/people/tyrone-referral-card.webp",
    cardAlt:
        "A share card for Imperium Elite coaching: the Imperium wordmark on a dark ground, with the line: train with intent.",
} as const;

export const REFERRAL_STEPS = [
    {
        title: "Share your link.",
        body: "Your referral link is in your member portal, with the card and the coaching page beside it. Send it the way you would send anything else worth reading.",
    },
    {
        title: "They take the membership.",
        body: "The referral is recorded when somebody opens your link and takes Imperium Elite. The coaching sessions and meal plans are bought directly, and carry no commission.",
    },
    {
        title: "The referral pays.",
        body: `${REFERRAL.commissionNote} Your portal shows every referral you have sent and everything you have earned.`,
    },
] as const;

