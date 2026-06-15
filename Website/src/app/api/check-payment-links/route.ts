export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-helper';

export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }

    // Helper to try to retrieve payment link by id (if provided) or by extracting possible id from URL
    async function tryRetrieveByUrlOrId(url: string, maybeId?: string) {
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
          } catch (err) {
            // fallthrough to listing
          }
        }
      } catch (e) {
        // ignore
      }
      return null;
    }

    // Get a page of payment links to match by URL (fallback)
    const list = await getStripe().paymentLinks.list({ limit: 100 });

    const results = [] as any[];
    for (const p of products) {
      const url = p.payment_link_url || p.stripe_url || null;
      if (!url) {
        results.push({ id: p.id, active: false, found: false, url: null });
        continue;
      }

      // First try to directly retrieve by using stored payment_link_id (if any) or parsing the URL
      let match: any = null;
      try {
        match = await tryRetrieveByUrlOrId(url, p.payment_link_id);
      } catch (e) {
        match = null;
      }

      // If retrieve failed, fallback to listing match
      if (!match) {
        match = list.data.find((pl: any) => pl.url === url || (pl.url && url.includes(pl.url)));
      }

      if (!match) {
        results.push({ id: p.id, active: false, found: false, url });
        continue;
      }

      const active = typeof (match as any).active === 'boolean' ? (match as any).active : true;
      results.push({ id: p.id, active, found: true, url, payment_link_id: match.id });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('check-payment-links error:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
