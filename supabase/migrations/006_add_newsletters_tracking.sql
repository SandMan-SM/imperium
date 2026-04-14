-- Migration: 006_add_newsletters_tracking.sql
-- Adds tracking columns to newsletters table for Resend integration

-- Create newsletters table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text,
    is_public boolean DEFAULT false,
    published boolean DEFAULT false,
    sent_at timestamptz,
    resend_batch_id text,
    recipient_count integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletters' AND column_name = 'sent_at') THEN
        ALTER TABLE newsletters ADD COLUMN sent_at timestamptz;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletters' AND column_name = 'resend_batch_id') THEN
        ALTER TABLE newsletters ADD COLUMN resend_batch_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletters' AND column_name = 'recipient_count') THEN
        ALTER TABLE newsletters ADD COLUMN recipient_count integer;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_at ON newsletters (sent_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_published ON newsletters (published);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters (created_at DESC);

-- Enable RLS
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view published newsletters" ON newsletters;
CREATE POLICY "Anyone can view published newsletters" ON newsletters 
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Anyone can view public newsletters" ON newsletters;
CREATE POLICY "Anyone can view public newsletters" ON newsletters 
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Service role can manage newsletters" ON newsletters;
CREATE POLICY "Service role can manage newsletters" ON newsletters 
    FOR ALL USING (true);
