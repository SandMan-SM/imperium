import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
    try {
        const { tier, email, firstName, lastName } = await request.json();

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
        let customer = await stripe.customers.list({ email, limit: 1 });
        let customerId = customer.data[0]?.id;

        if (!customerId) {
            const newCustomer = await stripe.customers.create({
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
        const subscription = await stripe.subscriptions.create({
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

        // Create subscription record in database
        const { data: subscriptionRecord, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                profile_id: user.id,
                tier,
                status: subscription.status,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customerId,
                current_period_start: new Date((subscription as any).current_period_start * 1000),
                current_period_end: new Date((subscription as any).current_period_end * 1000),
                trial_start: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : null,
                trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error creating subscription:', dbError);
            return NextResponse.json({ error: "Failed to create subscription record" }, { status: 500 });
        }

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
            subscriptionRecord
        });

    } catch (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
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