"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AssessmentMeta } from "@/lib/assessments/types";

export function AssessmentCard({ meta, index }: { meta: AssessmentMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={`/${meta.slug}`}
        className="glass-card card-lift rounded-2xl p-6 sm:p-8 flex flex-col h-full min-h-[16rem] sm:min-h-[17rem] group"
      >
        <h3 className="font-serif font-semibold tracking-[0.02em] leading-tight whitespace-nowrap text-[clamp(1.2rem,3.65vw,1.65rem)] text-white mb-4">
          {meta.title}
        </h3>
        <p className="text-body text-sm text-white/50 leading-relaxed flex-1">{meta.tagline}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-label text-white/30">{meta.durationLabel}</span>
          <span className="inline-flex items-center gap-2 text-label text-imperium-gold group-hover:gap-3 transition-all">
            Begin <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
