export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORWARD_URL = "https://omnileadsagi.com/api/inbound/imperium/events";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 422 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }

  // Best-effort forward into Imperium's own list. Never block or fail the
  // response on a forwarding error — swallow everything.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      await fetch(FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "form_submit",
          event_category: "subscribe",
          action: "imperium_subscribe",
          page_url: "/subscribe",
          value_text: email,
          properties: { email, source: "imperium", list: "imperium" },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Swallow all errors — the signup still succeeds for the user.
  }

  return NextResponse.json({ ok: true });
}
