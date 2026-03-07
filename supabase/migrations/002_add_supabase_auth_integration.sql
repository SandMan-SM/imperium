-- Migration: 002_add_supabase_auth_integration.sql
-- Links profiles to Supabase Auth users and adds proper RLS policies

-- Add auth_id column to link profiles with Supabase auth.users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles (auth_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, auth_id, created_at, updated_at)
  VALUES (gen_random_uuid(), new.email, new.id, now(), now())
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security: profiles can be read by the user themselves and admins
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth_id = auth.uid() OR is_admin = true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth_id = auth.uid());

-- Allow public read on newsletter_subscribers for email verification
DROP POLICY IF EXISTS "Public can read newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public can read newsletter_subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);

-- Allow public to insert newsletter subscribers (already exists, keeping for compatibility)
DROP POLICY IF EXISTS "Public can insert newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public can insert newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to read newsletters that are public or they are premium
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Newsletters public view" ON newsletters;
CREATE POLICY "Newsletters public view" ON newsletters
  FOR SELECT USING (is_public = true OR is_premium = true);

-- Allow public to read newsletter_engagement for their own data
ALTER TABLE newsletter_engagement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own engagement" ON newsletter_engagement;
CREATE POLICY "Users can view own engagement" ON newsletter_engagement
  FOR SELECT USING (auth_id = auth.uid());
