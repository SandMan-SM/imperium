import { getAdminClient } from './imperium-capture';

/**
 * Resolves the person behind an incoming request.
 *
 * The browser cannot read `profiles` directly any more. The fleet's own RLS
 * policies are self-referential — `profiles_admin_modify_all` subqueries the
 * `profiles` table — so every authenticated read of `profiles` fails with
 * Postgres error 42P17 ("infinite recursion detected in policy") and the
 * client silently receives an empty result. Anonymous reads are blocked
 * entirely, because the only policy open to `anon` is the one keyed to a
 * hard-coded operator email.
 *
 * So the profile read has to happen server side, with the service-role key,
 * where RLS does not apply. This module is the single place that turns a
 * request's bearer token into an auth user plus their profile row.
 *
 * `profiles.id` is NOT the auth user id: it is a separate uuid, and the
 * `subscriptions` / `referrals` foreign keys point at `profiles(id)`. Use
 * `profile.id` for those inserts, never `user.id`.
 */

export type CallerProfile = {
    id: string;
    auth_id: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean;
    is_premium: boolean;
    is_subscribed: boolean;
    subscription_status: string | null;
    tier: string | null;
    total_spent: number | null;
    purchase_count: number | null;
    newsletter_subscribed: boolean | null;
    metadata: Record<string, unknown> | null;
};

export type Caller = {
    user: { id: string; email: string | null };
    profile: CallerProfile | null;
};

/** Reads the bearer token from the request's Authorization header. */
export function readBearerToken(request: Request): string | null {
    const header = request.headers.get('authorization') || '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    return token || null;
}

/**
 * Resolves the caller. Returns null when the request carries no usable
 * Supabase access token.
 */
export async function resolveCaller(request: Request): Promise<Caller | null> {
    const token = readBearerToken(request);
    if (!token) return null;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey && token === serviceKey) return null;

    const admin = getAdminClient();
    if (!admin) return null;

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;

    const user = data.user;
    const profile = await findProfile(admin, user.id, user.email);

    return { user: { id: user.id, email: user.email ?? null }, profile };
}

/**
 * Finds the profile row for an auth user. The link is `profiles.auth_id`; rows
 * created before the auth link existed are matched on the account email.
 */
export async function findProfile(
    admin: NonNullable<ReturnType<typeof getAdminClient>>,
    authId: string,
    email?: string | null,
): Promise<CallerProfile | null> {
    const { data: byAuth } = await admin
        .from('profiles')
        .select('*')
        .eq('auth_id', authId)
        .limit(1);

    if (byAuth && byAuth.length > 0) return byAuth[0] as CallerProfile;

    if (!email) return null;

    const { data: byEmail } = await admin
        .from('profiles')
        .select('*')
        .ilike('email', email)
        .limit(1);

    return byEmail && byEmail.length > 0 ? (byEmail[0] as CallerProfile) : null;
}
