"use client";

import { useCallback, useEffect, useState } from "react";
import { CURRICULUM, TOTAL_UNITS } from "./curriculum";

// Progress for the 28 Principles course.
// Persisted in localStorage under a versioned key. Shape mirrors a future
// Supabase `user_progress` table:
//   user_progress(user_id, unit_id INT, completed BOOL, sub_points JSONB, updated_at)
// When auth-bound progress is needed, swap the storage backend in this file —
// every consumer uses the hook below and stays untouched.

const STORAGE_KEY = "imperium_28p_progress_v1";

export type SubPointPath = string; // "0", "1", "1.0", "1.2.3" — index path into the SubPoint tree

export type UnitProgress = {
    completed: boolean;
    subPoints: Record<SubPointPath, boolean>;
    updatedAt: number;
};

export type ProgressState = {
    units: Record<number, UnitProgress>;
    lastUnitId: number | null;
};

const EMPTY: ProgressState = { units: {}, lastUnitId: null };

function read(): ProgressState {
    if (typeof window === "undefined") return EMPTY;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY;
        const parsed = JSON.parse(raw) as ProgressState;
        if (!parsed || typeof parsed !== "object" || !parsed.units) return EMPTY;
        return parsed;
    } catch {
        return EMPTY;
    }
}

function write(state: ProgressState) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore quota / private mode
    }
}

function ensureUnit(state: ProgressState, unitId: number): UnitProgress {
    return state.units[unitId] ?? { completed: false, subPoints: {}, updatedAt: 0 };
}

export function useProgress() {
    const [state, setState] = useState<ProgressState>(EMPTY);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setState(read());
        setHydrated(true);
    }, []);

    const update = useCallback((mutator: (s: ProgressState) => ProgressState) => {
        setState((prev) => {
            const next = mutator(prev);
            write(next);
            return next;
        });
    }, []);

    const markUnit = useCallback(
        (unitId: number, completed: boolean) => {
            update((s) => {
                const unit = ensureUnit(s, unitId);
                return {
                    ...s,
                    units: {
                        ...s.units,
                        [unitId]: { ...unit, completed, updatedAt: Date.now() },
                    },
                    lastUnitId: unitId,
                };
            });
        },
        [update],
    );

    const toggleSubPoint = useCallback(
        (unitId: number, path: SubPointPath) => {
            update((s) => {
                const unit = ensureUnit(s, unitId);
                const nextChecked = !unit.subPoints[path];
                return {
                    ...s,
                    units: {
                        ...s.units,
                        [unitId]: {
                            ...unit,
                            subPoints: { ...unit.subPoints, [path]: nextChecked },
                            updatedAt: Date.now(),
                        },
                    },
                    lastUnitId: unitId,
                };
            });
        },
        [update],
    );

    const reset = useCallback(() => {
        update(() => EMPTY);
    }, [update]);

    return { state, hydrated, markUnit, toggleSubPoint, reset };
}

// ---------- Pure selectors (no React) — usable in non-component code too ----------

export function isUnitComplete(state: ProgressState, unitId: number): boolean {
    return !!state.units[unitId]?.completed;
}

export function isSubPointChecked(state: ProgressState, unitId: number, path: SubPointPath): boolean {
    return !!state.units[unitId]?.subPoints?.[path];
}

export function phaseProgress(state: ProgressState, phaseId: number): { completed: number; total: number } {
    const phase = CURRICULUM.find((p) => p.id === phaseId);
    if (!phase) return { completed: 0, total: 0 };
    const total = phase.units.length;
    const completed = phase.units.filter((u) => isUnitComplete(state, u.id)).length;
    return { completed, total };
}

export function overallProgress(state: ProgressState): { completed: number; total: number; percent: number } {
    const completed = Object.values(state.units).filter((u) => u.completed).length;
    const percent = TOTAL_UNITS === 0 ? 0 : Math.round((completed / TOTAL_UNITS) * 100);
    return { completed, total: TOTAL_UNITS, percent };
}

export function lastUnit(state: ProgressState) {
    if (!state.lastUnitId) return null;
    for (const phase of CURRICULUM) {
        const unit = phase.units.find((u) => u.id === state.lastUnitId);
        if (unit) return { phase, unit };
    }
    return null;
}
