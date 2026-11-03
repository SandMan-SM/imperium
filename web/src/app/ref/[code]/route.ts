import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { findReferrerByCode, REFERRAL_COOKIE } from '@/lib/server/referrals';

/**
 * The referral link.
 *
 * A member shares `https://secretimperium.com/ref/<CODE>`. This route is
 * what that link points at: it checks the code against the codes that have
 * actually been issued, remembers it in the visitor's browser, and sends
 * them on to the site.
 *
 * The code is remembered in a cookie rather than in the URL, because the
 * journey from here to a paid membership is several clicks and a checkout —
 * a parameter on the URL is easy to lose, and a cookie is read by the
 * server on every step.
 *
 * An unknown code is not an error page. A shared link that has been typed
 * by hand, or a code that was revoked, still sends the visitor to the site
 * — it simply earns nobody a commission.
 */

const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Only a path inside this site may be a redirect target. */
function safeTarget(value: string | null): string {
    if (!value) return '/';
    if (!value.startsWith('/') || value.startsWith('//')) return '/';
    return value;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> },
) {
    const { code: rawCode } = await params;
    const code = decodeURIComponent(rawCode || '').trim().toUpperCase();

    const url = new URL(request.url);
    const target = safeTarget(url.searchParams.get('to'));

    if (!CODE_PATTERN.test(code)) {
        return NextResponse.redirect(new URL(target, url.origin), 302);
    }

    const admin = getAdminClient();
    const referrer = admin ? await findReferrerByCode(admin, code) : null;

    if (!referrer) {
        // The code is unknown. The visitor still goes to the site — they
        // simply do not carry a referral.
        return NextResponse.redirect(new URL(target, url.origin), 302);
    }

    const response = NextResponse.redirect(new URL(target, url.origin), 302);
    response.cookies.set(REFERRAL_COOKIE, code, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE_SECONDS,
    });

    return response;
}
