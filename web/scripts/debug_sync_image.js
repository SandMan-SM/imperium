// Quick debugging script to test Stripe image upload for a product
// Run from project root: cd web && node scripts/debug_sync_image.js

const path = require('path');
// Prefer loading web/.env.local explicitly so local secrets are available when running from repo root
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY in env');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: products, error } = await supabase.from('products').select('*').limit(10);
  if (error) {
    console.error('Supabase error:', error);
    process.exit(1);
  }

  const candidate = (products || []).find(p => p.image_url && !(p.payment_link_url || p.stripe_url));
  if (!candidate) {
    console.error('No candidate product found (with image_url and missing payment link)');
    process.exit(1);
  }

  const siteUrl = (process.env.WEBSITE_URL || '').replace(/\/$/, '');
  const img = String(candidate.image_url);
  let normalized;
  if (img.startsWith('http://') || img.startsWith('https://')) normalized = img;
  else if (siteUrl) normalized = `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  else normalized = img;

  console.log('Testing product:', candidate.id, candidate.name);
  console.log('Original image_url:', candidate.image_url);
  console.log('Normalized image URL:', normalized);

  try {
    const p = await stripe.products.create({
      name: `TEST-SYNC-${candidate.id}-${Date.now()}`,
      description: candidate.description || '',
      images: normalized ? [normalized] : [],
      metadata: { productId: candidate.id, debug: 'true' },
    });
    console.log('Stripe product created:', p.id);
    console.log('Stripe product images:', p.images);

    // clean up
    await stripe.products.update(p.id, { active: false });
    // optionally delete
    // await stripe.products.del(p.id);
    console.log('Cleaned up test product (set inactive)');
  } catch (err) {
    console.error('Stripe create error:', err);
    process.exit(1);
  }
}

main();
