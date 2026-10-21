export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { authenticateAccount } from '@/lib/server/account-auth';

/**
 * Account profile read/update.
 *
 * Writes the display name and phone to the Imperium `profiles` row and keeps
 * the auth user metadata in sync so the name is available on every request.
 */
export async function GET(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  const { profile, user } = auth.account;
  return NextResponse.json({
    success: true,
    profile: {
      email: profile?.email ?? user.email ?? null,
      firstName: profile?.first_name ?? (user.user_metadata?.first_name as string) ?? '',
      lastName: profile?.last_name ?? (user.user_metadata?.last_name as string) ?? '',
      phone: profile?.phone ?? (user.user_metadata?.phone as string) ?? '',
    },
  });
}

export async function POST(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  const { user, profile, admin } = auth.account;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const text = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

  const firstName = text(body.firstName, 80);
  const lastName = text(body.lastName, 80);
  const phone = text(body.phone, 50);

  const patch = {
    first_name: firstName || null,
    last_name: lastName || null,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  };

  const target = profile
    ? admin.from('profiles').update(patch).eq('id', profile.id)
    : admin.from('profiles').insert({
        id: crypto.randomUUID(),
        auth_id: user.id,
        email: user.email ?? null,
        ...patch,
        newsletter_subscribed: false,
        is_premium: false,
        is_admin: false,
        is_subscribed: false,
        created_at: new Date().toISOString(),
      });

  const { error } = await target;
  if (error) {
    console.error('[account/profile] profile update failed:', error.message);
    return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 });
  }

  const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { first_name: firstName, last_name: lastName, phone },
  });
  if (authError) {
    // The profile row is the source of truth; a metadata failure is logged
    // but must not undo a saved profile.
    console.error('[account/profile] auth metadata update failed:', authError.message);
  }

  return NextResponse.json({ success: true, profile: patch });
}
