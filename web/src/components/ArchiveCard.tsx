import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArchiveEntry } from "@/lib/archive";
import { getArchiveArtwork } from "@/lib/archive-art";

export function ArchiveCard({ entry }: { entry: ArchiveEntry }) {
  const artwork = getArchiveArtwork(entry);
  return <Link href={`/archive/${entry.slug}/`} className="archive-entry">
    <div className="archive-entry-image"><Image src={artwork.src} alt={artwork.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" /></div>
    <div className="archive-entry-content"><div className="archive-entry-top"><span className="archive-category">{entry.category}</span><span className="archive-number">No. {entry.number}</span></div><div className="archive-entry-body"><h3>{entry.title}</h3><p>{entry.description}</p></div><div className="archive-entry-bottom"><span>{entry.readingTime}</span><span className="archive-entry-read">Read the piece <ArrowUpRight size={18} aria-hidden="true" /></span></div></div>
  </Link>;
}
