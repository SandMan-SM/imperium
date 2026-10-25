export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { Stripe } from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe-helper';
import { getAdminClient } from '@/lib/server/imperium-capture';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const PURCHASE_EVENT_TYPE = 'purchase_recorded';

/** Narrows an unknown thrown value to a plain object so its fields can be read. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Reads a `message` property off an unknown error value, mirroring `err?.message`. */
function errorMessage(error: unknown): string | undefined {
  const message = asRecord(error)?.message;
  return typeof message === 'string' ? message : undefined;
}

/**
 * The live database has no `purchases` table, so purchase history is written
 * to the tenant event log `inbound_imperium_events` — the same place the
 * newsletter send record lives. The checkout session id travels in the
 * payload and is the idempotency key.
 */
async function recordPurchase(payload: {
  sessionId: string;
  productId: string | null;
  productName: string | null;
  amount: number;
  currency: string;
  quantity: number;
  email: string | null;
}): Promise<void> {
  const sb = getAdminClient();
  if (!sb) return;

  const { data: business } = await sb
    .from('omni_businesses')
    .select('id')
    .eq('slug', 'imperium')
    .maybeSingle();
  const businessId = (business as { id?: string } | null)?.id ?? null;
  if (!businessId) {
    console.error('Stripe webhook: no imperium business id; purchase not recorded');
    return;
  }

  const { error } = await sb.from('inbound_imperium_events').insert({
    business_id: businessId,
    event_type: PURCHASE_EVENT_TYPE,
    event_category: 'commerce',
    action: 'purchased',
    target_type: 'product',
    target_id: payload.productId,
    payload: {
      stripe_checkout_session: payload.sessionId,
      product_id: payload.productId,
      product_name: payload.productName,
      amount: payload.amount,
      currency: payload.currency,
      quantity: payload.quantity,
      email: payload.email,
    },
    value_numeric: payload.amount,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Stripe webhook: purchase record failed:', error.message);
  }
}

async function upsertProfileByEmail(email: string | null, stripeCustomerId?: string) {
  if (!email && !stripeCustomerId) return null;
  const filter = email
    ? `email.eq.${email}`
    : `stripe_customer_id.eq.${stripeCustomerId}`;
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .or(filter)
    .limit(10);

  // An address can hold two rows — the one this webhook wrote, and the one
  // the signup trigger wrote for the person's account. The account row is
  // the one the site reads, so the Stripe id belongs on that one.
  const candidates = existing ?? [];
  const profile = candidates.find((row) => row.auth_id) ?? candidates[0];

  if (profile) {

    // The customer id has to be written onto the row, or the renewal and
    // cancellation events — which look a profile up by `stripe_customer_id`
    // and by nothing else — never find it again. A member who opened an
    // account before paying has a profile row that carries no Stripe id.
    if (stripeCustomerId && !profile.stripe_customer_id) {
      const { data: linked } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .limit(1);

      return linked?.[0] ?? profile;
    }

    return profile;
  }

  const insert = { email, stripe_customer_id: stripeCustomerId, created_at: new Date().toISOString() };
  const { data } = await supabaseAdmin.from('profiles').insert([insert]).select().limit(1);
  return data?.[0] ?? null;
}

/**
 * Finds the profile that belongs to a Stripe customer.
 *
 * The customer id is the reliable key, but it is only written onto the
 * profile when a checkout session arrives — and a customer can exist before
 * its first checkout, or a subscription can be started from the Stripe
 * dashboard. When that happens the id is missing, so the address on the
 * Stripe customer is used to find the row instead, and the id is written
 * onto it so the next event finds it directly.
 */
async function findProfileByCustomer(customerId: string) {
  const { data: byId } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .limit(1);

  if (byId && byId[0]) return byId[0];

  let email: string | null = null;
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!('deleted' in customer) && customer.email) email = customer.email;
  } catch (error) {
    console.error('Stripe webhook: could not read the customer:', errorMessage(error));
  }

  if (!email) return null;

  const { data: byEmail } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .limit(10);

  // An address can hold two rows — the one the Stripe webhook wrote, and the
  // one the signup trigger wrote for the account. The account row is the one
  // the site reads, so the Stripe id belongs on that one.
  const candidates = byEmail ?? [];
  const profile = candidates.find((row) => row.auth_id) ?? candidates[0];
  if (!profile) return null;

  const { data: linked } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
    .eq('id', profile.id)
    .select()
    .limit(1);

  return linked?.[0] ?? profile;
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
  } catch (err: unknown) {
    console.error('Stripe webhook signature verification failed:', errorMessage(err));
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Basic idempotency: skip if we've already recorded this Stripe event id in events table.
    // The events table stores free-form data in `properties` — there is no `payload`
    // column, so the Stripe event id is read back out of `properties`.
    const existingEvent = await supabaseAdmin
      .from('events')
      .select('id')
      .filter('properties->>stripe_event_id', 'eq', event.id)
      .limit(1);

    if (existingEvent.data && existingEvent.data.length) {
      return NextResponse.json({ received: true });
    }

    // Record the event. `actor_type`, `actor_id` and `ip_address` are required by
    // the table; `ip_address` is an inet column, so it is left null rather than "".
    const { error: logError } = await supabaseAdmin.from('events').insert([
      {
        actor_type: 'system',
        actor_id: 'stripe',
        event_type: event.type,
        event_category: 'stripe',
        action: 'received',
        target_type: 'stripe_event',
        target_id: event.id,
        session_id: 'stripe-webhook',
        ip_address: null,
        user_agent: 'stripe-webhook',
        properties: { stripe_event_id: event.id, type: event.type },
        created_at: new Date().toISOString(),
      },
    ]);

    if (logError) {
      console.error('Stripe webhook: could not record the event:', errorMessage(logError));
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Fetch line items
        const lineItems = await getStripe().checkout.sessions.listLineItems(session.id as string, { limit: 100 });

        // Find or create profile
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const profile = await upsertProfileByEmail(email, session.customer as string | undefined);

        // Record one purchase row per line item
        for (const li of lineItems.data) {
          const amount = (li.amount_total ?? session.amount_total ?? 0) / 100;
          const qty = li.quantity ?? 1;
          // Try to resolve product by price/product IDs
          const price = li.price;
          const priceProduct = price?.product;
          const priceId = price?.id ?? (typeof priceProduct === 'string' ? priceProduct : null);
          // Attempt to map product via stripe_price_id or stripe_product_id
          let productId = null;
          let productName = null;
          if (priceId) {
            const { data: prod } = await supabaseAdmin.from('products').select('id,name').or(`stripe_price_id.eq.${priceId},stripe_product_id.eq.${priceId}`).limit(1);
            if (prod && prod[0]) {
              productId = prod[0].id;
              productName = prod[0].name ?? null;
            }
          }

          // Idempotency: the checkout session id is the key, so a replayed
          // Stripe event never records the same purchase twice.
          const { data: existing } = await supabaseAdmin
            .from('inbound_imperium_events')
            .select('id')
            .eq('event_type', PURCHASE_EVENT_TYPE)
            .filter('payload->>stripe_checkout_session', 'eq', session.id)
            .limit(1);
          if (existing && existing.length) continue;

          await recordPurchase({
            sessionId: session.id,
            productId,
            productName,
            amount,
            currency: session.currency ?? 'usd',
            quantity: qty,
            email,
          });
        }

        // If subscription mode, mark premium
        if (session.mode === 'subscription' || (session.metadata && session.metadata['premium'] === 'true')) {
          if (profile) {
            await supabaseAdmin.from('profiles').update({ is_premium: true, subscription_status: 'active', premium_since: new Date().toISOString() }).eq('id', profile.id);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const profile = await findProfileByCustomer(customerId);
        if (profile) {
          await supabaseAdmin.from('profiles').update({ is_premium: true, subscription_status: 'active', premium_since: profile.premium_since ?? new Date().toISOString() }).eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status;
        const profile = await findProfileByCustomer(customerId);
        if (profile) {
          const isPremium = status === 'active' || status === 'trialing';
          await supabaseAdmin.from('profiles').update({ is_premium: isPremium, subscription_status: status, updated_at: new Date().toISOString() }).eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const profile = await findProfileByCustomer(customerId);
        if (profile) {
          // Mark subscription as past_due on payment failure
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          }).eq('id', profile.id);
        }
        break;
      }

      default:
        // ignore other events for now
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
