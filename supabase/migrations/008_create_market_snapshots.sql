-- Migration: 008_create_market_snapshots.sql
-- Stores Hermes market intelligence cron results for /market.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS market_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_at timestamptz NOT NULL DEFAULT now(),
    market_regime text NOT NULL,
    source_status jsonb NOT NULL DEFAULT '{}'::jsonb,
    picks jsonb NOT NULL DEFAULT '[]'::jsonb,
    notes jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_snapshots_generated_at
    ON market_snapshots (generated_at DESC);

ALTER TABLE market_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view market snapshots" ON market_snapshots;
CREATE POLICY "Anyone can view market snapshots" ON market_snapshots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage market snapshots" ON market_snapshots;
CREATE POLICY "Service role can manage market snapshots" ON market_snapshots
    FOR ALL USING (true);
