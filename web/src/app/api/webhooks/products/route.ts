export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { Stripe } from 'stripe';
import { getStripe } from '@/lib/stripe-helper';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature || !webhookSecret) {
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
        }

        let event;
        try {
            event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        // Handle specific event types
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('Payment successful for session:', session.id);

            // Here we would typically ping n8n / Supabase to fulfill the digital product
            // Or auto-update Printify stock logic using the Products table
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Products Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
