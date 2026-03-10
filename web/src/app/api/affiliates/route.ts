import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
    try {
        const { email, firstName, lastName, affiliateCode } = await request.json();

        if (!email || !affiliateCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Check if affiliate code exists and is valid
        const { data: affiliate, error: affiliateError } = await supabase
            .from('affiliates')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .single();

        if (affiliateError || !affiliate) {
            return NextResponse.json({ error: "Invalid affiliate code" }, { status: 400 });
        }

        // Create affiliate application
        const { data: application, error: appError } = await supabase
            .from('affiliate_applications')
            .insert({
                affiliate_id: affiliate.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                status: 'pending'
            })
            .select()
            .single();

        if (appError) {
            return NextResponse.json({ error: "Failed to create affiliate application" }, { status: 500 });
        }

        return NextResponse.json({
            message: "Affiliate application created successfully",
            application
        });

    } catch (error) {
        console.error('Affiliate application error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const affiliateCode = url.searchParams.get('code');

        if (!affiliateCode) {
            return NextResponse.json({ error: "Missing affiliate code" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: affiliate, error } = await supabase
            .from('affiliates')
            .select('name, email, commission_rate, total_earnings')
            .eq('affiliate_code', affiliateCode)
            .single();

        if (error || !affiliate) {
            return NextResponse.json({ error: "Invalid affiliate code" }, { status: 404 });
        }

        return NextResponse.json({ affiliate });

    } catch (error) {
        console.error('Fetch affiliate error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { applicationId, status } = await request.json();

        if (!applicationId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: application, error } = await supabase
            .from('affiliate_applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
        }

        return NextResponse.json({ application });

    } catch (error) {
        console.error('Update affiliate application error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}