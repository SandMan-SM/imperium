const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(1000);
  const toSync = (products || []).filter(p => !p.payment_link_url);
  console.log('Products to sync:', toSync.length);

  for (const product of toSync) {
    console.log('---');
    console.log('Product:', product.id, product.name);
    try {
      // Try resolve existing stripe info from stripe_url if present
      let stripeProductId = product.stripe_product_id;
      let stripePriceId = product.stripe_price_id;

      if (!stripeProductId && product.stripe_url) {
        try {
          const list = await stripe.paymentLinks.list({ limit: 100 });
          const match = list.data.find(pl => pl.url === product.stripe_url || pl.url === product.payment_link_url);
          if (match) {
            const full = await stripe.paymentLinks.retrieve(match.id, { expand: ['line_items'] });
            const li = full.line_items?.data?.[0];
            if (li) {
              stripePriceId = li.price?.id;
              stripeProductId = li.price?.product;
              console.log('Resolved from existing payment link:', stripeProductId, stripePriceId);
            }
          }
        } catch (e) {
          console.warn('Resolve existing payment link failed:', e.message || e);
        }
      }

      // Normalize image
      const envSite = process.env.WEBSITE_URL ? String(process.env.WEBSITE_URL).replace(/\/$/, '') : '';
      let siteUrl = envSite;
      if (!siteUrl) {
        siteUrl = 'https://imperium-green.vercel.app';
      }
      let images = [];
      if (product.image_url) {
        const img = String(product.image_url);
        if (img.startsWith('http://') || img.startsWith('https://')) images = [img];
        else images = [`${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`];
      }

      // Ensure price
      const priceNum = Number(product.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        console.log('Invalid price, skipping');
        continue;
      }

      if (!stripeProductId) {
        const sp = await stripe.products.create({ name: product.name, description: product.description || '', images, metadata: { productId: product.id } });
        stripeProductId = sp.id;
        console.log('Created stripe product', stripeProductId, 'images:', sp.images);
      } else if (images.length > 0) {
        try {
          const existing = await stripe.products.retrieve(String(stripeProductId));
          if (!existing.images || existing.images.length === 0) {
            await stripe.products.update(String(stripeProductId), { images });
            console.log('Updated existing stripe product images');
          } else {
            console.log('Existing stripe product already has images');
          }
        } catch (e) {
          console.warn('Failed to update existing product images:', e.message || e);
        }
      }

      if (!stripePriceId) {
        const sp = await stripe.prices.create({ product: stripeProductId, unit_amount: Math.round(priceNum * 100), currency: 'usd' });
        stripePriceId = sp.id;
        console.log('Created stripe price', stripePriceId);
      }

      const pl = await stripe.paymentLinks.create({ line_items: [{ price: stripePriceId, quantity: 1 }], metadata: { productId: product.id } });
      console.log('Created payment link', pl.url);

      await supabase.from('products').update({ stripe_product_id: stripeProductId, stripe_price_id: stripePriceId, stripe_url: pl.url, payment_link_url: pl.url }).eq('id', product.id);
      console.log('Updated DB for product', product.id);
    } catch (err) {
      console.error('Sync error for product', product.id, err);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
