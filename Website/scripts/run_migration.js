// Run migration from web context so dependencies resolve from web/node_modules
// Usage: node web/scripts/run_migration.js
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { Client } = require('pg');

async function run() {
  const sqlPath = path.resolve(__dirname, '../../../supabase/migrations/001_create_tracking_tables.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in web/.env.local');
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
    console.error('Migration error:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
