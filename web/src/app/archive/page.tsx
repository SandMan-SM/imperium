import type { Metadata } from "next";
import { ArchiveLibrary } from "@/components/ArchiveLibrary";
import { MembershipCta } from "@/components/MembershipCta";
import { archiveCategories } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Browse The Archive",
  description: "Browse 25 free resources on principles, original quotes, work ethic, strategy, and reflection. Choose a topic or search for an idea.",
  alternates: { canonical: "https://secretimperium.com/archive/" },
  openGraph: { title: "Browse The Archive · Imperium", description: "Short reads, practical ideas, and a little more perspective. Explore the full library.", url: "https://secretimperium.com/archive/", images: [{ url: "/archive/opengraph-image", width: 1200, height: 630, alt: "The Archive by Imperium — Browse the library" }] },
  twitter: { card: "summary_large_image", title: "The Archive · Imperium", description: "A free library of principles, perspective, and practice.", images: ["/archive/opengraph-image"] },
};

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = archiveCategories.includes(params.category as typeof archiveCategories[number]) ? params.category! : "All";
  return <div className="archive-site archive-dedicated"><div className="archive-wrap editorial-library-intro"><p className="editorial-kicker">THE IMPERIUM RESOURCE LIBRARY</p><h1>Find your next<br /><em>useful idea.</em></h1><p>Browse the collection by subject, or search for something on your mind.<br className="hidden md:block" /> Every resource is free to read, with a practical idea to take away.</p></div><ArchiveLibrary key={category} initialCategory={category} /><MembershipCta /></div>;
}
