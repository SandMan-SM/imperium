import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const description = "Imperium is a free collection of short essays, original quotes, and practical frameworks on clear thinking, work ethic, strategy and everyday life. Pick a subject, read a piece, and put an idea into practice.";

export const metadata: Metadata = {
  title: "About the Library",
  description,
  alternates: { canonical: "https://secretimperium.com/mission-statement/" },
  openGraph: {
    title: "A library for a thoughtful life. · Imperium",
    description,
    url: "https://secretimperium.com/mission-statement/",
    siteName: "Imperium",
    type: "website",
    images: [{ url: "https://secretimperium.com/opengraph-image", width: 1200, height: 630, alt: "Imperium — Free resources for clear thinking, better work, and everyday life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A library for a thoughtful life. · Imperium",
    description,
    images: ["https://secretimperium.com/opengraph-image"],
  },
};

const values = [
  {
    title: "Clear ideas.",
    body: "Each resource focuses on one useful subject. Expect plain language, a short read, and enough detail to understand the idea without having to work through a course.",
  },
  {
    title: "Something to try.",
    body: "Every piece includes a practical prompt. Use it to think through a decision, improve a working habit, or make a small change in your day.",
  },
  {
    title: "Free to explore.",
    body: "Read any resource without creating an account or paying for access. Browse by subject, search for a question, or return to a piece when you need it.",
  },
];

export default function MissionStatementPage() {
  return (
    <div className="editorial-about bg-[#191c1d] text-[#eee8dc]">
      <section className="about-header py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="mb-6 text-[13px] font-medium text-[#c0a76f]">About Imperium</p>
          <h1 className="max-w-4xl font-serif text-[clamp(2.7rem,6vw,5.2rem)] font-normal leading-[1.12] tracking-[-0.035em] text-[#eee8dc]">
            A library for a thoughtful life.
          </h1>
          <p className="mt-7 max-w-[750px] text-[18px] leading-[1.8] text-[#c0bfb6] sm:text-[20px]">
            {description}
          </p>
          <Link href="/archive" className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#c0a76f] px-6 py-3 text-[14px] font-medium text-[#191c1d] transition-colors hover:bg-[#d1b987]">
            Browse all resources <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <figure className="about-artwork mx-auto max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="relative aspect-[16/8] overflow-hidden rounded-sm bg-[#292d2c]">
          <Image src="/editorial/hero-acropolis-v1.webp" alt="Photographic artwork of an imagined Greek colonnade, with warm stone columns and bronze sunlight against charcoal shadows." fill priority sizes="(min-width: 1280px) 1152px, calc(100vw - 40px)" className="object-cover" />
        </div>
        <figcaption className="mt-3 text-[12px] text-[#aaa79e]">Imagined Greek architecture · Imperium editorial artwork</figcaption>
      </figure>

      <section aria-labelledby="about-resources-heading" className="about-paper bg-[#f7f5ef] text-[#252820]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-9 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <div>
            <p className="text-[13px] text-[#77754e]">What you will find</p>
            <h2 id="about-resources-heading" className="mt-4 max-w-sm font-serif text-3xl font-normal leading-[1.25] tracking-[-0.02em] sm:text-4xl">Useful reading, at your own pace.</h2>
            <p className="mt-5 max-w-sm text-[17px] leading-[1.8] text-[#666b60]">Start with a principle, a quote, or a subject you want to think about more clearly.</p>
          </div>
          <div className="divide-y divide-[#d7d7cd] border-t border-[#d7d7cd]">
            {values.map((value) => (
              <article key={value.title} className="py-7 first:pt-6 last:pb-0">
                <h3 className="font-serif text-2xl font-normal text-[#252820] sm:text-[28px]">{value.title}</h3>
                <p className="mt-3 text-[17px] leading-[1.8] text-[#666b60] sm:text-[18px]">{value.body}</p>
              </article>
            ))}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
