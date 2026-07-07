-- ============================================
--  Table: proposals
--  Desc:  Influencer bids on job posts
--  FK:    job_posts.id, influencer_profiles.id
-- ============================================
 
-- Enums
CREATE TYPE proposal_status AS ENUM (
    'pending',        -- submitted, awaiting client review
    'seen',           -- client opened the proposal
    'shortlisted',    -- client saved for consideration
    'accepted',       -- client accepted → triggers contract
    'rejected',       -- client rejected
    'withdrawn',      -- influencer pulled back proposal
    'expired'          -- job closed before decision
);
 
CREATE TYPE bid_type AS ENUM (
    'fixed',  -- one flat fee for the whole job
    'hourly', -- per hour rate
    'milestone'  -- split into milestone payments
);
 
-- Main table
CREATE TABLE proposals (
 
    -- Identity
    id                  UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    job_post_id           UUID   NOT NULL,                   -- FK -> job_posts.id
    influencer_id         UUID   NOT NULL,                   -- FK -> influencer_profiles.id
 
    -- Cover letter
    cover_letter          TEXT   NOT NULL,                   -- pitch from influencer
    why_good_fit          TEXT,                             -- optional extra context
    past_work_urls        TEXT[]         DEFAULT '{}',     -- links to relevant portfolio
    attachments           TEXT[]         DEFAULT '{}',     -- PDF / media file URLs
 
    -- Bid details
    bid_type              bid_type   NOT NULL,
    bid_amount            NUMERIC(12,2)  NOT NULL,            -- total or hourly rate
    currency              CHAR(3)        NOT NULL   DEFAULT 'USD',
    estimated_days        SMALLINT   NOT NULL,                   -- delivery time in days
    estimated_hours       SMALLINT,                             -- if bid_type = hourly
 
    -- Proposed deliverables
    proposed_deliverables  JSONB   NOT NULL   DEFAULT '[]',  -- [{type,qty,platform,note}]
    proposed_milestones    JSONB   DEFAULT '[]',           -- [{title,amount,due_date}]
 
    -- Availability window
    available_from        DATE,                             -- when influencer can start
    available_until       DATE,                             -- last date they can work on job
 
    -- Questions & answers
    client_questions      JSONB   DEFAULT '[]',           -- [{question, answer}]
 
    -- Status & tracking
    status                proposal_status  NOT NULL   DEFAULT 'pending',
    is_invited            BOOLEAN   NOT NULL   DEFAULT FALSE,   -- client sent invite
    client_note           TEXT,                             -- internal note by client
    rejection_reason      TEXT,                             -- shown to influencer on reject
    seen_at               TIMESTAMPTZ,                       -- when client first opened
    shortlisted_at        TIMESTAMPTZ,
    accepted_at           TIMESTAMPTZ,
    rejected_at           TIMESTAMPTZ,
    withdrawn_at          TIMESTAMPTZ,
    expiry_at             TIMESTAMPTZ,                       -- auto-set from job deadline
 
    -- Negotiation
    counter_offer_amount   NUMERIC(12,2),            -- client counter bid
    counter_offer_note     TEXT,                             -- reason for counter offer
    counter_offer_at      TIMESTAMPTZ,
    final_agreed_amount    NUMERIC(12,2),            -- after negotiation settles
 
    -- Timestamps
    created_at            TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    updated_at            TIMESTAMPTZ    NOT NULL   DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_proposal_job      FOREIGN KEY (job_post_id)  REFERENCES job_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_proposal_influencer  FOREIGN KEY (influencer_id)  REFERENCES influencer_profiles (id) ON DELETE CASCADE,
    CONSTRAINT uq_one_proposal_per_job  UNIQUE (job_post_id, influencer_id),                 -- one proposal per influencer per job
    CONSTRAINT chk_bid_amount        CHECK (bid_amount > 0),
    CONSTRAINT chk_estimated_days    CHECK (estimated_days > 0),
    CONSTRAINT chk_avail_window      CHECK (available_until IS NULL OR available_until >= available_from)
 
);
 
-- Indexes
CREATE INDEX idx_prop_job_post_id  ON proposals (job_post_id);
CREATE INDEX idx_prop_influencer_id  ON proposals (influencer_id);
CREATE INDEX idx_prop_status  ON proposals (status);
CREATE INDEX idx_prop_created_at  ON proposals (created_at DESC);
CREATE INDEX idx_prop_bid_amount  ON proposals (bid_amount);
CREATE INDEX idx_prop_is_invited  ON proposals (is_invited) WHERE is_invited = TRUE;
CREATE INDEX idx_prop_expiry  ON proposals (expiry_at);
 
-- Auto-update trigger
CREATE TRIGGER trg_prop_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: increment proposals_count on job_posts
CREATE OR REPLACE FUNCTION sync_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE job_posts SET proposals_count = proposals_count + 1
        WHERE id = NEW.job_post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE job_posts SET proposals_count = GREATEST(0, proposals_count - 1)
        WHERE id = OLD.job_post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_sync_proposals_count
AFTER INSERT OR DELETE ON proposals
FOR EACH ROW EXECUTE FUNCTION sync_proposals_count();