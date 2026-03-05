-- ==========================================
-- IMPERIUM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- PRODUCTS TABLE
-- Stores all product information synced from Printify
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printify_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- shirts, hoodies, sweats, beanies, hats
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    pain_points TEXT, -- JSON array of pain points this product solves
    brand VARCHAR(100), -- 'imperium' or other brand name
    in_stock BOOLEAN DEFAULT true,
    printify_variant_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true);

-- ==========================================
-- NEWSLETTERS TABLE
-- Stores generated daily newsletter posts
-- ==========================================
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    image_path TEXT, -- Local path to generated image
    product_id UUID REFERENCES products(id),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletters
CREATE POLICY "Anyone can read newsletters" ON newsletters FOR SELECT USING (true);
CREATE POLICY "Anyone can insert newsletters" ON newsletters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update newsletters" ON newsletters FOR UPDATE USING (true);

-- ==========================================
-- DAILY QUOTES TABLE
-- Stores AI-generated complementary quotes
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quotes
CREATE POLICY "Anyone can read daily_quotes" ON daily_quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert daily_quotes" ON daily_quotes FOR INSERT WITH CHECK (true);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_published ON newsletters(published) WHERE published = true;

-- ==========================================
-- SAMPLE DATA - Insert initial products
-- (Optional - will be synced from Printify)
-- ==========================================
-- INSERT INTO products (name, category, description, price, brand, in_stock)
-- VALUES 
--     ('Imperium Classic Tee', 'shirts', 'Premium cotton t-shirt with Imperium logo', 29.99, 'imperium', true),
--     ('Imperium Hoodie', 'hoodies', 'Heavyweight hoodie for maximum comfort', 79.99, 'imperium', true),
--     ('Imperium Sweatpants', 'sweats', 'Premium sweatpants', 59.99, 'imperium', true),
--     ('Imperium Beanie', 'beanies', 'Knit beanie with embroidered logo', 24.99, 'imperium', true),
--     ('Imperium Snapback', 'hats', 'Adjustable snapback cap', 27.99, 'imperium', true);
