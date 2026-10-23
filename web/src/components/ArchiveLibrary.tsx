"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { ArchiveCard } from "@/components/ArchiveCard";
import { archiveCategories, archiveEntries, type ArchiveCategory } from "@/lib/archive";

const categoryCopy: Record<ArchiveCategory, string> = {
  Principles: "Useful foundations for how you think and live.",
  Quotes: "Original thoughts to pause with and return to.",
  "Work ethic": "Practical ways to focus, follow through, and do good work.",
  Strategy: "Frameworks for clearer decisions and considered action.",
  Reflections: "Questions and perspectives for a more thoughtful life.",
};

export function ArchiveLibrary({ initialCategory = "All", preview = false }: { initialCategory?: string; preview?: boolean }) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams ? (searchParams.get("category") ?? "All") : initialCategory;
  const category = archiveCategories.includes(requestedCategory as ArchiveCategory) ? requestedCategory : "All";
  const [query, setQuery] = useState("");
  const entries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return archiveEntries.filter((entry) => (category === "All" || entry.category === category) && (!term || [entry.title, entry.description, entry.category, entry.quote || "", ...entry.paragraphs].join(" ").toLocaleLowerCase().includes(term)));
  }, [category, query]);
  const isPreview = preview && category === "All" && !query.trim();
  const visibleEntries = isPreview ? entries.filter((entry) => entry.featured).slice(0, 3) : entries;

  function selectCategory(next: string) {
    const url = new URL(window.location.href);
    if (next === "All") url.searchParams.delete("category");
    else url.searchParams.set("category", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <section id="archive" className="archive-library archive-wrap" aria-labelledby="archive-title">
      <div id="collections" className="archive-section-top">
        <div><p className="editorial-kicker">EXPLORE THE COLLECTION</p><h2 id="archive-title">{preview ? "A little perspective goes a long way." : "Browse the library."}</h2></div>
        <p className="archive-section-description">{archiveEntries.length} short reads. Five subjects.<br />Something to put into practice.</p>
      </div>
      <div className="archive-tools">
        <div className="archive-filter-list" role="group" aria-label="Filter resources by collection">
          {["All", ...archiveCategories].map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => selectCategory(item)} className={`archive-filter ${category === item ? "is-active" : ""}`}>{item === "All" ? "All topics" : item}</button>)}
        </div>
        <div className="archive-search"><Search size={19} aria-hidden="true" /><label htmlFor="archive-search" className="sr-only">Search the archive</label><input id="archive-search" type="search" placeholder="Search for an idea…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button onClick={() => setQuery("")} aria-label="Clear search" type="button"><X size={17} /></button>}</div>
      </div>
      <div className="archive-results-line" aria-live="polite" aria-atomic="true"><span>{query ? `Results for “${query}”` : category === "All" ? (isPreview ? "Selected from the library" : "The complete collection") : categoryCopy[category as ArchiveCategory]}</span><span>{isPreview ? `${visibleEntries.length} of ${entries.length} resources` : `${entries.length} ${entries.length === 1 ? "resource" : "resources"}`}</span></div>
      {visibleEntries.length > 0 ? <div className="archive-grid">{visibleEntries.map((entry) => <ArchiveCard key={entry.slug} entry={entry} />)}</div> : <div className="archive-empty"><p className="editorial-kicker">TRY ANOTHER DIRECTION</p><h3>No matching reads.</h3><p>Try a broader phrase or browse a different subject.</p><button type="button" onClick={() => { setQuery(""); selectCategory("All"); }}>Show all resources <ArrowRight size={17} /></button></div>}
      {isPreview && <div className="archive-view-all"><Link href="/archive/" className="editorial-button editorial-button-outline">Browse all {archiveEntries.length} resources <ArrowRight size={17} aria-hidden="true" /></Link></div>}
      <div className="archive-endnote"><p>Read at your own pace. Return when you need a fresh perspective.</p><a href="#archive">Back to topics ↑</a></div>
    </section>
  );
}
