export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { authenticateAccount } from '@/lib/server/account-auth';

/**
 * Saved shipping addresses.
 *
 * Addresses are stored on the Imperium profile row (`profiles.metadata`,
 * jsonb) so they travel with the account instead of living in the browser.
 */

const MAX_ADDRESSES = 10;

export type Address = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default: boolean;
};

function readAddresses(metadata: Record<string, unknown> | null): Address[] {
  const raw = metadata?.addresses;
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is Address => {
    if (!entry || typeof entry !== 'object') return false;
    const item = entry as Partial<Address>;
    return typeof item.id === 'string' && typeof item.address === 'string';
  });
}

function sanitizeAddress(input: unknown): Address | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const text = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

  const address = text(raw.address, 200);
  const city = text(raw.city, 100);
  const zip = text(raw.zip, 20);
  if (!address || !city || !zip) return null;

  return {
    id: text(raw.id, 64) || `addr-${crypto.randomUUID()}`,
    name: text(raw.name, 60) || 'Address',
    first_name: text(raw.first_name, 80),
    last_name: text(raw.last_name, 80),
    address,
    city,
    state: text(raw.state, 60),
    zip,
    country: text(raw.country, 2).toUpperCase() || 'US',
    phone: text(raw.phone, 50),
    is_default: raw.is_default === true,
  };
}

export async function GET(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({ success: true, addresses: readAddresses(auth.account.profile?.metadata ?? null) });
}

export async function POST(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  const { profile, admin } = auth.account;
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const incoming = sanitizeAddress(body.address ?? body);
  if (!incoming) {
    return NextResponse.json(
      { error: 'Street address, city, and postal code are required.' },
      { status: 400 },
    );
  }

  const existing = readAddresses(profile.metadata ?? null);
  const index = existing.findIndex((item) => item.id === incoming.id);
  const next = index >= 0 ? existing.map((item, i) => (i === index ? incoming : item)) : [...existing, incoming];

  if (next.length > MAX_ADDRESSES) {
    return NextResponse.json(
      { error: `You can save up to ${MAX_ADDRESSES} addresses.` },
      { status: 400 },
    );
  }

  // Exactly one address carries the default flag.
  const finalList = (() => {
    if (incoming.is_default) {
      return next.map((item) => ({ ...item, is_default: item.id === incoming.id }));
    }
    const hasDefault = next.some((item) => item.is_default && item.id !== incoming.id);
    if (hasDefault) return next;
    const defaultId = next.find((item) => item.id === incoming.id)?.id ?? next[0]?.id;
    return next.map((item) => ({ ...item, is_default: item.id === defaultId }));
  })();

  const metadata = { ...(profile.metadata ?? {}), addresses: finalList };
  const { error } = await admin
    .from('profiles')
    .update({ metadata, updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (error) {
    console.error('[account/addresses] save failed:', error.message);
    return NextResponse.json({ error: 'Could not save your address.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, addresses: finalList });
}

export async function DELETE(request: Request) {
  const auth = await authenticateAccount(request);
  if (!auth.ok) return auth.response;

  const { profile, admin } = auth.account;
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) {
    return NextResponse.json({ error: 'Address id is required.' }, { status: 400 });
  }

  const existing = readAddresses(profile.metadata ?? null);
  const remaining = existing.filter((item) => item.id !== id);
  if (remaining.length === existing.length) {
    return NextResponse.json({ success: true, addresses: existing });
  }

  const finalList = remaining.length
    ? remaining.map((item, i) => ({ ...item, is_default: i === 0 ? true : item.is_default }))
    : [];

  const metadata = { ...(profile.metadata ?? {}), addresses: finalList };
  const { error } = await admin
    .from('profiles')
    .update({ metadata, updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (error) {
    console.error('[account/addresses] delete failed:', error.message);
    return NextResponse.json({ error: 'Could not remove your address.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, addresses: finalList });
}
