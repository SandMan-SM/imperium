"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ENDPOINT = "https://omnileadsagi.com/api/inbound";
const SLUG = "imperium";
const STORAGE_KEY = "imperium_session_v1";
const REF_KEY = "imperium_ref_v1";

type Session = { id: string; started: number };

function getSession(): Session {
  if (typeof window === "undefined") return { id: "ssr", started: Date.now() };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {}
  const fresh: Session = {
    id: `s_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`,
    started: Date.now(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

function captureReferral(search: URLSearchParams) {
  if (typeof window === "undefined") return;
  const ref = search.get("ref");
  const creative = search.get("utm_campaign");
  if (!ref) return;
  try {
    if (localStorage.getItem(REF_KEY)) return;
    localStorage.setItem(
      REF_KEY,
      JSON.stringify({
        referring_federation_slug: ref,
        referring_creative_id: creative ?? null,
        first_referral_ts: Date.now(),
      }),
    );
  } catch {}
}

function readReferral() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function send(body: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const url = `${ENDPOINT}/${SLUG}/events`;
  const payload = JSON.stringify(body);
  try {
    if ("sendBeacon" in navigator) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {}
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
    mode: "cors",
  }).catch(() => void 0);
}

export default function InboundTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (search) captureReferral(search);
  }, [search]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const session = getSession();
    const ref = readReferral();
    send({
      session_id: session.id,
      session_started: session.started,
      event_type: "page_view",
      event_category: SLUG,
      page_path: pathname,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      qs: search?.toString() || null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      viewport_w: typeof window !== "undefined" ? window.innerWidth : null,
      viewport_h: typeof window !== "undefined" ? window.innerHeight : null,
      ...(ref || {}),
    });
  }, [pathname, search]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-track]") as HTMLElement | null;
      if (!el) return;
      const session = getSession();
      const ref = readReferral();
      send({
        session_id: session.id,
        event_type: "click",
        event_category: SLUG,
        action: "click",
        target_id: el.getAttribute("data-track"),
        target_area: el.closest("[data-track-area]")?.getAttribute("data-track-area") || null,
        page_path: pathname,
        ...(ref || {}),
      });
    }
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  useEffect(() => {
    const fired = new Set<number>();
    const milestones = [25, 50, 75, 100];
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.round((window.scrollY / total) * 100);
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          const session = getSession();
          send({
            session_id: session.id,
            event_type: "scroll_depth",
            event_category: SLUG,
            page_path: pathname,
            value_numeric: m,
          });
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
