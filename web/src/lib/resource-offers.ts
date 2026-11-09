/**
 * The offers the resource pages sell, and what they cost — the one place
 * those numbers are written down.
 *
 * Each offer's price was written down twice: once as a literal in the apply
 * section of the page, and once in the solution prose, in a sentence a
 * prospect reads. Two homes for one number means one of them is wrong the
 * day somebody edits it, and the site then contradicts itself about the
 * price of a service it is selling. **A number with two homes is a number
 * with no owner.**
 *
 * So the amounts live here, and everywhere else they appear is derived
 * from this file: the price in the apply section, the name of the offer
 * above it, and the prose, which carries a token — `{{price:partnership}}`
 * — that is filled in from here when the content is loaded.
 *
 * The prose is why this needs a module and not a constant. The sentence on
 * the partnership page names two offers: the one that page sells and the
 * one beside it. It cannot be written without knowing both prices, and a
 * price written into a content file is a price with a second home.
 *
 * A token that names an offer that does not exist is a broken build, not a
 * blank sentence.
 */

/** One offer, as the resource pages present it. */
export interface ResourceOffer {
  /** The name of the offer, as the apply section heads it. */
  offer: string;
  /** The amount, as a prospect reads it. */
  price: string;
}

/**
 * Every offer, by the kind of page it is sold from.
 *
 * The `utah-growth` page does not exist yet; it is listed so that the kind
 * has an answer of its own rather than falling through to the builder by
 * accident.
 */
const OFFERS = {
  builder: { offer: "Start your 3 month trial", price: "$1,500" },
  "utah-growth": { offer: "Start your 3 month trial", price: "$1,500" },
  "ai-partner": { offer: "AI Employees", price: "$100,000" },
  partnership: { offer: "Agentic Websites", price: "$50,000" },
} as const satisfies Record<string, ResourceOffer>;

/** The kinds of page an offer can be sold from. */
export type ResourceOfferKind = keyof typeof OFFERS;

/**
 * The offer sold from a page of this kind.
 *
 * An unknown kind falls back to the builder's offer, which is what the page
 * did before the prices had an owner.
 */
export function resourceOffer(kind?: string): ResourceOffer {
  if (kind && kind in OFFERS) return OFFERS[kind as ResourceOfferKind];
  return OFFERS.builder;
}

/**
 * Fills the offer tokens in a piece of text.
 *
 * `{{offer:partnership}}` and `{{price:partnership}}` become the offer's
 * name and its amount. An unknown kind throws: a build that stops is
 * better than a page that reads as though the price were free.
 */
export function fillText(text: string): string {
  return text.replace(
    /\{\{(offer|price):([a-z-]+)\}\}/g,
    (_match, field: string, kind: string) => {
      if (!(kind in OFFERS)) {
        throw new Error(`The content names an offer that does not exist: ${kind}`);
      }
      const entry = OFFERS[kind as ResourceOfferKind];
      return field === "price" ? entry.price : entry.offer;
    },
  );
}

/**
 * Fills the offer tokens everywhere in a value.
 *
 * The content is walked rather than patched, so no raw token can survive
 * somewhere nobody remembered to substitute.
 */
export function fillTokens<T>(value: T): T {
  if (typeof value === "string") return fillText(value) as unknown as T;
  if (Array.isArray(value)) {
    return value.map((entry) => fillTokens(entry)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const filled: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      filled[key] = fillTokens(entry);
    }
    return filled as unknown as T;
  }
  return value;
}
