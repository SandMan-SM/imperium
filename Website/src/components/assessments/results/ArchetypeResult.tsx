"use client";

import { motion } from "framer-motion";
import type { ArchetypeResult as AR } from "@/lib/assessments/types";

export function ArchetypeResult({ data }: { data: AR }) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
        <p className="section-kicker justify-center mb-4">{data.lineage.category} Lineage</p>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mb-1">
          Descendant of <span className="text-gradient-gold italic">{data.lineage.name}</span>
        </h1>
        <p className="text-body text-white/60 max-w-xl mx-auto mt-4 leading-relaxed">{data.lineage.essence}</p>
      </motion.div>

      {/* Archetype */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-label text-imperium-gold/70 mb-2">Archetype</p>
        <h2 className="font-serif text-2xl sm:text-3xl text-imperium-gold mb-3">{data.archetypeCard.name}</h2>
        <p className="text-body text-sm sm:text-base text-white/70 leading-relaxed mb-3">{data.archetypeCard.meaning}</p>
        <p className="text-body text-sm text-white/90 italic">{data.archetypeCard.personalLine}</p>
      </motion.div>

      {/* Oracle (purpose) */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }} className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-label text-imperium-gold/70 mb-2">Oracle — Your Purpose</p>
        <p className="text-body text-base sm:text-lg text-white/90 leading-relaxed mb-5">{data.oracle.calling}</p>
        <div className="flex flex-wrap gap-2">
          {data.oracle.pursuits.map((p) => (
            <span key={p} className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-imperium-gold/25 bg-imperium-gold/5 text-imperium-gold/90">
              {p}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Shadow */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="surface-card rounded-2xl p-6 sm:p-8 border-imperium-gold/10">
        <p className="text-label text-imperium-gold/70 mb-2">Shadow — Your Growth Edge</p>
        <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3">{data.shadow.creature}</h2>
        <p className="text-body text-sm sm:text-base text-white/70 leading-relaxed mb-3">{data.shadow.pattern}</p>
        <p className="text-body text-sm text-white/90">{data.shadow.guidance}</p>
      </motion.div>
    </div>
  );
}
