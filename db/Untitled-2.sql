-- ============================================
--  Table: client_profiles
--  Desc:  Extended profile for client role
--  FK:    users.id  (role = 'client')
-- ============================================
 
-- Enums
CREATE TYPE company_size AS ENUM (
    'solo',         -- 1 person / freelance brand
    'small',        -- 2 – 10 employees
    'medium',       -- 11 – 50 employees
    'large',        -- 51 – 200 employees
    'enterprise'      -- 200+ employees
);
 
CREATE TYPE client_type AS ENUM (
    'brand',          -- product / service company
    'agency',         -- marketing / talent agency
    'startup',        -- early-stage company
    'ngo',            -- non-profit org
    'individual'     -- personal project / creator
);
 
CREATE TYPE budget_range AS ENUM (
    'micro',        -- < $500
    'small',        -- $500 – $2K
    'medium',       -- $2K – $10K
    'large',        -- $10K – $50K
    'enterprise'    -- $50K+
);
 
-- Main table
CREATE TABLE client_profiles (
 
    -- Identity
    id               UUID  PRIMARY KEY  DEFAULT gen_random_uuid(),
    user_id           UUID  NOT NULL    UNIQUE,              -- 1-to-1 with users
 
    -- Company info
    company_name      VARCHAR(150)  NOT NULL,
    client_type       client_type   NOT NULL    DEFAULT 'brand',
    industry          VARCHAR(100),                       -- e.g. Fashion, FMCG, Tech
    sub_industry      VARCHAR(100),                       -- e.g. Skincare, SaaS
    description       TEXT,                              -- about the company
    founded_year      SMALLINT,                            -- e.g. 2018
    company_size      company_size,
    logo_url          TEXT,
    cover_url         TEXT,                              -- profile banner
 
    -- Contact & location
    website_url       TEXT,
    support_email     VARCHAR(255),                   -- public contact email
    support_phone     VARCHAR(20),
    location          VARCHAR(120),                   -- city, country
    country_code      CHAR(2),                         -- ISO 3166-1 alpha-2 e.g. IN
    timezone          VARCHAR(60)   NOT NULL    DEFAULT 'UTC',
 
    -- Social presence
    social_links      JSONB         DEFAULT '{}',         -- {"instagram":"url","linkedin":"url"}
 
    -- Hiring preferences
    preferred_platforms social_platform[] DEFAULT '{}',  -- platforms they target
    preferred_tiers   content_tier[]    DEFAULT '{}',  -- nano/micro/macro/mega
    preferred_niches  TEXT[]           DEFAULT '{}',  -- e.g. {fitness, food}
    typical_budget_range budget_range,                         -- overall spend tier
    typical_campaign_length SMALLINT,                           -- avg days per campaign
    min_influencer_followers INTEGER         DEFAULT 0,          -- follower floor
    min_engagement_rate NUMERIC(5,2)   DEFAULT 0.00,    -- engagement floor (%)
 
    -- Billing
    billing_name      VARCHAR(150),                   -- legal entity name
    billing_address   TEXT,
    billing_country   CHAR(2),
    tax_id          VARCHAR(50),                    -- GST / VAT / EIN
    payment_methods   JSONB         DEFAULT '{}',         -- saved card/UPI tokens (masked)
 
    -- Reputation
    rating            NUMERIC(3,2)   DEFAULT 0.00,    -- avg from influencer reviews
    total_reviews     INTEGER         NOT NULL    DEFAULT 0,
    total_jobs_posted INTEGER         NOT NULL    DEFAULT 0,
    total_jobs_completed INTEGER         NOT NULL    DEFAULT 0,
    total_spent       NUMERIC(14,2)  NOT NULL    DEFAULT 0.00,
 
    -- Verification
    is_verified       BOOLEAN         NOT NULL    DEFAULT FALSE,  -- platform trust badge
    is_featured       BOOLEAN         NOT NULL    DEFAULT FALSE,  -- featured client
    verified_at       TIMESTAMPTZ,
    kyb_status        VARCHAR(20)    DEFAULT 'pending',   -- Know Your Business
 
    -- Timestamps
    created_at        TIMESTAMPTZ     NOT NULL    DEFAULT now(),
    updated_at        TIMESTAMPTZ     NOT NULL    DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_client_user      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_client_rating   CHECK (rating BETWEEN 0 AND 5),
    CONSTRAINT chk_founded_year    CHECK (founded_year IS NULL OR (founded_year BETWEEN 1800 AND 2100)),
    CONSTRAINT chk_min_engagement CHECK (min_engagement_rate BETWEEN 0 AND 100)
 
);
 
-- Indexes
CREATE INDEX idx_cli_user_id  ON client_profiles (user_id);
CREATE INDEX idx_cli_industry  ON client_profiles (industry);
CREATE INDEX idx_cli_country  ON client_profiles (country_code);
CREATE INDEX idx_cli_client_type  ON client_profiles (client_type);
CREATE INDEX idx_cli_budget_range  ON client_profiles (typical_budget_range);
CREATE INDEX idx_cli_rating  ON client_profiles (rating DESC);
CREATE INDEX idx_cli_pref_platforms  ON client_profiles USING GIN (preferred_platforms);
CREATE INDEX idx_cli_pref_niches  ON client_profiles USING GIN (preferred_niches);
CREATE INDEX idx_cli_social_links  ON client_profiles USING GIN (social_links);
 
-- Auto-update trigger
CREATE TRIGGER trg_cli_updated_at
BEFORE UPDATE ON client_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();