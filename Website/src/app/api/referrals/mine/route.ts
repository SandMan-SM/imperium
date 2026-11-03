export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { resolveCaller } from '@/lib/server/request-user';
import { referralSummary } from '@/lib/server/referrals';

/**
 * The member's own referral record.
 *
 * The portal used to show a referral link built from the first eight
 * characters of the profile's uuid, pointing at a domain the site does not
 * serve and a route that does not exist. It looked like a link and could
 * never work, and no commission was recorded anywhere.
 *
 * This route answers with the real thing: the member's code, the link built
 * from it, how many referrals they have sent and what they have earned.
 *
 * The caller's session is the only credential — the figures are the
 * caller's own, and nobody else's.
 */

export async function GET(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!caller.profile) {
            return NextResponse.json({ error: 'No profile for this account' }, { status: 404 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const summary = await referralSummary(admin, caller.profile.id);

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Referral summary error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
