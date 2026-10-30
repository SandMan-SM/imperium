export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import type { Stripe } from 'stripe';
import { getStripe } from '@/lib/stripe-helper';
import { isAdminRequest } from '@/lib/server/admin-auth';

/** Product row fields this endpoint reads. */
interface ProductLinkRow {
  id: string;
  payment_link_url?: string | null;
  stripe_url?: string | null;
  payment_link_id?: string | null;
}

/** Result for a single product. */
interface LinkCheckResult {
  id: string;
  active: boolean;
  found: boolean;
  url: string | null;
  payment_link_id?: string;
}

/** Narrows an unknown thrown value to a plain object so its fields can be read. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Reads a `message` property off an unknown error value, mirroring `err?.message`. */
function errorMessage(error: unknown): string | undefined {
  const message = asRecord(error)?.message;
  return typeof message === 'string' ? message : undefined;
}

export async function POST(req: NextRequest) {
  try {
    // This route asks Stripe, with the secret key, which payment links exist
    // and whether each one is still active. The dashboard that calls it is
    // gated in the browser, which is a client-side gate, so the handler was
    // reachable by anyone who knew the URL.
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { products } = (await req.json()) as { products?: unknown };
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }

    const productList = products as ProductLinkRow[];

    // Helper to try to retrieve payment link by id (if provided) or by extracting possible id from URL
    async function tryRetrieveByUrlOrId(url: string, maybeId?: string | null): Promise<Stripe.PaymentLink | null> {
      // If DB provided a payment_link_id, try that first
      if (maybeId) {
        try {
          const pl = await getStripe().paymentLinks.retrieve(maybeId);
          return pl;
        } catch (err) {
          // fall through to try parsing the URL
          console.warn(`Failed to retrieve payment link by id ${maybeId}:`, err);
        }
      }
      try {
        const m = url.match(/buy\.stripe\.com\/([^\/\?#]+)/);
        if (m && m[1]) {
          const id = m[1].split('?')[0];
          // try retrieve
          try {
            const pl = await getStripe().paymentLinks.retrieve(id);
            return pl;
          } catch {
            // fallthrough to listing
          }
        }
      } catch {
        // ignore
      }
      return null;
    }

    // Get a page of payment links to match by URL (fallback)
    const list = await getStripe().paymentLinks.list({ limit: 100 });

    const results: LinkCheckResult[] = [];
    for (const p of productList) {
      const url = p.payment_link_url || p.stripe_url || null;
      if (!url) {
        results.push({ id: p.id, active: false, found: false, url: null });
        continue;
      }

      // First try to directly retrieve by using stored payment_link_id (if any) or parsing the URL
      let match: Stripe.PaymentLink | null = null;
      try {
        match = await tryRetrieveByUrlOrId(url, p.payment_link_id);
      } catch {
        match = null;
      }

      // If retrieve failed, fallback to listing match
      if (!match) {
        match = list.data.find((pl) => pl.url === url || (pl.url && url.includes(pl.url))) ?? null;
      }

      if (!match) {
        results.push({ id: p.id, active: false, found: false, url });
        continue;
      }

      const active = typeof match.active === 'boolean' ? match.active : true;
      results.push({ id: p.id, active, found: true, url, payment_link_id: match.id });
    }

    return NextResponse.json({ results });
  } catch (err: unknown) {
    console.error('check-payment-links error:', err);
    return NextResponse.json({ error: errorMessage(err) ?? String(err) }, { status: 500 });
  }
}
