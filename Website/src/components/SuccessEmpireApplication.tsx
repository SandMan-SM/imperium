"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, LoaderCircle, MessageCircle } from "lucide-react";
import { SUCCESS_EMPIRE, SUCCESS_EMPIRE_SMS } from "@/lib/success-empire";

type Application = { fullName: string; email: string; phone: string; message: string; company_website: string; submission_id: string };

export function SuccessEmpireApplication() {
  const [state, setState] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [error, setError] = useState("");
  const [retryOnly, setRetryOnly] = useState(false);
  const pending = useRef(false);
  const attempt = useRef<Application | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) || "").trim();
    const input = retryOnly && attempt.current ? attempt.current : {
      fullName: value("fullName").replace(/\s+/g, " "),
      email: value("email").toLowerCase(),
      phone: value("phone"),
      message: value("message"),
      company_website: value("company_website"),
      submission_id: attempt.current?.submission_id || crypto.randomUUID(),
    };
    const digits = input.phone.replace(/\D/g, "").length;
    if (digits < 7 || digits > 15 || !/^[+\d() .-]+$/.test(input.phone)) {
      setError("Please enter a valid phone number, including your country code if outside the U.S.");
      setState("error");
      return;
    }
    attempt.current = input;
    pending.current = true;
    setError("");
    setState("sending");
    try {
      const response = await fetch("/api/apply/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input), signal: AbortSignal.timeout(60_000),
      });
      const result: { ok?: boolean; workflow_complete?: boolean; submission_id?: string; message?: string } = await response.json();
      if (response.ok && result.ok === true && result.workflow_complete === true && result.submission_id === input.submission_id) {
        setState("success");
        requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      if (response.status === 422) {
        attempt.current = null;
        setRetryOnly(false);
      }
      else setRetryOnly(true);
      setError(typeof result.message === "string" ? result.message : "We couldn’t confirm your application. Please try again or text us.");
      setState("error");
    } catch {
      setRetryOnly(true);
      setError("We couldn’t confirm your application. Please retry, or use Learn more to text us.");
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  if (state === "success") return <div ref={statusRef} className="success-application-receipt" role="status" tabIndex={-1}>
    <span className="success-application-receipt-icon"><Check size={24} aria-hidden="true" /></span>
    <p className="editorial-kicker">SUCCESS EMPIRE</p>
    <h2>Application received.</h2>
    <p>Thank you for sharing what you’re working toward. We’ll use the details you provided to follow up about your application.</p>
    <Link href="/archive/" className="editorial-button editorial-button-outline">Explore The Archive <ArrowRight size={17} aria-hidden="true" /></Link>
  </div>;

  return <form onSubmit={submit} className="success-application-form" aria-labelledby="application-form-title">
    <p className="editorial-kicker">YOUR APPLICATION</p>
    <h2 id="application-form-title">Tell us what’s next.</h2>
    <p className="success-application-form-intro">A few details. One honest answer.</p>
    <fieldset disabled={state === "sending" || retryOnly}>
      <legend className="sr-only">Apply to join Success Empire</legend>
      <label htmlFor="application-name">Full name</label>
      <input id="application-name" name="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" />
      <label htmlFor="application-email">Email</label>
      <input id="application-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
      <label htmlFor="application-phone">Phone</label>
      <input id="application-phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="Your phone number" aria-describedby="application-phone-note" />
      <p id="application-phone-note" className="success-application-field-note">Include your country code if outside the U.S.</p>
      <label htmlFor="application-message">{SUCCESS_EMPIRE.applicationQuestion}</label>
      <textarea id="application-message" name="message" required minLength={10} maxLength={2000} rows={4} placeholder="Tell us what you’re working toward." />
      <div className="success-application-honeypot" aria-hidden="true">
        <label htmlFor="application-website">Leave this field empty</label>
        <input id="application-website" name="company_website" autoComplete="off" tabIndex={-1} maxLength={200} />
      </div>
    </fieldset>
    <p className="success-application-privacy">We’ll use these details to respond to your application. Read our <Link href="/privacy/">privacy policy</Link>.</p>
    {error && <div className="success-application-error" role="alert">{error}{retryOnly && <span> Retry below with the same details, or text us if you need to make a change.</span>}</div>}
    <button type="submit" className="editorial-button success-application-submit" disabled={state === "sending"}>
      {state === "sending" ? <>Submitting application <LoaderCircle className="success-application-spinner" size={18} aria-hidden="true" /></> : <>{retryOnly ? "Retry application" : "Submit application"} <ArrowRight size={18} aria-hidden="true" /></>}
    </button>
    <a className="success-empire-text" href={SUCCESS_EMPIRE_SMS}><MessageCircle size={17} aria-hidden="true" /> Learn more</a>
  </form>;
}
