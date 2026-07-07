-- ============================================
--  Table: job_posts
--  Desc:  Campaign listings created by clients
--  FK:    client_profiles.id
-- ============================================
 
-- Enums
CREATE TYPE job_status AS ENUM (
    'draft',         -- saved, not yet published
    'open',          -- accepting proposals
    'in_review',     -- client reviewing proposals
    'hired',         -- influencer selected
    'in_progress',   -- contract active
    'completed',     -- all milestones done
    'cancelled',     -- cancelled by client
    'expired'         -- deadline passed, no hire
);
 
CREATE TYPE budget_type AS ENUM (
    'fixed',         -- one-time project fee
    'hourly',        -- per-hour rate
    'milestone'      -- split across milestones
);
 
CREATE TYPE campaign_type AS ENUM (
    'sponsored_post',  -- paid post / story
    'product_review',  -- review / unboxing
    'brand_ambassador', -- long-term rep
    'affiliate',       -- commission-based
    'event_coverage',  -- live / on-ground
    'content_creation', -- UGC for brand use
    'giveaway',       -- contest / giveaway collab
    'other'            -- custom
);
 
CREATE TYPE visibility_type AS ENUM (
    'public',         -- visible to all influencers
    'invite_only',    -- client sends invites
    'private'         -- hidden, direct link only
);
 
-- Main table
CREATE TABLE job_posts (
    -- Identity
    id                  UUID     PRIMARY KEY  DEFAULT gen_random_uuid(),
    client_id             UUID     NOT NULL,                    -- FK -> client_profiles.id
    slug                  VARCHAR(200)   UNIQUE,              -- SEO-friendly URL
 
    -- Campaign details
    title                 VARCHAR(200)   NOT NULL,
    description             TEXT              NOT NULL,
    campaign_type         campaign_type    NOT NULL,
    campaign_goals        TEXT[]          DEFAULT '{}',      -- e.g. {awareness, sales}
    brand_name              VARCHAR(150),                  -- may differ from company name
    brand_website         TEXT,
    sample_content_url    TEXT,                          -- reference / mood board link
 
    -- Budget
    budget_type             budget_type      NOT NULL,
    budget_min              NUMERIC(12,2)  NOT NULL,
    budget_max              NUMERIC(12,2)  NOT NULL,
    currency                CHAR(3)         NOT NULL    DEFAULT 'USD',
    is_negotiable         BOOLEAN          NOT NULL    DEFAULT TRUE,
 
    -- Influencer requirements
    required_platforms    social_platform[] NOT NULL    DEFAULT '{}',
    required_tiers        content_tier[]   DEFAULT '{}',      -- acceptable tiers
    required_niches       TEXT[]          DEFAULT '{}',
    min_followers         INTEGER          DEFAULT 0,
    min_engagement_rate  NUMERIC(5,2)  DEFAULT 0.00,
    required_languages    TEXT[]          DEFAULT '{}',
    required_location     TEXT[]          DEFAULT '{}',      -- country / city filters
    influencer_count      SMALLINT         NOT NULL    DEFAULT 1,      -- how many influencers needed
 
    -- Deliverables
    deliverables           JSONB           NOT NULL    DEFAULT '[]',    -- [{type,qty,platform,notes}]
    usage_rights           TEXT,                          -- how brand can reuse content
    exclusivity_period_days  SMALLINT,                          -- days influencer can't work with competitors
    content_guidelines_url   TEXT,                          -- doc / notion link
    dos                 TEXT[]          DEFAULT '{}',      -- content dos
    donts               TEXT[]          DEFAULT '{}',      -- content don'ts
 
    -- Timeline
    application_deadline   TIMESTAMPTZ,                      -- last date to submit proposal
    campaign_start_date    DATE,
    campaign_end_date      DATE,
    content_submission_date  DATE,                          -- draft due before go-live
 
    -- Visibility & status
    status                  job_status      NOT NULL    DEFAULT 'draft',
    visibility              visibility_type  NOT NULL    DEFAULT 'public',
    is_urgent             BOOLEAN          NOT NULL    DEFAULT FALSE,   -- pinned / highlighted
    published_at           TIMESTAMPTZ,                      -- set when status -> open
    closed_at             TIMESTAMPTZ,                      -- set when status -> hired/cancelled
 
    -- Counters (denormalised for performance)
    views_count             INTEGER          NOT NULL    DEFAULT 0,
    proposals_count       INTEGER          NOT NULL    DEFAULT 0,
    shortlisted_count     INTEGER          NOT NULL    DEFAULT 0,
    hired_count             SMALLINT         NOT NULL    DEFAULT 0,
 
    -- Timestamps
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT now(),
    deleted_at              TIMESTAMPTZ,                      -- soft delete
 
    -- Constraints
    CONSTRAINT fk_job_client        FOREIGN KEY (client_id) REFERENCES client_profiles (id) ON DELETE CASCADE,
    CONSTRAINT chk_budget_range      CHECK (budget_min >= 0 AND budget_max >= budget_min),
    CONSTRAINT chk_campaign_dates    CHECK (campaign_end_date IS NULL OR campaign_end_date >= campaign_start_date),
    CONSTRAINT chk_influencer_count  CHECK (influencer_count >= 1),
    CONSTRAINT chk_min_engagement_job  CHECK (min_engagement_rate BETWEEN 0 AND 100)
 
);
 
-- Indexes
CREATE INDEX idx_job_client_id  ON job_posts (client_id);
CREATE INDEX idx_job_status  ON job_posts (status);
CREATE INDEX idx_job_campaign_type  ON job_posts (campaign_type);
CREATE INDEX idx_job_visibility  ON job_posts (visibility);
CREATE INDEX idx_job_budget  ON job_posts (budget_min, budget_max);
CREATE INDEX idx_job_deadline  ON job_posts (application_deadline);
CREATE INDEX idx_job_published_at  ON job_posts (published_at DESC);
CREATE INDEX idx_job_deleted  ON job_posts (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_req_platforms  ON job_posts USING GIN (required_platforms);
CREATE INDEX idx_job_req_niches  ON job_posts USING GIN (required_niches);
CREATE INDEX idx_job_campaign_goals  ON job_posts USING GIN (campaign_goals);
CREATE INDEX idx_job_deliverables  ON job_posts USING GIN (deliverables);
 
-- Auto-update trigger
CREATE TRIGGER trg_job_updated_at
BEFORE UPDATE ON job_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
