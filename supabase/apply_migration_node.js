// Apply migration from supabase/migrations using web/.env.local
// Run this from the web directory to ensure dependencies resolve:
//   cd web && node ../supabase/apply_migration_node.js

const fs = require('fs');
const path = require('path');

// Load env from the current working directory (should be web/ when invoked)
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const { Client } = require('pg');

async function main() {
  const migrationPath = path.resolve(__dirname, 'migrations/001_create_tracking_tables.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found at', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL missing in web/.env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB; running migration...');
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
