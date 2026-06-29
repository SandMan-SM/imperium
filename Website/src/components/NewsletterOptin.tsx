"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Mail, CheckCircle2, AlertCircle, Loader2, Crown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { STRIPE_CHECKOUT_URL } from "@/lib/brand";

interface NewsletterContentProps {
  isPremium: boolean;
  isLoggedIn: boolean;
}

function FreeNewsletterContent({ isPremium, isLoggedIn }: NewsletterContentProps) {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-light text-white tracking-wide uppercase mb-4 sm:mb-4">
          Daily Intelligence
        </h2>
        <p className="text-gray-400 font-light max-w-xl mx-auto text-sm sm:text-base px-2 sm:px-0">
          Strategic analysis and the 28 Principles delivered directly to your inbox. No noise, just leverage.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
        <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8 text-left">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#fff2a6]/45 to-transparent" />
          <div className="flex items-start justify-between gap-4 mb-7 pb-5 border-b border-white/[0.07]">
            <div className="space-y-2">
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gradient-gold">Latest Brief</p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">Issue 147 · Tactical Series</p>
            </div>
            <div className="w-9 h-9 rounded-full gradient-gold-dim border border-imperium-gold/25 flex items-center justify-center shrink-0">
              <span className="text-gradient-gold text-xs font-bold">I</span>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">The Law of Deliberate Action</h3>
          <p className="text-white/50 font-light text-sm md:text-base leading-relaxed">
            Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity. Reactivity is the signature of the amateur. This brief breaks down three tactical frameworks used by the most effective operators in history to eliminate reactive decision-making from their behavioral stack.
          </p>

          <div className="mt-7 pt-5 border-t border-white/[0.07] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-white/35 text-xs">Subscribe to read the full brief</p>
            {!isLoggedIn ? (
              <a
                href={STRIPE_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase text-gradient-gold hover:opacity-80 transition-opacity inline-block"
              >
                Upgrade to Premium →
              </a>
            ) : (
              <Link href="/#subscribe" className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase text-gradient-gold hover:opacity-80 transition-opacity">
                Upgrade to Premium →
              </Link>
            )}
          </div>
        </article>

        {!isLoggedIn && (
          <aside className="relative rounded-2xl border border-imperium-gold/20 bg-imperium-gold/[0.035] p-6 md:p-8 text-center flex flex-col justify-center">
            <Mail className="w-9 h-9 text-imperium-gold mx-auto mb-5" />
            <h4 className="text-xl text-white font-semibold mb-3">Unlock Premium Intelligence</h4>
            <p className="text-white/40 text-sm mb-7">Get daily intelligence delivered straight to your inbox.</p>
            <NewsletterEmailForm />
          </aside>
        )}

        {isLoggedIn && !isPremium && (
          <aside className="relative rounded-2xl border border-imperium-gold/20 bg-imperium-gold/[0.035] p-6 md:p-8 text-center flex flex-col justify-center">
            <Crown className="w-9 h-9 text-imperium-gold mx-auto mb-5" />
            <h4 className="text-xl text-white font-semibold mb-3">Unlock Premium Intelligence</h4>
            <p className="text-white/40 text-sm mb-7">Get exclusive briefs without marketing, plus full access to 28 Principles.</p>
            <a
              href={STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex justify-center rounded-xl px-6 py-3 text-sm"
            >
              Upgrade to Premium — $20/month
            </a>
          </aside>
        )}
      </div>
    </div>
  );
}

function PremiumNewsletterContent() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-imperium-gold/10 border border-imperium-gold/20 rounded-full mb-4">
          <Crown className="w-4 h-4 text-imperium-gold" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-imperium-gold">Premium Intelligence</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-4xl font-light text-white tracking-wide uppercase mb-4 sm:mb-4">
          Exclusive Briefs
        </h2>
        <p className="text-gray-400 font-light max-w-xl mx-auto text-sm sm:text-base px-2 sm:px-0">
          Premium intelligence delivered directly to your inbox. No marketing, just pure strategic value.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 border border-imperium-gold/20">
        <h3 className="text-sm font-bold tracking-widest uppercase text-imperium-gold mb-4">Latest Premium Brief</h3>

        <div className="text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-imperium-border">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-1">Imperium Premium Brief</p>
              <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">Issue 148 · Strategic Series</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-imperium-gold/20 border border-imperium-gold/30 flex items-center justify-center">
              <span className="text-imperium-gold text-xs font-bold">IP</span>
            </div>
          </div>

          <h3 className="text-base md:text-lg font-semibold text-white mb-4">The Sovereign Operating System</h3>
          <p className="text-white/60 font-light text-[13px] md:text-sm leading-relaxed mb-6">
            This is premium content with full access. No marketing, no upsells — just pure strategic intelligence.
            As a premium member, you have access to the complete archive of briefs and the full 28 Principles framework.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-imperium-border">
            {["Advanced Strategy", "Full Archive Access", "28 Principles"].map((feature, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-2">{feature}</div>
                <div className="w-full h-2 rounded-full bg-imperium-gold/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-imperium-gold/60 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/28principles" className="inline-flex items-center gap-2 text-imperium-gold hover:text-white transition-colors">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wider">Access the 28 Principles</span>
        </Link>
      </div>
    </div>
  );
}

export function NewsletterEmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: email.toLowerCase(), status: "active" }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("You are already subscribed to the intelligence brief.");
        }
        throw error;
      }

      // Send welcome email via API (fire-and-forget; don't block on failure)
      fetch("/api/newsletter/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      }).catch(() => {});

      setStatus("success");
      setMessage("Directive Received. Welcome to the network.");
      setEmail("");
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to establish connection. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
      <div className="relative flex items-center rounded-2xl border border-white/[0.08] bg-black/45 p-1.5">
        <Mail className="absolute left-4 text-imperium-gold/55 w-4 h-4 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full bg-transparent text-white pl-10 pr-24 py-3 rounded-xl focus:outline-none text-sm placeholder:text-white/25"
          required
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="absolute right-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gradient-gold text-xs uppercase tracking-[0.16em] font-bold transition-colors border border-white/[0.08] disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Deploy"}
        </button>
      </div>

      <AnimatePresence>
        {status !== "idle" && status !== "loading" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 flex items-center justify-center gap-2 text-sm ${status === "success" ? "text-green-400" : "text-red-400"
              }`}
          >
            {status === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export function NewsletterOptin() {
  const { user, profile, checkPremiumStatus } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useEffect(() => {
    async function checkPremium() {
      if (user && profile) {
        const premium = profile.is_premium || profile.subscription_status === "active";
        setIsPremium(premium);
        setCheckingPremium(false);
      } else if (user && !profile) {
        const { isPremium: premium } = await checkPremiumStatus(user.email || "");
        setIsPremium(premium);
        setCheckingPremium(false);
      } else {
        setIsPremium(false);
        setCheckingPremium(false);
      }
    }
    checkPremium();
  }, [user, profile, checkPremiumStatus]);

  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
      </div>
    );
  }

  const isLoggedIn = !!user;

  if (isPremium && isLoggedIn) {
    return <PremiumNewsletterContent />;
  }

  return <FreeNewsletterContent isPremium={isPremium} isLoggedIn={isLoggedIn} />;
}

export default function NewsletterPageContent() {
  const { user, profile, checkPremiumStatus } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useEffect(() => {
    async function checkPremium() {
      if (user && profile) {
        const premium = profile.is_premium || profile.subscription_status === "active";
        setIsPremium(premium);
        setCheckingPremium(false);
      } else if (user && !profile) {
        const { isPremium: premium } = await checkPremiumStatus(user.email || "");
        setIsPremium(premium);
        setCheckingPremium(false);
      } else {
        setIsPremium(false);
        setCheckingPremium(false);
      }
    }
    checkPremium();
  }, [user, profile, checkPremiumStatus]);

  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
      </div>
    );
  }

  const isLoggedIn = !!user;

  if (isPremium && isLoggedIn) {
    return <PremiumNewsletterContent />;
  }

  return <FreeNewsletterContent isPremium={isPremium} isLoggedIn={isLoggedIn} />;
}
