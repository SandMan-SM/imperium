export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateAccount } from '@/lib/server/account-auth';

/**
 * Password change.
 *
 * The current password is verified first (Supabase re-authentication), then
 * the new password is set through the admin client. The verification client
 * is a throwaway instance with session persistence disabled so it can never
 * clobber the caller's own session.
 */
export async function POST(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  const { user, admin } = auth.account;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Enter your current password and a new password.' },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'Your new password must be at least 8 characters.' },
      { status: 400 },
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: 'Your new password must be different from the current one.' },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey || !user.email) {
    return NextResponse.json(
      { error: 'Password service is not configured.' },
      { status: 503 },
    );
  }

  const verifier = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json(
      { error: 'Your current password is not correct.' },
      { status: 401 },
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (updateError) {
    console.error('[account/password] update failed:', updateError.message);
    return NextResponse.json(
      { error: 'We could not update your password. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
