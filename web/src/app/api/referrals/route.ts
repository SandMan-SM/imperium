export const dynamic = 'force-static';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { email, firstName, lastName, referralCode } = await request.json();

        if (!email || !referralCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Check if referral code exists and is valid
        const { data: referrer, error: referrerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('referral_code', referralCode)
            .single();

        if (referrerError || !referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.getUser();

        if (existingUser.user) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Create new user
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-8), // Generate temporary password
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    referred_by: referrer.id
                }
            }
        });

        if (authError) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // Create profile record
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authUser.user?.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                referred_by: referrer.id,
                referral_code: generateReferralCode()
            })
            .select()
            .single();

        if (profileError) {
            return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
        }

        // Track referral
        await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referred_id: authUser.user?.id,
            email: email,
            status: 'pending'
        });

        return NextResponse.json({
            message: "User created successfully",
            profile,
            referralCode: profile.referral_code
        });

    } catch (error) {
        console.error('Referral creation error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const referralCode = url.searchParams.get('code');

        if (!referralCode) {
            return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: referrer, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('referral_code', referralCode)
            .single();

        if (error || !referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
        }

        return NextResponse.json({ referrer });

    } catch (error) {
        console.error('Fetch referral error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}