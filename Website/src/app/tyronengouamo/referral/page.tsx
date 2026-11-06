import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { COACH, REFERRAL, REFERRAL_STEPS, OFFERS } from "@/lib/tyrone";
import { ReferralLinks } from "./ReferralLinks";

const SITE_URL = "https://secretimperium.com";
const PAGE_URL = `${SITE_URL}/tyronengouamo/referral/`;

const description =
  "Share Tyrone Ngouamo's coaching and the Imperium Elite membership with someone who would use them. A share card, copyable links, and how a referral is recorded.";

export const metadata: Metadata = {
  title: "Refer a friend",
  description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Refer a friend · Imperium",
    description,
    url: PAGE_URL,
    siteName: "Imperium",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/tyronengouamo/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Refer a friend to Imperium Elite coaching.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refer a friend · Imperium",
    description,
    images: [`${SITE_URL}/tyronengouamo/opengraph-image`],
  },
};

const SHARE_LINKS = [
    {
        label: "The coaching page",
        detail: "All three offers, in one place.",
        url: `${SITE_URL}/tyronengouamo/`,
    },
    {
        label: "Personal Training — 1 hour",
        detail: "$150, one session.",
        url: OFFERS[0].checkoutUrl,
    },
    {
        label: "Custom Meal Plan — full build-out",
        detail: "$297, one payment.",
        url: OFFERS[1].checkoutUrl,
    },
    {
        label: "Imperium Elite membership",
        detail: `${REFERRAL.membershipPrice} — the referral pays ${REFERRAL.commission} commission.`,
        url: REFERRAL.membershipUrl,
        // The membership is the offer that carries a commission, so this is
        // the link that is replaced with the member's own referral link.
        referral: true,
    },
];

export default function ReferralPage() {
    return (
        <div className="archive-site">
            <section className="coaching-hero">
                <div className="archive-wrap coaching-hero-inner">
                    <div>
                        <p className="editorial-kicker">REFER A FRIEND</p>
                        <h1>
                            Send him to <em>someone.</em>
                        </h1>
                        <p className="coaching-hero-deck">
                            Some people need a session, not a list of things to read.
                        </p>
                        <p className="coaching-hero-copy">
                            There is a share card below and links you can copy straight into a
                            message. Your referral link records the referral: when somebody takes
                            {REFERRAL.membershipName} through it, you earn {REFERRAL.commission} of
                            that membership.
                        </p>
                        <div className="coaching-hero-actions">
                            <Link className="editorial-button" href="/tyronengouamo/">
                                See the coaching page
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                    <figure className="coaching-hero-portrait">
                        <Image
                            src={COACH.image}
                            alt={COACH.imageAlt}
                            fill
                            priority
                            sizes="(min-width: 900px) 30vw, 90vw"
                            className="object-cover"
                        />
                    </figure>
                </div>
            </section>

            <section className="coaching-closing" aria-labelledby="share-title">
                <div className="archive-wrap coaching-closing-inner">
                    <p className="editorial-kicker">THE CARD</p>
                    <h2 id="share-title">
                        Share the card, or copy a link and say a sentence about why.
                    </h2>
                    <p>
                        Your referral link is what records the referral. The sentence is what makes
                        somebody actually open it.
                    </p>
                    <div className="coaching-share">
                        <figure className="coaching-share-card">
                            <Image
                                src={REFERRAL.card}
                                alt={REFERRAL.cardAlt}
                                fill
                                sizes="(min-width: 860px) 40vw, 92vw"
                                className="object-cover"
                            />
                        </figure>
                        <ReferralLinks staticLinks={SHARE_LINKS} />
                    </div>
                </div>
            </section>

            <section className="coaching-section" aria-labelledby="referral-steps-title">
                <div className="archive-wrap">
                    <div className="coaching-heading">
                        <p className="editorial-kicker">HOW A REFERRAL WORKS</p>
                        <h2 id="referral-steps-title">Three steps, and none of them cost you anything.</h2>
                    </div>
                    <ol className="coaching-steps">
                        {REFERRAL_STEPS.map((step, index) => (
                            <li key={step.title} className="coaching-step">
                                <span>STEP {String(index + 1).padStart(2, "0")}</span>
                                <h3>{step.title}</h3>
                                <p>{step.body}</p>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-12 grid gap-8 border-t border-[#d2d1c7] pt-8 md:grid-cols-2">
                        <div>
                            <p className="editorial-kicker">WHAT THEY GET</p>
                            <h3 className="mt-4 font-serif text-[26px] font-normal leading-[1.25]">
                                A full membership, or one good hour.
                            </h3>
                            <p className="mt-4 text-[14.5px] leading-[1.85] text-[#6c6f63]">
                                {REFERRAL.membershipName} is {REFERRAL.membershipPrice}: the 28
                                Principles curriculum, the weekly letter, the community, and the
                                accountability calls. The coaching offers are separate, and can be
                                bought on their own.
                            </p>
                        </div>
                        <div>
                            <p className="editorial-kicker">WHAT YOU GET</p>
                            <h3 className="mt-4 font-serif text-[26px] font-normal leading-[1.25]">
                                {REFERRAL.commission} commission on a membership.
                            </h3>
                            <p className="mt-4 text-[14.5px] leading-[1.85] text-[#6c6f63]">
                                {REFERRAL.commissionNote} Your member portal shows every referral you
                                have sent and everything you have earned. Coaching sessions and meal
                                plans are bought directly and carry no commission — so the page does
                                not promise one.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-5">
                        <Link className="editorial-button" href="/tyronengouamo/">
                            Back to the coaching page
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link className="editorial-underlined" href="/archive/">
                            Read something while you wait
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
