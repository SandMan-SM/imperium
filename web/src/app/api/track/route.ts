export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HUB_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Preserve the visitor's real IP so the hub's rate limiting and
    // geo fields stay accurate.
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;

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
