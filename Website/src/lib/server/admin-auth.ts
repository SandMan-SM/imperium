import { getAdminClient } from './imperium-capture';

/**
 * Server-side guard for the operator-only routes.
 *
 * The admin dashboard is gated in the browser (Supabase session -> profile
 * row), which is a client-side gate: the API routes behind it were reachable
 * by anyone who knew the URL, so a stranger could trigger a full newsletter
 * send.
 *
 * A request is allowed when it carries either
 *   1. the service-role key (automation and the dispatch webhook), or
 *   2. a Supabase access token belonging to a profile with `is_admin`.
 *
 * The profile is resolved by `auth_id` and falls back to the account email
 * for rows created before the auth link existed.
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && token === serviceKey) return true;

  const admin = getAdminClient();
  if (!admin) return false;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return false;

  const user = data.user;

  const { data: byAuth } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('auth_id', user.id)
    .limit(1);
  if (byAuth?.[0]?.is_admin) return true;

  if (!user.email) return false;

  const { data: byEmail } = await admin
    .from('profiles')
    .select('is_admin')
    .ilike('email', user.email)
    .limit(1);
  return Boolean(byEmail?.[0]?.is_admin);
}
