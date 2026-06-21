"use client";

import { motion } from "framer-motion";
import { Bar } from "./Bar";
import type { PersonalityResult as PR } from "@/lib/assessments/types";

const AXIS_LABEL: Record<string, [string, string]> = {
  EI: ["Extraversion", "Introversion"],
  SN: ["Sensing", "Intuition"],
  TF: ["Thinking", "Feeling"],
  JP: ["Judging", "Perceiving"],
};
const LETTER_LABEL: Record<string, string> = {
  E: "Extraversion", I: "Introversion", S: "Sensing", N: "Intuition",
  T: "Thinking", F: "Feeling", J: "Judging", P: "Perceiving",
};

export function PersonalityResult({ data }: { data: PR }) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <p className="section-kicker justify-center mb-4">Your Type</p>
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-gradient-gold tracking-wide mb-2">{data.type}</h1>
        <p className="text-heading text-xl sm:text-2xl text-white">{data.nickname}</p>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-body text-white/70 leading-relaxed">{data.summary}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-label text-imperium-gold/70 mb-5">The Four Axes</p>
        <div className="flex flex-col gap-4">
          {data.axes.map((a, i) => (
            <Bar key={a.axis} label={LETTER_LABEL[a.letter]} value={a.strength} caption={`${a.strength}% ${a.letter}`} delay={i * 0.1} />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-label text-imperium-gold/70 mb-3">Strengths</p>
          <ul className="flex flex-col gap-2">
            {data.strengths.map((s) => (
              <li key={s} className="text-body text-sm text-white/70">— {s}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-label text-imperium-gold/70 mb-3">Blind Spots</p>
          <ul className="flex flex-col gap-2">
            {data.blindSpots.map((s) => (
              <li key={s} className="text-body text-sm text-white/70">— {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-heading text-lg sm:text-xl text-imperium-gold/90 italic px-4">
        {data.imperiumLine}
      </p>
    </div>
  );
}
