-- Create user_interactions table for comprehensive tracking
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click', 'form_submit', 'newsletter_subscribe', 'newsletter_unsubscribe', 'product_view', 'product_purchase', 'affiliate_signup', 'newsletter_open', 'newsletter_read')),
    event_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_type ON user_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_page_url ON user_interactions(page_url);

-- Enable RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for user interactions
CREATE POLICY "Users can view their own interactions" ON user_interactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON user_interactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON user_interactions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON user_interactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get user interaction summary
CREATE OR REPLACE FUNCTION get_user_interaction_summary(user_uuid UUID)
RETURNS TABLE (
    total_interactions BIGINT,
    page_views BIGINT,
    form_submissions BIGINT,
    newsletter_subscriptions BIGINT,
    product_views BIGINT,
    product_purchases BIGINT,
    affiliate_signups BIGINT,
    last_interaction TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_interactions,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
        COUNT(*) FILTER (WHERE event_type = 'form_submit') as form_submissions,
        COUNT(*) FILTER (WHERE event_type = 'newsletter_subscribe') as newsletter_subscriptions,
        COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
        COUNT(*) FILTER (WHERE event_type = 'product_purchase') as product_purchases,
        COUNT(*) FILTER (WHERE event_type = 'affiliate_signup') as affiliate_signups,
        MAX(timestamp) as last_interaction
    FROM user_interactions
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get session analytics
CREATE OR REPLACE FUNCTION get_session_analytics(session_uuid TEXT)
RETURNS TABLE (
    session_duration INTERVAL,
    page_views BIGINT,
    unique_pages BIGINT,
    events_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        MAX(timestamp) - MIN(timestamp) as session_duration,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
        COUNT(DISTINCT page_url) as unique_pages,
        jsonb_object_agg(event_type, count) as events_by_type
    FROM (
        SELECT event_type, COUNT(*) as count
        FROM user_interactions
        WHERE session_id = session_uuid
        GROUP BY event_type
    ) as event_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get website analytics summary
CREATE OR REPLACE FUNCTION get_website_analytics_summary()
RETURNS TABLE (
    total_users BIGINT,
    total_interactions BIGINT,
    total_page_views BIGINT,
    total_form_submissions BIGINT,
    total_newsletter_subscriptions BIGINT,
    total_product_views BIGINT,
    total_product_purchases BIGINT,
    total_affiliate_signups BIGINT,
    avg_session_duration INTERVAL,
    unique_sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_interactions,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as total_page_views,
        COUNT(*) FILTER (WHERE event_type = 'form_submit') as total_form_submissions,
        COUNT(*) FILTER (WHERE event_type = 'newsletter_subscribe') as total_newsletter_subscriptions,
        COUNT(*) FILTER (WHERE event_type = 'product_view') as total_product_views,
        COUNT(*) FILTER (WHERE event_type = 'product_purchase') as total_product_purchases,
        COUNT(*) FILTER (WHERE event_type = 'affiliate_signup') as total_affiliate_signups,
        AVG(session_duration) as avg_session_duration,
        COUNT(DISTINCT session_id) as unique_sessions
    FROM (
        SELECT 
            session_id,
            user_id,
            event_type,
            timestamp,
            MAX(timestamp) OVER (PARTITION BY session_id) - MIN(timestamp) OVER (PARTITION BY session_id) as session_duration
        FROM user_interactions
    ) as session_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;