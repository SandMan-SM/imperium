import type { ArchiveEntry } from "@/lib/archive";

const collectionArtwork: Record<string, { slug: string; alt: string }> = {
  Quotes: { slug: "quotes", alt: "A classical marble bust and a closed book in a Greek arched alcove" },
  "Work ethic": { slug: "work-ethic", alt: "Stone carving tools and carefully prepared blocks beneath a Greek colonnade" },
  Strategy: { slug: "strategy", alt: "An architectural temple plan and bronze compass on a marble table" },
  Reflections: { slug: "reflections", alt: "A still reflecting pool, a classical column, and an olive tree in a Greek courtyard" },
};
const principleAlt: Record<string, string> = {
  "law-of-deliberate-action": "A considered path of broad stone steps leading through a sunlit Greek doorway",
  "law-of-leverage": "A monumental Greek architrave supported by two balanced Doric columns",
  "identity-is-a-practice": "An unfinished classical marble bust with sculpting tools and stone fragments",
  "the-discipline-of-attention": "An aligned view through a Greek colonnade toward a single marble urn",
  "compounding-discipline": "A rhythmic sequence of classical columns and stone steps extending into the distance",
  "radical-ownership": "A single monumental column rising from a strong stone foundation",
  "purposeful-restriction": "A simple Greek doorway framing an olive tree and the sea beyond",
  "the-long-game": "A weathered Greek temple above an expansive Mediterranean landscape",
};

export function getArchiveArtwork(entry: ArchiveEntry): { src: string; alt: string; position?: string } {
  if (entry.category === "Principles") return { src: `/editorial/principles/${entry.slug}.png`, alt: principleAlt[entry.slug] || `Classical Greek architectural artwork for ${entry.title}` };
  const collection = collectionArtwork[entry.category];
  return { src: `/editorial/collections/${collection.slug}.png`, alt: collection.alt };
}
