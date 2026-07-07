-- ============================================
--  Table: payments
--  Desc:  Every financial transaction on
--         the platform — escrow, payouts,
--         refunds, platform fees
--  FK:    contracts.id, milestones.id,
--         users.id (payer / payee)
-- ============================================
 
-- Enums
CREATE TYPE payment_status AS ENUM (
    'pending',       -- initiated, awaiting gateway
    'processing',    -- gateway is processing
    'held_in_escrow', -- client paid, held until approval
    'released',      -- payout sent to influencer
    'refunded',      -- returned to client
    'partially_refunded', -- partial refund issued
    'failed',        -- gateway failure
    'cancelled'          -- cancelled before processing
);
 
CREATE TYPE payment_type AS ENUM (
    'escrow_funding',    -- client funds escrow
    'milestone_payout',  -- influencer receives milestone pay
    'platform_fee',      -- platform commission deducted
    'refund',            -- full refund to client
    'partial_refund',    -- partial refund to client
    'bonus',             -- extra tip from client
    'adjustment'           -- manual correction by admin
);
 
CREATE TYPE payment_method AS ENUM (
    'card',    -- credit / debit card
    'upi',     -- UPI (India)
    'net_banking', -- net banking
    'wallet',    -- platform wallet balance
    'bank_transfer', -- NEFT / SWIFT
    'paypal',    -- PayPal
    'stripe',    -- Stripe
    'razorpay'     -- Razorpay
);
 
-- Main table
CREATE TABLE payments (
 
    -- Identity
    id                   UUID   PRIMARY KEY  DEFAULT gen_random_uuid(),
    payment_number           VARCHAR(30)      UNIQUE      NOT NULL,  -- e.g. PAY-2026-00198
    contract_id            UUID   NOT NULL,                  -- FK -> contracts.id
    milestone_id           UUID,                              -- FK -> milestones.id (null for escrow)
 
    -- Parties
    payer_id               UUID   NOT NULL,                  -- FK -> users.id
    payee_id               UUID   NOT NULL,                  -- FK -> users.id
 
    -- Payment type & method
    payment_type           payment_type   NOT NULL,
    payment_method         payment_method,                    -- null until confirmed
 
    -- Amounts
    gross_amount           NUMERIC(12,2)  NOT NULL,         -- what client paid
    platform_fee_amount    NUMERIC(12,2)  NOT NULL  DEFAULT 0.00,
    tax_amount             NUMERIC(12,2)  NOT NULL  DEFAULT 0.00,   -- GST / VAT
    net_amount             NUMERIC(12,2)  NOT NULL,         -- influencer receives this
    refund_amount          NUMERIC(12,2)  DEFAULT 0.00,    -- how much was refunded
    currency                  CHAR(3)        NOT NULL  DEFAULT 'USD',
    exchange_rate          NUMERIC(12,6)  DEFAULT 1.000000, -- if multi-currency
    base_currency          CHAR(3)        DEFAULT 'USD',      -- platform base currency
 
    -- Gateway
    gateway                VARCHAR(30),                  -- 'razorpay' | 'stripe' | 'paypal'
    gateway_payment_id     VARCHAR(100),                 -- gateway transaction ID
    gateway_order_id       VARCHAR(100),                 -- gateway order reference
    gateway_signature      TEXT,                              -- webhook verification hash
    gateway_response       JSONB,                             -- raw gateway response payload
    gateway_fee            NUMERIC(10,2)  DEFAULT 0.00,  -- what gateway charged us
 
    -- Invoice
    invoice_number         VARCHAR(30)      UNIQUE,          -- e.g. INV-2026-00198
    invoice_url            TEXT,                              -- generated PDF link
 
    -- Status & lifecycle
    status                   payment_status  NOT NULL  DEFAULT 'pending',
    failure_reason         TEXT,                              -- if status = failed
    refund_reason          TEXT,                              -- if status = refunded
    notes                  TEXT,                              -- admin / internal notes
    initiated_at           TIMESTAMPTZ,
    processed_at           TIMESTAMPTZ,                       -- gateway confirmed
    held_at                TIMESTAMPTZ,                       -- when escrow lock started
    released_at            TIMESTAMPTZ,                       -- when payout sent
    refunded_at            TIMESTAMPTZ,
    created_at             TIMESTAMPTZ    NOT NULL  DEFAULT now(),
    updated_at             TIMESTAMPTZ    NOT NULL  DEFAULT now(),
 
    -- Constraints
    CONSTRAINT fk_pay_contract   FOREIGN KEY (contract_id)   REFERENCES contracts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pay_milestone   FOREIGN KEY (milestone_id)   REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT fk_pay_payer   FOREIGN KEY (payer_id)   REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pay_payee   FOREIGN KEY (payee_id)   REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_gross_amount   CHECK (gross_amount > 0),
    CONSTRAINT chk_net_amount   CHECK (net_amount >= 0),
    CONSTRAINT chk_refund_amount   CHECK (refund_amount >= 0 AND refund_amount <= gross_amount),
    CONSTRAINT chk_payer_payee   CHECK (payer_id != payee_id)
 
);
 
-- Indexes
CREATE INDEX idx_pay_contract_id  ON payments (contract_id);
CREATE INDEX idx_pay_milestone_id  ON payments (milestone_id);
CREATE INDEX idx_pay_payer_id  ON payments (payer_id);
CREATE INDEX idx_pay_payee_id  ON payments (payee_id);
CREATE INDEX idx_pay_status  ON payments (status);
CREATE INDEX idx_pay_payment_type  ON payments (payment_type);
CREATE INDEX idx_pay_gateway_payment_id ON payments (gateway_payment_id);
CREATE INDEX idx_pay_created_at  ON payments (created_at DESC);
CREATE INDEX idx_pay_held  ON payments (status) WHERE status = 'held_in_escrow';
 
-- Auto-update trigger
CREATE TRIGGER trg_pay_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- Trigger: update total_spent on client_profiles
CREATE OR REPLACE FUNCTION sync_client_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'released' AND (TG_OP = 'INSERT' OR OLD.status != 'released') THEN
        UPDATE client_profiles SET total_spent = total_spent + NEW.gross_amount
        WHERE user_id = NEW.payer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_sync_client_spent
AFTER INSERT OR UPDATE OF status ON payments
FOR EACH ROW WHEN (NEW.payment_type = 'escrow_funding')
EXECUTE FUNCTION sync_client_total_spent();