"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp(email, password, firstName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-imperium-bg flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-imperium-card border border-imperium-border rounded-2xl p-10 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <ShieldCheck className="text-green-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide uppercase mb-4">
              Check Your Email
            </h1>
            <p className="text-white/40 font-light text-sm mb-6">
              We&apos;ve sent a confirmation link to <span className="text-white">{email}</span>.
              Click the link to activate your account.
            </p>
            <a
              href="/login"
              className="inline-block bg-imperium-gold text-imperium-bg px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
            >
              Go to Login
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-imperium-bg flex items-center justify-center px-4 py-20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-imperium-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-imperium-gold/3 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-imperium-card border border-imperium-border rounded-2xl p-8 md:p-10 backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-imperium-gold/10 flex items-center justify-center mx-auto mb-4 border border-imperium-gold/20">
              <ShieldCheck className="text-imperium-gold w-7 h-7" />
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide uppercase">Join the Network</h1>
            <p className="text-white/40 font-light text-sm mt-2">Create your sovereign account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-imperium-gold/50 w-4 h-4" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full bg-black/50 border border-imperium-border text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-imperium-gold/50 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-black/50 border border-imperium-border text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-imperium-gold/50 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-black/50 border border-imperium-border text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-imperium-gold text-imperium-bg py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-imperium-gold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] tracking-[0.2em] uppercase text-white/20 font-semibold">
          Encrypted Protocol
        </p>
      </motion.div>
    </div>
  );
}
