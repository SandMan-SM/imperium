"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-imperium-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-imperium-gold/3 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperium-gold to-transparent" />
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-imperium-gold/10 flex items-center justify-center mx-auto mb-4 border border-imperium-gold/20">
              <ShieldCheck className="text-imperium-gold w-7 h-7" />
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide uppercase">Welcome Back</h1>
            <p className="text-white/40 font-light text-sm mt-2">Sign in to access your intelligence brief</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full bg-black/40 border border-imperium-gold/20 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm"
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
                  placeholder="Enter your password"
                  className="w-full bg-black/40 border border-imperium-gold/20 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-imperium-gold/50 transition-colors text-sm"
                  required
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
              className="w-full bg-imperium-gold text-imperium-bg py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Access Brief <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-imperium-gold hover:underline">
                Sign up
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
