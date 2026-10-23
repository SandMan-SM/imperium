// EQ Test — emotional intelligence across 5 domains. 15 Likert items, 3 per domain.
import { LIKERT_OPTIONS, likertValue } from "./engine";
import type { AssessmentMeta, EngineQuestion, EqDomain, EqResult } from "./types";

export const meta: AssessmentMeta = {
  slug: "eq",
  title: "EQ Assessment",
  tagline: "How well you read, regulate, and rule your inner world.",
  blurb:
    "Fifteen statements measure five domains of emotional intelligence: self-awareness, self-regulation, motivation, empathy, and social skill.",
  durationLabel: "3–4 min",
  questionCount: 15,
  icon: "HeartPulse",
};

const DOMAIN_LABEL: Record<EqDomain, string> = {
  self_awareness: "Self-Awareness",
  self_regulation: "Self-Regulation",
  motivation: "Motivation",
  empathy: "Empathy",
  social: "Social Skill",
};

interface EQItem {
  id: string;
  domain: EqDomain;
  prompt: string;
  reverse: boolean;
}

const ITEMS: EQItem[] = [
  { id: "e1", domain: "self_awareness", reverse: false, prompt: "I can name what I'm feeling, even in the middle of it." },
  { id: "e2", domain: "self_awareness", reverse: true, prompt: "My moods often catch me by surprise." },
  { id: "e3", domain: "self_awareness", reverse: false, prompt: "I know which situations tend to set me off." },
  { id: "e4", domain: "self_regulation", reverse: false, prompt: "When I'm angry, I can pause before I act." },
  { id: "e5", domain: "self_regulation", reverse: true, prompt: "Under pressure I tend to say things I regret." },
  { id: "e6", domain: "self_regulation", reverse: false, prompt: "I can stay composed when plans fall apart." },
  { id: "e7", domain: "motivation", reverse: false, prompt: "I keep working toward goals even when it stops being fun." },
  { id: "e8", domain: "motivation", reverse: true, prompt: "I lose momentum the moment something gets hard." },
  { id: "e9", domain: "motivation", reverse: false, prompt: "Setbacks make me more determined, not less." },
  { id: "e10", domain: "empathy", reverse: false, prompt: "I can usually tell how someone feels before they say it." },
  { id: "e11", domain: "empathy", reverse: true, prompt: "I find it hard to see things from another person's side." },
  { id: "e12", domain: "empathy", reverse: false, prompt: "People feel understood after talking with me." },
  { id: "e13", domain: "social", reverse: false, prompt: "I can defuse tension between people." },
  { id: "e14", domain: "social", reverse: true, prompt: "I struggle to influence people toward a shared goal." },
  { id: "e15", domain: "social", reverse: false, prompt: "I build rapport quickly, even with strangers." },
];

export const questions: EngineQuestion[] = ITEMS.map((q) => ({
  id: q.id,
  kicker: "How true is this of you?",
  prompt: q.prompt,
  options: LIKERT_OPTIONS,
}));

const DOMAINS: EqDomain[] = [
  "self_awareness",
  "self_regulation",
  "motivation",
  "empathy",
  "social",
];

function band(score: number): string {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Developing";
  return "Emerging";
}

const GROWTH_NOTE: Record<EqDomain, string> = {
  self_awareness: "Name the feeling as it rises — accuracy here makes every other domain easier.",
  self_regulation: "Build the pause between trigger and response; that gap is where power lives.",
  motivation: "Anchor to a reason bigger than the mood, and the hard days stop deciding for you.",
  empathy: "Listen for what isn't said; people follow those who make them feel seen.",
  social: "Turn rapport into direction — connection is only leverage when it moves people.",
};

export function score(answers: number[]): EqResult {
  const sums: Record<EqDomain, number> = {
    self_awareness: 0,
    self_regulation: 0,
    motivation: 0,
    empathy: 0,
    social: 0,
  };
  ITEMS.forEach((q, i) => {
    sums[q.domain] += likertValue(answers[i] ?? 2, q.reverse);
  });

  // 3 items per domain, value 1..5 → 3..15 → normalize to 0..100.
  const domainScores = DOMAINS.map((domain) => {
    const raw = sums[domain];
    const pct = Math.round(((raw - 3) / 12) * 100);
    return { domain, label: DOMAIN_LABEL[domain], score: Math.max(0, Math.min(100, pct)) };
  });

  const overall = Math.round(
    domainScores.reduce((a, d) => a + d.score, 0) / domainScores.length
  );

  const sorted = [...domainScores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return {
    overall,
    band: band(overall),
    domains: domainScores,
    strongest: { label: strongest.label, note: GROWTH_NOTE[strongest.domain] },
    weakest: { label: weakest.label, note: GROWTH_NOTE[weakest.domain] },
  };
}
