Migration SQL + Quick Instructions (paste into Supabase SQL editor)

Follow these steps in order. This file is formatted so you can copy the SQL block and paste it directly into the Supabase SQL editor (Dashboard → SQL → New query).

1) Backup (recommended)
- If this is production, create quick backups before running: in the SQL editor run:

  CREATE TABLE public.profiles_backup AS TABLE public.profiles;
  CREATE TABLE public.products_backup AS TABLE public.products;
  CREATE TABLE public.purchases_backup AS TABLE public.purchases;
  CREATE TABLE public.newsletter_subscribers_backup AS TABLE public.newsletter_subscribers;

2) Paste and run the SQL block below in the Supabase SQL editor
- The block is idempotent and conservative: it creates missing tables and columns and only adds FK/trigger when safe.

----- BEGIN SQL: paste all of this into the SQL editor -----

-- Safe, idempotent migration to add tracking schema
-- BACKUP first if this is production: CREATE TABLE public.profiles_backup AS TABLE public.profiles;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_subscribed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent numeric(12,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gross_revenue numeric(12,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS purchase_count int DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_purchase_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.profiles SET id = gen_random_uuid() WHERE id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'profiles' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.profiles ADD PRIMARY KEY (id)';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not add PK on profiles.id (may not be unique). Skipping.';
    END;
  END IF;
END$$;

-- Products
CREATE TABLE IF NOT EXISTS public.products (id text PRIMARY KEY);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_product_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available_stock int;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count int DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count int DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS revenue_generated numeric(12,2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Purchases
CREATE TABLE IF NOT EXISTS public.purchases (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS product_id text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS stripe_payment_id text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS stripe_checkout_session text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS amount numeric(12,2) DEFAULT 0.00;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS quantity int DEFAULT 1;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS captured_at timestamptz;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='purchases' AND column_name='profile_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='id')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE c.contype = 'f' AND t.relname = 'purchases' AND pg_get_constraintdef(c.oid) LIKE '%REFERENCES public.profiles(id)%'
     ) THEN
    ALTER TABLE public.purchases
      ADD CONSTRAINT fk_purchases_profile FOREIGN KEY (profile_id)
      REFERENCES public.profiles (id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='purchases' AND column_name='product_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='id')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE c.contype = 'f' AND t.relname = 'purchases' AND pg_get_constraintdef(c.oid) LIKE '%REFERENCES public.products(id)%'
     ) THEN
    ALTER TABLE public.purchases
      ADD CONSTRAINT fk_purchases_product FOREIGN KEY (product_id)
      REFERENCES public.products (id) ON DELETE SET NULL;
  END IF;
END$$;

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS subscribed_at timestamptz DEFAULT now();
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmed boolean DEFAULT false;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS opens_count int DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS clicks_count int DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS shares_count int DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS newsletters_sent_count int DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='newsletter_subscribers' AND column_name='profile_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='id')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint c
       JOIN pg_class t ON c.conrelid = t.oid
       WHERE c.contype = 'f' AND t.relname = 'newsletter_subscribers' AND pg_get_constraintdef(c.oid) LIKE '%REFERENCES public.profiles(id)%'
     ) THEN
    ALTER TABLE public.newsletter_subscribers
      ADD CONSTRAINT fk_newsletter_profile FOREIGN KEY (profile_id)
      REFERENCES public.profiles (id) ON DELETE SET NULL;
  END IF;
END$$;

-- Events
CREATE TABLE IF NOT EXISTS public.events (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entity_id text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Trigger function & trigger
CREATE OR REPLACE FUNCTION public.fn_handle_purchase_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE public.profiles
      SET total_spent = COALESCE(total_spent,0) + COALESCE(NEW.amount,0),
          gross_revenue = COALESCE(gross_revenue,0) + COALESCE(NEW.amount,0),
          purchase_count = COALESCE(purchase_count,0) + 1,
          last_purchase_at = NEW.created_at,
          updated_at = now()
    WHERE id = NEW.profile_id;
  END IF;

  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
      SET sold_count = COALESCE(sold_count,0) + COALESCE(NEW.quantity,1),
          revenue_generated = COALESCE(revenue_generated,0) + COALESCE(NEW.amount,0),
          updated_at = now()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='purchases') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_after_purchase_insert') THEN
      CREATE TRIGGER trg_after_purchase_insert
      AFTER INSERT ON public.purchases
      FOR EACH ROW
      EXECUTE FUNCTION public.fn_handle_purchase_insert();
    END IF;
  END IF;
END$$;

-- RLS for newsletter inserts (permissive; review later)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'allow_public_insert_newsletter'
  ) THEN
    CREATE POLICY allow_public_insert_newsletter
      ON public.newsletter_subscribers
      FOR INSERT
      WITH CHECK (true);
  END IF;
END$$;

-- Indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='newsletter_subscribers' AND column_name='email') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers (email)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='category') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category)';
  END IF;
END$$;

----- END SQL -----

3) Verification queries (run after the SQL succeeds)

-- Confirm tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles','products','purchases','newsletter_subscribers','events');

-- Confirm PK on profiles
SELECT kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = 'profiles';

-- Quick counts
SELECT (SELECT count(*) FROM public.profiles) AS profiles, (SELECT count(*) FROM public.purchases) AS purchases, (SELECT count(*) FROM public.newsletter_subscribers) AS newsletters;

4) Common errors & quick fixes (paste any error and I will provide immediate fix)
- "column \"id\" referenced in foreign key constraint does not exist": run the diagnostic below, then run the minimal fix I provide.

Diagnostic to run (paste output here):
-- which target tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles','products','purchases','newsletter_subscribers','events','clients');

-- show profile columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY ordinal_position;

5) Backfill step (run after migration completes)
- From your terminal in the repo: (ensure web/.env.local contains SUPABASE_SERVICE_ROLE_KEY)

  cd web
  npm install
  node scripts/backfill_clients_to_profiles.js

That script will upsert profiles by email using the existing `clients` rows and tag profiles.metadata.migrated_from_client.

If you prefer I produce a single consolidated file for offline use (or a tailored minimal fix based on diagnostics), paste the diagnostics output and I will return the exact SQL to run.

If you run the SQL and get any errors, paste the exact error text here and I will respond immediately with the precise correction.
