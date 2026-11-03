

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/server/imperium-capture";
import { consumeRateWindow, requestIp } from "@/lib/server/rate-limit";
import { isAdminRequest } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
    try {
        // This form writes a row carrying an address, so the caller's IP is
        // counted before anything is written. The limiter is the shared one,
        // not a second copy of it.
        const ip = requestIp(request);
        const limited = consumeRateWindow(`affiliate:${ip}`);
        if (!limited.ok) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again shortly." },
                { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
            );
        }

        const { email, firstName, lastName, affiliateCode } = await request.json();

        if (!email || !affiliateCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // The read used to be made with the anon key. The fleet's own RLS
        // policies do not open `affiliates` to anonymous readers, so every
        // code — including a real one — was answered "Invalid affiliate
        // code" and the route could never work. It is read here with the
        // service-role key, where RLS does not apply.
        const supabase = getAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

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

        const supabase = getAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

        const { data: affiliate, error } = await supabase
            .from('affiliates')
            .select('name, commission_rate')
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
        // Approving an affiliate application is an operator decision: it
        // starts a commission. The route held no credential at all, so a
        // stranger could approve their own application by guessing an id.
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { applicationId, status } = await request.json();

        if (!applicationId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // The status is a fixed set. An operator route that writes whatever
        // string it is handed is a route that can be told to write anything.
        const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected"]);
        if (!ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({ error: "Unsupported status" }, { status: 400 });
        }

        const supabase = getAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

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