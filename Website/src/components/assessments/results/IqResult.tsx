"use client";

import { motion } from "framer-motion";
import { Bar } from "./Bar";
import type { IqResult as IR } from "@/lib/assessments/types";

// Strengths-first: lead with what you're sharpest at, show the full multi-layer
// profile, and present the estimated range as supporting context — never a verdict.
export function IqResult({ data, disclaimer }: { data: IR; disclaimer?: string }) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <p className="section-kicker justify-center mb-4">You're Sharpest In</p>
        <h1 className="font-serif text-3xl sm:text-5xl text-gradient-gold mb-3 capitalize">{data.strongestStyle}</h1>
        <p className="text-body text-white/60 max-w-lg mx-auto leading-relaxed">
          Intelligence isn&apos;t one number — it&apos;s a profile. Here&apos;s the shape of how your mind reasons.
        </p>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-label text-imperium-gold/70 mb-5">Your Reasoning Profile</p>
        <div className="flex flex-col gap-4">
          {data.categoryAccuracy.map((c, i) => (
            <Bar
              key={c.category}
              label={c.category}
              value={c.total ? (c.correct / c.total) * 100 : 0}
              caption={`${c.correct}/${c.total}`}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>

      <div className="surface-card rounded-2xl p-6 sm:p-8 text-center border-imperium-gold/10">
        <p className="text-label text-imperium-gold/70 mb-2">Overall Estimated Range</p>
        <p className="font-serif text-3xl sm:text-4xl text-white mb-1">{data.rangeLabel}</p>
        <p className="text-body text-sm text-white/55">
          {data.band} · {data.correct} of {data.total} correct · {data.percentileLine}
        </p>
      </div>

      {disclaimer && (
        <p className="text-xs text-white/40 text-center leading-relaxed max-w-lg mx-auto">{disclaimer}</p>
      )}
    </div>
  );
}
