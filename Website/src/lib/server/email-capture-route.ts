import { NextResponse } from 'next/server';
import {
  captureEmailCapture,
  cleanText,
  isValidEmail,
  type CaptureInput,
} from './imperium-capture';
import { consumeRateWindow, requestIp } from './rate-limit';

/**
 * Shared request handler for every public email capture form on the site.
 * Rate limiting happens here (not only in the capture pipeline) so a flood of
 * junk submissions never reaches Supabase or the hub.
 */

const MAX_BODY_BYTES = 8 * 1024;

export async function handleEmailCaptureRequest(
  request: Request,
  options: { defaultSource: string },
): Promise<Response> {
  const ip = requestIp(request);
  const limited = consumeRateWindow(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } },
    );
  }

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: 'Submission is too large.' },
      { status: 413 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  // Honeypot — bots fill the hidden field. Answer 200 so they learn nothing,
  // and never write a row.
  const decoy = ['website', 'url', 'company_website', 'hp']
    .map((key) => cleanText(body[key], 200))
    .find((value) => value.length > 0);
  if (decoy) {
    return NextResponse.json({ success: true, persisted: false, emailSent: false });
  }

  const email = cleanText(body.email, 254).toLowerCase();
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email is required.' },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const referer = cleanText(request.headers.get('referer'), 2048);
  const principle = cleanText(body.principle_accessed, 40);
  const message = cleanText(body.message, 1000);

  const input: CaptureInput = {
    email,
    firstName: cleanText(body.firstName, 80) || cleanText(body.first_name, 80) || undefined,
    lastName: cleanText(body.lastName, 80) || cleanText(body.last_name, 80) || undefined,
    phone: cleanText(body.phone, 50) || undefined,
    message: message || (principle ? `Principle access: ${principle}` : undefined),
    source: cleanText(body.source, 50) || options.defaultSource,
    pageUrl: cleanText(body.page_url, 2048) || referer || undefined,
    referrer: referer || undefined,
    utmSource: cleanText(body.utm_source, 100) || undefined,
    utmMedium: cleanText(body.utm_medium, 100) || undefined,
    utmCampaign: cleanText(body.utm_campaign, 100) || undefined,
    visitorId: cleanText(body.visitor_id, 100) || undefined,
    sessionId: cleanText(body.session_id, 100) || undefined,
    userAgent: cleanText(request.headers.get('user-agent'), 500) || undefined,
    ipAddress: ip === 'unknown' ? undefined : ip,
  };

  const result = await captureEmailCapture(input);

  if (!result.persisted) {
    return NextResponse.json(
      {
        success: false,
        error: 'We could not save your details. Please try again in a moment.',
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    persisted: true,
    emailSent: result.emailSent,
    suppressed: result.suppressed,
  });
}
