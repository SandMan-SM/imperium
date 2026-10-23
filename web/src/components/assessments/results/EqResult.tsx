"use client";

import { motion } from "framer-motion";
import { Bar } from "./Bar";
import type { EqResult as ER } from "@/lib/assessments/types";

export function EqResult({ data }: { data: ER }) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <p className="section-kicker justify-center mb-4">Your EQ</p>
        <h1 className="font-serif text-6xl sm:text-7xl text-gradient-gold mb-2">{data.overall}</h1>
        <p className="text-heading text-xl sm:text-2xl text-white">{data.band}</p>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-label text-imperium-gold/70 mb-5">The Five Domains</p>
        <div className="flex flex-col gap-4">
          {data.domains.map((d, i) => (
            <Bar key={d.domain} label={d.label} value={d.score} caption={`${d.score}`} delay={i * 0.1} />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-label text-imperium-gold/70 mb-2">Strongest — {data.strongest.label}</p>
          <p className="text-body text-sm text-white/70 leading-relaxed">{data.strongest.note}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-label text-imperium-gold/70 mb-2">Growth Edge — {data.weakest.label}</p>
          <p className="text-body text-sm text-white/70 leading-relaxed">{data.weakest.note}</p>
        </div>
      </div>
    </div>
  );
}
