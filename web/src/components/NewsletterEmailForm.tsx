"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Reusable email-capture form. Drops into any page that wants to grow the
// Imperium intelligence-brief list. Uses the same profiles table the rest
// of the site reads from. Marks the row is_subscribed=true and creates the
// profile if it doesn't already exist.
export default function NewsletterEmailForm() {
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
                await supabase.from("profiles").insert([
                    {
                        email: email.toLowerCase(),
                        is_subscribed: true,
                        is_premium: false,
                        is_admin: false,
                        created_at: new Date().toISOString(),
                    },
                ]);
            }

            setStatus("success");
            setMessage("Directive Received. Welcome to the network.");
            setEmail("");
        } catch (err: unknown) {
            // eslint-disable-next-line no-console
            console.error(err);
            setStatus("error");
            setMessage(err instanceof Error ? err.message : "Failed to establish connection. Try again.");
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
                        className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                            status === "success" ? "text-green-400" : "text-red-400"
                        }`}
                    >
                        {status === "success" ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        <span>{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
}
