// Run this from the web directory: node apply_migration_direct.js
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { Client } = require('pg');

async function main() {
  const migrationPath = path.resolve(process.cwd(), '../supabase/migrations/001_create_tracking_tables.sql');
  console.log('Looking for migration at', migrationPath);
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file missing:', migrationPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL missing in .env.local');
    process.exit(1);
  }
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB — running migration...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
