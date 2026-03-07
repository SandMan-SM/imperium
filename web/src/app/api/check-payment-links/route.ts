import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-02-25.clover' });

export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }

    // Get a reasonably large page of payment links to match by URL
    const list = await stripe.paymentLinks.list({ limit: 100 });

    const results = products.map((p: any) => {
      const url = p.payment_link_url || p.stripe_url || null;
      if (!url) return { id: p.id, active: false, found: false, url: null };

      const match = list.data.find((pl: any) => pl.url === url || (pl.url && url.includes(pl.url)));
      if (!match) return { id: p.id, active: false, found: false, url };

      // PaymentLink object may include an `active` flag; if not, assume found=active
      const active = typeof (match as any).active === 'boolean' ? (match as any).active : true;
      return { id: p.id, active, found: true, url, payment_link_id: match.id };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('check-payment-links error:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
