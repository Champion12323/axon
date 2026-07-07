-- ============================================
--  Table: reviews
--  Desc:  Post-contract ratings between
--         client and influencer (double-blind)
--  FK:    contracts.id, users.id
-- ============================================
 
-- Enums
CREATE TYPE reviewer_role AS ENUM (
    'client',      -- client reviewing influencer
    'influencer'  -- influencer reviewing client
);
 
CREATE TYPE review_status AS ENUM (
    'pending',    -- contract done, review not yet submitted
    'submitted',  -- review written, in blind period
    'published',  -- visible on profile
    'flagged',    -- reported for abuse
    'removed'      -- taken down by admin
);
 
-- Main table
CREATE TABLE reviews (
 
    -- Identity
    id                   UUID  PRIMARY KEY  DEFAULT gen_random_uuid(),
    contract_id            UUID  NOT NULL,                  -- FK -> contracts.id
    reviewer_id            UUID  NOT NULL,                  -- FK -> users.id
    reviewee_id            UUID  NOT NULL,                  -- FK -> users.id
    reviewer_role          reviewer_role  NOT NULL,
 
    -- Ratings (all 1–5)
    overall_rating         SMALLINT  NOT NULL,                  -- headline star score
    communication_rating     SMALLINT,                            -- responsiveness
    quality_rating         SMALLINT,                            -- content / work quality
    timeliness_rating      SMALLINT,                            -- delivered on time
    professionalism_rating  SMALLINT,                            -- conduct & attitude
    would_work_again       BOOLEAN,                            -- recommend flag
 
    -- Written review
    comment                 TEXT,                            -- public review text
    private_feedback       TEXT,                            -- only visible to platform admin
    tags                    TEXT[]        DEFAULT '{}',  -- e.g. {creative, punctual}
 
    -- Double-blind logic
    is_blind                BOOLEAN          NOT NULL  DEFAULT TRUE,   -- hidden until both submit
    blind_reveal_at          TIMESTAMPTZ,                      -- auto-publish deadline
 
    -- Response
    reviewee_response      TEXT,                            -- public reply to review
    response_at             TIMESTAMPTZ,
 
    -- Moderation
    status                   review_status  NOT NULL  DEFAULT 'pending',
    flag_reason             TEXT,                            -- why it was flagged
    flagged_by               UUID,                            -- FK -> users.id
    flagged_at               TIMESTAMPTZ,
    moderated_by            UUID,                            -- FK -> users.id (admin)
    moderated_at            TIMESTAMPTZ,
    moderation_note         TEXT,
 
    -- Timestamps
    submitted_at             TIMESTAMPTZ,
    published_at             TIMESTAMPTZ,
    created_at               TIMESTAMPTZ  NOT NULL  DEFAULT now(),
    updated_at               TIMESTAMPTZ  NOT NULL  DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_review_contract    FOREIGN KEY (contract_id)  REFERENCES contracts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_review_reviewer    FOREIGN KEY (reviewer_id)  REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_review_reviewee    FOREIGN KEY (reviewee_id)  REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_review_flagged_by    FOREIGN KEY (flagged_by)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_review_moderated    FOREIGN KEY (moderated_by)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_one_review_per_side  UNIQUE (contract_id, reviewer_id),         -- one review per person per contract
    CONSTRAINT chk_not_self_review    CHECK (reviewer_id != reviewee_id),
    CONSTRAINT chk_overall_rating    CHECK (overall_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_comm_rating    CHECK (communication_rating IS NULL OR communication_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_quality_rating    CHECK (quality_rating IS NULL OR quality_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_time_rating    CHECK (timeliness_rating IS NULL OR timeliness_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_prof_rating    CHECK (professionalism_rating IS NULL OR professionalism_rating BETWEEN 1 AND 5)
 
);
 
-- Indexes
CREATE INDEX idx_rev_contract_id  ON reviews (contract_id);
CREATE INDEX idx_rev_reviewer_id  ON reviews (reviewer_id);
CREATE INDEX idx_rev_reviewee_id  ON reviews (reviewee_id);
CREATE INDEX idx_rev_status  ON reviews (status);
CREATE INDEX idx_rev_overall_rating  ON reviews (overall_rating DESC);
CREATE INDEX idx_rev_blind_reveal  ON reviews (blind_reveal_at) WHERE is_blind = TRUE;
CREATE INDEX idx_rev_published  ON reviews (published_at DESC) WHERE status = 'published';
CREATE INDEX idx_rev_tags  ON reviews USING GIN (tags);
 
-- Auto-update trigger
CREATE TRIGGER trg_rev_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: recalculate profile rating on publish/remove
CREATE OR REPLACE FUNCTION sync_profile_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_score NUMERIC(3,2);
    rev_count INTEGER;
BEGIN
    SELECT ROUND(AVG(overall_rating), 2), COUNT(*)
    INTO avg_score, rev_count
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id AND status = 'published';
 
    UPDATE influencer_profiles SET
        rating = avg_score, total_reviews = rev_count
    WHERE user_id = NEW.reviewee_id;
 
    UPDATE client_profiles SET
        rating = avg_score, total_reviews = rev_count
    WHERE user_id = NEW.reviewee_id;
 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_sync_profile_rating
AFTER INSERT OR UPDATE OF status ON reviews
FOR EACH ROW WHEN (NEW.status IN ('published', 'removed'))
EXECUTE FUNCTION sync_profile_rating();
