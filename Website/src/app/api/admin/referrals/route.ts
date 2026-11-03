export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { isAdminRequest } from '@/lib/server/admin-auth';

/**
 * The operator's view of the referral programme.
 *
 * The referral table carries the commission a referral has earned
 * (`reward_amount`, `reward_claimed`, `claimed_at`). Until now nothing
 * wrote those fields and nothing read them, so the commission the site
 * promised could not be tracked, audited or paid.
 *
 * GET   — every referral, with the member who sent it and the member who
 *         joined, and what each has earned.
 * PATCH — mark a commission paid. The payout itself is made by the team;
 *         this records that it happened, so the member's portal stops
 *         showing it as waiting.
 *
 * The caller's session is the only credential. These are the business's own
 * referral records and they name people.
 */

type ReferralRow = {
    id: string;
    referrer_id: string;
    referred_id: string;
    reward_amount: number | null;
    reward_currency: string | null;
    reward_type: string | null;
    reward_claimed: boolean | null;
    claimed_at: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    referrer_name: string | null;
    referrer_email: string | null;
    referred_name: string | null;
    referred_email: string | null;
};

export async function GET(request: Request) {
    try {
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const { data: referrals, error } = await admin
            .from('referrals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) {
            console.error('Admin referrals read failed:', error.message);
            return NextResponse.json({ error: 'Failed to read referrals' }, { status: 500 });
        }

        const rows = (referrals ?? []) as Omit<ReferralRow, 'referrer_name' | 'referrer_email' | 'referred_name' | 'referred_email'>[];

        // The two profile ids on a referral point at people. One read of the
        // profiles in question names them; there is no second query per row.
        const ids = Array.from(new Set(rows.flatMap((row) => [row.referrer_id, row.referred_id])));
        const names = new Map<string, { name: string | null; email: string | null }>();

        if (ids.length > 0) {
            const { data: profiles } = await admin
                .from('profiles')
                .select('id, first_name, last_name, email')
                .in('id', ids);

            for (const profile of (profiles ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[]) {
                const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
                names.set(profile.id, { name: name || null, email: profile.email ?? null });
            }
        }

        const payload: ReferralRow[] = rows.map((row) => {
            const referrer = names.get(row.referrer_id);
            const referred = names.get(row.referred_id);
            return {
                ...row,
                referrer_name: referrer?.name ?? null,
                referrer_email: referrer?.email ?? null,
                referred_name: referred?.name ?? null,
                referred_email: referred?.email ?? null,
            };
        });

        // `reward_amount` is written in dollars, the same unit as the
        // `reward_currency` column beside it, so the row reads the way it
        // looks in the database.
        const owed = Math.round(
            payload
                .filter((row) => !row.reward_claimed)
                .reduce((sum, row) => sum + Number(row.reward_amount || 0), 0) * 100,
        ) / 100;

        return NextResponse.json({
            referrals: payload,
            count: payload.length,
            owed,
        });
    } catch (error) {
        console.error('Admin referrals read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = (await request.json().catch(() => ({}))) as { id?: string; claimed?: boolean };
        const id = typeof body.id === 'string' ? body.id.trim() : '';
        const claimed = body.claimed !== false;

        if (!id) {
            return NextResponse.json({ error: 'A referral id is required' }, { status: 400 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const patch: Record<string, unknown> = { reward_claimed: claimed };
        patch.claimed_at = claimed ? new Date().toISOString() : null;

        const { data, error } = await admin
            .from('referrals')
            .update(patch)
            .eq('id', id)
            .select('id, reward_amount, reward_claimed, claimed_at')
            .single();

        if (error) {
            console.error('Admin referral update failed:', error.message);
            return NextResponse.json({ error: 'Failed to update the referral' }, { status: 500 });
        }

        return NextResponse.json({ referral: data });
    } catch (error) {
        console.error('Admin referral update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
