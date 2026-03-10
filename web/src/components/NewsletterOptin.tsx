"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Mail, CheckCircle2, AlertCircle, Loader2, Crown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface NewsletterContentProps {
  isPremium: boolean;
  isLoggedIn: boolean;
}

function FreeNewsletterContent({ isPremium, isLoggedIn }: NewsletterContentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-light text-white tracking-wide uppercase mb-3 sm:mb-4">
          Daily Intelligence
        </h2>
        <p className="text-gray-400 font-light max-w-xl mx-auto text-sm sm:text-base px-2 sm:px-0">
          Strategic analysis and the 28 Principles delivered directly to your inbox. No noise, just leverage.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 border border-imperium-border/50">
        <h3 className="text-sm font-bold tracking-widest uppercase text-imperium-gold mb-4">Latest Brief</h3>

        <div className="text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-imperium-border">
            <div>
              <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-1">Imperium Intelligence Brief</p>
              <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">Issue 147 · Tactical Series</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center">
              <span className="text-imperium-gold text-xs font-bold">I</span>
            </div>
          </div>

          <h3 className="text-base md:text-lg font-semibold text-white mb-4">The Law of Deliberate Action</h3>
          <p className="text-white/50 font-light text-[13px] md:text-sm leading-relaxed mb-6">
            Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity. Reactivity is the signature of the amateur. This brief breaks down three tactical frameworks used by the most effective operators in history to eliminate reactive decision-making from their behavioral stack.
          </p>

          <div className="text-center pt-4 border-t border-imperium-border">
            {!isLoggedIn ? (
              <div>
                <p className="text-white/40 text-xs mb-2">Subscribe to read the full brief</p>
                <a
                  href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold hover:text-imperium-gold-bright transition-colors inline-block"
                >
                  Upgrade to Premium →
                </a>
              </div>
            ) : (
              <div>
                <p className="text-white/40 text-xs mb-2">Upgrade to premium for full access</p>
                <Link href="/#subscribe" className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold hover:text-imperium-gold-bright transition-colors">
                  Upgrade to Premium →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="mt-8 bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-6 text-center">
          <Mail className="w-8 h-8 text-imperium-gold mx-auto mb-3" />
          <h4 className="text-white font-semibold mb-2">Unlock Premium Intelligence</h4>
          <p className="text-white/40 text-sm mb-4">Get daily intelligence delivered straight to your inbox</p>
          <div className="max-w-md mx-auto">
            <NewsletterEmailForm />
          </div>
        </div>
      )}

      {isLoggedIn && !isPremium && (
        <div className="mt-8 bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-6 text-center">
          <Crown className="w-8 h-8 text-imperium-gold mx-auto mb-3" />
          <h4 className="text-white font-semibold mb-2">Unlock Premium Intelligence</h4>
          <p className="text-white/40 text-sm mb-4">Get access to exclusive briefs without marketing, plus full access to 28 Principles</p>
          <a
            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-imperium-gold text-imperium-bg px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
          >
            Upgrade to Premium — $20/month
          </a>
        </div>
      )}

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
        <h2 className="text-xl sm:text-2xl md:text-4xl font-light text-white tracking-wide uppercase mb-3 sm:mb-4">
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

      setStatus("success");
      setMessage("Directive Received. Welcome to the network.");
      setEmail("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Failed to establish connection. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto relative px-2 sm:px-0">
      <div className="relative flex items-center">
        <Mail className="absolute left-3 sm:left-4 text-imperium-gold/50 w-4 sm:w-5 h-4 sm:h-5 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full bg-black/50 border border-imperium-border text-white pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm sm:text-base"
          required
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="absolute right-1.5 sm:right-2 px-4 sm:px-6 py-2 bg-white/5 hover:bg-white/10 text-imperium-gold text-xs sm:text-sm uppercase tracking-wider font-bold rounded-lg transition-colors border border-imperium-border/50 disabled:opacity-50"
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
