export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { resolveCaller } from '@/lib/server/request-user';
import { readCompletedUnits, resolveMembership } from '@/lib/server/membership';
import {
    CURRICULUM_FREE_UNIT,
    CURRICULUM_UNIT_COUNT,
    curriculumUnits,
    toUnitSummary,
} from '@/lib/curriculum';

/**
 * The 28 Principles — the member curriculum.
 *
 * The lessons themselves live in `lib/curriculum.ts`, which is a server
 * module. This route is the only way out of it, so the paid content is
 * never shipped to a browser that has not paid for it: a visitor who is not
 * a member receives the outline — phase, unit, title, summary and the points
 * the unit covers — and the body of the free sample unit. Everything else
 * stays on the server.
 *
 * GET  -> the curriculum for the signed-in member
 * POST -> mark a unit complete (or not) in `profiles.completed_units`
 */

function lessonPayload(unit: (typeof curriculumUnits)[number]) {
    return {
        ...toUnitSummary(unit),
        quote: unit.quote,
        body: unit.body,
        reflection: unit.reflection,
    };
}

export async function GET(request: Request) {
    try {
        const caller = await resolveCaller(request);

        // An anonymous visitor sees the outline and the free sample unit.
        // That is the same view a signed-in non-member gets.
        if (!caller) {
            return NextResponse.json({
                authenticated: false,
                premium: false,
                membershipSource: 'none',
                subscriptionStatus: null,
                completedUnits: [],
                freeUnit: CURRICULUM_FREE_UNIT,
                unitCount: CURRICULUM_UNIT_COUNT,
                units: curriculumUnits.map((unit) =>
                    unit.number <= CURRICULUM_FREE_UNIT
                        ? { ...lessonPayload(unit), locked: false }
                        : { ...toUnitSummary(unit), locked: true },
                ),
            });
        }

        const membership = await resolveMembership(caller.user.email);
        const premium = membership.premium;

        // Progress belongs to the account the member signed in with, not to
        // whichever row happens to hold the purchase.
        const progressProfileId = caller.profile?.id ?? membership.profileId;
        const completedUnits = await readCompletedUnits(progressProfileId);

        const units = curriculumUnits.map((unit) => {
            const unlocked = premium || unit.number <= CURRICULUM_FREE_UNIT;
            return unlocked ? { ...lessonPayload(unit), locked: false } : { ...toUnitSummary(unit), locked: true };
        });

        return NextResponse.json({
            authenticated: true,
            premium,
            membershipSource: membership.source,
            subscriptionStatus: membership.subscriptionStatus,
            completedUnits,
            freeUnit: CURRICULUM_FREE_UNIT,
            unitCount: CURRICULUM_UNIT_COUNT,
            units,
        });
    } catch (error) {
        console.error('Curriculum read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
            unit?: number;
            completed?: boolean;
        };

        const unit = Number(body.unit);
        if (!Number.isInteger(unit) || unit < 1 || unit > CURRICULUM_UNIT_COUNT) {
            return NextResponse.json({ error: 'Unknown unit' }, { status: 400 });
        }

        const membership = await resolveMembership(caller.user.email);

        // A member can mark any unit. Anyone else can only mark the free
        // sample, which is readable by everyone anyway.
        if (!membership.premium && unit > CURRICULUM_FREE_UNIT) {
            return NextResponse.json({ error: 'Membership required' }, { status: 402 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        let profileId = caller.profile?.id ?? membership.profileId;

        if (!profileId) {
            const { data: created, error: createError } = await admin
                .from('profiles')
                .insert({
                    id: crypto.randomUUID(),
                    auth_id: caller.user.id,
                    email: caller.user.email,
                    created_at: new Date().toISOString(),
                })
                .select('id')
                .single();

            if (createError) {
                console.error('Curriculum progress profile create failed:', createError);
                return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
            }

            profileId = created.id as string;
        }

        const current = await readCompletedUnits(profileId);
        const next = body.completed === false
            ? current.filter((value) => value !== unit)
            : Array.from(new Set([...current, unit])).sort((a, b) => a - b);

        const { error: updateError } = await admin
            .from('profiles')
            .update({ completed_units: next, updated_at: new Date().toISOString() })
            .eq('id', profileId);

        if (updateError) {
            console.error('Curriculum progress update failed:', updateError);
            return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
        }

        return NextResponse.json({ ok: true, completedUnits: next });
    } catch (error) {
        console.error('Curriculum progress write error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
