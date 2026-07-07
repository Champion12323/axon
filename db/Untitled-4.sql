-- ============================================
--  Table: contracts
--  Desc:  Binding agreement between client
--         and influencer after proposal accept
--  FK:    proposals.id, client_profiles.id,
--         influencer_profiles.id
-- ============================================
 
-- Enums
CREATE TYPE contract_status AS ENUM (
    'pending_sign',    -- awaiting both parties to sign
    'active',        -- both signed, work in progress
    'on_hold',       -- paused by mutual agreement
    'completed',     -- all milestones approved
    'cancelled',     -- cancelled before completion
    'disputed',      -- under platform dispute review
    'refunded'          -- payment refunded to client
);
 
CREATE TYPE contract_payment_type AS ENUM (
    'fixed',      -- single payment on completion
    'hourly',     -- billed per tracked hour
    'milestone'    -- paid per milestone approval
);
 
CREATE TYPE cancellation_reason AS ENUM (
    'client_request',   -- client initiated
    'influencer_request', -- influencer initiated
    'mutual_agreement',   -- both agreed
    'platform_action',    -- admin/policy violation
    'non_delivery',       -- influencer did not deliver
    'non_payment'           -- client did not pay
);
 
-- Main table
CREATE TABLE contracts (
 
    -- Identity
    id                    UUID  PRIMARY KEY  DEFAULT gen_random_uuid(),
    contract_number          VARCHAR(30)         UNIQUE       NOT NULL,  -- e.g. CNT-2026-00042
    proposal_id            UUID  NOT NULL    UNIQUE,          -- 1-to-1 with proposals
    job_post_id            UUID  NOT NULL,                   -- denorm for easy joins
    client_id                UUID  NOT NULL,
    influencer_id            UUID  NOT NULL,
 
    -- Financial terms
    payment_type           contract_payment_type  NOT NULL,
    agreed_amount            NUMERIC(12,2)  NOT NULL,         -- total contract value
    platform_fee_pct       NUMERIC(5,2)   NOT NULL   DEFAULT 10.00,  -- % platform takes
    platform_fee_amount      NUMERIC(12,2)  NOT NULL   DEFAULT 0.00,   -- computed on create
    influencer_payout        NUMERIC(12,2)  NOT NULL   DEFAULT 0.00,   -- agreed_amount - fee
    currency                   CHAR(3)         NOT NULL   DEFAULT 'USD',
    hourly_rate            NUMERIC(10,2),              -- if payment_type = hourly
    total_hours_logged     NUMERIC(8,2)   DEFAULT 0.00,   -- tracked hours (hourly only)
 
    -- Scope of work
    scope_of_work            TEXT                  NOT NULL,            -- final agreed deliverables
    deliverables               JSONB                 NOT NULL   DEFAULT '[]',
    dos                    TEXT[]              DEFAULT '{}',
    donts                  TEXT[]              DEFAULT '{}',
    usage_rights               TEXT,                             -- content reuse rights
    exclusivity_period_days    SMALLINT,                         -- competitor lockout days
    content_guidelines_url     TEXT,
 
    -- Timeline
    start_date                 DATE                  NOT NULL,
    end_date                   DATE                  NOT NULL,
    content_submission_date    DATE,                             -- draft due before go-live
    extension_days           SMALLINT          DEFAULT 0,          -- granted extra days
    extended_end_date        DATE,                             -- end_date + extension_days
 
    -- Signing
    terms                    TEXT,                             -- full contract terms text
    client_signed            BOOLEAN              NOT NULL   DEFAULT FALSE,
    influencer_signed        BOOLEAN              NOT NULL   DEFAULT FALSE,
    client_signed_at         TIMESTAMPTZ,
    influencer_signed_at     TIMESTAMPTZ,
 
    -- Status & lifecycle
    status                   contract_status    NOT NULL   DEFAULT 'pending_sign',
    cancellation_reason      cancellation_reason,
    cancellation_note        TEXT,                             -- free-text explanation
    cancelled_by               UUID,                             -- FK -> users.id
    dispute_reason           TEXT,
    dispute_opened_at        TIMESTAMPTZ,
    dispute_resolved_at      TIMESTAMPTZ,
 
    -- Key timestamps
    activated_at               TIMESTAMPTZ,                    -- both signed
    completed_at               TIMESTAMPTZ,
    cancelled_at               TIMESTAMPTZ,
    created_at                 TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    updated_at                 TIMESTAMPTZ    NOT NULL   DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_contract_proposal    FOREIGN KEY (proposal_id)   REFERENCES proposals (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contract_job        FOREIGN KEY (job_post_id)   REFERENCES job_posts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contract_client      FOREIGN KEY (client_id)   REFERENCES client_profiles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contract_influencer  FOREIGN KEY (influencer_id)   REFERENCES influencer_profiles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contract_cancelled_by FOREIGN KEY (cancelled_by)   REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_agreed_amount     CHECK (agreed_amount > 0),
    CONSTRAINT chk_end_after_start     CHECK (end_date >= start_date),
    CONSTRAINT chk_fee_pct           CHECK (platform_fee_pct BETWEEN 0 AND 100)
 
);
 
-- Indexes
CREATE INDEX idx_con_proposal_id  ON contracts (proposal_id);
CREATE INDEX idx_con_client_id  ON contracts (client_id);
CREATE INDEX idx_con_influencer_id  ON contracts (influencer_id);
CREATE INDEX idx_con_status  ON contracts (status);
CREATE INDEX idx_con_job_post_id  ON contracts (job_post_id);
CREATE INDEX idx_con_end_date  ON contracts (end_date);
CREATE INDEX idx_con_activated_at  ON contracts (activated_at DESC);
 
-- Auto-update trigger
CREATE TRIGGER trg_con_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: auto-compute fee & payout on insert/update
CREATE OR REPLACE FUNCTION compute_contract_financials()
RETURNS TRIGGER AS $$
BEGIN
    NEW.platform_fee_amount := ROUND(NEW.agreed_amount * NEW.platform_fee_pct / 100, 2);
    NEW.influencer_payout := NEW.agreed_amount - NEW.platform_fee_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_compute_financials
BEFORE INSERT OR UPDATE OF agreed_amount, platform_fee_pct ON contracts
FOR EACH ROW EXECUTE FUNCTION compute_contract_financials();
