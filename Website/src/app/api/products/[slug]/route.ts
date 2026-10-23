export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';

/**
 * A product row, looked up by its URL slug.
 *
 * The `products` table has no `slug` column — adding one is a schema change
 * and belongs to the council, not to this app — so the slug is derived from
 * the product name: "Imperium Command Hoodie" -> "imperium-command-hoodie".
 *
 * The read happens server side. The only policy open to `public` on
 * `products` is an UPDATE policy, so an anonymous browser read returns no
 * rows at all and the catalogue was unreachable.
 */

const PRODUCT_COLUMNS =
    'id, name, category, description, price, image_url, brand, in_stock, available_stock, sku';

/** Turns a product name into the slug used in the URL. */
function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const wanted = slugify(slug);

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const { data, error } = await admin
            .from('products')
            .select(PRODUCT_COLUMNS)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Product lookup failed:', error);
            return NextResponse.json({ error: 'Product lookup failed' }, { status: 500 });
        }

        const rows = (data || []) as { id: string; name: string }[];
        const match = rows.find((row) => slugify(row.name || '') === wanted);

        if (!match) {
            return NextResponse.json({ product: null });
        }

        return NextResponse.json({ product: { ...match, slug: wanted } });
    } catch (error) {
        console.error('Product lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
