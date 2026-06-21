// Generic scoring helpers shared across the assessment suite.
import type { Dimension, EngineOption } from "./types";

/** Standard 5-point Likert option set (value encoded by index 0..4 → 1..5). */
export const LIKERT_OPTIONS: EngineOption[] = [
  { label: "Strongly disagree" },
  { label: "Disagree" },
  { label: "Neutral" },
  { label: "Agree" },
  { label: "Strongly agree" },
];

/** Convert a Likert answer index (0..4) to a 1..5 value, honoring reverse-keyed items. */
export function likertValue(answerIndex: number, reverse: boolean): number {
  const raw = answerIndex + 1; // 1..5
  return reverse ? 6 - raw : raw;
}

export const ALL_DIMENSIONS: Dimension[] = [
  "dominion",
  "wisdom",
  "valor",
  "cunning",
  "craft",
  "eros",
  "depth",
  "wild",
];

export function emptyVector(): Record<Dimension, number> {
  return {
    dominion: 0,
    wisdom: 0,
    valor: 0,
    cunning: 0,
    craft: 0,
    eros: 0,
    depth: 0,
    wild: 0,
  };
}

/** Normalize raw dimension sums to 0..100 relative to the max present (keeps shape, avoids a flat 100). */
export function normalizeVector(
  raw: Record<Dimension, number>
): Record<Dimension, number> {
  const values = ALL_DIMENSIONS.map((d) => raw[d]);
  const max = Math.max(1, ...values);
  const out = emptyVector();
  for (const d of ALL_DIMENSIONS) {
    out[d] = Math.round((raw[d] / max) * 100);
  }
  return out;
}

/** Cosine similarity between two dimension vectors. */
export function cosine(
  a: Record<Dimension, number>,
  b: Record<Dimension, number>
): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const d of ALL_DIMENSIONS) {
    dot += a[d] * b[d];
    na += a[d] * a[d];
    nb += b[d] * b[d];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Pick the highest-scoring key from a record; deterministic tie-break by the provided order. */
export function topKey<K extends string>(
  scores: Record<K, number>,
  order: K[]
): K {
  let best = order[0];
  let bestVal = -Infinity;
  for (const k of order) {
    const v = scores[k] ?? 0;
    if (v > bestVal) {
      bestVal = v;
      best = k;
    }
  }
  return best;
}
