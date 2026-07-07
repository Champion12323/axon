-- ============================================
--  Table: portfolio_items
--  Desc:  Past campaigns & work samples
--         showcased on influencer profile
--  FK:    influencer_profiles.id
--         contracts.id (optional)
-- ============================================
 
-- Enums
CREATE TYPE portfolio_media_type AS ENUM (
    'image',       -- single photo / carousel
    'video',       -- reel, YouTube, TikTok
    'blog_post',   -- written article
    'podcast',     -- audio episode
    'story',       -- Instagram / FB story
    'livestream',  -- live session
    'ugc',         -- user-generated content
    'other'         -- custom
);
 
CREATE TYPE portfolio_visibility AS ENUM (
    'public',      -- visible to everyone
    'clients_only',  -- visible to logged-in clients
    'private'        -- only visible to influencer
);
 
-- Main table
CREATE TABLE portfolio_items (
 
    -- Identity
    id                  UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    influencer_id           UUID   NOT NULL,                   -- FK -> influencer_profiles.id
    contract_id             UUID,                               -- FK -> contracts.id (if from a paid job)
    position                SMALLINT            DEFAULT 0,          -- display order on profile
 
    -- Content details
    title                   VARCHAR(200)   NOT NULL,
    description             TEXT,                               -- campaign story / context
    media_type              portfolio_media_type  NOT NULL,
    tags                    TEXT[]           DEFAULT '{}',   -- e.g. {fashion, unboxing}
    niche                   TEXT[]           DEFAULT '{}',   -- niche tags for filtering
 
    -- Brand info
    brand_name              VARCHAR(150),                   -- which brand this was for
    brand_logo_url          TEXT,
    campaign_name           VARCHAR(200),                   -- e.g. "Summer Glow 2025"
 
    -- Media assets
    thumbnail_url           TEXT,                               -- cover image for the card
    media_urls              TEXT[]           NOT NULL   DEFAULT '{}',  -- all media files / CDN links
    external_url            TEXT,                               -- live post / YouTube link
    platform                social_platform,                       -- where it was posted
    platform_post_id        VARCHAR(100),                   -- native post ID for embed
 
    -- Performance metrics
    reach                   INTEGER           DEFAULT 0,          -- unique accounts reached
    impressions             INTEGER           DEFAULT 0,          -- total views
    likes                   INTEGER           DEFAULT 0,
    comments                INTEGER           DEFAULT 0,
    shares                  INTEGER           DEFAULT 0,
    saves                   INTEGER           DEFAULT 0,
    clicks                  INTEGER           DEFAULT 0,          -- link clicks
    engagement_rate         NUMERIC(5,2)   DEFAULT 0.00,    -- (likes+comments+shares)/reach*100
    conversion_rate         NUMERIC(5,2),                   -- if tracked (clicks/reach*100)
    revenue_generated       NUMERIC(12,2),                  -- if affiliate / tracked sales
    metrics_updated_at      TIMESTAMPTZ,                       -- last time stats were refreshed
 
    -- Visibility & status
    visibility              portfolio_visibility  NOT NULL   DEFAULT 'public',
    is_featured             BOOLEAN            NOT NULL   DEFAULT FALSE,  -- pinned at top of profile
    is_verified             BOOLEAN            NOT NULL   DEFAULT FALSE,  -- platform verified the metrics
 
    -- Published date
    published_at            DATE,                               -- when the content went live
 
    -- Timestamps
    created_at              TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    updated_at              TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    deleted_at              TIMESTAMPTZ,                       -- soft delete
 
    -- Constraints
    CONSTRAINT fk_port_influencer  FOREIGN KEY (influencer_id)  REFERENCES influencer_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_port_contract  FOREIGN KEY (contract_id)  REFERENCES contracts (id) ON DELETE SET NULL,
    CONSTRAINT chk_engagement_rate  CHECK (engagement_rate BETWEEN 0 AND 100),
    CONSTRAINT chk_reach_positive  CHECK (reach >= 0),
    CONSTRAINT chk_port_position  CHECK (position >= 0)
 
);
 
-- Indexes
CREATE INDEX idx_port_influencer_id  ON portfolio_items (influencer_id);
CREATE INDEX idx_port_contract_id  ON portfolio_items (contract_id);
CREATE INDEX idx_port_media_type  ON portfolio_items (media_type);
CREATE INDEX idx_port_platform  ON portfolio_items (platform);
CREATE INDEX idx_port_visibility  ON portfolio_items (visibility);
CREATE INDEX idx_port_is_featured  ON portfolio_items (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_port_engagement  ON portfolio_items (engagement_rate DESC);
CREATE INDEX idx_port_published_at  ON portfolio_items (published_at DESC);
CREATE INDEX idx_port_deleted  ON portfolio_items (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_port_tags  ON portfolio_items USING GIN (tags);
CREATE INDEX idx_port_niche  ON portfolio_items USING GIN (niche);
 
-- Auto-update trigger
CREATE TRIGGER trg_port_updated_at
BEFORE UPDATE ON portfolio_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();