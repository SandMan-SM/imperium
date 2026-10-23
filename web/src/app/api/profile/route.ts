export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { resolveCaller } from '@/lib/server/request-user';

/**
 * The signed-in person's profile.
 *
 * The browser used to read `profiles` directly with the anon key. That no
 * longer works: the fleet's `profiles` policies are self-referential, so an
 * authenticated read dies with Postgres error 42P17 and an anonymous read is
 * blocked outright. The read therefore happens here, server side with the
 * service-role key, and the browser gets the one row it is allowed to see.
 *
 * GET  -> the caller's profile
 * POST -> updates the caller's own name fields
 */

export async function GET(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        let profile = caller.profile;

        // The signup form collects a first name, but the database trigger that
        // creates the profile row on signup cannot see the auth metadata. Fill
        // the gap once the account is confirmed, so the name is not lost.
        if (profile) {
            const patch = await syncNameFromAuthMetadata(admin, profile.id, caller.user.id);
            if (patch) profile = { ...profile, ...patch };
        }

        if (!profile) {
            return NextResponse.json({ profile: null });
        }

        return NextResponse.json({
            // The caller's own row. The browser needs the whole record because
            // the profile it renders (tier, premium flag, admin flag) is the
            // same shape it used to read straight from `profiles`.
            profile,
        });
    } catch (error) {
        console.error('Profile read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const body = (await request.json().catch(() => ({}))) as {
            firstName?: string;
            lastName?: string;
        };

        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (typeof body.firstName === 'string') patch.first_name = body.firstName.trim() || null;
        if (typeof body.lastName === 'string') patch.last_name = body.lastName.trim() || null;

        let profileId = caller.profile?.id ?? null;

        if (!profileId) {
            const { data: created, error: createError } = await admin
                .from('profiles')
                .insert({
                    id: crypto.randomUUID(),
                    auth_id: caller.user.id,
                    email: caller.user.email,
                    created_at: new Date().toISOString(),
                    ...patch,
                })
                .select()
                .single();

            if (createError) {
                console.error('Profile create error:', createError);
                return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
            }
            profileId = created.id as string;
        } else {
            const { error: updateError } = await admin
                .from('profiles')
                .update(patch)
                .eq('id', profileId);

            if (updateError) {
                console.error('Profile update error:', updateError);
                return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
            }
        }

        return NextResponse.json({ ok: true, profileId });
    } catch (error) {
        console.error('Profile write error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Copies the first and last name out of the auth metadata into the profile
 * row, but only when the profile does not have them yet.
 */
async function syncNameFromAuthMetadata(
    admin: NonNullable<ReturnType<typeof getAdminClient>>,
    profileId: string,
    authId: string,
): Promise<Record<string, unknown> | null> {
    const { data: userData } = await admin.auth.admin.getUserById(authId);
    const metadata = (userData?.user?.user_metadata || {}) as Record<string, unknown>;

    const first = typeof metadata.first_name === 'string' ? metadata.first_name.trim() : '';
    const last = typeof metadata.last_name === 'string' ? metadata.last_name.trim() : '';

    if (!first && !last) return null;

    const { data: current } = await admin
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', profileId)
        .limit(1);

    const row = current?.[0] as { first_name: string | null; last_name: string | null } | undefined;
    if (!row) return null;
    if (row.first_name || row.last_name) return null;

    const patch: Record<string, unknown> = {};
    if (first && !row.first_name) patch.first_name = first;
    if (last && !row.last_name) patch.last_name = last;
    if (Object.keys(patch).length === 0) return null;

    const { error } = await admin.from('profiles').update(patch).eq('id', profileId);
    if (error) {
        console.error('Profile name sync failed:', error);
        return null;
    }

    return patch;
}
