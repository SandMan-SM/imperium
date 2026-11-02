import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { COACH, OFFERS } from "@/lib/tyrone";

const SITE_URL = "https://secretimperium.com";
const PAGE_URL = `${SITE_URL}/tyronengouamo/booked/`;

export const metadata: Metadata = {
  title: "You are booked",
  description:
    "Your coaching session or plan is paid for. Here is what happens next, and what to expect from Tyrone.",
  alternates: { canonical: PAGE_URL },
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    title: "The receipt is with you.",
    body: "Stripe has emailed the receipt for the payment. Keep it — it is the reference for anything that follows.",
  },
  {
    title: "Tyrone reaches out.",
    body: "You will get a message to set the date and the place — in person in Utah, or a video link if that is what you chose.",
  },
  {
    title: "You are given it in writing.",
    body: "Session notes after a session. A plan on paper after an intake call. Nothing that only exists in a conversation you will forget.",
  },
];

export default function BookedPage() {
  return (
    <div className="archive-site">
      <section className="coaching-closing">
        <div className="archive-wrap coaching-closing-inner">
          <p className="editorial-kicker">PAYMENT RECEIVED</p>
          <h2>
            You are in. Now the work
            <em> starts.</em>
          </h2>
          <p>
            Your place is held. {COACH.name} will be in touch about the session or the intake
            call — you do not need to do anything else to keep it.
          </p>
        </div>
      </section>

      <section className="coaching-section" aria-labelledby="next-title">
        <div className="archive-wrap">
          <div className="coaching-heading">
            <p className="editorial-kicker">WHAT HAPPENS NEXT</p>
            <h2 id="next-title">Three things, in order.</h2>
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

          <div className="mt-12 border-t border-[#d2d1c7] pt-8">
            <p className="editorial-kicker">IN THE MEANING</p>
            <ul className="mt-4 grid gap-3">
              {OFFERS.map((offer) => (
                <li key={offer.id} className="flex items-start gap-3 text-[14px] leading-[1.7] text-[#4f5449]">
                  <Check size={15} className="mt-1 shrink-0 text-[#92784e]" aria-hidden="true" />
                  <span>
                    {offer.name} — {offer.price} {offer.priceNote}.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] leading-[1.8] text-[#6c6f63]">
              If the wrong offer was charged, reply to the receipt email and it will be corrected
              and refunded. Nothing is lost by asking.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link className="editorial-button" href="/tyronengouamo/">
                Back to the coaching page
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="editorial-underlined" href="/archive/">
                Read something while you wait
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
