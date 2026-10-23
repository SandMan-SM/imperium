export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';

/**
 * The product catalogue.
 *
 * The browser used to read `products` with the anon key. The only policy open
 * to `public` on that table is an UPDATE policy, so the read always came back
 * empty and every product grid fell back to the hard-coded catalogue. The
 * read happens server side here, where the service-role key is not subject to
 * RLS.
 *
 * Only the columns a storefront needs are returned.
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

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const inStockOnly = url.searchParams.get('all') !== '1';

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        let query = admin.from('products').select(PRODUCT_COLUMNS);
        if (inStockOnly) query = query.eq('in_stock', true);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Product list failed:', error);
            return NextResponse.json({ error: 'Product list failed' }, { status: 500 });
        }

        const rows = (data || []) as { name?: string }[];
        const products = rows.map((row) => ({ ...row, slug: slugify(row.name || '') }));

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Product list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
