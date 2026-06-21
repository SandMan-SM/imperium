"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { getMeta } from "@/lib/assessments";
import { LANDING } from "@/lib/assessments/landing";
import { ASSESSMENT_CONFIG } from "@/lib/assessments/config";
import type { Slug } from "@/lib/assessments/types";
import { ShareButton } from "./ShareButton";

export function AssessmentLanding({ slug }: { slug: Slug }) {
  const meta = getMeta(slug)!;
  const content = LANDING[slug];
  const beginHref = `/${slug}/assessment`;

  return (
    <div className="min-h-screen bg-imperium-bg">
      <Header />
      <main className="pt-[96px] sm:pt-[110px] pb-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14 sm:mb-20"
          >
            <p className="section-kicker justify-center mb-5">Imperium Assessment</p>
            <h1 className="text-display text-3xl sm:text-5xl md:text-6xl text-white mb-5">
              {meta.title}
            </h1>
            <p className="text-body text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
              {content.promise}
            </p>
            <div className="flex items-center justify-center gap-6 mb-8 text-label text-white/40">
              <span>{meta.questionCount} questions</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{meta.durationLabel}</span>
            </div>
            <Link href={beginHref} className="btn-primary rounded-full px-10 py-4 text-sm inline-flex items-center gap-2">
              Begin the assessment <ArrowRight className="w-4 h-4" />
            </Link>
            {meta.disclaimer && (
              <p className="text-xs text-white/40 max-w-md mx-auto mt-6 leading-relaxed">{meta.disclaimer}</p>
            )}
          </motion.div>

          {/* Why it matters */}
          <div className="flex flex-col gap-5 mb-14">
            {content.why.map((section, i) => (
              <motion.div
                key={section.heading}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <h2 className="text-heading text-lg sm:text-xl text-white mb-3">{section.heading}</h2>
                <p className="text-body text-sm sm:text-base text-white/60 leading-relaxed">{section.body}</p>
              </motion.div>
            ))}
          </div>

          {/* What it measures */}
          <div className="mb-16">
            <p className="section-kicker justify-center mb-8">{content.measuresTitle}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {content.measures.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="surface-card rounded-xl p-5 flex gap-4 items-start"
                >
                  <span className="text-imperium-gold font-serif text-xl leading-none mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-body font-semibold text-white mb-1">{m.name}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Closing CTA */}
          <div className="text-center glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-body text-white/70 mb-6 max-w-lg mx-auto">{content.closing}</p>
            <Link href={beginHref} className="btn-primary rounded-full px-10 py-4 text-sm inline-flex items-center gap-2">
              Begin the assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-7">
              <ShareButton
                variant="subtle"
                text={`I'm taking the ${ASSESSMENT_CONFIG.brandName} ${meta.title}. ${content.promise}`}
                url={`${ASSESSMENT_CONFIG.siteUrl}/${slug}`}
                title={`${ASSESSMENT_CONFIG.brandName} ${meta.title}`}
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/assessments" className="text-label text-white/40 hover:text-white transition-colors inline-flex items-center gap-2">
              ← All assessments
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
