"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { BRAND, STRIPE_CHECKOUT_URL } from "@/lib/brand";

/**
 * The member view of the 28 Principles.
 *
 * The outline and the lessons arrive from `/api/principles`, which only
 * releases the body of a unit to a paying member. A locked unit therefore
 * has no content on the client to peek at — it was never sent.
 */

type UnitSummary = {
    number: number;
    slug: string;
    title: string;
    summary: string;
    points: string[];
    phaseId: number;
    phaseTitle: string;
    locked: boolean;
};

type UnitLesson = UnitSummary & {
    locked: false;
    quote: string;
    body: string[];
    reflection: string;
};

type Unit = UnitSummary | UnitLesson;

type CurriculumPayload = {
    authenticated: boolean;
    premium: boolean;
    membershipSource: string;
    subscriptionStatus: string | null;
    completedUnits: number[];
    freeUnit: number;
    unitCount: number;
    units: Unit[];
};

function isLesson(unit: Unit): unit is UnitLesson {
    return "body" in unit && Array.isArray((unit as UnitLesson).body);
}

export function PrinciplesLibrary() {
    const { user, profileLoaded } = useAuth();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [payload, setPayload] = useState<CurriculumPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openUnit, setOpenUnit] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [checkout, setCheckout] = useState<{ paid: boolean; email: string | null } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            const response = await fetch("/api/principles", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: "no-store",
            });

            if (!response.ok) throw new Error("Could not load the curriculum");

            const body = (await response.json()) as CurriculumPayload;
            setPayload(body);
            setOpenUnit((current) => current ?? body.freeUnit);
        } catch (loadError) {
            console.error(loadError);
            setError("The curriculum could not be loaded. Try again in a moment.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    // Stripe sends the member back here after a completed checkout. Read the
    // session so the page can name the address the membership is attached to.
    useEffect(() => {
        if (!sessionId) return;

        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch(`/api/membership/session?session_id=${encodeURIComponent(sessionId)}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!response.ok) return;
                const body = (await response.json()) as { paid?: boolean; email?: string | null };
                setCheckout({ paid: Boolean(body.paid), email: body.email ?? null });
            } catch (fetchError) {
                console.error(fetchError);
            }
        })();

        return () => controller.abort();
    }, [sessionId]);

    // The membership state can change while the page is open (a checkout
    // completing in another tab, a renewal landing). Re-read once the
    // session has settled.
    useEffect(() => {
        if (profileLoaded && user) void load();
    }, [profileLoaded, user, load]);

    const units = useMemo(() => payload?.units ?? [], [payload?.units]);
    const completed = useMemo(
        () => new Set(payload?.completedUnits ?? []),
        [payload?.completedUnits],
    );

    const phases = useMemo(() => {
        const grouped = new Map<number, { id: number; title: string; units: Unit[] }>();
        for (const unit of units) {
            const existing = grouped.get(unit.phaseId);
            if (existing) existing.units.push(unit);
            else grouped.set(unit.phaseId, { id: unit.phaseId, title: unit.phaseTitle, units: [unit] });
        }
        return Array.from(grouped.values());
    }, [units]);

    const active = units.find((unit) => unit.number === openUnit) ?? null;
    const progress = payload ? (payload.completedUnits.length / Math.max(payload.unitCount, 1)) * 100 : 0;

    const toggleComplete = async (unitNumber: number, completedFlag: boolean) => {
        if (!payload?.authenticated) return;

        setSaving(true);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            const response = await fetch("/api/principles", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ unit: unitNumber, completed: completedFlag }),
            });

            if (!response.ok) {
                setError("Progress could not be saved. Try again.");
                return;
            }

            const body = (await response.json()) as { completedUnits: number[] };
            setPayload({ ...payload, completedUnits: body.completedUnits });
        } catch (saveError) {
            console.error(saveError);
            setError("Progress could not be saved. Try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !payload) {
        return (
            <div className="member-loading">
                <Loader2 size={20} aria-hidden="true" className="animate-spin" />
                <span>Loading the curriculum…</span>
            </div>
        );
    }

    if (error && !payload) {
        return (
            <div className="member-loading">
                <span>{error}</span>
                <button type="button" className="editorial-button editorial-button-outline" onClick={() => void load()}>
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="member-shell">
            {checkout?.paid && !payload?.premium && (
                <div className="member-activation" role="status">
                    <div>
                        <p className="editorial-kicker">PAYMENT RECEIVED</p>
                        <p>
                            {checkout.email
                                ? `Your membership is attached to ${checkout.email}. `
                                : "Your membership is active. "}
                            {payload?.authenticated
                                ? "You are signed in with a different account — sign in with the address above to open the curriculum."
                                : "Sign in with that address to open the curriculum."}
                        </p>
                    </div>
                    <div className="member-gate-actions">
                        <Link className="editorial-button" href="/login/">
                            Sign in
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        {!payload?.authenticated && (
                            <Link className="member-gate-note" href="/signup/">
                                No account yet? Create one with the same address.
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="member-status">
                <div className="member-status-copy">
                    <p className="editorial-kicker">
                        {payload?.premium ? "IMPERIUM ELITE · MEMBER ACCESS" : "THE CURRICULUM"}
                    </p>
                    <h2>
                        {payload?.premium
                            ? "The 28 Principles, in sequence."
                            : "Twenty-eight principles. One at a time."}
                    </h2>
                    <p className="member-status-note">
                        {payload?.premium
                            ? `${payload.completedUnits.length} of ${payload.unitCount} units complete. Your progress is saved to your account.`
                            : `Unit ${payload?.freeUnit ?? 1} is free to read. The rest of the sequence is open to Imperium Elite members.`}
                    </p>
                </div>
                <div className="member-progress-block">
                    <div className="member-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={payload?.unitCount ?? 28} aria-valuenow={payload?.completedUnits.length ?? 0} aria-label="Curriculum progress">
                        <div className="member-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <span className="member-progress-label">
                        {payload?.completedUnits.length ?? 0} / {payload?.unitCount ?? 28} complete
                    </span>
                </div>
            </div>

            {error && <p className="member-error" role="status">{error}</p>}

            {!payload?.premium && (
                <div className="member-gate">
                    <div>
                        <p className="editorial-kicker">MEMBERSHIP</p>
                        <p>
                            {payload?.authenticated
                                ? "Your account is not an active member yet. Join to open every unit, keep your progress, and get the weekly letter."
                                : "Join Imperium Elite to open all 28 units, keep your progress across devices, and get the weekly letter."}
                        </p>
                    </div>
                    <div className="member-gate-actions">
                        <a className="editorial-button" href={STRIPE_CHECKOUT_URL}>
                            Join — {BRAND.priceMonthly}
                            <ArrowRight size={18} aria-hidden="true" />
                        </a>
                        {payload?.authenticated ? (
                            <span className="member-gate-note">Your membership is tied to the email you used at checkout.</span>
                        ) : (
                            <span className="member-gate-note">
                                Already paid? <Link href="/login/">Sign in</Link> with the email you used at checkout.
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="member-columns">
                <nav className="member-index" aria-label="The 28 Principles">
                    {phases.map((phase) => (
                        <div key={phase.id} className="member-phase">
                            <p className="member-phase-title">Phase {phase.id} — {phase.title}</p>
                            <ul>
                                {phase.units.map((unit) => {
                                    const isOpen = unit.number === openUnit;
                                    const isDone = completed.has(unit.number);
                                    return (
                                        <li key={unit.number}>
                                            <button
                                                type="button"
                                                className={`member-unit${isOpen ? " is-open" : ""}${unit.locked ? " is-locked" : ""}`}
                                                onClick={() => setOpenUnit(unit.number)}
                                                aria-current={isOpen ? "true" : undefined}
                                            >
                                                <span className="member-unit-number">{String(unit.number).padStart(2, "0")}</span>
                                                <span className="member-unit-title">{unit.title}</span>
                                                {isDone ? (
                                                    <Check size={15} aria-label="Complete" className="member-unit-state" />
                                                ) : unit.locked ? (
                                                    <Lock size={14} aria-label="Locked" className="member-unit-state" />
                                                ) : null}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <article className="member-lesson" aria-live="polite">
                    {active ? (
                        <>
                            <p className="editorial-kicker">
                                {active.phaseTitle} · UNIT {String(active.number).padStart(2, "0")}
                            </p>
                            <h3>{active.title}</h3>

                            {isLesson(active) ? (
                                <>
                                    {active.quote && <blockquote className="member-quote">{active.quote}</blockquote>}
                                    <div className="member-body">
                                        {active.body.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </div>
                                    <div className="member-points">
                                        <p className="member-points-title">This unit covers</p>
                                        <ul>
                                            {active.points.map((point) => (
                                                <li key={point}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="member-reflection">
                                        <p className="member-points-title">Put it to work</p>
                                        <p>{active.reflection}</p>
                                    </div>
                                    {payload?.authenticated && (
                                        <button
                                            type="button"
                                            className="member-complete"
                                            disabled={saving}
                                            onClick={() => void toggleComplete(active.number, !completed.has(active.number))}
                                        >
                                            {saving ? (
                                                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                                            ) : (
                                                <Check size={16} aria-hidden="true" />
                                            )}
                                            {completed.has(active.number) ? "Completed" : "Mark as complete"}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="member-locked">
                                    <Lock size={20} aria-hidden="true" />
                                    <p className="member-locked-title">This unit is open to members.</p>
                                    <p className="member-locked-body">
                                        Unit {active.number} — {active.title} — is part of the full Imperium Elite curriculum.
                                        Join to read it and work through the reflection.
                                    </p>
                                    <a className="editorial-button" href={STRIPE_CHECKOUT_URL}>
                                        Unlock the sequence — {BRAND.priceMonthly}
                                        <ArrowRight size={18} aria-hidden="true" />
                                    </a>
                                    {!payload?.authenticated && (
                                        <span className="member-gate-note">
                                            Already paid? <Link href="/login/">Sign in</Link> with the email you used at checkout.
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="member-locked-body">Choose a unit to begin.</p>
                    )}
                </article>
            </div>
        </div>
    );
}
