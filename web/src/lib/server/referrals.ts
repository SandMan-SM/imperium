/**
 * The referral programme.
 *
 * The portal has always promised a 30% commission on a referral and the
 * referral page repeated it. Nothing behind the promise existed: no member
 * had a code, no referral was ever recorded, and no commission was ever
 * calculated — so the site was making a promise it had no way to keep.
 *
 * This module is the mechanism behind that promise. It lives in one place so
 * the link a member shares, the referral that is recorded, the commission
 * that is earned and the figure the member sees cannot drift apart.
 *
 * The live schema:
 *   profiles  — `metadata` jsonb holds `referral_code` and `referred_by`
 *   referrals — `referrer_id` and `referred_id` point at `profiles(id)`,
 *               and the row carries the reward: `reward_amount`,
 *               `reward_currency`, `reward_type`, `reward_claimed`,
 *               `claimed_at`, `stripe_subscription_id`
 *
 * `profiles.id` is NOT the auth user id — it is its own uuid, and every
 * reference here is to `profiles(id)`.
 */

import { getAdminClient } from './imperium-capture';
import { BRAND } from '@/lib/brand';

/** The share of a referral's membership that the referrer earns. */
export const REFERRAL_COMMISSION_RATE = 0.3;

/** The membership the commission is a share of: $20 a month. */
export const MEMBERSHIP_PRICE_CENTS = 2000;

/** Where the referral code is remembered in the visitor's browser. */
export const REFERRAL_COOKIE = 'imperium_ref';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

type ProfileMeta = Record<string, unknown> | null;

export type ReferralSummary = {
    /** The member's own code, once one has been issued. */
    code: string | null;
    /** The link to share. */
    link: string | null;
    /** How many referrals this member has sent. */
    referralCount: number;
    /** Commission earned and paid out, in dollars. */
    commissionPaid: number;
    /** Commission earned and not yet paid out, in dollars. */
    commissionUnpaid: number;
};

/** A short, unambiguous code. No vowels that read as letters, no 0/O. */
export function generateReferralCode(): string {
    let code = '';
    for (let index = 0; index < 8; index += 1) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
}

/** The link a member shares. It carries the code and nothing else. */
export function referralLink(code: string): string {
    return `${BRAND.siteUrl}/ref/${code}`;
}

/** Reads a referral code out of a metadata bag. */
export function readReferralCode(metadata: ProfileMeta): string | null {
    const code = metadata?.referral_code;
    return typeof code === 'string' && code.trim() ? code.trim().toUpperCase() : null;
}

/** Reads the referrer's profile id out of a metadata bag. */
export function readReferredBy(metadata: ProfileMeta): string | null {
    const id = metadata?.referred_by;
    return typeof id === 'string' && id.trim() ? id.trim() : null;
}

/**
 * Finds the member who owns a referral code.
 *
 * The code lives in `profiles.metadata`, so this is a containment test
 * against the jsonb column. Only codes that have actually been issued can
 * be found.
 */
export async function findReferrerByCode(
    admin: AdminClient,
    code: string,
): Promise<{ id: string; first_name: string | null; last_name: string | null; email: string | null } | null> {
    const { data } = await admin
        .from('profiles')
        .select('id, first_name, last_name, email')
        .contains('metadata', { referral_code: code.toUpperCase() })
        .limit(1);

    return (data?.[0] as { id: string; first_name: string | null; last_name: string | null; email: string | null }) ?? null;
}

/**
 * Issues a referral code to a member, if they do not have one.
 *
 * The code is stored in `profiles.metadata`, alongside whatever else the
 * profile keeps there, so issuing one never overwrites anything.
 */
export async function ensureReferralCode(admin: AdminClient, profileId: string): Promise<string | null> {
    const { data, error } = await admin
        .from('profiles')
        .select('metadata')
        .eq('id', profileId)
        .limit(1);

    if (error) {
        console.error('Referral: could not read the profile metadata:', error.message);
        return null;
    }

    const metadata = (data?.[0]?.metadata ?? null) as ProfileMeta;
    const existing = readReferralCode(metadata);
    if (existing) return existing;

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = generateReferralCode();

        const { data: taken } = await admin
            .from('profiles')
            .select('id')
            .contains('metadata', { referral_code: code })
            .limit(1);

        if (taken && taken.length > 0) continue;

        const { error: updateError } = await admin
            .from('profiles')
            .update({ metadata: { ...(metadata || {}), referral_code: code } })
            .eq('id', profileId);

        if (updateError) {
            console.error('Referral: could not issue a code:', updateError.message);
            return null;
        }

        return code;
    }

    return null;
}

/**
 * Records the referral itself.
 *
 * One row per (referrer, referred) pair: a member who opens the link twice
 * is still one referral, and the commission is earned once.
 */
