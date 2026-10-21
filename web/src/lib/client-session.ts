import { supabase } from './supabase';

/**
 * Access token for authenticated browser requests to the account API routes.
 * The routes verify the token server-side with the Supabase admin client.
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
