export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { consumeRateWindow, requestIp } from "@/lib/server/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIST_ENDPOINT = "https://omnileadsagi.com/api/federation-newsletter/subscribe";
const EVENT_ENDPOINT = "https://omnileadsagi.com/api/inbound/imperium/events";

async function post(url: string, body: unknown): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: controller.signal, cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  // This route puts an address on the brand's mailing list and writes an
  // event into the hub. Unrated, it is a way to send the brand's mail to any
  // address on demand, so the caller's IP is counted first.
  const limited = consumeRateWindow(`subscribe:${requestIp(request)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const [listOk] = await Promise.all([
    post(LIST_ENDPOINT, { site: "imperium", email, source: "imperium" }),
    post(EVENT_ENDPOINT, {
      event_type: "form_submit", event_category: "subscribe", action: "imperium_subscribe",
      page_url: "/subscribe", value_text: email,
      properties: { email, source: "imperium", list: "imperium", subscriber_captured: true },
    }),
  ]);
  if (!listOk) return NextResponse.json({ ok: false, error: "subscribe_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