export async function recordReferral(admin: AdminClient, referrerId: string, referredId: string): Promise<boolean> {
    if (referrerId === referredId) return false;

    const { data: existing } = await admin
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('referred_id', referredId)
        .limit(1);

    if (existing && existing.length > 0) return true;

    const { error } = await admin.from('referrals').insert({
        referrer_id: referrerId,
        referred_id: referredId,
        reward_claimed: false,
    });

    if (error) {
        console.error('Referral: could not record the referral:', error.message);
        return false;
    }

    return true;
}

/**
 * Records the commission a referral has earned.
 *
 * The commission is a share of the membership the referral paid for. It is
 * written once: a replayed Stripe event, or a member who signs in twice,
 * must not double the figure the member is shown.
 *
 * Two things about the row. The database fills in its own defaults when the
 * row is created — `reward_amount` of 0, `reward_currency` of USD and a
 * `reward_type` — so the test for "already earned" is an amount above zero,
 * not an amount that is not null. And the amount is written in dollars, the
 * same unit as the currency column beside it, so the row reads the way it
 * looks in the database.
 */
export async function awardReferralCommission(
    admin: AdminClient,
    options: { referredId: string; amountCents?: number | null; subscriptionId?: string | null },
): Promise<number | null> {
    const { referredId, amountCents, subscriptionId } = options;

    const { data: rows } = await admin
        .from('referrals')
        .select('id, reward_amount, reward_claimed')
        .eq('referred_id', referredId)
        .order('created_at', { ascending: false })
        .limit(1);

    const row = rows?.[0] as
        | { id: string; reward_amount: number | null; reward_claimed: boolean | null }
        | undefined;

    if (!row) return null;

    // Already earned. The first figure recorded is the one that counts.
    if (Number(row.reward_amount || 0) > 0) {
        return Number(row.reward_amount);
    }

    const base = amountCents && amountCents > 0 ? amountCents : MEMBERSHIP_PRICE_CENTS;
    const commission = Math.round(base * REFERRAL_COMMISSION_RATE) / 100;

    if (commission <= 0) return null;

    const patch: Record<string, unknown> = {
        reward_amount: commission,
        reward_claimed: false,
    };

    if (subscriptionId) patch.stripe_subscription_id = subscriptionId;

    const { error } = await admin.from('referrals').update(patch).eq('id', row.id);

    if (error) {
        console.error('Referral: could not record the commission:', error.message);
        return null;
    }

    return commission;
}

/**
 * What a member has earned, and the link they share.
 *
 * A member with no code yet is given one here, so the link in the portal is
 * always a working link rather than a placeholder.
 */
export async function referralSummary(admin: AdminClient, profileId: string): Promise<ReferralSummary> {
    const code = await ensureReferralCode(admin, profileId);

    const { data: rows } = await admin
        .from('referrals')
        .select('reward_amount, reward_claimed')
        .eq('referrer_id', profileId);

    const referrals = rows ?? [];
    let paid = 0;
    let unpaid = 0;

    for (const row of referrals as { reward_amount: number | null; reward_claimed: boolean | null }[]) {
        const amount = Number(row.reward_amount || 0);
        if (amount <= 0) continue;
        if (row.reward_claimed) paid += amount;
        else unpaid += amount;
    }

    return {
        code,
        link: code ? referralLink(code) : null,
        referralCount: referrals.length,
        commissionPaid: Math.round(paid * 100) / 100,
        commissionUnpaid: Math.round(unpaid * 100) / 100,
    };
}

/**
 * Claims a referral for a member.
 *
 * The code arrives in the visitor's browser (it was put there when they
 * opened the member's link) and is checked against the codes that have
 * actually been issued. The member's own profile records who referred them,
 * and the referral row is written.
 *
 * Returns what happened, so the caller can say it plainly.
 */
export async function claimReferral(
    admin: AdminClient,
    options: { referredProfileId: string; code: string },
): Promise<{ ok: boolean; reason?: string }> {
    const code = options.code.trim().toUpperCase();
    if (!code) return { ok: false, reason: 'no code' };

    const referrer = await findReferrerByCode(admin, code);
    if (!referrer) return { ok: false, reason: 'unknown code' };

    if (referrer.id === options.referredProfileId) {
        return { ok: false, reason: 'self referral' };
    }

    const { data: current } = await admin
        .from('profiles')
        .select('metadata')
        .eq('id', options.referredProfileId)
        .limit(1);

    const metadata = (current?.[0]?.metadata ?? null) as ProfileMeta;
    const existingReferrer = readReferredBy(metadata);

    // The first referral recorded is the one that counts. A member who opens
    // two people's links has still only been referred by one of them.
    if (existingReferrer && existingReferrer !== referrer.id) {
        return { ok: false, reason: 'already referred' };
    }

    if (!existingReferrer) {
        const { error } = await admin
            .from('profiles')
            .update({ metadata: { ...(metadata || {}), referred_by: referrer.id } })
            .eq('id', options.referredProfileId);

        if (error) {
            console.error('Referral: could not record the referrer:', error.message);
            return { ok: false, reason: 'could not record the referrer' };
        }
    }

    await recordReferral(admin, referrer.id, options.referredProfileId);

    return { ok: true };
}
