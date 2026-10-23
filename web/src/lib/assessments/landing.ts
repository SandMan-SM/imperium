// Education content for each test's landing page (/iq, /eq, /personality, /archetype).
// The landing page explains why the test matters; /[slug]/test runs the assessment.
import type { Slug } from "./types";

export interface LandingSection {
  heading: string;
  body: string;
}
export interface LandingMeasure {
  name: string;
  desc: string;
}
export interface LandingContent {
  promise: string; // hero sub-line
  why: LandingSection[];
  measuresTitle: string;
  measures: LandingMeasure[];
  closing: string;
}

export const LANDING: Record<Slug, LandingContent> = {
  iq: {
    promise:
      "Intelligence isn't one number — it's a profile. This shows you what you're sharp at, not a verdict on your worth.",
    why: [
      {
        heading: "A single score tells you almost nothing",
        body:
          "Reducing a mind to one number is how people get mislabeled. Two people with the same score can think in completely different ways. What actually matters is the shape of your reasoning — where you're fast, where you're deliberate, and how you solve.",
      },
      {
        heading: "Knowing your edge changes how you operate",
        body:
          "When you know your strongest mode of reasoning, you stop fighting your own wiring. You delegate the rest, lean into your edge, and put yourself in arenas where your specific intelligence wins.",
      },
      {
        heading: "This is a profile, not a sentence",
        body:
          "You'll get an indicative range, yes — but the real value is the breakdown across four kinds of reasoning. Nobody leaves here called \"dumb.\" You leave knowing what you're built to think about.",
      },
    ],
    measuresTitle: "The four layers we measure",
    measures: [
      { name: "Numerical & Sequential", desc: "Spotting the rule inside numbers and sequences." },
      { name: "Verbal & Analogical", desc: "Reasoning by relationship, language, and analogy." },
      { name: "Logical Deduction", desc: "Following premises to the only valid conclusion." },
      { name: "Pattern Recognition", desc: "Seeing the odd-one-out and the hidden structure." },
    ],
    closing: "Twelve problems. An estimated range, and a map of how your mind actually works.",
  },
  eq: {
    promise:
      "Emotional intelligence predicts leadership and relationships better than raw IQ — and unlike IQ, you can grow it.",
    why: [
      {
        heading: "EQ is the skill under every other skill",
        body:
          "How you read a room, regulate under pressure, and move people decides more outcomes than talent does. Most people never measure it, so they never improve it.",
      },
      {
        heading: "It's five distinct muscles",
        body:
          "Self-awareness, self-regulation, motivation, empathy, and social skill develop independently. You can be elite at one and untrained at another. Knowing which is which is the first move.",
      },
    ],
    measuresTitle: "The five domains",
    measures: [
      { name: "Self-Awareness", desc: "Naming what you feel as it happens." },
      { name: "Self-Regulation", desc: "The pause between trigger and response." },
      { name: "Motivation", desc: "Drive that outlasts the mood." },
      { name: "Empathy", desc: "Reading what others feel and need." },
      { name: "Social Skill", desc: "Turning connection into direction." },
    ],
    closing: "Fifteen honest questions. A score, a breakdown, and your sharpest and weakest domain.",
  },
  personality: {
    promise:
      "Understanding how you're wired ends the war against your own nature — and shows you how others are wired too.",
    why: [
      {
        heading: "Self-knowledge is leverage",
        body:
          "When you know how you take in the world and make decisions, you stop forcing yourself into the wrong rooms, roles, and routines. You build a life around your wiring instead of against it.",
      },
      {
        heading: "It makes other people legible",
        body:
          "The same lens that decodes you decodes everyone else. You start to see why people clash, what they need, and how to lead them.",
      },
    ],
    measuresTitle: "The four axes",
    measures: [
      { name: "Energy", desc: "Where you draw it: outward or inward." },
      { name: "Perception", desc: "What you trust: the concrete or the pattern." },
      { name: "Decisions", desc: "How you decide: by logic or by values." },
      { name: "Structure", desc: "How you live: planned or open." },
    ],
    closing: "Twenty quick choices. Your four-letter type, your strengths, and your blind spots.",
  },
  archetype: {
    promise:
      "Myth is how humans have always mapped the soul. This reveals your lineage, your archetype, your purpose, and the shadow you're here to master.",
    why: [
      {
        heading: "Archetypes name what data can't",
        body:
          "The gods and heroes endure because they're mirrors. Knowing which one you descend from gives language to a pattern you've felt your whole life but never named.",
      },
      {
        heading: "Purpose and shadow, together",
        body:
          "The Oracle reads what you're built to do and would love doing. The Shadow names the trait quietly costing you. Most tests flatter you; this one points you forward.",
      },
    ],
    measuresTitle: "What you'll receive",
    measures: [
      { name: "Lineage", desc: "The god or hero you descend from." },
      { name: "Archetype", desc: "Your card — the role you're playing now." },
      { name: "Oracle", desc: "Your purpose: what you'd thrive doing." },
      { name: "Shadow", desc: "The growth edge you're here to master." },
    ],
    closing: "Sixteen scenarios. A four-part reading of who you are and where you're headed.",
  },
};
