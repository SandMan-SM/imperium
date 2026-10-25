"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-shell"><div className="auth-card"><p className="auth-sub">Loading…</p></div></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // The membership is keyed to the address used at checkout, so a member
  // who lands here from a purchase returns to the curriculum afterwards.
  const destination = searchParams.get("redirect") || "/principles/";
  const sessionId = searchParams.get("session_id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(destination);
      router.refresh();
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brandmark">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
        <h1 className="auth-title">Welcome back.</h1>
        <p className="auth-sub">Sign in to open the curriculum and pick up where you left off.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="auth-input"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="auth-input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                Signing in
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="auth-alt">
          No account yet?{" "}
          <Link href={`/signup/?redirect=${encodeURIComponent(destination)}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""}`}>Create one</Link>
        </p>
        <p className="auth-note">
          Already a member? Sign in with the same address you used at checkout and the curriculum opens straight away.
        </p>
      </div>
    </div>
  );
}
