import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getAdminClient } from './imperium-capture';

/**
 * Server-side guard for the authenticated account routes.
 *
 * The browser sends its Supabase access token in the Authorization header.
 * The token is verified with the service-role client, and the Imperium
 * profile row is resolved by `auth_id` (falling back to the account email
 * for rows created before the auth link existed).
 */

export type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  metadata: Record<string, unknown> | null;
};

export type AuthedAccount = {
  user: User;
  profile: ProfileRow | null;
  admin: AdminClient;
};

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function authenticateAccount(
  request: Request,
): Promise<{ ok: true; account: AuthedAccount } | { ok: false; response: NextResponse }> {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { ok: false, response: unauthorized('Sign in to continue.') };
  }

  const admin = getAdminClient();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Account service is not configured.' },
        { status: 503 },
      ),
    };
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, response: unauthorized('Your session expired. Sign in again.') };
  }

  const user = data.user;
  const profile = await findProfile(admin, user);

  return { ok: true, account: { user, profile, admin } };
}

async function findProfile(
  admin: AdminClient,
  user: User,
): Promise<ProfileRow | null> {
  const { data } = await admin
    .from('profiles')
    .select('id, email, first_name, last_name, phone, metadata')
    .eq('auth_id', user.id)
    .limit(1);

  const byAuth = data?.[0] as ProfileRow | undefined;
  if (byAuth) return byAuth;

  if (!user.email) return null;

  const { data: byEmail } = await admin
    .from('profiles')
    .select('id, email, first_name, last_name, phone, metadata')
    .ilike('email', user.email)
    .limit(1);

  const row = byEmail?.[0] as ProfileRow | undefined;
  if (row) {
    // Link the legacy row to the auth user so future lookups are direct.
    await admin.from('profiles').update({ auth_id: user.id }).eq('id', row.id);
    return { ...row };
  }
  return null;
}
