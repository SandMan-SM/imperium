export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { consumeRateWindow, requestIp } from '@/lib/server/rate-limit';

/**
 * Same-origin analytics proxy for the Omni hub.
 *
 * The browser beacon used to POST straight to
 * `https://omnileadsagi.com/api/inbound/imperium/events`. That endpoint
 * enforces a per-tenant CORS allowlist, and the hub's registry only lists
 * `https://secretimperium.com` for imperium — so on `imperiumelite.com`
 * every page view raised a CORS error and the event was dropped before it
 * reached the hub.
 *
 * Forwarding server-side removes the origin dependency entirely: both
 * production domains report through the same path, and the hub still sees
 * the real visitor IP because the incoming `x-forwarded-for` is passed on.
 */

const HUB_BASE_URL = process.env.OMNI_HUB_URL || 'https://omnileadsagi.com';
const HUB_ENDPOINT = `${HUB_BASE_URL}/api/inbound/imperium/events`;
const HUB_TIMEOUT_MS = 4000;

/** An analytics beacon is small. Anything larger is not one. */
const MAX_BODY_BYTES = 8 * 1024;

/**
 * The beacon rate that a page view costs.
 *
 * The shared limiter's ten calls per ten minutes is right for a form and
 * far too tight for a page: every navigation fires a beacon. This window is
 * generous enough for a fast reader and tight enough that a flood is still
 * stopped.
 */
const BEACON_MAX = 240;
const BEACON_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  // This route forwards a body to the hub's event endpoint. Open, it is a
  // relay: anything sent here is written into live tenant data. The
  // caller's IP is counted, and the body is bounded, before it goes on.
  const limited = consumeRateWindow(`track:${requestIp(request)}`, BEACON_MAX, BEACON_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json({ ok: false }, { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  // The beacon is an event, so it has to be an event. A body that is not a
  // JSON object is not one, and it is not forwarded.
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HUB_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // The hub's rate limiting and geo fields need the visitor's real IP.
    // The raw `x-forwarded-for` header is whatever the caller sent, so the
    // address is resolved from the edge headers instead and passed on.
    const visitorIp = requestIp(request);
    if (visitorIp !== 'unknown') headers['x-forwarded-for'] = visitorIp;

    const userAgent = request.headers.get('user-agent');
    if (userAgent) headers['user-agent'] = userAgent;

    const response = await fetch(HUB_ENDPOINT, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[track] hub rejected event:', response.status);
    }
  } catch (error) {
    // A failed analytics ping must never surface as a console error on the
    // page — the beacon is best-effort by design.
    console.error('[track] hub call failed:', error);
  } finally {
    clearTimeout(timeout);
  }

  return NextResponse.json({ ok: true });
}
