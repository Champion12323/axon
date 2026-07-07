-- ============================================
--  Table: influencer_profiles
--  Desc:  Extended profile for influencer role
--  FK:    users.id  (role = 'influencer')
-- ============================================
 
-- Enums
CREATE TYPE availability_status AS ENUM (
    'available', 'busy', 'not_available'
);
 
CREATE TYPE social_platform AS ENUM (
    'instagram', 'youtube', 'tiktok', 'twitter',
    'linkedin', 'facebook', 'snapchat', 'pinterest'
);
 
CREATE TYPE content_tier AS ENUM (
    'nano', -- 1K  – 10K  followers
    'micro', -- 10K – 100K followers
    'macro', -- 100K – 1M  followers
    'mega'   -- 1M+        followers
);
 
-- Main table
CREATE TABLE influencer_profiles (
 
    -- Identity
    id             UUID          PRIMARY KEY   DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL     UNIQUE,         -- 1-to-1 with users
 
    -- Profile
    bio             TEXT,
    tagline         VARCHAR(160),                    -- short headline shown on card
    profile_cover_url TEXT,                              -- banner image
    website_url     TEXT,
    location        VARCHAR(120),
    languages       TEXT[]        NOT NULL     DEFAULT '{}',  -- e.g. {Hindi, English}
 
    -- Niche & categories
    niche           TEXT[]        NOT NULL     DEFAULT '{}',  -- e.g. {fitness, travel}
    content_type    TEXT[]        NOT NULL     DEFAULT '{}',  -- e.g. {reels, blogs}
 
    -- Pricing
    hourly_rate     NUMERIC(10,2),              -- for hourly contracts
    fixed_rate_min  NUMERIC(10,2),              -- min project budget
    fixed_rate_max  NUMERIC(10,2),              -- max project budget
    rate_currency   CHAR(3)         NOT NULL     DEFAULT 'USD',
 
    -- Social platforms
    primary_platform social_platform,                  -- main platform
    platforms       social_platform[] NOT NULL     DEFAULT '{}',
    platform_handles JSONB          NOT NULL     DEFAULT '{}',  -- {"instagram":"@priya"}
 
    -- Audience / analytics
    total_followers  INTEGER         NOT NULL     DEFAULT 0,
    avg_engagement_rate NUMERIC(5,2),               -- e.g. 4.75 (%)
    avg_views_per_post INTEGER,
    audience_age_range JSONB,                          -- {"18-24":40,"25-34":35}
    audience_gender_split JSONB,                          -- {"male":45,"female":55}
    audience_top_countries TEXT[],                        -- ["IN","US","GB"]
    content_tier    content_tier,                        -- auto-computed or manual
 
    -- Reputation
    rating          NUMERIC(3,2)        DEFAULT 0.00,   -- avg of all reviews
    total_reviews   INTEGER         NOT NULL     DEFAULT 0,
    total_jobs_done  INTEGER         NOT NULL     DEFAULT 0,
    total_earnings  NUMERIC(14,2)     NOT NULL     DEFAULT 0.00,
    success_rate    NUMERIC(5,2)        DEFAULT 0.00,   -- % jobs completed
 
    -- Availability
    availability_status availability_status NOT NULL     DEFAULT 'available',
    available_from  DATE,                                -- if busy, free from this date
    max_active_contracts SMALLINT       NOT NULL     DEFAULT 3,
 
    -- Verification & badges
    is_verified     BOOLEAN         NOT NULL     DEFAULT FALSE,  -- platform verified badge
    is_featured     BOOLEAN         NOT NULL     DEFAULT FALSE,  -- shown on homepage
    verified_at     TIMESTAMPTZ,
    media_kit_url   TEXT,                              -- downloadable PDF/link
 
    -- Timestamps
    created_at      TIMESTAMPTZ     NOT NULL     DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL     DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_influencer_user  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_rating          CHECK (rating BETWEEN 0 AND 5),
    CONSTRAINT chk_engagement      CHECK (avg_engagement_rate BETWEEN 0 AND 100),
    CONSTRAINT chk_rate_range      CHECK (fixed_rate_min IS NULL OR fixed_rate_max IS NULL OR fixed_rate_min <= fixed_rate_max)
 
);
 
-- Indexes
CREATE INDEX idx_inf_user_id  ON influencer_profiles (user_id);
CREATE INDEX idx_inf_availability  ON influencer_profiles (availability_status);
CREATE INDEX idx_inf_tier  ON influencer_profiles (content_tier);
CREATE INDEX idx_inf_rating  ON influencer_profiles (rating DESC);
CREATE INDEX idx_inf_followers  ON influencer_profiles (total_followers DESC);
CREATE INDEX idx_inf_platform_handles ON influencer_profiles USING GIN (platform_handles);
CREATE INDEX idx_inf_niche  ON influencer_profiles USING GIN (niche);
 
-- Auto-update trigger
CREATE TRIGGER trg_inf_updated_at
BEFORE UPDATE ON influencer_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();