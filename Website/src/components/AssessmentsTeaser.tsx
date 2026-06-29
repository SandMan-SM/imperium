"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AssessmentCard } from "@/components/assessments/AssessmentCard";
import { ASSESSMENTS } from "@/lib/assessments";

export function AssessmentsTeaser() {
  const personality = ASSESSMENTS.find((meta) => meta.slug === "personality");
  const primaryAssessments = ASSESSMENTS.filter((meta) => meta.slug !== "personality");

  return (
    <section className="py-16 sm:py-24 bg-imperium-bg relative overflow-hidden px-4 sm:px-6 border-t border-imperium-border">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.04] rounded-full blur-[120px] pointer-events-none"
      />
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="section-kicker justify-center mb-5">Know Thyself</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl text-white tracking-[0.04em] mb-4">
            Discover Your <span className="text-gradient-gold">Archetype</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto font-light text-sm sm:text-base px-2 sm:px-0">
            <span className="md:whitespace-nowrap">Four short, precise assessments — your archetype, personality, emotional</span>{" "}
            intelligence, and reasoning profile. Free, with results sent to your inbox.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {primaryAssessments.map((meta, i) => (
            <AssessmentCard key={meta.slug} meta={meta} index={i} />
          ))}
          {personality && (
            <div className="sm:col-span-2 lg:col-span-3">
              <AssessmentCard meta={personality} index={primaryAssessments.length} />
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/assessments"
            className="inline-flex items-center gap-2 text-label text-imperium-gold hover:gap-3 transition-all"
          >
            Explore all assessments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
