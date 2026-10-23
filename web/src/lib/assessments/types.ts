// Shared types for the Imperium assessment suite.
// Four tests: personality (MBTI-style), iq, eq, archetype.

export type Slug = "personality" | "iq" | "eq" | "archetype";

export type Dichotomy = "EI" | "SN" | "TF" | "JP";
export type EqDomain =
  | "self_awareness"
  | "self_regulation"
  | "motivation"
  | "empathy"
  | "social";
export type Dimension =
  | "dominion"
  | "wisdom"
  | "valor"
  | "cunning"
  | "craft"
  | "eros"
  | "depth"
  | "wild";

/** The engine only needs prompt + option labels; richer payloads are read by each scorer. */
export interface EngineOption {
  label: string;
  /** Optional helper text shown under the label (e.g. Likert anchor). */
  hint?: string;
}
export interface EngineQuestion {
  id: string;
  prompt: string;
  /** Optional short framing above the prompt (e.g. "Scenario"). */
  kicker?: string;
  options: EngineOption[];
}

export interface AssessmentMeta {
  slug: Slug;
  title: string;
  tagline: string;
  /** One-line description for the hub card + intro screen. */
  blurb: string;
  durationLabel: string;
  questionCount: number;
  /** lucide-react icon name used on the hub. */
  icon: "Compass" | "Brain" | "HeartPulse" | "Sparkles";
  /** Shown on intro + result for legally-sensitive tests (IQ). */
  disclaimer?: string;
}

// ----- Result shapes (one per test) -----

export interface PersonalityResult {
  type: string; // e.g. "INTJ"
  nickname: string;
  axes: { axis: Dichotomy; letter: string; strength: number }[]; // strength 0-100
  summary: string;
  strengths: string[];
  blindSpots: string[];
  imperiumLine: string;
}

export interface IqResult {
  correct: number;
  total: number;
  rangeLabel: string; // e.g. "~110–125"
  band: string;
  percentileLine: string;
  categoryAccuracy: { category: string; correct: number; total: number }[];
  strongestStyle: string;
}

export interface EqResult {
  overall: number; // 0-100
  band: string;
  domains: { domain: EqDomain; label: string; score: number }[];
  strongest: { label: string; note: string };
  weakest: { label: string; note: string };
}

export interface ArchetypeResult {
  vector: Record<Dimension, number>; // 0-100 per dimension
  lineage: {
    name: string;
    category: string;
    essence: string;
  };
  archetypeCard: {
    name: string;
    meaning: string;
    personalLine: string;
  };
  oracle: {
    calling: string;
    pursuits: string[];
  };
  shadow: {
    creature: string;
    pattern: string;
    guidance: string;
  };
}

export type AnyResult =
  | { slug: "personality"; data: PersonalityResult }
  | { slug: "iq"; data: IqResult }
  | { slug: "eq"; data: EqResult }
  | { slug: "archetype"; data: ArchetypeResult };
