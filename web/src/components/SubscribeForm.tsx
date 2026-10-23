"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SubscribeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError("");

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Subscription failed");
      }

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <div className="mt-9 w-full max-w-md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center gap-2 rounded-full border border-imperium-border bg-white/[0.03] p-1.5 pl-5 backdrop-blur-md transition-colors focus-within:border-imperium-gold/50">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            disabled={submitting}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Joining" : "Join Free"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          href="/"
          className="link-underline text-xs font-medium tracking-wide text-white/55 transition-colors hover:text-white"
        >
          Already subscribed? &rarr;
        </Link>
        <p className="text-[11px] tracking-wide text-white/30">Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
