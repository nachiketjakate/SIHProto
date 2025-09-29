-- Blue Carbon Credit Registry Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('developer', 'verifier', 'admin', 'buyer');

-- Project status enum
CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'under_review', 'verified', 'rejected', 'tokenized');

-- Verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Transaction type enum
CREATE TYPE transaction_type AS ENUM ('mint', 'transfer', 'retire');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    wallet_address TEXT,
    organization TEXT,
    country TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_coordinates JSONB, -- {lat: number, lng: number}
    location_address TEXT,
    project_area DECIMAL NOT NULL, -- in hectares
    ecosystem_type TEXT NOT NULL, -- mangrove, seagrass, salt_marsh
    restoration_details JSONB, -- detailed restoration information
    estimated_co2_sequestration DECIMAL NOT NULL, -- estimated tCO2e
    project_documents_ipfs_cid TEXT, -- IPFS CID for project documents
    mrv_data_ipfs_cid TEXT, -- IPFS CID for MRV data
    status project_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verifications table
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_co2_amount DECIMAL, -- actual verified tCO2e
    verification_documents_ipfs_cid TEXT,
    signature_hash TEXT, -- cryptographic signature
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Carbon credits/tokens table
CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
    token_id BIGINT UNIQUE NOT NULL, -- blockchain token ID
    amount DECIMAL NOT NULL, -- amount of credits (1 credit = 1 tCO2e)
    metadata_ipfs_cid TEXT NOT NULL, -- IPFS CID for token metadata
    contract_address TEXT NOT NULL,
    blockchain_network TEXT NOT NULL DEFAULT 'ethereum',
    current_owner_id UUID REFERENCES users(id),
    is_retired BOOLEAN DEFAULT FALSE,
    retirement_reason TEXT,
    retirement_certificate_ipfs_cid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    retired_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table (blockchain transaction history)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_id UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE, -- blockchain transaction hash
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace listings table
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_id UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    price_per_credit DECIMAL NOT NULL, -- price in ETH or USD
    currency TEXT NOT NULL DEFAULT 'ETH',
    quantity_available DECIMAL NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NCCR sensor data table
CREATE TABLE nccr_sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sensor_type TEXT NOT NULL, -- iot, satellite, drone
    data_type TEXT NOT NULL, -- carbon_flux, biomass, water_quality, etc.
    measurement_value DECIMAL NOT NULL,
    measurement_unit TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location_coordinates JSONB,
    raw_data_ipfs_cid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- project, credit, transaction
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_projects_developer_id ON projects(developer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_verifications_project_id ON verifications(project_id);
CREATE INDEX idx_verifications_verifier_id ON verifications(verifier_id);
CREATE INDEX idx_credits_project_id ON credits(project_id);
CREATE INDEX idx_credits_current_owner_id ON credits(current_owner_id);
CREATE INDEX idx_credits_token_id ON credits(token_id);
CREATE INDEX idx_transactions_credit_id ON transactions(credit_id);
CREATE INDEX idx_transactions_transaction_hash ON transactions(transaction_hash);
CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_credit_id ON marketplace_listings(credit_id);
CREATE INDEX idx_nccr_sensor_data_project_id ON nccr_sensor_data(project_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();