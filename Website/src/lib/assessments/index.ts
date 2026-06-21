// Registry for the assessment suite. The hub and the [slug] route read from here.
import type { AssessmentMeta, Slug } from "./types";
import * as personality from "./personality";
import * as iq from "./iq";
import * as eq from "./eq";
import * as archetype from "./archetype";

export const ASSESSMENT_MODULES = { personality, iq, eq, archetype } as const;

export const ASSESSMENTS: AssessmentMeta[] = [
  archetype.meta,
  personality.meta,
  eq.meta,
  iq.meta,
];

export const SLUGS: Slug[] = ["archetype", "personality", "eq", "iq"];

export function getMeta(slug: string): AssessmentMeta | undefined {
  return ASSESSMENTS.find((a) => a.slug === slug);
}
