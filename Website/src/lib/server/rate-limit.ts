import { cleanText } from './imperium-capture';

/**
 * Shared rate limiting for the public write endpoints.
 *
 * Every public form on the site funnels through a handler that counts the
 * caller's IP in a fixed window. The counters live on `globalThis` because a
 * serverless function is a fresh module on every invocation, and a per-
 * invocation counter would never count anything.
 */

export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

type RateWindow = { count: number; resetAt: number };

const rateWindows =
  globalThis.__imperiumRateLimitWindows ?? new Map<string, RateWindow>();
globalThis.__imperiumRateLimitWindows = rateWindows;

declare global {
  var __imperiumRateLimitWindows: Map<string, RateWindow> | undefined;
}

/**
 * The caller's IP, from the proxy headers Vercel sets.
 *
 * The order matters. `x-forwarded-for` is a list the client can start, and
 * most edges append to it rather than replace it — so its FIRST entry is
 * whatever the caller sent, and a limiter that counts on it can be walked
 * around by rotating a header. Vercel's own `x-vercel-forwarded-for` and
 * `x-real-ip` are set by the edge and cannot be forged, and the LAST entry
 * of `x-forwarded-for` is the hop closest to the server.
 */
export function requestIp(request: Request): string {
  const last = (value: string | null): string => {
    const parts = cleanText(value, 256)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return '';
    // An address may carry a port (`1.2.3.4:5678`); the port is not the
    // identity, and it would split one caller into two windows.
    return parts[parts.length - 1].replace(/:\d+$/, '');
  };

  return (
    last(request.headers.get('x-vercel-forwarded-for')) ||
    last(request.headers.get('x-real-ip')) ||
    last(request.headers.get('x-forwarded-for')) ||
    'unknown'
  );
}

/**
 * Counts one call against `key`'s window and reports whether it is allowed.
 *
 * The window resets after `windowMs`. A caller over the limit is told how
 * long to wait, so the caller can answer with `Retry-After`.
 */
export function consumeRateWindow(
  key: string,
  max: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const current = rateWindows.get(key);

  if (!current || current.resetAt <= now) {
    rateWindows.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    current.count += 1;
    if (current.count > max) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }
  }

  // Keep the map from growing without bound on a long-lived instance.
  if (rateWindows.size > 2000) {
    for (const [candidate, value] of rateWindows) {
      if (value.resetAt <= now || rateWindows.size > 1500) rateWindows.delete(candidate);
    }
  }

  return { ok: true, retryAfterSeconds: 0 };
}
