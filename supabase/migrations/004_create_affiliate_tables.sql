-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_commissions DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_applications table
CREATE TABLE IF NOT EXISTS affiliate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) DEFAULT 'stripe',
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliate_applications_affiliate_id ON affiliate_applications(affiliate_id);
CREATE INDEX idx_affiliate_applications_status ON affiliate_applications(status);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_affiliates_updated_at 
    BEFORE UPDATE ON affiliates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_applications_updated_at 
    BEFORE UPDATE ON affiliate_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_affiliate_updated_at();

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliates
CREATE POLICY "Affiliates are viewable by authenticated users" ON affiliates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Affiliates are insertable by authenticated users" ON affiliates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Affiliates are updatable by authenticated users" ON affiliates
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for affiliate_applications
CREATE POLICY "Affiliate applications are viewable by authenticated users" ON affiliate_applications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Affiliate applications are insertable by authenticated users" ON affiliate_applications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Affiliate applications are updatable by authenticated users" ON affiliate_applications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for affiliate_commissions
CREATE POLICY "Affiliate commissions are viewable by authenticated users" ON affiliate_commissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Affiliate commissions are insertable by authenticated users" ON affiliate_commissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for affiliate_payouts
CREATE POLICY "Affiliate payouts are viewable by authenticated users" ON affiliate_payouts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Affiliate payouts are insertable by authenticated users" ON affiliate_payouts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');