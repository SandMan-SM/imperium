// IQ Test — indicative reasoning estimate. 12 mixed logic items, single correct answer.
// NOTE: estimate for insight/entertainment, not a clinical measure.
import type { AssessmentMeta, EngineQuestion, IqResult } from "./types";

export const meta: AssessmentMeta = {
  slug: "iq",
  title: "IQ Assessment",
  tagline: "A multi-layer read on how your mind reasons — and what it's sharpest at.",
  blurb:
    "Twelve problems across four kinds of reasoning return a profile of how you think — not a single number.",
  durationLabel: "≤ 10 min",
  questionCount: 12,
  icon: "Brain",
  disclaimer:
    "An indicative reasoning estimate for insight and entertainment — not a clinical or certified IQ measurement.",
};

type Category = "Numerical" | "Verbal" | "Logic" | "Pattern";

interface IQItem {
  id: string;
  category: Category;
  prompt: string;
  options: string[];
  correct: number; // index into options
}

const ITEMS: IQItem[] = [
  { id: "i1", category: "Numerical", prompt: "What comes next: 2, 4, 8, 16, ?", options: ["24", "30", "32", "36"], correct: 2 },
  { id: "i2", category: "Numerical", prompt: "What comes next: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "15"], correct: 2 },
  { id: "i3", category: "Numerical", prompt: "What comes next: A, C, F, J, ?", options: ["N", "O", "P", "M"], correct: 1 },
  { id: "i4", category: "Numerical", prompt: "What comes next: 3, 6, 11, 18, 27, ?", options: ["36", "37", "38", "40"], correct: 2 },
  { id: "i5", category: "Numerical", prompt: "What comes next: 7, 14, 28, 56, ?", options: ["84", "98", "110", "112"], correct: 3 },
  { id: "i6", category: "Verbal", prompt: "Bird is to Sky as Fish is to ___", options: ["Water", "Scales", "Boat", "Net"], correct: 0 },
  { id: "i7", category: "Verbal", prompt: "Pen is to Writer as Brush is to ___", options: ["Canvas", "Painter", "Color", "Art"], correct: 1 },
  { id: "i8", category: "Verbal", prompt: "Hot is to Cold as Up is to ___", options: ["High", "Side", "Down", "Far"], correct: 2 },
  { id: "i9", category: "Pattern", prompt: "Which is the odd one out?", options: ["Rose", "Tulip", "Oak", "Daisy"], correct: 2 },
  { id: "i10", category: "Pattern", prompt: "Which is the odd one out?", options: ["2", "3", "9", "11"], correct: 2 },
  { id: "i11", category: "Logic", prompt: "All sovereigns are disciplined. Some disciplined people are wealthy. Which must be true?", options: ["All sovereigns are wealthy", "Some sovereigns may be wealthy", "No sovereigns are wealthy", "All wealthy people are sovereigns"], correct: 1 },
  { id: "i12", category: "Logic", prompt: "A is taller than B. C is shorter than B. Who is tallest?", options: ["A", "B", "C", "Cannot tell"], correct: 0 },
];

export const questions: EngineQuestion[] = ITEMS.map((q) => ({
  id: q.id,
  kicker: q.category,
  prompt: q.prompt,
  options: q.options.map((label) => ({ label })),
}));

const CATEGORIES: Category[] = ["Numerical", "Verbal", "Logic", "Pattern"];

function rangeFor(correct: number): { rangeLabel: string; band: string; percentileLine: string } {
  if (correct >= 10) return { rangeLabel: "~125–140+", band: "Exceptional reasoning", percentileLine: "Top ~5% of this format." };
  if (correct >= 7) return { rangeLabel: "~110–125", band: "Strong reasoning", percentileLine: "Well above the typical range." };
  if (correct >= 4) return { rangeLabel: "~100–110", band: "Solid reasoning", percentileLine: "Around and above the midpoint." };
  return { rangeLabel: "~90–100", band: "Developing reasoning", percentileLine: "A baseline to build from." };
}

const STYLE_LABEL: Record<Category, string> = {
  Numerical: "numerical & sequential reasoning",
  Verbal: "verbal & relational reasoning",
  Logic: "deductive logic",
  Pattern: "pattern recognition",
};

export function score(answers: number[]): IqResult {
  let correct = 0;
  const byCat: Record<Category, { correct: number; total: number }> = {
    Numerical: { correct: 0, total: 0 },
    Verbal: { correct: 0, total: 0 },
    Logic: { correct: 0, total: 0 },
    Pattern: { correct: 0, total: 0 },
  };

  ITEMS.forEach((q, i) => {
    byCat[q.category].total += 1;
    if ((answers[i] ?? -1) === q.correct) {
      correct += 1;
      byCat[q.category].correct += 1;
    }
  });

  const { rangeLabel, band, percentileLine } = rangeFor(correct);

  let strongest: Category = "Numerical";
  let bestRatio = -1;
  for (const c of CATEGORIES) {
    const { correct: cc, total } = byCat[c];
    const ratio = total ? cc / total : 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      strongest = c;
    }
  }

  return {
    correct,
    total: ITEMS.length,
    rangeLabel,
    band,
    percentileLine,
    categoryAccuracy: CATEGORIES.map((c) => ({
      category: c,
      correct: byCat[c].correct,
      total: byCat[c].total,
    })),
    strongestStyle: STYLE_LABEL[strongest],
  };
}
