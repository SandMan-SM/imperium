
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Stripe } from "stripe";
import { getStripe } from "@/lib/stripe-helper";

/** Request body accepted by the subscription creation endpoint. */
interface SubscriptionRequestBody {
    tier?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

/**
 * The pinned Stripe API version (2026-02-25.clover) exposes the billing period
 * timestamps on subscription items; older payloads still carry them at the top
 * level, so they are read through this optional shape.
 */
type SubscriptionPeriodFields = {
    current_period_start?: number;
    current_period_end?: number;
};

/**
 * `invoice.payment_intent` was removed from the Stripe API in newer versions,
 * but an expanded invoice payload may still carry it.
 */
type InvoiceWithPaymentIntent = Stripe.Invoice & {
    payment_intent?: Stripe.PaymentIntent;
};

/** Converts a Stripe unix timestamp (seconds) into a Date, or null when absent. */
function epochToDate(seconds?: number): Date | null {
    return typeof seconds === 'number' ? new Date(seconds * 1000) : null;
}

export async function POST(request: Request) {
    try {
        const { tier, email, firstName, lastName } = (await request.json()) as SubscriptionRequestBody;

        if (!tier || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create Stripe customer
        const customer = await getStripe().customers.list({ email, limit: 1 });
        let customerId = customer.data[0]?.id;

        if (!customerId) {
            const newCustomer = await getStripe().customers.create({
                email,
                name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
                metadata: { user_id: user.id }
            });
            customerId = newCustomer.id;
        }

        // Get price ID based on tier
        const priceId = getPriceIdForTier(tier);
        if (!priceId) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        // Create subscription
        const subscription = await getStripe().subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                user_id: user.id,
                tier,
                email
            }
        });

        const rawSubscription = subscription as Stripe.Subscription & SubscriptionPeriodFields;

        // In the pinned Stripe API version the billing period lives on the
        // subscription item, not on the subscription itself. Older payloads
        // still carry it at the top level, so both are read.
        const firstItem = rawSubscription.items?.data?.[0];
        const periodStart = rawSubscription.current_period_start ?? firstItem?.current_period_start;
        const periodEnd = rawSubscription.current_period_end ?? firstItem?.current_period_end;

        // Create subscription record in database
        const { data: subscriptionRecord, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                profile_id: user.id,
                tier,
                status: subscription.status,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customerId,
                current_period_start: epochToDate(periodStart),
                current_period_end: epochToDate(periodEnd),
                trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
                trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error creating subscription:', dbError);
            return NextResponse.json({ error: "Failed to create subscription record" }, { status: 500 });
        }

        const latestInvoice = subscription.latest_invoice;
        const invoice: InvoiceWithPaymentIntent | undefined =
            latestInvoice && typeof latestInvoice === 'object' ? latestInvoice : undefined;
        const invoicePaymentIntent = invoice?.payment_intent;
        const clientSecret =
            invoicePaymentIntent && typeof invoicePaymentIntent === 'object'
                ? invoicePaymentIntent.client_secret
                : undefined;

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret,
            subscriptionRecord
        });

    } catch (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
        }

        return NextResponse.json({ subscriptions });

    } catch (error) {
        console.error('Fetch subscriptions error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function getPriceIdForTier(tier: string): string | null {
    switch (tier) {
        case 'foundation':
            return process.env.STRIPE_PRICE_FOUNDATION || 'price_1QHf2JFj9oKErkMT11000000';
        case 'elite':
            return process.env.STRIPE_PRICE_ELITE || 'price_1QHf2JFj9oKErkMT22000000';
        case 'sovereign':
            return process.env.STRIPE_PRICE_SOVEREIGN || 'price_1QHf2JFj9oKErkMT33000000';
        default:
            return null;
    }
}
