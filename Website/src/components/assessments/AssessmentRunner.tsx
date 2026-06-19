"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { ASSESSMENT_CONFIG } from "@/lib/assessments/config";
import { ASSESSMENT_MODULES } from "@/lib/assessments";
import type { AssessmentMeta, Slug } from "@/lib/assessments/types";
import { QuizEngine } from "./QuizEngine";
import { ShareButton } from "./ShareButton";
import { PersonalityResult } from "./results/PersonalityResult";
import { EqResult } from "./results/EqResult";
import { IqResult } from "./results/IqResult";
import { ArchetypeResult } from "./results/ArchetypeResult";

type Phase = "intro" | "quiz" | "capture" | "result";

export function AssessmentRunner({ meta }: { meta: AssessmentMeta }) {
  const slug = meta.slug as Slug;
  const mod = ASSESSMENT_MODULES[slug];
  const storageKey = `imperium_assess_${slug}`;
  const resultKey = `${storageKey}_result`;

  // Landing page (/[slug]) serves as the intro; the runner starts at the quiz.
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<unknown>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(resultKey);
      if (raw) {
        setResult(JSON.parse(raw));
        setPhase("result");
      }
    } catch {
      /* ignore */
    }
  }, [resultKey]);

  const handleComplete = useCallback((a: number[]) => {
    setAnswers(a);
    setPhase("capture");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submitCapture = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      if (trimmedName.length < 2) return setError("Please enter your full name.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail))
        return setError("Please enter a valid email.");

      setSubmitting(true);
      const [firstName, ...rest] = trimmedName.split(" ");
      const lastName = rest.join(" ");

      // Local score as a guaranteed fallback so results are never blocked.
      let finalResult: unknown = mod.score(answers);
      try {
        const res = await fetch("/api/assessments/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, answers, firstName, lastName, email: trimmedEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.result) finalResult = data.result;
        }
      } catch {
        /* keep local fallback */
      }

      setResult(finalResult);
      try {
        localStorage.setItem(resultKey, JSON.stringify(finalResult));
      } catch {
        /* ignore */
      }
      setSubmitting(false);
      setPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [name, email, answers, mod, slug, resultKey]
  );

  const retake = useCallback(() => {
    try {
      localStorage.removeItem(resultKey);
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setResult(null);
    setAnswers([]);
    setPhase("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resultKey, storageKey]);

  const shareUrl = `${ASSESSMENT_CONFIG.siteUrl}/${slug}`;
  const shareText = useCallback(() => {
    if (!result) return `Discover your ${ASSESSMENT_CONFIG.brandName} ${meta.title}.`;
    if (slug === "archetype") {
      const r = result as import("@/lib/assessments/types").ArchetypeResult;
      return `My ${ASSESSMENT_CONFIG.brandName} Archetype: Descendant of ${r.lineage.name} · ${r.archetypeCard.name} · Shadow: ${r.shadow.creature}. What's yours?`;
    }
    if (slug === "personality") {
      const r = result as import("@/lib/assessments/types").PersonalityResult;
      return `My ${ASSESSMENT_CONFIG.brandName} Personality type: ${r.type} — ${r.nickname}. What's yours?`;
    }
    if (slug === "eq") {
      const r = result as import("@/lib/assessments/types").EqResult;
      return `My ${ASSESSMENT_CONFIG.brandName} EQ: ${r.overall} (${r.band}). What's yours?`;
    }
    const r = result as import("@/lib/assessments/types").IqResult;
    return `My ${ASSESSMENT_CONFIG.brandName} reasoning estimate: ${r.rangeLabel}. Can you beat it?`;
  }, [result, slug, meta.title]);

  // ----- Intro -----
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto text-center pt-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="section-kicker justify-center mb-5">Imperium Assessment</p>
          <h1 className="text-display text-3xl sm:text-5xl text-white mb-5">{meta.title}</h1>
          <p className="text-body text-white/60 leading-relaxed mb-8 max-w-xl mx-auto">{meta.blurb}</p>
          <div className="flex items-center justify-center gap-6 mb-8 text-label text-white/40">
            <span>{meta.questionCount} questions</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{meta.durationLabel}</span>
          </div>
          {meta.disclaimer && (
            <p className="text-xs text-white/40 max-w-md mx-auto mb-8 leading-relaxed">{meta.disclaimer}</p>
          )}
          <button type="button" onClick={() => setPhase("quiz")} className="btn-primary rounded-full px-10 py-4 text-sm inline-flex items-center gap-2">
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ----- Quiz -----
  if (phase === "quiz") {
    return (
      <div className="pt-6">
        <QuizEngine questions={mod.questions} storageKey={storageKey} onComplete={handleComplete} />
      </div>
    );
  }

  // ----- Capture (required to unlock results) -----
  if (phase === "capture") {
    return (
      <div className="max-w-md mx-auto pt-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <p className="section-kicker justify-center mb-5">Your results are ready</p>
          <h1 className="text-display text-2xl sm:text-4xl text-white mb-4">Where should we send them?</h1>
          <p className="text-body text-sm text-white/60 mb-8 max-w-sm mx-auto">
            Enter your name and email to unlock your full results — we&apos;ll send a copy to your inbox, free.
          </p>
        </motion.div>
        <form onSubmit={submitCapture} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <label htmlFor="assess-name" className="text-label text-white/50 block mb-2">Full name</label>
            <input
              id="assess-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              className="w-full rounded-xl bg-white/[0.03] border border-imperium-border focus:border-imperium-gold/50 px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="assess-email" className="text-label text-white/50 block mb-2">Email</label>
            <input
              id="assess-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl bg-white/[0.03] border border-imperium-border focus:border-imperium-gold/50 px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary rounded-full px-8 py-4 text-sm inline-flex items-center justify-center gap-2 mt-1 disabled:opacity-60">
            {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Unlocking…</>) : (<>Reveal my results <ArrowRight className="w-4 h-4" /></>)}
          </button>
          <p className="text-[11px] text-white/30 text-center leading-relaxed">
            No spam. Unsubscribe anytime. By continuing you agree to receive your results and occasional intelligence from Imperium.
          </p>
        </form>
      </div>
    );
  }

  // ----- Result -----
  return (
    <div className="max-w-2xl mx-auto pt-6">
      {slug === "personality" && <PersonalityResult data={result as never} />}
      {slug === "eq" && <EqResult data={result as never} />}
      {slug === "iq" && <IqResult data={result as never} disclaimer={meta.disclaimer} />}
      {slug === "archetype" && <ArchetypeResult data={result as never} />}

      {/* Share */}
      <div className="mt-12 text-center">
        <p className="text-body text-sm text-white/50 mb-4">Know someone who needs to see this?</p>
        <ShareButton text={shareText()} url={shareUrl} title={`Imperium ${meta.title}`} />
      </div>

      {/* CTA */}
      <div className="mt-10 glass-card rounded-2xl p-7 sm:p-9 text-center">
        <p className="section-kicker justify-center mb-4">Go Deeper</p>
        <h3 className="text-heading text-xl sm:text-2xl text-white mb-3">{ASSESSMENT_CONFIG.ctaHeadline}</h3>
        <p className="text-body text-sm text-white/60 max-w-md mx-auto mb-7">{ASSESSMENT_CONFIG.ctaSubtext}</p>
        <a href={ASSESSMENT_CONFIG.ctaUrl} target="_blank" rel="noopener noreferrer" className="btn-primary rounded-full px-9 py-4 text-sm inline-flex items-center gap-2">
          {ASSESSMENT_CONFIG.ctaLabel} <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button type="button" onClick={retake} className="inline-flex items-center gap-2 text-label text-white/50 hover:text-white transition-colors">
          <RotateCcw className="w-4 h-4" /> Retake
        </button>
        <Link href="/assessments" className="text-label text-white/50 hover:text-white transition-colors">
          All assessments
        </Link>
      </div>
    </div>
  );
}
