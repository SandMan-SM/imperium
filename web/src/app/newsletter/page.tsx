"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Mail, CheckCircle2, AlertCircle, Loader2, Crown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NewsletterPage() {
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hero */}
            <div className="relative border-b border-imperium-gold/20 pt-[84px] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />

                <div className="relative container mx-auto px-4 sm:px-6 max-w-3xl py-12 sm:py-16 md:py-24 text-center">
                    {isPremium && isLoggedIn ? (
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/10">
                            <Crown className="w-4 h-4 text-imperium-gold" />
                            <span className="text-imperium-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">Premium Intelligence</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                            <span className="text-imperium-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">Intelligence Network</span>
                        </div>
                    )}

                    <h1 className="text-2xl sm:text-3xl md:text-6xl text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0" style={{ paddingTop: '6px' }}>
                        The{" "}
                        <span className="font-display italic text-gold-gradient">Imperium</span>{" "}
                        {isPremium && isLoggedIn ? "Premium Brief" : "Intelligence Brief"}
                    </h1>

                    <p className="text-white/45 font-light text-xs sm:text-sm md:text-lg leading-relaxed mb-3 sm:mb-4 px-2 sm:px-0">
                        {isPremium && isLoggedIn
                            ? "Exclusive premium intelligence. No marketing, no noise — just pure strategic value delivered to your inbox."
                            : "A daily dose of raw tactical intellect for the disciplined sovereign. No noise, no motivation platitudes — just precision frameworks from the world's most formidable strategic minds."
                        }
                    </p>

                    <p className="text-imperium-gold/60 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-widest uppercase">
                        {isPremium && isLoggedIn ? "Premium Access Active" : "2,400+ subscribers · $20 / month · Cancel anytime"}
                    </p>
                </div>
            </div>

            {/* Unlock Premium Intelligence Section - Free Newsletter Signup */}
            {!isPremium && !isLoggedIn && (
                <div className="border-b border-imperium-gold/20 py-16 md:py-20">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-12 md:mb-14">
                            <h2 className="text-2xl md:text-3xl text-white mb-3">Unlock Premium Intelligence</h2>
                            <p className="text-white/35 font-light text-sm">Enter your email to join the free intelligence network.</p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <NewsletterEmailForm />
                        </div>
                    </div>
                </div>
            )}

            {/* Premium: Show exclusive content, Free: Show sample */}
            <div className="py-20">
                <div className="container mx-auto px-6 max-w-3xl">
                    <NewsletterContent isPremium={isPremium && isLoggedIn} isLoggedIn={isLoggedIn} />
                </div>
            </div>

            {/* CTA Section */}
            <div className="border-t border-imperium-gold/20 py-20">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    {isPremium && isLoggedIn ? (
                        <div className="space-y-6">
                            <div className="bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-8">
                                <Crown className="w-12 h-12 text-imperium-gold mx-auto mb-4" />
                                <h3 className="text-xl text-white mb-3">Premium Access Active</h3>
                                <p className="text-white/40 font-light mb-6">You have full access to premium intelligence briefs and the 28 Principles.</p>
                                <Link href="/28principles" className="inline-flex items-center gap-2 px-6 py-3 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200 btn-primary">
                                    <Lock className="w-4 h-4" /> Access 28 Principles
                                </Link>
                            </div>
                        </div>
                    ) : isLoggedIn ? (
                        <div className="space-y-6">
                            <div className="bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-8">
                                <h3 className="text-xl text-white mb-3">Upgrade to Premium</h3>
                                <p className="text-white/40 font-light mb-6">Get exclusive briefs without marketing and full access to 28 Principles.</p>
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-imperium-gold text-imperium-bg px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
                                >
                                    Upgrade to Premium — $20/month
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl text-white mb-3">Subscribe Now</h2>
                            <p className="text-white/40 font-light text-sm">Enter your email below or go straight to checkout.</p>

                            <NewsletterEmailForm />

                            <div className="mt-8">
                                <p className="text-white/25 text-sm font-light mb-4">Or subscribe directly via Stripe:</p>
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-gold !text-[11px] md:!text-[12px] w-full sm:w-auto"
                                >
                                    Join Imperium Elite — $20/month
                                </a>
                                <p className="mt-4 text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">No contracts. Cancel anytime.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NewsletterContent({ isPremium, isLoggedIn }: { isPremium: boolean; isLoggedIn: boolean }) {
    const [newsletters, setNewsletters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNewsletters() {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from("newsletters")
                    .select("*")
                    .eq("published", true)
                    .order("created_at", { ascending: false })
                    .limit(10);

                setNewsletters(data || []);
            } catch (error) {
                console.error("Error fetching newsletters:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNewsletters();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-imperium-gold/30 border-t-imperium-gold rounded-full animate-spin mx-auto"></div>
                <p className="text-white/35 font-light text-sm mt-4">Loading intelligence...</p>
            </div>
        );
    }

    if (newsletters.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-2xl text-white mb-3">
                    {isPremium ? "Latest Premium Brief" : "Sample Intelligence Brief"}
                </h2>
                <p className="text-white/35 font-light text-sm mb-10">
                    {isPremium ? "Your exclusive premium intelligence content." : "Every brief looks like this. Dense. Formatted. Executable."}
                </p>
                <div className="glass-card rounded-2xl p-6 md:p-10 text-left">
                    <p className="text-white/40 font-light text-sm">No newsletters published yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl text-white mb-3">
                    Latest Intelligence Brief
                </h2>
                <p className="text-white/35 font-light text-sm">
                    {isPremium ? "Your exclusive premium intelligence content." : "Public briefs from the Imperium archive."}
                </p>
            </div>

            {newsletters.map((nl) => (
                <div key={nl.id} className="glass-card rounded-2xl p-6 md:p-10 text-left relative overflow-hidden mb-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-imperium-border">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-1">
                                Imperium Intelligence Brief
                            </p>
                            <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">
                                {nl.created_at ? new Date(nl.created_at).toLocaleDateString() : 'New'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center">
                            <span className="text-imperium-gold text-xs font-bold">I</span>
                        </div>
                    </div>

                    <h3 className="text-base md:text-lg font-semibold text-white mb-4">
                        {nl.title}
                    </h3>

                    {/* Newsletter Content */}
                    <div className="space-y-6">
                        {nl.content ? (
                            <div className="text-white/50 font-light text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap">
                                {nl.content}
                            </div>
                        ) : (
                            <div className="text-white/40 font-light text-sm">No content available.</div>
                        )}
                    </div>

                    {/* Access Indicator */}
                    <div className="mt-8 pt-6 border-t border-imperium-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {nl.is_public ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Public Brief
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-imperium-gold/10 border border-imperium-gold/20 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold">
                                        <span className="w-2 h-2 bg-imperium-gold rounded-full animate-pulse"></span>
                                        Premium Only
                                    </span>
                                )}
                                <span className="text-white/20 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                                    {nl.is_public ? "Available to all" : "Premium subscribers"}
                                </span>
                            </div>

                            {!nl.is_public && !isPremium && isLoggedIn && (
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-imperium-gold text-imperium-bg px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
                                >
                                    Upgrade to Premium
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function NewsletterEmailForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        try {
            const { data: existing } = await supabase
                .from("profiles")
                .select("email")
                .eq("email", email.toLowerCase())
                .single();

            if (existing) {
                await supabase
                    .from("profiles")
                    .update({ is_subscribed: true })
                    .eq("email", email.toLowerCase());
            } else {
                await supabase
                    .from("profiles")
                    .insert([{
                        email: email.toLowerCase(),
                        is_subscribed: true,
                        is_premium: false,
                        is_admin: false,
                        created_at: new Date().toISOString(),
                    }]);
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
