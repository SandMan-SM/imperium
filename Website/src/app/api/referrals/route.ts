export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient, isValidEmail } from "@/lib/server/imperium-capture";
import { consumeRateWindow, requestIp } from "@/lib/server/rate-limit";

/**
 * Referral codes.
 *
 * The route used to look for `profiles.referral_code`, `profiles.referred_by`,
 * `referrals.email` and `referrals.status`. None of those columns exist — the
 * `profiles` table has no referral code at all — so every call failed with
 * "Invalid referral code" and the route could never work.
 *
 * The live schema is:
 *   profiles  — id (a uuid of its own, not the auth id), email, metadata jsonb
 *   referrals — referrer_id -> profiles(id), referred_id -> profiles(id)
 *
 * So the code lives in `profiles.metadata.referral_code`, and the link lives
 * in the `referrals` row that points at two profile ids.
 */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates a short, unambiguous referral code. */
function generateReferralCode(): string {
    let code = "";
    for (let index = 0; index < 8; index += 1) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
}

/**
 * Generates a code that is not already taken. The check is a containment test
 * against `profiles.metadata`, so it only sees codes that have been issued.
 */
async function issueReferralCode(
    admin: NonNullable<ReturnType<typeof getAdminClient>>,
): Promise<string | null> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = generateReferralCode();

        const { data: taken } = await admin
            .from("profiles")
            .select("id")
            .contains("metadata", { referral_code: code })
            .limit(1);

        if (!taken || taken.length === 0) return code;
    }
    return null;
}

/** Finds the profile that owns a referral code. */
async function findReferrerByCode(
    admin: NonNullable<ReturnType<typeof getAdminClient>>,
    code: string,
): Promise<{ id: string; first_name: string | null; last_name: string | null; email: string | null } | null> {
    const { data } = await admin
        .from("profiles")
        .select("id, first_name, last_name, email")
        .contains("metadata", { referral_code: code })
        .limit(1);

    return (data?.[0] as { id: string; first_name: string | null; last_name: string | null; email: string | null }) ?? null;
}

export async function POST(request: Request) {
    try {
        // This route creates a real Supabase auth user and sends a
        // confirmation email to whatever address it is given. The referral
        // code is the invitation, but one code must not become a way to send
        // the brand's mail to any address, so the caller's IP is counted
        // before any account is created.
        const ip = requestIp(request);
        const limited = consumeRateWindow(`referral:${ip}`);
        if (!limited.ok) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again shortly." },
                { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
            );
        }

        const { email, firstName, lastName, referralCode } = await request.json();

        if (!email || !referralCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

        const referrer = await findReferrerByCode(admin, String(referralCode).toUpperCase());

        if (!referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }

        // Check if the person already has an account.
        const { data: existingProfiles } = await admin
            .from("profiles")
            .select("id")
            .ilike("email", email)
            .limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // The signup goes through the public auth client so the confirmation
        // email is sent. The `handle_new_user` trigger creates the profile row.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-8),
            options: {
                data: {
                    first_name: firstName || null,
                    last_name: lastName || null,
                },
            },
        });

        if (authError || !authUser.user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // The trigger writes the profile row; find it by the auth link.
        const { data: newProfiles } = await admin
            .from("profiles")
            .select("id, metadata")
            .eq("auth_id", authUser.user.id)
            .limit(1);

        const newProfile = newProfiles?.[0] as { id: string; metadata: Record<string, unknown> | null } | undefined;

        if (!newProfile) {
            return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
        }

        const issuedCode = await issueReferralCode(admin);

        if (!issuedCode) {
            return NextResponse.json({ error: "Failed to issue a referral code" }, { status: 500 });
        }

        const metadata = {
            ...(newProfile.metadata || {}),
            referral_code: issuedCode,
            referred_by: referrer.id,
        };

        const { error: profileError } = await admin
            .from("profiles")
            .update({ metadata })
            .eq("id", newProfile.id);

        if (profileError) {
            console.error('Referral profile update failed:', profileError);
            return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
        }

        // Track the referral. Both columns point at `profiles(id)`.
        const { error: referralError } = await admin.from("referrals").insert({
            referrer_id: referrer.id,
            referred_id: newProfile.id,
        });

        if (referralError) {
            console.error('Referral insert failed:', referralError);
            return NextResponse.json({ error: "Failed to track the referral" }, { status: 500 });
        }

        return NextResponse.json({
            message: "User created successfully",
            profileId: newProfile.id,
            referralCode: issuedCode,
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

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

        const referrer = await findReferrerByCode(admin, referralCode.toUpperCase());

        if (!referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
        }

        // The name only. Anyone holding a code must not be able to read the
        // referrer's email address.
        return NextResponse.json({
            referrer: {
                first_name: referrer.first_name,
                last_name: referrer.last_name,
            },
        });

    } catch (error) {
        console.error('Fetch referral error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
