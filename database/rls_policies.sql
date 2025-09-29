-- Row Level Security (RLS) Policies for Blue Carbon Registry

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nccr_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view user basic info for marketplace" ON users
    FOR SELECT USING (true);

-- Projects table policies
CREATE POLICY "Developers can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = developer_id::text);

CREATE POLICY "Developers can view their own projects" ON projects
    FOR SELECT USING (auth.uid()::text = developer_id::text);

CREATE POLICY "Developers can update their own draft projects" ON projects
    FOR UPDATE USING (
        auth.uid()::text = developer_id::text AND 
        status IN ('draft', 'rejected')
    );

CREATE POLICY "Verifiers can view submitted projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'verifier'
        ) AND status IN ('submitted', 'under_review')
    );

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Public can view verified projects" ON projects
    FOR SELECT USING (status IN ('verified', 'tokenized'));

-- Verifications table policies
CREATE POLICY "Verifiers can create verifications" ON verifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'verifier'
        )
    );

CREATE POLICY "Verifiers can view and update their verifications" ON verifications
    FOR ALL USING (auth.uid()::text = verifier_id::text);

CREATE POLICY "Project developers can view verifications of their projects" ON verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = verifications.project_id 
            AND projects.developer_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all verifications" ON verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Credits table policies
CREATE POLICY "Credit owners can view their credits" ON credits
    FOR SELECT USING (auth.uid()::text = current_owner_id::text);

CREATE POLICY "Project developers can view credits from their projects" ON credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = credits.project_id 
            AND projects.developer_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Public can view active credits for marketplace" ON credits
    FOR SELECT USING (
        NOT is_retired AND 
        EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE marketplace_listings.credit_id = credits.id 
            AND marketplace_listings.is_active = true
        )
    );

CREATE POLICY "Admins can view all credits" ON credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Transactions table policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Public can view completed transactions for transparency" ON transactions
    FOR SELECT USING (block_number IS NOT NULL);

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Marketplace listings table policies
CREATE POLICY "Sellers can create listings" ON marketplace_listings
    FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Sellers can view and update their listings" ON marketplace_listings
    FOR ALL USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Public can view active listings" ON marketplace_listings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all listings" ON marketplace_listings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- NCCR sensor data policies
CREATE POLICY "Admins can manage sensor data" ON nccr_sensor_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Project developers can view sensor data for their projects" ON nccr_sensor_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = nccr_sensor_data.project_id 
            AND projects.developer_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Verifiers can view sensor data for projects under review" ON nccr_sensor_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'verifier'
        ) AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = nccr_sensor_data.project_id 
            AND projects.status IN ('submitted', 'under_review')
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Function to get current user role (helper for policies)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;