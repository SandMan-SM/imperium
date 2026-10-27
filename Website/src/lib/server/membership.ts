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
    //
    // Every customer that could belong to this address is considered, not
    // just the first one Stripe returns. An address can hold more than one
    // customer — a second card, a second checkout — and a member is a member
    // if *any* of them carries a live subscription. Reading only the first
    // would lock a paying member out the moment the first customer they ever
    // opened was closed.
    let stripe: ReturnType<typeof getStripe> | null = null;
    try {
        stripe = getStripe();
    } catch (error) {
        // Stripe is not configured on this deployment. The database flag is
        // then the only thing left, so a paying member is not locked out.
        console.error('Membership check could not reach Stripe:', error);
    }

    // The customer id the webhook stamped onto the account row is the most
    // reliable key of all: it does not depend on how the address was spelled.
    const candidateIds = new Set<string>();
    for (const row of profiles) {
        const customerId = row.stripe_customer_id as string | undefined;
        if (customerId) candidateIds.add(customerId);
    }

    // The address is the fallback for a customer whose id never reached the
    // profile — a customer created before its first checkout, say. Stripe
    // matches the address exactly, so the lower-cased spelling is tried too:
    // Supabase lower-cases addresses and Stripe keeps them as they were typed.
    if (stripe) {
        try {
            for (const variant of new Set([email, email.toLowerCase()])) {
                const customers = await stripe.customers.list({ email: variant, limit: 10 });
                for (const customer of customers.data) candidateIds.add(customer.id);
            }
        } catch (error) {
            // The address lookup is a convenience, not the source of truth. A
            // failure here must not stop the stamped ids from being checked.
            console.error('Membership check could not list Stripe customers:', error);
        }
    }

    if (stripe && candidateIds.size > 0) {
        const client = stripe;
        try {
            let liveStatus: string | null = null;
            let liveCustomerId: string | null = null;
            let latestStatus: string | null = null;
            let latestCustomerId: string | null = null;

            for (const customerId of candidateIds) {
                const subscriptions = await client.subscriptions.list({
                    customer: customerId,
                    status: 'all',
                    limit: 10,
                });

                const live = subscriptions.data.find((subscription) =>
                    ACTIVE_STATUSES.has(subscription.status),
                );

                if (live && !liveStatus) {
                    liveStatus = live.status;
                    liveCustomerId = customerId;
                }

                if (!latestStatus && subscriptions.data[0]) {
                    latestStatus = subscriptions.data[0].status;
                    latestCustomerId = customerId;
                }
            }

            return {
                premium: liveStatus !== null,
                source: 'stripe',
                customerId: liveCustomerId ?? latestCustomerId,
                subscriptionStatus: liveStatus ?? latestStatus,
                profileId,
            };
        } catch (error) {
            // Stripe is unreachable or not configured. Fall through to the
            // database flag rather than locking a paying member out.
            console.error('Membership check could not reach Stripe:', error);
        }
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
