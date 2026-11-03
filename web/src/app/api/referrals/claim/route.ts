export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { resolveCaller } from '@/lib/server/request-user';
import { resolveMembership } from '@/lib/server/membership';
import {
    awardReferralCommission,
    claimReferral,
    REFERRAL_COOKIE,
    referralSummary,
} from '@/lib/server/referrals';

/**
 * Claims the referral a visitor arrived with.
 *
 * The code was put in the visitor's browser when they opened the member's
 * link. It is claimed the moment there is an account to attach it to — so
 * the referral is recorded against the person who sent it, and the member
 * who sent it sees a referral that actually happened.
 *
 * Two rules keep this honest:
 *   1. The caller's session is the only credential. You cannot claim a
 *      referral onto somebody else's account.
 *   2. The first referral recorded on an account is the one that counts,
 *      and a member cannot refer themselves.
 *
 * A member who paid before they had an account is the awkward case: the
 * payment cleared before there was a profile to attribute it to. When the
 * account appears, the commission for that membership is recorded here.
 */

export async function POST(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!caller.profile) {
            return NextResponse.json({ error: 'No profile for this account' }, { status: 404 });
        }

        const cookieStore = await cookies();
        const code = cookieStore.get(REFERRAL_COOKIE)?.value?.trim().toUpperCase() || '';

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        if (!code) {
            const summary = await referralSummary(admin, caller.profile.id);
            return NextResponse.json({ claimed: false, reason: 'no referral code', ...summary });
        }

        const result = await claimReferral(admin, {
            referredProfileId: caller.profile.id,
            code,
        });

        if (result.ok) {
            // The membership may have been paid for before this account
            // existed — the webhook had no profile to attach the commission
            // to. Stripe is the ledger, so the membership is asked for
            // rather than read off a flag on a profile row.
            const membership = await resolveMembership(caller.user.email);
            if (membership.premium) {
                await awardReferralCommission(admin, { referredId: caller.profile.id });
            }
        }

        const summary = await referralSummary(admin, caller.profile.id);

        return NextResponse.json({
            claimed: result.ok,
            reason: result.reason ?? null,
            ...summary,
        });
    } catch (error) {
        console.error('Referral claim error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
