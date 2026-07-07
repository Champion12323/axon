    -- ============================================
--  Table: conversations
--  Desc:  Chat thread container between
--         two users, optionally tied to
--         a job post or contract
-- ============================================
CREATE TYPE conversation_status AS ENUM (
    'active',      -- open and messaging
    'archived',    -- hidden from inbox
    'blocked'      -- one party blocked the other
);
 
CREATE TABLE conversations (
 
    -- Identity
    id            UUID  PRIMARY KEY  DEFAULT gen_random_uuid(),
    participant_one   UUID  NOT NULL,                  -- FK -> users.id (always lower uuid)
    participant_two   UUID  NOT NULL,                  -- FK -> users.id (always higher uuid)
 
    -- Context
    job_post_id     UUID,                              -- FK -> job_posts.id (nullable)
    contract_id     UUID,                              -- FK -> contracts.id (nullable)
 
    -- Status
    status         conversation_status  NOT NULL  DEFAULT 'active',
    blocked_by     UUID,                              -- FK -> users.id
 
    -- Denormalised for inbox performance
    last_message_id   UUID,                              -- FK -> messages.id
    last_message_at   TIMESTAMPTZ,                          -- for inbox sort
    last_message_preview VARCHAR(200),              -- truncated text snippet
 
    -- Unread counts per participant
    unread_count_one INTEGER          NOT NULL  DEFAULT 0,      -- unread for participant_one
    unread_count_two INTEGER          NOT NULL  DEFAULT 0,      -- unread for participant_two
 
    -- Timestamps
    created_at     TIMESTAMPTZ    NOT NULL  DEFAULT now(),
    updated_at     TIMESTAMPTZ    NOT NULL  DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_conv_p1         FOREIGN KEY (participant_one)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_p2         FOREIGN KEY (participant_two)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_job         FOREIGN KEY (job_post_id)  REFERENCES job_posts (id) ON DELETE SET NULL,
    CONSTRAINT fk_conv_contract    FOREIGN KEY (contract_id)  REFERENCES contracts (id) ON DELETE SET NULL,
    CONSTRAINT fk_conv_blocked_by  FOREIGN KEY (blocked_by)  REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_conversation      UNIQUE (participant_one, participant_two),  -- one thread per pair
    CONSTRAINT chk_participants     CHECK (participant_one < participant_two)  -- enforce ordering
 
);
 
-- ============================================
--  Table: messages
--  Desc:  Individual messages inside a
--         conversation thread
--  FK:    conversations.id, users.id
-- ============================================
 
CREATE TYPE message_type AS ENUM (
    'text',         -- plain text
    'image',        -- image file
    'file',         -- PDF / doc / zip
    'video',        -- video file
    'audio',        -- voice note
    'system',       -- auto-generated e.g. "Contract created"
    'proposal_card',  -- proposal summary card
    'contract_card',  -- contract summary card
    'payment_card'    -- payment receipt card
);
 
CREATE TABLE messages (
 
    -- Identity
    id                UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    conversation_id        UUID   NOT NULL,                   -- FK -> conversations.id
    sender_id            UUID   NOT NULL,                   -- FK -> users.id
 
    -- Content
    message_type         message_type   NOT NULL   DEFAULT 'text',
    content              TEXT,                               -- text body (null for file-only msgs)
    metadata             JSONB          DEFAULT '{}',       -- extra data for card types
 
    -- Attachments
    attachments         JSONB          DEFAULT '[]',       -- [{url,name,size,mime_type}]
 
    -- Reply threading
    reply_to_id         UUID,                               -- FK -> messages.id (quoted reply)
 
    -- Read receipts
    is_read              BOOLEAN         NOT NULL   DEFAULT FALSE,
    read_at              TIMESTAMPTZ,
 
    -- Edit & delete
    is_edited            BOOLEAN         NOT NULL   DEFAULT FALSE,
    edited_at            TIMESTAMPTZ,
    original_content     TEXT,                               -- stored on first edit
    is_deleted           BOOLEAN         NOT NULL   DEFAULT FALSE,  -- soft delete
    deleted_at           TIMESTAMPTZ,
 
    -- Moderation
    is_flagged           BOOLEAN         NOT NULL   DEFAULT FALSE,
    flagged_reason       TEXT,
 
    -- Timestamps
    sent_at              TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    created_at           TIMESTAMPTZ    NOT NULL   DEFAULT now(),
    updated_at           TIMESTAMPTZ    NOT NULL   DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_msg_conversation  FOREIGN KEY (conversation_id)  REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender  FOREIGN KEY (sender_id)  REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_msg_reply_to  FOREIGN KEY (reply_to_id)  REFERENCES messages (id) ON DELETE SET NULL,
    CONSTRAINT chk_msg_has_content  CHECK (content IS NOT NULL OR attachments != '[]'::
        JSONB OR message_type IN ('system','proposal_card','contract_card','payment_card'))  -- must have something
 
);
 
-- Indexes
CREATE INDEX idx_conv_p1  ON conversations (participant_one);
CREATE INDEX idx_conv_p2  ON conversations (participant_two);
CREATE INDEX idx_conv_last_msg  ON conversations (last_message_at DESC);
CREATE INDEX idx_conv_contract_id  ON conversations (contract_id);
CREATE INDEX idx_conv_job_post_id  ON conversations (job_post_id);
 
CREATE INDEX idx_msg_conversation_id  ON messages (conversation_id, sent_at DESC);
CREATE INDEX idx_msg_sender_id  ON messages (sender_id);
CREATE INDEX idx_msg_reply_to  ON messages (reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX idx_msg_unread  ON messages (conversation_id) WHERE is_read = FALSE;
CREATE INDEX idx_msg_not_deleted  ON messages (conversation_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_msg_type  ON messages (message_type);
 
-- Triggers
CREATE TRIGGER trg_conv_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
CREATE TRIGGER trg_msg_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: sync conversation preview on new message
CREATE OR REPLACE FUNCTION sync_conversation_preview()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET
        last_message_id      = NEW.id,
        last_message_at      = NEW.sent_at,
        last_message_preview = LEFT(COALESCE(NEW.content, '[attachment]'), 200),
        unread_count_one      = CASE
            WHEN NEW.sender_id != participant_one THEN unread_count_one + 1
            ELSE unread_count_one
        END,
        unread_count_two      = CASE
            WHEN NEW.sender_id != participant_two THEN unread_count_two + 1
            ELSE unread_count_two
        END
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_sync_conv_preview
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION sync_conversation_preview();