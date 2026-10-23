export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { isAdminRequest } from '@/lib/server/admin-auth';

/**
 * The admin console's data.
 *
 * The console used to read `profiles`, `products` and `newsletters` straight
 * from the browser with the anon key. That no longer returns anything:
 *
 *   - `profiles` has a policy that subqueries `profiles`, so every
 *     authenticated read fails with Postgres error 42P17;
 *   - `products` has no SELECT policy at all for `public`, only an UPDATE
 *     one, so the read is empty;
 *   - `newsletters` inherits the `profiles` recursion through its
 *     "premium users can read private newsletters" policy.
 *
 * So the console reads through this route, which uses the service-role key
 * and is guarded by the operator's session token.
 */

export async function GET(request: Request) {
    try {
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const [profiles, products, newsletters, metrics, sendEvents] = await Promise.all([
            admin.from('profiles').select('*').order('created_at', { ascending: false }),
            admin.from('products').select('*').order('created_at', { ascending: false }),
            admin.from('newsletters').select('*').order('created_at', { ascending: false }),
            admin.from('live_retention_metrics').select('*').limit(1),
            admin
                .from('inbound_imperium_events')
                .select('target_id, payload, created_at')
                .eq('event_type', 'newsletter_sent')
                .order('created_at', { ascending: false })
                .limit(200),
        ]);

        const profileRows = (profiles.data || []) as { is_subscribed?: boolean }[];
        const productRows = (products.data || []) as unknown[];
        const subscriberCount = profileRows.filter(
            (row) => row.is_subscribed === true,
        ).length;

        return NextResponse.json({
            profiles: profileRows,
            products: productRows,
            newsletters: newsletters.data || [],
            newsletterSendEvents: sendEvents.data || [],
            metrics: (metrics.data || [])[0] || null,
            stats: {
                profiles: profileRows.length,
                products: productRows.length,
                subs: subscriberCount,
            },
        });
    } catch (error) {
        console.error('Admin console read failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

interface ConsoleAction {
    action: string;
    id?: string;
    product?: Record<string, unknown>;
    newsletter?: Record<string, unknown>;
}

export async function POST(request: Request) {
    try {
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const body = (await request.json()) as ConsoleAction;

        switch (body.action) {
            case 'product.upsert': {
                if (!body.product) {
                    return NextResponse.json({ error: 'Missing product' }, { status: 400 });
                }

                const product = body.product;
                const id = typeof product.id === 'string' && product.id ? product.id : null;

                if (id) {
                    const { error } = await admin.from('products').update(product).eq('id', id);
                    if (error) throw error;
                } else {
                    const { error } = await admin
                        .from('products')
                        .insert([{ ...product, created_at: new Date().toISOString() }]);
                    if (error) throw error;
                }

                return NextResponse.json({ ok: true });
            }

            case 'product.delete': {
                if (!body.id) {
                    return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
                }
                const { error } = await admin.from('products').delete().eq('id', body.id);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }

            case 'newsletter.create': {
                if (!body.newsletter) {
                    return NextResponse.json({ error: 'Missing newsletter' }, { status: 400 });
                }
                const { error } = await admin.from('newsletters').insert(body.newsletter);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }

            case 'newsletter.publish': {
                if (!body.id) {
                    return NextResponse.json({ error: 'Missing newsletter id' }, { status: 400 });
                }
                const { error } = await admin
                    .from('newsletters')
                    .update({ published: true })
                    .eq('id', body.id);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Admin console write failed:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
