-- ============================================
--  Table: milestones
--  Desc:  Payment & delivery stages within
--         a contract
--  FK:    contracts.id
-- ============================================
 
-- Enums
CREATE TYPE milestone_status AS ENUM (
    'pending',      -- not yet started
    'in_progress',  -- influencer working on it
    'submitted',    -- influencer submitted work
    'revision_requested', -- client asked for changes
    'approved',     -- client approved → triggers payment
    'paid',         -- payment released to influencer
    'disputed',     -- under review
    'cancelled'         -- milestone dropped
);
 
-- Main table
CREATE TABLE milestones (
 
    -- Identity
    id                 UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    contract_id            UUID   NOT NULL,                  -- FK -> contracts.id
    position               SMALLINT   NOT NULL,                  -- order: 1, 2, 3 …
 
    -- Milestone details
    title                  VARCHAR(200)  NOT NULL,         -- e.g. "Script approval"
    description            TEXT,                            -- what must be delivered
    deliverables           JSONB   DEFAULT '[]',        -- [{type, qty, platform}]
 
    -- Payment
    amount                 NUMERIC(12,2)  NOT NULL,         -- portion of contract value
    currency               CHAR(3)        NOT NULL  DEFAULT 'USD',
    is_escrow_funded       BOOLEAN   NOT NULL  DEFAULT FALSE,  -- client pre-funded escrow
    escrow_funded_at       TIMESTAMPTZ,                        -- when escrow was topped up
 
    -- Timeline
    due_date               DATE   NOT NULL,
    extended_due_date      DATE,                            -- if extension granted
    extension_reason       TEXT,
 
    -- Submission
    submission_note         TEXT,                            -- influencer message on submit
    submission_urls         TEXT[]        DEFAULT '{}',  -- content / drive links
    submission_attachments  TEXT[]        DEFAULT '{}',  -- uploaded files
    submitted_at           TIMESTAMPTZ,
 
    -- Review & revision
    revision_count         SMALLINT   NOT NULL  DEFAULT 0,       -- how many revision rounds
    max_revisions          SMALLINT   NOT NULL  DEFAULT 2,       -- cap agreed in contract
    revision_notes         JSONB   DEFAULT '[]',        -- [{round, note, requested_at}]
    client_feedback         TEXT,                            -- final feedback on approval
 
    -- Approval
    approved_by            UUID,                            -- FK -> users.id (client)
    approved_at            TIMESTAMPTZ,
 
    -- Status
    status                 milestone_status  NOT NULL  DEFAULT 'pending',
    is_auto_approved       BOOLEAN   NOT NULL  DEFAULT FALSE,  -- auto-approved after N days
    auto_approve_at         TIMESTAMPTZ,                        -- scheduled auto-approve time
    cancelled_at           TIMESTAMPTZ,
    cancellation_note      TEXT,
 
    -- Timestamps
    created_at             TIMESTAMPTZ   NOT NULL  DEFAULT now(),
    updated_at             TIMESTAMPTZ   NOT NULL  DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_milestone_contract  FOREIGN KEY (contract_id)  REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_milestone_approver  FOREIGN KEY (approved_by)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_milestone_position  UNIQUE (contract_id, position),               -- no duplicate positions per contract
    CONSTRAINT chk_milestone_amount  CHECK (amount > 0),
    CONSTRAINT chk_milestone_position  CHECK (position > 0),
    CONSTRAINT chk_max_revisions  CHECK (max_revisions BETWEEN 0 AND 10)
 
);
 
-- Indexes
CREATE INDEX idx_ms_contract_id  ON milestones (contract_id);
CREATE INDEX idx_ms_status  ON milestones (status);
CREATE INDEX idx_ms_due_date  ON milestones (due_date);
CREATE INDEX idx_ms_position  ON milestones (contract_id, position);
CREATE INDEX idx_ms_auto_approve  ON milestones (auto_approve_at) WHERE status = 'submitted';
CREATE INDEX idx_ms_escrow  ON milestones (is_escrow_funded) WHERE is_escrow_funded = TRUE;
 
-- Auto-update trigger
CREATE TRIGGER trg_ms_updated_at
BEFORE UPDATE ON milestones
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: mark contract completed when all milestones paid
CREATE OR REPLACE FUNCTION check_contract_completion()
RETURNS TRIGGER AS $$
DECLARE
    unpaid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unpaid_count
    FROM milestones
    WHERE contract_id = NEW.contract_id
    AND status != 'paid'
    AND status != 'cancelled';
 
    IF unpaid_count = 0 THEN
        UPDATE contracts
        SET status = 'completed',
               completed_at = now()
        WHERE id = NEW.contract_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_contract_completion
AFTER UPDATE OF status ON milestones
FOR EACH ROW WHEN (NEW.status = 'paid')
EXECUTE FUNCTION check_contract_completion();