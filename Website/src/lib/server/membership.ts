import { getAdminClient } from './imperium-capture';
import { getStripe } from '@/lib/stripe-helper';

/**
 * Membership state for an account.
 *
 * `source` says where the answer came from:
 *   - `stripe` — a Stripe customer with this email has (or had) a subscription
 *   - `database` — no Stripe customer exists, but a profile row is flagged premium
 *   - `none` — nothing found
 */
export type MembershipState = {
    premium: boolean;
    source: 'stripe' | 'database' | 'none';
    customerId: string | null;
    subscriptionStatus: string | null;
    profileId: string | null;
};

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

/**
 * Resolves whether an email address holds a paid membership.
 *
 * The database is not the only source of truth here, and the difference
 * matters:
 *
 * A checkout creates a `profiles` row through the Stripe webhook, keyed on
 * the email that was entered at checkout. If the same person later creates an
 * account on the site, the signup trigger creates a *second* row with the
 * same email and no premium flag (there is no unique constraint on
 * `profiles.email`, and the trigger's row is always the newer one). So the
 * row that belongs to the signed-in account is frequently NOT the row that
 * holds the purchase.
 *
 * That is why the lookup below reads every row for the address, and why
 * Stripe itself is consulted when a customer exists. Stripe is the ledger:
 * if the customer has a live subscription the member is in; if the
 * subscription was cancelled, the member is out, whatever a stale profile
 * row still says.
 */
export async function resolveMembership(email: string | null | undefined): Promise<MembershipState> {
    const empty: MembershipState = {
        premium: false,
        source: 'none',
        customerId: null,
        subscriptionStatus: null,
        profileId: null,
    };

    if (!email) return empty;

    const admin = getAdminClient();
    if (!admin) return empty;

    const { data: rows } = await admin
        .from('profiles')
        .select('id, email, is_premium, subscription_status, stripe_customer_id')
        .ilike('email', email);

    const profiles = rows ?? [];
    const databasePremium = profiles.some((row) => row.is_premium === true);
    const profileId = (profiles[0]?.id as string | undefined) ?? null;

    // Stripe is the ledger. If a customer exists for this address, the
    // subscription decides — not a flag that was written once and never
    // updated.
    try {
        const stripe = getStripe();
        const customers = await stripe.customers.list({ email, limit: 10 });

        if (customers.data.length > 0) {
            const customer = customers.data[0];
            const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'all',
                limit: 10,
            });

            const live = subscriptions.data.find((subscription) =>
                ACTIVE_STATUSES.has(subscription.status),
            );

            return {
                premium: Boolean(live),
                source: 'stripe',
                customerId: customer.id,
                subscriptionStatus: live?.status ?? subscriptions.data[0]?.status ?? null,
                profileId,
            };
        }
    } catch (error) {
        // Stripe is unreachable or not configured. Fall through to the
        // database flag rather than locking a paying member out.
        console.error('Membership check could not reach Stripe:', error);
    }

    return {
        premium: databasePremium,
        source: databasePremium ? 'database' : 'none',
        customerId: null,
        subscriptionStatus: null,
        profileId,
    };
}

/**
 * The unit numbers a member has marked complete, read from the
 * `completed_units` array on their own profile row.
 */
export async function readCompletedUnits(profileId: string | null): Promise<number[]> {
    if (!profileId) return [];

    const admin = getAdminClient();
    if (!admin) return [];

    const { data } = await admin
        .from('profiles')
        .select('completed_units')
        .eq('id', profileId)
        .limit(1);

    const raw = (data?.[0]?.completed_units ?? []) as unknown;

    if (!Array.isArray(raw)) return [];

    return raw
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
}
