-- ============================================
--  Table: users
--  Desc:  Core auth table for all user types
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;
DROP TABLE if exists users cascade;
 
DROP TYPE IF EXISTS user_role;
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'influencer', 'client', 'admin'
    );
END $$;
 
DROP TYPE IF EXISTS user_status;
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM (
        'pending', 'active', 'suspended', 'banned'
    );
END $$;
 
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    -- Identity
    id                    UUID            PRIMARY KEY     DEFAULT gen_random_uuid(),
    email                 VARCHAR(255)    NOT NULL        UNIQUE,
    username              VARCHAR(50)     NOT NULL        UNIQUE,
    password_hash         VARCHAR(255)    ,               -- null if OAuth only
 
    -- Personal info
    full_name             VARCHAR(120)    NOT NULL,
    avatar_url            TEXT,
    phone                 VARCHAR(20),
    date_of_birth         DATE,                           -- age verification (18+)
 
    -- Role & status
    role                  user_role       NOT NULL,
    status                user_status     NOT NULL        DEFAULT 'pending',
    is_email_verified     BOOLEAN         NOT NULL        DEFAULT FALSE,
    is_phone_verified     BOOLEAN         NOT NULL        DEFAULT FALSE,
    is_identity_verified  BOOLEAN         NOT NULL        DEFAULT FALSE,
 
    -- Auth & security
    two_fa_secret         VARCHAR(100),                  -- null if 2FA disabled
    two_fa_enabled        BOOLEAN         NOT NULL        DEFAULT FALSE,
    last_login_at         TIMESTAMPTZ,
    last_login_ip         INET,
    failed_login_count    SMALLINT        NOT NULL        DEFAULT 0,
    locked_until          TIMESTAMPTZ,
 
    -- OAuth
    oauth_provider        VARCHAR(30),                   -- 'google' | 'facebook' | 'apple'
    oauth_provider_id     VARCHAR(255),
 
    -- Preferences
    locale                VARCHAR(10)     NOT NULL        DEFAULT 'en-US',
    timezone              VARCHAR(60)     NOT NULL        DEFAULT 'UTC',
    currency              CHAR(3)        NOT NULL        DEFAULT 'USD',
    notification_prefs    JSONB           DEFAULT         '{}',
 
    -- Timestamps
    email_verified_at     TIMESTAMPTZ,
    created_at            TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    updated_at            TIMESTAMPTZ     NOT NULL        DEFAULT now(),
    deleted_at            TIMESTAMPTZ,                   -- soft delete; NULL = active

    -- Constraints
    CONSTRAINT uq_oauth   UNIQUE (oauth_provider, oauth_provider_id),
    CONSTRAINT chk_age    CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years')

);
 
-- Indexes
CREATE INDEX idx_users_role    ON users (role);
CREATE INDEX idx_users_status  ON users (status);
CREATE INDEX idx_users_email   ON users (email);
CREATE INDEX idx_users_deleted ON users (deleted_at) WHERE deleted_at IS NULL;
 
-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO users (
    id, email, username, password_hash, full_name,
    avatar_url, phone, date_of_birth, role, status,
    is_email_verified, is_phone_verified, is_identity_verified,
    two_fa_enabled, last_login_at, last_login_ip, failed_login_count,
    oauth_provider, oauth_provider_id,
    locale, timezone, currency, notification_prefs,
    email_verified_at, created_at, updated_at , deleted_at
) VALUES
 
-- ── Influencer 1 ──────────────────────────────────
(
    'a1b2c3d4-0001-0001-0001-000000000001',
    'priya.sharma@gmail.com',           'priya_creates',
    '$2b$12$KIXzB9Lq0v1N2M3P4R5S6uHashedPasswordHere1',
    'Priya Sharma',
    'https://cdn.example.com/avatars/priya.jpg',
    '+91-9876543210',                 '1998-04-15',
    'influencer',                    'active',
    TRUE,  TRUE,  TRUE,
    FALSE,  '2026-03-24 10:30:00+05:30',  '103.21.244.10',  0,
    NULL, NULL,
    'en-IN', 'Asia/Kolkata', 'INR', '{"new_proposal":true,"messages":true}',
    '2025-01-10 09:00:00+05:30', '2025-01-10 09:00:00+05:30', '2026-03-24 10:30:00+05:30', NULL
),
 
-- ── Influencer 2 ──────────────────────────────────
(
    'a1b2c3d4-0002-0002-0002-000000000002',
    'arjun.vlogs@gmail.com',           'arjun_vlogs',
    '$2b$12$KIXzB9Lq0v1N2M3P4R5S6uHashedPasswordHere2',
    'Arjun Mehta',
    'https://cdn.example.com/avatars/arjun.jpg',
    '+91-9123456780',                 '2000-08-22',
    'influencer',                    'active',
    TRUE,  TRUE,  FALSE,
    TRUE,   '2026-03-22 14:15:00+05:30',  '182.73.48.22',   0,
    'google', 'google-uid-arjun-9823',
    'en-IN', 'Asia/Kolkata', 'INR', '{"new_proposal":true,"messages":false}',
    '2025-03-01 11:00:00+05:30', '2025-03-01 11:00:00+05:30', '2026-03-22 14:15:00+05:30', NULL
),
 
-- ── Influencer 3 ──────────────────────────────────
(
    'a1b2c3d4-0003-0003-0003-000000000003',
    'sneha.beauty@outlook.com',        'sneha_glam',
    '$2b$12$KIXzB9Lq0v1N2M3P4R5S6uHashedPasswordHere3',
    'Sneha Kapoor',
    'https://cdn.example.com/avatars/sneha.jpg',
    NULL,                               '1995-12-03',
    'influencer',                    'active',
    TRUE,  FALSE, TRUE,
    FALSE,  '2026-03-20 08:45:00+05:30',  '49.36.121.55',   0,
    NULL, NULL,
    'en-US', 'Asia/Kolkata', 'USD', '{"new_proposal":true,"messages":true}',
    '2024-11-05 07:30:00+05:30', '2024-11-05 07:30:00+05:30', '2026-03-20 08:45:00+05:30', NULL
);
 

 
-- Quick verify (run manually after INSERT)
