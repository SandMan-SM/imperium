"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { EngineQuestion } from "@/lib/assessments/types";

interface SavedState {
  answers: number[];
  index: number;
}

export function QuizEngine({
  questions,
  storageKey,
  onComplete,
}: {
  questions: EngineQuestion[];
  storageKey: string;
  onComplete: (answers: number[]) => void;
}) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Resume from a prior in-progress attempt.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState;
        if (Array.isArray(parsed.answers)) {
          setAnswers(parsed.answers);
          setIndex(Math.min(parsed.index ?? 0, total - 1));
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey, total]);

  // Persist progress.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, index }));
    } catch {
      /* ignore */
    }
  }, [answers, index, hydrated, storageKey]);

  const finish = useCallback(
    (final: number[]) => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      onComplete(final);
    },
    [onComplete, storageKey]
  );

  const select = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = optionIndex;
        if (index >= total - 1) {
          // small beat so the selection registers visually
          setTimeout(() => finish(next), 180);
        } else {
          setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 180);
        }
        return next;
      });
    },
    [index, total, finish]
  );

  const goBack = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total]
  );

  // Keyboard: 1-9 to select, arrows to navigate.
  useEffect(() => {
    if (!hydrated) return;
    const onKey = (e: KeyboardEvent) => {
      const q = questions[index];
      const num = parseInt(e.key, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= q.options.length) {
        select(num - 1);
      } else if (e.key === "ArrowLeft") {
        goBack();
      } else if (e.key === "ArrowRight" && answers[index] !== undefined) {
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hydrated, questions, answers, select, goBack, goNext]);

  if (!hydrated) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  const q = questions[index];
  const answered = answers.filter((a) => a !== undefined).length;
  const progress = Math.round((answered / total) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label text-imperium-gold/70">
            Question {index + 1} of {total}
          </span>
          <span className="text-label text-white/30">{progress}% complete</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full gradient-gold"
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {q.kicker && (
            <p className="section-kicker mb-4 justify-center sm:justify-start">{q.kicker}</p>
          )}
          <h2 className="text-heading text-xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8 text-balance">
            {q.prompt}
          </h2>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const isSelected = answers[index] === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={isSelected}
                  className={`group w-full text-left rounded-xl border px-5 py-4 transition-all duration-200 flex items-center gap-4 ${
                    isSelected
                      ? "border-imperium-gold bg-imperium-gold/10"
                      : "border-imperium-border bg-white/[0.02] hover:border-imperium-gold/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? "border-imperium-gold bg-imperium-gold text-imperium-bg"
                        : "border-white/20 text-white/40 group-hover:border-imperium-gold/50 group-hover:text-imperium-gold"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-body text-sm sm:text-base text-white/90">
                    {opt.label}
                    {opt.hint && (
                      <span className="block text-xs text-white/40 mt-0.5">{opt.hint}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          className="inline-flex items-center gap-2 text-label text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={answers[index] === undefined || index === total - 1}
          className="inline-flex items-center gap-2 text-label text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
