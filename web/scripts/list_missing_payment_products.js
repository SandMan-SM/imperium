const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or('stripe_url.is.null,payment_link_url.is.null')
    .limit(100);

  if (error) {
    console.error('Supabase error:', error);
    process.exit(1);
  }

  console.log('Found', (data || []).length, 'products missing stripe_url or payment_link_url');
  for (const p of data || []) {
    console.log('---');
    console.log('id:', p.id);
    console.log('name:', p.name);
    console.log('price:', p.price);
    console.log('image_url:', p.image_url);
    console.log('stripe_product_id:', p.stripe_product_id);
    console.log('stripe_price_id:', p.stripe_price_id);
    console.log('stripe_url:', p.stripe_url);
    console.log('payment_link_url:', p.payment_link_url);
  }
}

main();
