-- Migration: 001_create_tracking_tables.sql
-- Creates profiles, purchases, events and extends products/newsletter_subscribers

-- Ensure uuid generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table: canonical user profile for tracking
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  email_verified boolean DEFAULT false,
  stripe_customer_id text,
  telegram_id text,
  is_admin boolean DEFAULT false,
  is_subscribed boolean DEFAULT false,
  subscription_status text DEFAULT 'none',
  is_premium boolean DEFAULT false,
  premium_since timestamptz,
  total_spent numeric(12,2) DEFAULT 0.00,
  gross_revenue numeric(12,2) DEFAULT 0.00,
  purchase_count int DEFAULT 0,
  last_purchase_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles (created_at);

-- Products table: create if missing, otherwise keep existing and add columns
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text,
  category text,
  description text,
  price numeric(10,2) DEFAULT 0.00,
  image_url text,
  stripe_product_id text,
  stripe_price_id text,
  stripe_url text,
  sku text,
  in_stock boolean DEFAULT true,
  available_stock int,
  sold_count int DEFAULT 0,
  views_count int DEFAULT 0,
  revenue_generated numeric(12,2) DEFAULT 0.00,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchases table: records individual purchases / payments
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  product_id text REFERENCES products(id) ON DELETE SET NULL,
  stripe_payment_id text,
  stripe_checkout_session text,
  amount numeric(12,2) DEFAULT 0.00,
  currency text,
  quantity int DEFAULT 1,
  status text,
  captured_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_profile_id ON purchases (profile_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases (product_id);

-- Newsletter subscribers (create or extend)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  confirmed boolean DEFAULT false,
  source text,
  opens_count int DEFAULT 0,
  clicks_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  newsletters_sent_count int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

-- Events table for generic analytics
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  event_type text,
  entity_type text,
  entity_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trigger function to update aggregates after a purchase is recorded
CREATE OR REPLACE FUNCTION fn_handle_purchase_insert()
RETURNS trigger AS $$
BEGIN
  -- Update profile aggregates
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE profiles
      SET total_spent = COALESCE(total_spent,0) + COALESCE(NEW.amount,0),
          gross_revenue = COALESCE(gross_revenue,0) + COALESCE(NEW.amount,0),
          purchase_count = COALESCE(purchase_count,0) + 1,
          last_purchase_at = NEW.created_at,
          updated_at = now()
    WHERE id = NEW.profile_id;
  END IF;

  -- Update product counters
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products
      SET sold_count = COALESCE(sold_count,0) + COALESCE(NEW.quantity,1),
          revenue_generated = COALESCE(revenue_generated,0) + COALESCE(NEW.amount,0),
          updated_at = now()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_after_purchase_insert ON purchases;
CREATE TRIGGER trg_after_purchase_insert
AFTER INSERT ON purchases
FOR EACH ROW
EXECUTE FUNCTION fn_handle_purchase_insert();

-- Row Level Security: allow anonymous inserts into newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'allow_public_insert_newsletter'
  ) THEN
    CREATE POLICY allow_public_insert_newsletter
      ON newsletter_subscribers
      FOR INSERT
      WITH CHECK (true);
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products (in_stock);

-- End migration
