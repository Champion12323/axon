-- ============================================
--  Table: notifications
--  Desc:  In-app, email & push alerts
--         for all platform events
--  FK:    users.id
-- ============================================
 
-- Enums
CREATE TYPE notification_type AS ENUM (
 
    -- Proposal events
    'proposal_received',      -- client: new proposal on your job
    'proposal_shortlisted',   -- influencer: you were shortlisted
    'proposal_accepted',      -- influencer: proposal accepted
    'proposal_rejected',      -- influencer: proposal rejected
    'proposal_withdrawn',     -- client: influencer withdrew
    'proposal_counter_offer',  -- influencer: client sent counter
 
    -- Contract events
    'contract_created',       -- both: contract ready to sign
    'contract_signed',        -- both: other party signed
    'contract_activated',     -- both: contract now active
    'contract_completed',     -- both: all milestones done
    'contract_cancelled',     -- both: contract cancelled
    'contract_disputed',      -- both: dispute opened
    'contract_extended',      -- both: deadline extended
 
    -- Milestone events
    'milestone_due_soon',      -- influencer: due in 48h
    'milestone_overdue',       -- influencer: past due date
    'milestone_submitted',     -- client: work submitted
    'milestone_revision_requested', -- influencer: revision needed
    'milestone_approved',      -- influencer: milestone approved
    'milestone_auto_approved',  -- influencer: auto approved
 
    -- Payment events
    'payment_received',       -- influencer: payout released
    'payment_failed',         -- client: payment failed
    'payment_refunded',       -- client: refund processed
    'escrow_funded',          -- influencer: escrow locked
    'invoice_ready',          -- both: invoice generated
 
    -- Message events
    'new_message',            -- new chat message
    'job_invite',             -- influencer: invited to apply
 
    -- Review events
    'review_received',        -- both: new review published
    'review_response_received', -- reviewer: reviewee responded
 
    -- Job events
    'job_post_expiring',      -- client: job closing soon
    'job_post_expired',       -- client: job auto-closed
    'job_post_hired',         -- influencer: position filled
 
    -- Account events
    'account_verified',       -- user: identity verified
    'account_suspended',      -- user: account suspended
    'kyb_approved',           -- client: KYB passed
    'kyb_rejected',           -- client: KYB failed
    'profile_featured'           -- influencer: featured on homepage
);
 
CREATE TYPE notification_channel AS ENUM (
    'in_app',     -- bell icon in UI
    'email',      -- transactional email
    'push',       -- mobile push notification
    'sms'         -- SMS (critical events only)
);
 
CREATE TYPE notification_status AS ENUM (
    'pending',    -- queued, not yet sent
    'sent',       -- dispatched to channel
    'delivered',  -- confirmed delivery
    'failed',     -- delivery failed
    'read'         -- user opened it
);
 
-- Main table
CREATE TABLE notifications (
 
    -- Identity
    id              UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    user_id          UUID   NOT NULL,                   -- FK -> users.id (recipient)
    actor_id         UUID,                               -- FK -> users.id (who triggered it)
 
    -- Event
    type              notification_type   NOT NULL,
    channel          notification_channel   NOT NULL   DEFAULT 'in_app',
 
    -- Content
    title            VARCHAR(150)   NOT NULL,          -- short headline
    body             TEXT              NOT NULL,          -- full notification text
    icon             VARCHAR(50),                    -- icon key e.g. 'proposal', 'payment'
    image_url        TEXT,                               -- avatar / thumbnail for rich push
 
    -- Deep link
    action_url       TEXT,                               -- where to go on click
    action_label     VARCHAR(60),                    -- CTA text e.g. "View Proposal"
 
    -- Entity references (for grouping & dedup)
    ref_job_post_id    UUID,                               -- FK -> job_posts.id
    ref_proposal_id    UUID,                               -- FK -> proposals.id
    ref_contract_id    UUID,                               -- FK -> contracts.id
    ref_milestone_id   UUID,                               -- FK -> milestones.id
    ref_payment_id     UUID,                               -- FK -> payments.id
    ref_message_id     UUID,                               -- FK -> messages.id
    ref_review_id      UUID,                               -- FK -> reviews.id
    metadata         JSONB          DEFAULT '{}',       -- any extra data
 
    -- Delivery & status
    status           notification_status  NOT NULL   DEFAULT 'pending',
    is_read          BOOLEAN            NOT NULL   DEFAULT FALSE,
    read_at          TIMESTAMPTZ,
    sent_at          TIMESTAMPTZ,
    delivered_at     TIMESTAMPTZ,
    failed_at        TIMESTAMPTZ,
    failure_reason     TEXT,                               -- error from email/push provider
    retry_count       SMALLINT          NOT NULL   DEFAULT 0,
    max_retries       SMALLINT          NOT NULL   DEFAULT 3,
    scheduled_at     TIMESTAMPTZ,                       -- for deferred sends
 
    -- Grouping / dedup
    group_key        VARCHAR(100),                   -- e.g. 'contract:uuid:milestones'
    is_grouped       BOOLEAN            NOT NULL   DEFAULT FALSE,  -- collapsed into group badge
 
    -- Timestamps
    created_at       TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    expires_at       TIMESTAMPTZ,                       -- auto-expire old notifs
    updated_at       TIMESTAMPTZ    NOT NULL   DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_notif_user      FOREIGN KEY (user_id)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_actor     FOREIGN KEY (actor_id)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_retry_count  CHECK (retry_count <= max_retries),
    CONSTRAINT chk_max_retries  CHECK (max_retries BETWEEN 0 AND 10)
 
);
 
-- Indexes
CREATE INDEX idx_notif_user_id  ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notif_unread  ON notifications (user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_status  ON notifications (status);
CREATE INDEX idx_notif_type  ON notifications (type);
CREATE INDEX idx_notif_channel  ON notifications (channel);
CREATE INDEX idx_notif_scheduled  ON notifications (scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_notif_pending_retry  ON notifications (retry_count, failed_at) WHERE status = 'failed';
CREATE INDEX idx_notif_group_key  ON notifications (group_key) WHERE group_key IS NOT NULL;
CREATE INDEX idx_notif_expires_at  ON notifications (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_notif_ref_contract  ON notifications (ref_contract_id) WHERE ref_contract_id IS NOT NULL;
 
-- Auto-update trigger
CREATE TRIGGER trg_notif_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Cleanup job hint (run via pg_cron or app scheduler)
-- DELETE FROM notifications
--   WHERE expires_at IS NOT NULL
--   AND expires_at < now();