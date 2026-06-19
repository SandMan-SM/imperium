"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Brain, HeartPulse, Sparkles, ArrowRight } from "lucide-react";
import type { AssessmentMeta } from "@/lib/assessments/types";

const ICONS = { Compass, Brain, HeartPulse, Sparkles };

export function AssessmentCard({ meta, index }: { meta: AssessmentMeta; index: number }) {
  const Icon = ICONS[meta.icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={`/${meta.slug}`}
        className="glass-card card-lift rounded-2xl p-6 sm:p-8 flex flex-col h-full group"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="w-12 h-12 rounded-xl border border-imperium-gold/25 bg-imperium-gold/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-imperium-gold" />
          </span>
          <span className="text-label text-white/30">{meta.durationLabel}</span>
        </div>
        <h3 className="text-heading text-xl sm:text-2xl text-white mb-2">{meta.title}</h3>
        <p className="text-body text-sm text-white/50 leading-relaxed flex-1">{meta.tagline}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-label text-white/30">{meta.questionCount} questions</span>
          <span className="inline-flex items-center gap-2 text-label text-imperium-gold group-hover:gap-3 transition-all">
            Begin <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
