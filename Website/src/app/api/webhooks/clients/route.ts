export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { handleEmailCaptureRequest } from '@/lib/server/email-capture-route';
import { cleanText, isValidEmail } from '@/lib/server/imperium-capture';

/**
 * Lead capture for external client sources.
 *
 * This route used to answer "Lead recorded and admin notified" while
 * recording nothing at all: the payload was read, a Telegram message was
 * assembled from it, and the lead itself was dropped on the floor. It also
 * accepted any body from anybody, which made it a relay into the operator's
 * private admin chat — every field was pasted straight into a message.
 *
 * The lead now goes through the same capture pipeline as every other form on
 * the site — validation, rate limiting, the subscriber row in `profiles` and
 * the tenant lead row in `inbound_imperium_leads` — and the Telegram ping
 * reports what actually happened instead of claiming success.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_TIMEOUT_MS = 8000;

type Lead = {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    notes: string;
};

/**
 * Tells the operator a lead arrived.
 *
 * Plain text, no `parse_mode`: a lead's own notes are pasted into the
 * message, and Markdown in them would make Telegram reject the whole
 * message. A failed ping is reported as a failed ping — a lead that nobody
 * hears about is a lead nobody follows up.
 */
async function notifyAdmin(lead: Lead): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return false;

    const text = [
        'New Imperium lead',
        `Name: ${lead.fullName}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone || 'not given'}`,
        `Company: ${lead.company || 'not given'}`,
        `Notes: ${lead.notes || 'none'}`,
    ].join('\n');

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text }),
            signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(
                'Lead notification failed:',
                response.status,
                (await response.text().catch(() => '')).slice(0, 200),
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error('Lead notification error:', error);
        return false;
    }
}

export async function POST(request: Request) {
    let parsed: unknown;
    try {
        parsed = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const body = parsed as Record<string, unknown>;
    const lead: Lead = {
        fullName: cleanText(body.fullName, 120),
        email: cleanText(body.email, 254).toLowerCase(),
        phone: cleanText(body.phone, 50),
        company: cleanText(body.company, 120),
        notes: cleanText(body.notes, 1000),
    };

    if (!lead.fullName) {
        return NextResponse.json({ error: 'fullName is required.' }, { status: 400 });
    }
    if (!isValidEmail(lead.email)) {
        return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const [first, ...rest] = lead.fullName.split(/\s+/);
    const firstName = first ?? '';
    const lastName = rest.join(' ');
    const message = [
        lead.company ? `Company: ${lead.company}` : '',
        lead.notes,
    ]
        .filter(Boolean)
        .join('\n');

    // The capture runs through the shared handler, which validates, rate
    // limits by address, writes the subscriber and the tenant lead, and
    // delivers the welcome email through the hub. The request headers that
    // matter for the rate limit and for the lead row are carried across.
    const normalized = new Request(request.url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
            'x-real-ip': request.headers.get('x-real-ip') ?? '',
            'user-agent': request.headers.get('user-agent') ?? '',
            referer: request.headers.get('referer') ?? '',
        },
        body: JSON.stringify({
            email: lead.email,
            firstName,
            lastName,
            phone: lead.phone,
            message,
            source: 'client_lead',
        }),
    });

    const capture = await handleEmailCaptureRequest(normalized, { defaultSource: 'client_lead' });
    const result = (await capture.json().catch(() => ({}))) as {
        success?: boolean;
        persisted?: boolean;
        emailSent?: boolean;
        error?: string;
    };

    if (!capture.ok) {
        return NextResponse.json(
            {
                success: false,
                error: result.error ?? 'The lead could not be recorded. Please try again in a moment.',
            },
            { status: capture.status, headers: capture.headers },
        );
    }

    const notified = await notifyAdmin(lead);

    return NextResponse.json({
        success: true,
        persisted: true,
        emailSent: Boolean(result.emailSent),
        notified,
        message: notified ? 'Lead recorded and admin notified.' : 'Lead recorded.',
    });
}
