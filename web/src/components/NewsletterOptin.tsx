"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NewsletterOptin() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        try {
            // Use Supabase anon key to insert. Ensure RLS allows public inserts to newsletter_subscribers!
            const { error } = await supabase
                .from("newsletter_subscribers")
                .insert([{ email, status: "active" }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
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
        <section className="w-full py-16 sm:py-24 bg-imperium-bg relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-imperium-gold/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-imperium-card border border-imperium-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
                    {/* subtle gold accent line */}

                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl md:text-4xl font-light text-white tracking-wide uppercase mb-3 sm:mb-4">
                            Daily Intelligence
                        </h2>
                        <p className="text-gray-400 font-light max-w-xl mx-auto text-sm sm:text-base px-2 sm:px-0">
                            Strategic analysis and the 28 Principles delivered directly to your inbox. No noise, just leverage.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto relative px-2 sm:px-0">
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 sm:left-4 text-imperium-gold/50 w-4 sm:w-5 h-4 sm:h-5 pointer-events-none" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your transmission..."
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
                </div>
            </div>
        </section>
    );
}
