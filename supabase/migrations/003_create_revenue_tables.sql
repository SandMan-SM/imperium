-- Migration: 003_create_revenue_tables.sql
-- Creates tables for tiered subscriptions, referrals, affiliates, social proof, and leads

-- Ensure uuid generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Subscriptions table with tiered pricing
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL, -- foundation, elite, sovereign
    status VARCHAR(20) NOT NULL, -- active, canceled, past_due, trialing
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions (profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions (tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- Referrals table for tracking referral program
CREATE TABLE IF NOT EXISTS referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    reward_claimed BOOLEAN DEFAULT false,
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    reward_currency VARCHAR(3) DEFAULT 'USD',
    reward_type VARCHAR(20) DEFAULT 'subscription_credit', -- subscription_credit, cash, product
    stripe_subscription_id VARCHAR(255), -- subscription that triggered the reward
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    claimed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_reward_claimed ON referrals (reward_claimed);

-- Affiliate earnings table
CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    source VARCHAR(255), -- subscription, product, bundle
    source_id VARCHAR(255), -- subscription_id, product_id, etc.
    commission_rate DECIMAL(5,4), -- 0.30 for 30%
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, rejected
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_affiliate_id ON affiliate_earnings (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON affiliate_earnings (status);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_source ON affiliate_earnings (source);

-- Page views for social proof
CREATE TABLE IF NOT EXISTS page_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page VARCHAR(100) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views (page);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_profile_id ON page_views (profile_id);

-- Lead magnets collected
CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100), -- exit_intent, newsletter, principle_access
    principle_accessed VARCHAR(10), -- which principle they accessed
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    converted_to_user BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads (converted_to_user);

-- Bundle purchases (subscription + product)
CREATE TABLE IF NOT EXISTS bundle_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id text REFERENCES products(id) ON DELETE CASCADE,
    bundle_type VARCHAR(50), -- subscription_with_product, product_with_subscription
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_checkout_session VARCHAR(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bundle_purchases_profile_id ON bundle_purchases (profile_id);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_subscription_id ON bundle_purchases (subscription_id);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_product_id ON bundle_purchases (product_id);

-- Revenue analytics summary table (updated by triggers)
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    tier VARCHAR(20),
    metric VARCHAR(50), -- mrr, new_subscriptions, churned_subscriptions, arpu, ltv
    value DECIMAL(12,2) NOT NULL,
    count_value INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_analytics_date_tier_metric ON revenue_analytics (date, tier, metric);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics (date);

-- Update triggers for revenue analytics
CREATE OR REPLACE FUNCTION fn_update_revenue_analytics()
RETURNS trigger AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Update MRR (Monthly Recurring Revenue)
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- This is a simplified version - in production you'd want more sophisticated MRR calculation
        -- For now, we'll just track subscription count and amount changes
        INSERT INTO revenue_analytics (date, tier, metric, value, count_value)
        VALUES (current_date, NEW.tier, 'subscription_count', NEW.amount, 1)
        ON CONFLICT (date, tier, metric)
        DO UPDATE SET
            value = revenue_analytics.value + EXCLUDED.value,
            count_value = revenue_analytics.count_value + EXCLUDED.count_value;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to subscriptions table
DROP TRIGGER IF EXISTS trg_update_revenue_analytics ON subscriptions;
CREATE TRIGGER trg_update_revenue_analytics
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION fn_update_revenue_analytics();

-- Row Level Security for new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions (users can only see their own)
CREATE POLICY select_own_subscriptions ON subscriptions
FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY insert_subscriptions ON subscriptions
FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Policies for referrals (users can see their own referrals)
CREATE POLICY select_own_referrals ON referrals
FOR SELECT USING (referrer_id = (SELECT id FROM profiles WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY insert_referrals ON referrals
FOR INSERT WITH CHECK (referrer_id = (SELECT id FROM profiles WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions (current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end ON subscriptions (cancel_at_period_end);
CREATE INDEX IF NOT EXISTS idx_page_views_hour ON page_views (DATE_TRUNC('hour', created_at));
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);

-- End migration