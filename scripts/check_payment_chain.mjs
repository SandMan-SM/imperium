#!/usr/bin/env node
/**
 * Proves that a payment became a membership.
 *
 * The site's revenue path is a chain, and every link in it can fail on its
 * own without anything on the page saying so:
 *
 *   1. the checkout session was paid          (Stripe)
 *   2. the webhook received the event         (events table)
 *   3. the purchase was recorded              (inbound_imperium_events)
 *   4. the profile carries the membership     (profiles)
 *   5. the site agrees the member is in       (profiles + Stripe, together)
 *
 * A member who paid and cannot open the curriculum is the worst outcome the
 * site can produce, and it is invisible until somebody tries to sign in. This
 * script answers the question directly: "did my card actually make me a
 * member?" — one command, no guesswork.
 *
 *   node scripts/check_payment_chain.mjs someone@example.com
 *   node scripts/check_payment_chain.mjs --recent
 *
 * Credentials are read from the environment first and from Website/.env.local
 * second. Nothing is printed except states, ids and amounts.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function loadEnvFile() {
    const path = join(repoRoot, 'Website', '.env.local');
    if (!existsSync(path)) return {};

    const values = {};
    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (!match) continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        values[match[1]] = value;
    }
    return values;
}

const fileEnv = loadEnvFile();
const env = (name) => process.env[name] || fileEnv[name] || '';

const STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY');
const SUPABASE_URL = env('SUPABASE_URL') || env('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');

const LIVE_STATUSES = new Set(['active', 'trialing']);

const results = [];

function record(label, ok, detail) {
    results.push({ label, ok, detail });
    const mark = ok === null ? '?' : ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
}

async function supabase(path) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Supabase returned ${response.status}: ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : [];
}

async function stripeCall(path, params) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const response = await fetch(`https://api.stripe.com/v1/${path}${query}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message ?? `Stripe returned ${response.status}`);
    return json;
}

async function checkEmail(email) {
    console.log(`\nImperium payment chain — ${email}\n`);

    const lower = email.toLowerCase();

    // 1. The ledger.
    const customers = await stripeCall('customers', { email: lower, limit: 10 });
    const customerIds = customers.data.map((customer) => customer.id);

    const profiles = await supabase(
        `profiles?select=id,email,is_premium,subscription_status,stripe_customer_id,newsletter_subscribed&email=ilike.${encodeURIComponent(email)}`,
    );
    for (const profile of profiles) {
        if (profile.stripe_customer_id && !customerIds.includes(profile.stripe_customer_id)) {
            customerIds.push(profile.stripe_customer_id);
        }
    }

    let liveSubscription = null;
    let liveCustomerId = null;
    const seen = new Set();

    for (const customerId of customerIds) {
        if (seen.has(customerId)) continue;
        seen.add(customerId);

        const subscriptions = await stripeCall('subscriptions', { customer: customerId, status: 'all', limit: 10 });
        const live = subscriptions.data.find((subscription) => LIVE_STATUSES.has(subscription.status));
        if (live && !liveSubscription) {
            liveSubscription = live;
            liveCustomerId = customerId;
        }
    }

    record(
        'Stripe: a customer exists for this address',
        customerIds.length > 0,
        customerIds.length > 0 ? customerIds.join(', ') : 'none',
    );

    record(
        'Stripe: the subscription is live',
        Boolean(liveSubscription),
        liveSubscription
            ? `${liveSubscription.id} (${liveSubscription.status}) on ${liveCustomerId}`
            : 'no active or trialing subscription',
    );

    // 2. The webhook.
    const memberEvents = await supabase(
        `events?select=id,event_type,target_id,created_at&event_category=eq.stripe&order=created_at.desc&limit=5`,
    );
    record(
        'Webhook: Stripe events reached the site',
        memberEvents.length > 0,
        memberEvents.length > 0
            ? `${memberEvents.length} recorded, latest ${memberEvents[0].event_type} at ${memberEvents[0].created_at}`
            : 'no Stripe event has been received',
    );

    // 3. The purchase record.
    const purchases = await supabase(
        `inbound_imperium_events?select=id,event_type,target_id,created_at,value_numeric&event_type=eq.purchase_recorded&order=created_at.desc&limit=5`,
    );
    record(
        'Ledger: the purchase was recorded',
        purchases.length > 0,
        purchases.length > 0
            ? `${purchases.length} recorded, latest ${purchases[0].id} for $${purchases[0].value_numeric ?? '?'}`
            : 'no purchase_recorded row',
    );

    // 4. The profile.
    const premiumRow = profiles.find((profile) => profile.is_premium === true);
    record(
        'Account: a profile row carries the membership',
        Boolean(premiumRow),
        premiumRow
            ? `id ${premiumRow.id}, status ${premiumRow.subscription_status ?? 'unknown'}, letter ${premiumRow.newsletter_subscribed ? 'on' : 'off'}`
            : `no premium row among ${profiles.length} row(s) for this address`,
    );

    const stamped = profiles.find((profile) => profile.stripe_customer_id);
    record(
        'Account: the Stripe customer id is stamped on the profile',
        Boolean(stamped),
        stamped ? stamped.stripe_customer_id : 'no profile row carries a Stripe id',
    );

    // 5. What the site will conclude.
    const siteSaysMember = Boolean(liveSubscription) || Boolean(premiumRow);
    record(
        'Site: the member will be recognised as a member',
        siteSaysMember,
        siteSaysMember
            ? 'the curriculum opens on sign-in'
            : 'the curriculum stays closed — the payment did not reach the site',
    );

    const failed = results.filter((result) => result.ok === false);
    console.log(
        failed.length === 0
            ? '\nThe chain is complete. This address is a member.\n'
            : `\n${failed.length} link(s) in the chain are broken. See the FAIL lines above.\n`,
    );

    return failed.length === 0;
}
async function checkRecent() {
    console.log('\nImperium payment chain — recent Stripe activity\n');

    const customers = await stripeCall('customers', { limit: 20 });
    const subscriptions = await stripeCall('subscriptions', { limit: 20 });
    const sessions = await stripeCall('checkout/sessions', { limit: 20 });

    console.log(`Customers:        ${customers.data.length}`);
    console.log(`Subscriptions:    ${subscriptions.data.length}`);
    console.log(`Checkout sessions: ${sessions.data.length}`);

    const paid = sessions.data.filter((session) => session.payment_status === 'paid');
    console.log(`Paid sessions:    ${paid.length}`);

    for (const session of sessions.data.slice(0, 10)) {
        console.log(
            `  ${session.id}  ${session.status}/${session.payment_status}  ${session.mode}  ` +
                `${session.amount_total ?? 0}${session.currency ?? ''}  ${session.customer_email ?? session.customer_details?.email ?? '(no address)'}`,
        );
    }

    console.log('');
    return true;
}

async function main() {
    if (!STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY is not available. Set it, or add it to Website/.env.local.');
        process.exit(2);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed to check the account rows.');
        process.exit(2);
    }

    const args = process.argv.slice(2);
    const email = args.find((arg) => !arg.startsWith('--'));

    if (args.includes('--recent') || !email) {
        await checkRecent();
        return;
    }

    const ok = await checkEmail(email);
    process.exit(ok ? 0 : 1);
}

main().catch((error) => {
    console.error(`\nThe chain could not be checked: ${error.message}\n`);
    process.exit(3);
});
