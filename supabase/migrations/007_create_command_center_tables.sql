-- Migration: 007_create_command_center_tables.sql
-- Creates live_retention_metrics, client_health, and smart lists tables for Command Center

-- Live retention metrics view/table for dashboard
CREATE TABLE IF NOT EXISTS live_retention_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    total_users integer DEFAULT 0,
    premium_subscribers integer DEFAULT 0,
    free_newsletter_opens integer DEFAULT 0,
    premium_newsletter_opens integer DEFAULT 0,
    active_30d_users integer DEFAULT 0,
    total_network_revenue numeric(12,2) DEFAULT 0,
    avg_purchases_per_user numeric(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Client health tracking for premium users
CREATE TABLE IF NOT EXISTS client_health (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    health_score integer DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
    email_opens_30d integer DEFAULT 0,
    email_clicks_30d integer DEFAULT 0,
    purchases_30d integer DEFAULT 0,
    last_activity_at timestamptz,
    engagement_trend VARCHAR(20) DEFAULT 'stable', -- growing, stable, declining
    at_risk_score integer DEFAULT 0 CHECK (at_risk_score BETWEEN 0 AND 100),
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Smart lists for CRM segmentation
CREATE TABLE IF NOT EXISTS smart_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description text,
    list_type VARCHAR(50) NOT NULL, -- free_users, subscribers, premium_users, nurture, custom
    query_config jsonb DEFAULT '{}'::jsonb, -- stores the filter criteria
    include_premium boolean DEFAULT false,
    sort_by VARCHAR(50) DEFAULT 'created_at',
    sort_order VARCHAR(10) DEFAULT 'desc',
    is_system boolean DEFAULT false, -- system lists cannot be deleted
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Nurture sequences for automated follow-ups
CREATE TABLE IF NOT EXISTS nurture_sequences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description text,
    trigger_event VARCHAR(50), -- purchase, signup, inactivity, manual
    delay_days integer DEFAULT 0,
    email_template_id text,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed
    sent_count integer DEFAULT 0,
    open_rate numeric(5,2) DEFAULT 0,
    click_rate numeric(5,2) DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Client activity timeline
CREATE TABLE IF NOT EXISTS client_timeline (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- purchase, email_open, email_click, login, subscription_created, subscription_cancelled
    event_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_health_profile ON client_health (profile_id);
CREATE INDEX IF NOT EXISTS idx_client_health_score ON client_health (health_score);
CREATE INDEX IF NOT EXISTS idx_client_health_at_risk ON client_health (at_risk_score);
CREATE INDEX IF NOT EXISTS idx_smart_lists_slug ON smart_lists (slug);
CREATE INDEX IF NOT EXISTS idx_smart_lists_type ON smart_lists (list_type);
CREATE INDEX IF NOT EXISTS idx_nurture_sequences_status ON nurture_sequences (status);
CREATE INDEX IF NOT EXISTS idx_client_timeline_profile ON client_timeline (profile_id);
CREATE INDEX IF NOT EXISTS idx_client_timeline_created ON client_timeline (created_at DESC);

-- Enable RLS
ALTER TABLE live_retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurture_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow service role full access
CREATE POLICY "Admin full access live_retention_metrics" ON live_retention_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access client_health" ON client_health FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access smart_lists" ON smart_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access nurture_sequences" ON nurture_sequences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access client_timeline" ON client_timeline FOR ALL USING (true) WITH CHECK (true);

-- Insert default smart lists
INSERT INTO smart_lists (name, slug, description, list_type, include_premium, is_system) VALUES
('Free Users', 'free-users', 'Users who have not purchased any products', 'free_users', false, true),
('Subscribers', 'subscribers', 'Newsletter subscribers who are not premium', 'subscribers', false, true),
('Premium Members', 'premium-members', 'Active premium/subscription members', 'premium_users', true, true),
('Nurture List', 'nurture-list', 'Users in nurture campaign', 'nurture', false, true),
('At Risk', 'at-risk', 'Premium users showing declining engagement', 'custom', true, true),
('New This Week', 'new-this-week', 'Users who joined within the last 7 days', 'custom', false, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default nurture sequences
INSERT INTO nurture_sequences (name, description, trigger_event, delay_days) VALUES
('Welcome Series', 'Onboarding sequence for new users', 'signup', 0),
('Post-Purchase Follow-up', 'Follow up after any purchase', 'purchase', 2),
('Win-back Inactive', 'Re-engage inactive premium users', 'inactivity', 14),
('Upsell to Premium', 'Encourage free users to upgrade', 'manual', 0)
ON CONFLICT DO NOTHING;

-- Function to calculate and update client health scores
CREATE OR REPLACE FUNCTION fn_update_client_health()
RETURNS void AS $$
BEGIN
    -- Update health based on recent activity
    UPDATE client_health ch
    SET 
        health_score = LEAST(100,
            COALESCE(ch.email_opens_30d * 2, 0) + 
            COALESCE(ch.email_clicks_30d * 3, 0) + 
            COALESCE(ch.purchases_30d * 10, 0) +
            CASE WHEN ch.last_activity_at > NOW() - INTERVAL '7 days' THEN 20
                 WHEN ch.last_activity_at > NOW() - INTERVAL '14 days' THEN 10
                 ELSE 0 END
        ),
        at_risk_score = LEAST(100,
            CASE WHEN ch.last_activity_at < NOW() - INTERVAL '30 days' THEN 80
                 WHEN ch.last_activity_at < NOW() - INTERVAL '14 days' THEN 50
                 WHEN ch.health_score < 30 THEN 60
                 ELSE 0 END
        ),
        engagement_trend = CASE 
            WHEN ch.email_opens_30d > (SELECT COALESCE(email_opens_30d, 0) FROM client_health WHERE profile_id = ch.profile_id AND updated_at < NOW() - INTERVAL '30 days') THEN 'growing'
            WHEN ch.email_opens_30d < (SELECT COALESCE(email_opens_30d, 0) FROM client_health WHERE profile_id = ch.profile_id AND updated_at < NOW() - INTERVAL '30 days') * 0.5 THEN 'declining'
            ELSE 'stable' END,
        updated_at = NOW()
    WHERE ch.profile_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh live metrics
CREATE OR REPLACE FUNCTION fn_refresh_live_metrics()
RETURNS void AS $$
DECLARE
    v_total_users INTEGER;
    v_premium_subscribers INTEGER;
    v_active_30d INTEGER;
    v_total_revenue NUMERIC(12,2);
    v_avg_purchases NUMERIC(10,2);
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM profiles;
    SELECT COUNT(*) INTO v_premium_subscribers FROM profiles WHERE is_premium = true OR subscription_status = 'active';
    SELECT COUNT(*) INTO v_active_30d FROM profiles WHERE updated_at > NOW() - INTERVAL '30 days';
    SELECT COALESCE(SUM(total_spent), 0) INTO v_total_revenue FROM profiles;
    SELECT COALESCE(AVG(purchase_count), 0) INTO v_avg_purchases FROM profiles;

    INSERT INTO live_retention_metrics (
        total_users, premium_subscribers, active_30d_users, 
        total_network_revenue, avg_purchases_per_user, created_at, updated_at
    )
    VALUES (
        v_total_users, v_premium_subscribers, v_active_30d,
        v_total_revenue, v_avg_purchases, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Add first_name and last_name to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100);
    END IF;
END $$;
