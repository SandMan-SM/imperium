/**
 * The words around Tyrone Ngouamo's coaching — who he is, how the work runs,
 * who it is for, and the referral offer.
 *
 * The offers themselves — their prices, their links, their catalogue rows —
 * live in `src/lib/coaching-offers.ts`, which is the one place their numbers
 * are written down. The membership price has the same owner in
 * `src/lib/membership.ts`.
 */

import { STRIPE_CHECKOUT_URL } from "@/lib/brand";
import {
    MEMBERSHIP_PRICE_MONTHLY_SPACED,
    REFERRAL_COMMISSION_LABEL,
    REFERRAL_COMMISSION_NOTE,
} from "@/lib/membership";

export const COACH = {
    name: "Tyrone Ngouamo",
    role: "Strength and nutrition coach",
    location: "Utah",
    image: "/people/tyrone.webp",
    imageAlt:
        "Tyrone Ngouamo — a monogram card in the Imperium house style, his name set in serif italic.",
    remote: "Remote worldwide",
} as const;

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
    membershipPrice: MEMBERSHIP_PRICE_MONTHLY_SPACED,
    membershipUrl: STRIPE_CHECKOUT_URL,
    commission: REFERRAL_COMMISSION_LABEL,
    commissionNote: REFERRAL_COMMISSION_NOTE,
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

