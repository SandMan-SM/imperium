// Backfill script: migrate clients -> profiles by email
// Usage: cd web && node scripts/backfill_clients_to_profiles.js
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Fetching clients...');
  const { data: clients } = await supabase.from('clients').select('*');
  if (!clients || clients.length === 0) {
    console.log('No clients found to backfill');
    return;
  }

  for (const c of clients) {
    try {
      const email = c.email?.toLowerCase().trim();
      if (!email) continue;
      const { data: existing } = await supabase.from('profiles').select('*').eq('email', email).limit(1);
      if (existing && existing.length) {
        // update profile with client data
        await supabase.from('profiles').update({ metadata: { ...existing[0].metadata, migrated_from_client_id: c.id }, updated_at: new Date().toISOString() }).eq('id', existing[0].id);
        continue;
      }

      const insert = {
        email,
        metadata: { migrated_from_client: c },
        created_at: c.created_at || new Date().toISOString()
      };
      await supabase.from('profiles').insert([insert]);
      console.log('Inserted profile for', email);
    } catch (err) {
      console.error('Backfill error for client', c, err.message || err);
    }
  }

  console.log('Backfill complete');
}

run();
