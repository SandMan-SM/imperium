import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, MapPin, Video } from "lucide-react";

import { MembershipCta } from "@/components/MembershipCta";
import { COACH, FAQ, FOR_WHO, OFFERS, STEPS } from "@/lib/tyrone";

const SITE_URL = "https://secretimperium.com";
const PAGE_URL = `${SITE_URL}/tyronengouamo/`;

const description =
  "One-to-one coaching with Tyrone Ngouamo: a 60-minute training session, a meal-by-meal nutrition plan built around your real week, and a payment plan that spreads the cost. In person in Utah or live by video.";

export const metadata: Metadata = {
  title: "Coaching with Tyrone Ngouamo",
  description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Coaching with Tyrone Ngouamo · Imperium",
    description,
    url: PAGE_URL,
    siteName: "Imperium",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/tyronengouamo/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Tyrone Ngouamo — strength and nutrition coaching, through Imperium.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coaching with Tyrone Ngouamo · Imperium",
    description,
    images: [`${SITE_URL}/tyronengouamo/opengraph-image`],
  },
};

/**
 * The page states prices in one place — `lib/tyrone.ts` — and each offer's
 * button points at that offer's own Stripe payment link. The links are created
 * by `scripts/stripe_tyrone_offers.mjs`, which writes the same ids back onto
 * the catalogue rows, so the price on the page is the price charged.
 */
const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: COACH.name,
    jobTitle: COACH.role,
    description: `${COACH.name} coaches strength training and nutrition through Imperium.`,
    url: PAGE_URL,
    image: `${SITE_URL}${COACH.image}`,
    worksFor: { "@type": "Organization", name: "Imperium", url: SITE_URL },
    knowsAbout: ["Strength training", "Nutrition", "Meal planning", "Accountability coaching"],
};

const offerJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Coaching offers",
    itemListElement: OFFERS.map((offer) => ({
        "@type": "Offer",
        name: offer.name,
        description: offer.summary,
        price: offer.price.replace(/[^0-9.]/g, ""),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: offer.checkoutUrl,
        seller: { "@type": "Organization", name: "Imperium", url: SITE_URL },
    })),
};

export default function TyroneNgouamoPage() {
    return (
        <div className="archive-site">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
            />

            <section className="coaching-hero">
                <div className="archive-wrap coaching-hero-inner">
                    <div>
                        <p className="editorial-kicker">COACHING BY {COACH.name.toUpperCase()}</p>
                        <h1>
                            Train with <em>intent.</em>
                        </h1>
                        <p className="coaching-hero-deck">
                            Strength, nutrition, and someone who notices when you drift.
                        </p>
                        <p className="coaching-hero-copy">
                            {COACH.name} works one person at a time: an hour on the training floor, a
                            plan you can cook on a normal week, and follow-up that keeps the work
                            moving after the session ends. In person in {COACH.location}, or live by
                            video from anywhere.
                        </p>
                        <div className="coaching-hero-actions">
                            <a
                                className="editorial-button"
                                href={OFFERS[0].checkoutUrl}
                                data-track="tyrone_book_session"
                                data-track-area="coaching_hero"
                            >
                                Book a session — {OFFERS[0].price}
                                <ArrowRight size={18} aria-hidden="true" />
                            </a>
                            <Link className="editorial-hero-link" href="#offers">
                                See the three offers
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <div className="coaching-hero-facts">
                            <span className="inline-flex items-center gap-2">
                                <MapPin size={13} aria-hidden="true" /> In person — {COACH.location}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Video size={13} aria-hidden="true" /> {COACH.remote}
                            </span>
                            <span>Secure checkout by Stripe</span>
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

            <section id="offers" className="coaching-section" aria-labelledby="offers-title">
                <div className="archive-wrap">
                    <div className="coaching-heading">
                        <p className="editorial-kicker">THE OFFERS</p>
                        <h2 id="offers-title">Three ways to start. No packages, no contracts.</h2>
                        <p>
                            Buy the one that fits the problem in front of you. Every offer is a
                            single payment or a month you can stop, and every one of them comes with
                            the same thing in writing afterwards — so the work is yours to keep.
                        </p>
                    </div>

                    <div className="coaching-offers">
                        {OFFERS.map((offer) => (
                            <article key={offer.id} className="coaching-offer" id={offer.id}>
                                <div className="coaching-offer-head">
                                    <p className="coaching-offer-price">
                                        <strong>{offer.price}</strong>
                                        <span>{offer.priceNote}</span>
                                    </p>
                                    <h3>{offer.name}</h3>
                                    <p className="coaching-offer-summary">{offer.summary}</p>
                                </div>
                                <ul className="coaching-offer-list">
                                    {offer.includes.map((item) => (
                                        <li key={item}>
                                            <Check size={14} aria-hidden="true" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="coaching-offer-cta">
                                    <a
                                        className="editorial-button"
                                        href={offer.checkoutUrl}
                                        data-track="tyrone_offer_buy"
                                        data-track-area="coaching_offers"
                                    >
                                        Choose {offer.price}
                                        <ArrowRight size={17} aria-hidden="true" />
                                    </a>
                                    <p className="coaching-offer-note">
                                        Secure checkout by Stripe · {offer.priceNote}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="coaching-section coaching-section-alt" aria-labelledby="how-title">
                <div className="archive-wrap">
                    <div className="coaching-heading">
                        <p className="editorial-kicker">HOW IT WORKS</p>
                        <h2 id="how-title">Four steps, and none of them are a mystery.</h2>
                        <p>
                            The hardest part of coaching is usually not the session. It is knowing
                            what happens next. So here is the whole of it.
                        </p>
                    </div>
                    <ol className="coaching-steps">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="coaching-step">
                                <span>STEP {String(index + 1).padStart(2, "0")}</span>
                                <h3>{step.title}</h3>
                                <p>{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="coaching-section" aria-labelledby="who-title">
                <div className="archive-wrap">
                    <div className="coaching-heading">
                        <p className="editorial-kicker">WHO IT IS FOR</p>
                        <h2 id="who-title">If one of these is you, coaching is cheaper than another month of guessing.</h2>
                    </div>
                    <div className="coaching-columns">
                        {FOR_WHO.map((item) => (
                            <article key={item.title}>
                                <h3 className="font-serif text-[21px] font-normal leading-[1.3]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.75] text-[#6c6f63]">
                                    {item.body}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="coaching-section coaching-section-alt" aria-labelledby="faq-title">
                <div className="archive-wrap">
                    <div className="coaching-heading">
                        <p className="editorial-kicker">THE SMALL PRINT</p>
                        <h2 id="faq-title">Questions people actually ask.</h2>
                    </div>
                    <div className="coaching-faq">
                        {FAQ.map((entry) => (
                            <details key={entry.question}>
                                <summary>
                                    {entry.question}
                                    <ChevronDown size={18} aria-hidden="true" />
                                </summary>
                                <p>{entry.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="coaching-closing" aria-labelledby="referral-title">
                <div className="archive-wrap coaching-closing-inner">
                    <p className="editorial-kicker">SEND HIM TO SOMEONE</p>
                    <h2 id="referral-title">
                        Someone you know would get more out of an hour with Tyrone than a year of
                        <em> reading about it.</em>
                    </h2>
                    <p>
                        Share the coaching page, or share the membership that sits behind the same
                        principles. There is a share card and copyable links on the referral page.
                    </p>
                    <div className="coaching-hero-actions">
                        <Link className="editorial-button" href="/tyronengouamo/referral/">
                            Open the referral page
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <MembershipCta />
        </div>
    );
}
