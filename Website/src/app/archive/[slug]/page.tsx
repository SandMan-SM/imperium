import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { archiveEntries, getArchiveEntry } from "@/lib/archive";
import { getArchiveArtwork } from "@/lib/archive-art";

const SITE_URL = "https://secretimperium.com";

export const dynamicParams = false;

type ArchivePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return archiveEntries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getArchiveEntry(slug);

  if (!entry) return { title: "Entry not found", robots: { index: false } };

  const title = `${entry.title} | The Archive`;
  const url = `${SITE_URL}/archive/${entry.slug}/`;
  const image = {
    url: `${url}opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${entry.title} — an original ${entry.category.toLowerCase()} entry in The Archive by Imperium`,
    type: "image/png",
  };

  return {
    title,
    description: entry.description,
    alternates: { canonical: url },
    authors: [{ name: "Imperium editorial" }],
    openGraph: {
      title,
      description: entry.description,
      url,
      siteName: "Imperium",
      type: "article",
      authors: ["Imperium editorial"],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: entry.description,
      images: [image],
    },
  };
}

export default async function ArchiveEntryPage({ params }: ArchivePageProps) {
  const { slug } = await params;
  const entry = getArchiveEntry(slug);
  if (!entry) notFound();
  const artwork = getArchiveArtwork(entry);

  const related = [
    ...archiveEntries.filter((item) => item.category === entry.category && item.slug !== slug),
    ...archiveEntries.filter((item) => item.category !== entry.category),
  ].slice(0, 3);

  return (
    <div className="editorial-reading bg-[#191c1d] text-[#eee8dc]">
      <article className="reading-article">
        <header className="reading-header mx-auto max-w-6xl px-5 pb-10 pt-5 sm:px-8 sm:pb-12 sm:pt-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex min-h-11 items-center gap-2 text-[13px] text-[#aaa79e] sm:mb-10">
            <Link href="/archive" className="inline-flex min-h-11 items-center transition-colors hover:text-[#eee8dc]">The Archive</Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-[#c0a76f]" aria-hidden="true" />
            <span>Entry {entry.number}</span>
          </nav>
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
            <Link href={`/archive?category=${encodeURIComponent(entry.category)}`} className="font-medium text-[#c0a76f] underline-offset-4 hover:underline">{entry.category}</Link>
            <span className="text-[#696b67]" aria-hidden="true">/</span>
            <span className="text-[#aaa79e]">{entry.readingTime}</span>
          </div>
          <h1 className="max-w-4xl font-serif text-[clamp(2.4rem,5.5vw,4.5rem)] font-normal leading-[1.13] tracking-[-0.035em] text-[#eee8dc]">{entry.title}</h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-[1.7] text-[#c0bfb6] sm:text-[20px]">{entry.description}</p>
          <p className="mt-7 text-[13px] text-[#aaa79e]">By Imperium editorial <span aria-hidden="true" className="px-1">·</span> Original writing</p>
        </header>

        <figure className="reading-artwork mx-auto max-w-6xl px-5 pb-9 sm:px-8 sm:pb-12">
          <div className="relative aspect-[20/11] overflow-hidden rounded-sm bg-[#292d2c]">
            <Image src={artwork.src} alt={artwork.alt} fill priority sizes="(min-width: 1280px) 1152px, calc(100vw - 40px)" className="object-cover" style={{ objectPosition: artwork.position ?? "center" }} />
          </div>
          <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[12px] text-[#aaa79e]">
            <span>{entry.category}</span><span>Imperium editorial artwork</span>
          </figcaption>
        </figure>

        <div className="reading-paper mx-auto max-w-[800px] bg-[#f7f5ef] px-5 pb-12 pt-9 text-[#252820] sm:px-10 sm:pb-16 sm:pt-12">
          {entry.quote && (
            <figure className="mb-9 border-l-2 border-[#a5a184] py-1 pl-5 sm:mb-11 sm:pl-7">
              <blockquote className="font-serif text-[25px] leading-[1.5] text-[#4d513e] sm:text-[30px]">“{entry.quote}”</blockquote>
              <figcaption className="mt-4 text-[12px] text-[#666b60]">An original Imperium quote</figcaption>
            </figure>
          )}
          <div className="space-y-6 text-[18px] leading-[1.85] text-[#3f4439] sm:space-y-7 sm:text-[19px]">
            {entry.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <section aria-labelledby="practice-heading" className="mt-10 rounded-lg border border-[#d7d7cd] bg-[#eeeee4] p-6 sm:mt-12 sm:p-8">
            <h2 id="practice-heading" className="font-serif text-2xl font-normal text-[#252820]">Put it into practice</h2>
            <p className="mt-4 text-[17px] leading-[1.8] text-[#4b5144] sm:text-[18px]">{entry.practice}</p>
          </section>
          <Link href="/archive" className="mt-8 inline-flex min-h-11 items-center gap-3 text-[14px] text-[#666b60] transition-colors hover:text-[#252820]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />Browse all resources
          </Link>
        </div>
      </article>

      <section aria-labelledby="related-heading" className="reading-related mt-12 border-t border-[#41453f] sm:mt-16">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <h2 id="related-heading" className="font-serif text-3xl font-normal tracking-[-0.02em] text-[#eee8dc] sm:text-4xl">Further reading</h2>
          <div className="mt-7 grid gap-8 md:grid-cols-3">
            {related.map((item) => {
              const relatedArtwork = getArchiveArtwork(item);
              return (
                <Link key={item.slug} href={`/archive/${item.slug}`} className="group flex h-full flex-col">
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-sm bg-[#292d2c]">
                    <Image src={relatedArtwork.src} alt={relatedArtwork.alt} fill sizes="(min-width: 768px) 33vw, calc(100vw - 40px)" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" style={{ objectPosition: relatedArtwork.position ?? "center" }} />
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-[#c0a76f]">
                    <span>{item.category}</span><span className="text-[#aaa79e]">{item.readingTime}</span>
                  </div>
                  <h3 className="font-serif text-[25px] font-normal leading-[1.3] text-[#eee8dc] transition-colors group-hover:text-[#d1b987]">{item.title}</h3>
                  <p className="mt-3 text-[16px] leading-[1.7] text-[#aaa79e]">{item.description}</p>
                  <div className="mt-auto flex min-h-11 items-center gap-2 pt-4 text-[13px] text-[#c0a76f]">
                    <span>Read article</span><ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
