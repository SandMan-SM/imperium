export const dynamic = 'force-static';

import { NextResponse } from 'next/server';
import type { Stripe } from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe-helper';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function upsertProfileByEmail(email: string | null, stripeCustomerId?: string) {
  if (!email && !stripeCustomerId) return null;
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .or(email ? `email.eq.${email}` : '')
    .limit(1);

  if (existing && existing[0]) return existing[0];

  const insert = { email, stripe_customer_id: stripeCustomerId, created_at: new Date().toISOString() };
  const { data } = await supabaseAdmin.from('profiles').insert([insert]).select().limit(1);
  return data?.[0] ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Basic idempotency: skip if we've already recorded this Stripe event id in events table
    const existingEvent = await supabaseAdmin
      .from('events')
      .select('*')
      .filter("payload->>stripe_event_id", 'eq', event.id)
      .limit(1);

    if (existingEvent.data && existingEvent.data.length) {
      return NextResponse.json({ received: true });
    }

    // Record the event
    await supabaseAdmin.from('events').insert([{ event_type: event.type, payload: { stripe_event_id: event.id, raw: event }, created_at: new Date().toISOString() }]);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Fetch line items
        const lineItems = await getStripe().checkout.sessions.listLineItems(session.id as string, { limit: 100 });

        // Find or create profile
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const profile = await upsertProfileByEmail(email, session.customer as string | undefined);

        // Insert purchases per line item
        for (const li of lineItems.data) {
          const amount = (li.amount_total ?? session.amount_total ?? 0) / 100;
          const qty = li.quantity ?? 1;
          // Try to resolve product by price/product IDs
          const priceId = (li.price as any)?.id ?? (li.price as any)?.product ?? null;
          // Attempt to map product via stripe_price_id or stripe_product_id
          let productId = null;
          if (priceId) {
            const { data: prod } = await supabaseAdmin.from('products').select('id').or(`stripe_price_id.eq.${priceId},stripe_product_id.eq.${priceId}`).limit(1);
            if (prod && prod[0]) productId = prod[0].id;
          }

          // Check idempotency on purchases using stripe_checkout_session
          const { data: existing } = await supabaseAdmin.from('purchases').select('*').eq('stripe_checkout_session', session.id).limit(1);
          if (existing && existing.length) continue;

          await supabaseAdmin.from('purchases').insert([{ profile_id: profile?.id ?? null, product_id: productId, stripe_checkout_session: session.id, amount: amount, currency: session.currency ?? 'usd', quantity: qty, status: 'succeeded', captured_at: new Date().toISOString(), created_at: new Date().toISOString() }]);
        }

        // If subscription mode, mark premium
        if ((session.mode as any) === 'subscription' || (session.metadata && session.metadata['premium'] === 'true')) {
          if (profile) {
            await supabaseAdmin.from('profiles').update({ is_premium: true, subscription_status: 'active', premium_since: new Date().toISOString() }).eq('id', profile.id);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: profiles } = await supabaseAdmin.from('profiles').select('*').eq('stripe_customer_id', customerId).limit(1);
        const profile = profiles?.[0];
        if (profile) {
          await supabaseAdmin.from('profiles').update({ is_premium: true, subscription_status: 'active', premium_since: profile.premium_since ?? new Date().toISOString() }).eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status;
        const { data: profiles } = await supabaseAdmin.from('profiles').select('*').eq('stripe_customer_id', customerId).limit(1);
        const profile = profiles?.[0];
        if (profile) {
          const isPremium = status === 'active' || status === 'trialing';
          await supabaseAdmin.from('profiles').update({ is_premium: isPremium, subscription_status: status, updated_at: new Date().toISOString() }).eq('id', profile.id);
        }
        break;
      }

      default:
        // ignore other events for now
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
