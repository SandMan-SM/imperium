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

/** The caller's IP, from the proxy headers Vercel sets. */
export function requestIp(request: Request): string {
  const forwarded = cleanText(request.headers.get('x-forwarded-for'), 256).split(',')[0]?.trim();
  return forwarded || cleanText(request.headers.get('x-real-ip'), 80) || 'unknown';
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
