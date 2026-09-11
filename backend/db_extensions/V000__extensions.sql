-- ============================================================
-- IRIB DWP Database — V000: Extensions & Global Settings
-- SRS v1.0 Baseline
-- ============================================================

-- Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";          -- UUID Generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";           -- PII Encryption, Hashing
CREATE EXTENSION IF NOT EXISTS "ltree";              -- Org Hierarchy (Microsites, Scopes)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";            -- Persian Fuzzy Search (GIN Index)
CREATE EXTENSION IF NOT EXISTS "btree_gin";          -- Composite GIN Indexes
-- CREATE EXTENSION IF NOT EXISTS "pg_partman";         -- Audit Log Partitioning Automation (not available in standard Alpine image)
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query Performance Monitoring (included in shared_preload_libraries)
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";            -- Scheduled Tasks (not available in standard Alpine image)

-- Configuration
SET default_table_access_method = 'heap';
SET timezone = 'UTC';

-- ============================================================
-- Helper Functions (Security Definer)
-- ============================================================

-- Current Tenant ID (Set by Application per Request)
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- Current User ID (Set by Application per Request)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- Current User Scopes (Array of Department IDs)
CREATE OR REPLACE FUNCTION current_user_scopes()
RETURNS UUID[]
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    string_to_array(current_setting('app.current_scopes', true), ',')::uuid[],
    '{}'::uuid[]
  );
$$;

-- ============================================================
-- Tenant Table (Single Tenant for Now, Modeled for Future)
-- ============================================================

CREATE TABLE IF NOT EXISTS tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            JSONB NOT NULL,
    settings        JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default Tenant
INSERT INTO tenants (code, name, settings, status)
VALUES (
    'irib-east-az',
    '{"fa": "صدا و سیمای آذربایجان شرقی", "en": "IRIB East Azerbaijan"}',
    '{"featureFlags": {"mobileApp": true, "aiSearch": false}, "theme": {"primaryColor": "#00A6B6"}}',
    'ACTIVE'
)
ON CONFLICT (code) DO NOTHING;
