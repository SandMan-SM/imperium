"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-shell"><div className="auth-card"><p className="auth-sub">Loading…</p></div></div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = searchParams.get("redirect") || "/principles/";
  const sessionId = searchParams.get("session_id");

  /**
   * Two paths, and the difference matters.
   *
   * Someone who just paid arrives here from Stripe with the checkout session
   * in the URL. Their address is already proven, so the account is created
   * confirmed on the server and they can sign in straight away.
   *
   * Anyone else signs up the ordinary way and waits on the confirmation
   * email — that path still needs Supabase to send the mail.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Supabase requires a password that mixes character classes. Say so
    // before the request goes out, rather than after it is refused.
    const strong =
      /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
    if (!strong) {
      setError("Use a password with a lowercase letter, an uppercase letter, a number and a symbol.");
      return;
    }

    setLoading(true);

    if (sessionId) {
      try {
        const response = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, session_id: sessionId }),
        });

        const body = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          setError(body.error || "The account could not be created.");
          setLoading(false);
          return;
        }

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          setSuccess(true);
          setConfirmationPending(false);
          setLoading(false);
          return;
        }

        router.push(destination);
        router.refresh();
        return;
      } catch {
        setError("The account could not be created. Try again.");
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await signUp(email, password, firstName);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setConfirmationPending(true);
    }
  };

  if (success) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brandmark">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <h1 className="auth-title">{confirmationPending ? "Check your email." : "Your account is ready."}</h1>
          <p className="auth-sub">
            {confirmationPending ? (
              <>
                We sent a confirmation link to <strong>{email}</strong>. Open it to activate the account, then sign in.
              </>
            ) : (
              <>
                The account for <strong>{email}</strong> is active. Sign in to open the curriculum.
              </>
            )}
          </p>
          <p className="auth-note">
            {confirmationPending
              ? "If you already paid for membership, use the same address you used at checkout and the curriculum opens as soon as the account is confirmed."
              : "Your membership is already attached to this address, so the full sequence is open as soon as you sign in."}
          </p>
          <div className="auth-form">
            <Link className="auth-submit" href={`/login/?redirect=${encodeURIComponent(destination)}`}>
              Go to sign in
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brandmark">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
        <h1 className="auth-title">Create your account.</h1>
        <p className="auth-sub">One address for the curriculum, the newsletter, and your progress.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="auth-label" htmlFor="signup-name">First name</label>
            <input
              id="signup-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="auth-input"
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="auth-input"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="auth-hint">At least 8 characters, with a lowercase letter, an uppercase letter, a number and a symbol.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                Creating the account
              </>
            ) : (
              <>
                Create the account
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account?{" "}
          <Link href={`/login/?redirect=${encodeURIComponent(destination)}`}>Sign in</Link>
        </p>
        <p className="auth-note">
          Use the same address you used at checkout. That is what connects the membership to the account.
        </p>
      </div>
    </div>
  );
}
