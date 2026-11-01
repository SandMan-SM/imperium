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
    .select('id')
    .eq('auth_id', user.id)
    .eq('is_admin', true)
    .limit(1);
  if (byAuth && byAuth.length > 0) return true;

  if (!user.email) return false;

  // The email fallback finds rows written before the auth link existed. The
  // filter is on `is_admin` rather than on the first row that happens to
  // match: `profiles` is a shared table and one address can carry more than
  // one row, so reading the flag off an arbitrary row made the answer depend
  // on which row Postgres happened to return — and an operator whose address
  // had a second, ordinary row could be refused with a 401 on a button that
  // had always worked.
  const { data: byEmail } = await admin
    .from('profiles')
    .select('id')
    .ilike('email', user.email)
    .eq('is_admin', true)
    .limit(1);
  return Boolean(byEmail && byEmail.length > 0);
}
