-- ============================================================
-- IRIB DWP Database — V010: Core Domain Tables
-- SRS v1.0 Baseline
-- ============================================================

-- ============================================================
-- 1. Users & Identity (IAM)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY, -- Keycloak Subject ID
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    personnel_code      VARCHAR(50) NOT NULL,
    national_code       VARCHAR(255), -- Encrypted PII
    mobile              VARCHAR(255), -- Encrypted PII
    email               VARCHAR(255),
    full_name           JSONB NOT NULL, -- { "fa": "علی رضایی", "en": "Ali Rezaei" }
    avatar_media_id     UUID,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE (tenant_id, personnel_code)
);

CREATE INDEX idx_users_tenant_status ON users(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_personnel ON users(tenant_id, personnel_code);

-- User Devices (Mobile Binding)
CREATE TABLE IF NOT EXISTS user_devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    device_id       VARCHAR(255) NOT NULL,
    platform        VARCHAR(20) NOT NULL,
    push_token      TEXT, -- Encrypted
    public_key      TEXT, -- WebAuthn/Passkey
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, device_id)
);

-- QR Link Tokens (Desktop Linking)
CREATE TABLE IF NOT EXISTS qr_link_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    nonce       VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    endpoint    VARCHAR(500) NOT NULL,
    p256dh      VARCHAR(255) NOT NULL,
    auth_key    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, endpoint)
);

-- ============================================================
-- 2. Organization Structure (ltree)
-- ============================================================

CREATE TABLE IF NOT EXISTS organization_units (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    code            VARCHAR(50) NOT NULL,
    name            JSONB NOT NULL,
    unit_type       VARCHAR(30) NOT NULL,
    parent_id       UUID REFERENCES organization_units(id) ON DELETE SET NULL,
    path            LTREE NOT NULL,
    manager_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    valid_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to        DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code),
    UNIQUE (tenant_id, path)
);

CREATE INDEX idx_org_units_path_gist ON organization_units USING GIST (path);
CREATE INDEX idx_org_units_parent ON organization_units (parent_id);

-- Microsite Configs
CREATE TABLE IF NOT EXISTS microsite_configs (
    org_unit_id     UUID PRIMARY KEY REFERENCES organization_units(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    hero_config     JSONB,
    theme_overrides JSONB,
    nav_items       JSONB NOT NULL DEFAULT '[]',
    service_cards   JSONB NOT NULL DEFAULT '[]',
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Dynamic RBAC / ABAC
-- ============================================================

CREATE TABLE IF NOT EXISTS atomic_permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity      VARCHAR(50) NOT NULL,
    action      VARCHAR(30) NOT NULL,
    description TEXT,
    UNIQUE (entity, action)
);

CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    code        VARCHAR(50) NOT NULL,
    name        JSONB NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES atomic_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    scope_type          VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
    scope_ids           UUID[] NOT NULL DEFAULT '{}',
    granted_permissions UUID[] NOT NULL DEFAULT '{}',
    denied_permissions  UUID[] NOT NULL DEFAULT '{}',
    assigned_by         UUID REFERENCES users(id),
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    UNIQUE (user_id, role_id, scope_type, scope_ids)
);

CREATE INDEX idx_ura_user ON user_role_assignments (user_id) WHERE expires_at IS NULL OR expires_at > NOW();
CREATE INDEX idx_ura_scope_ids ON user_role_assignments USING GIN (scope_ids);

-- ============================================================
-- 4. Single Content Model (SCM)
-- ============================================================

CREATE TYPE content_type_enum AS ENUM (
    'NEWS', 'ANNOUNCEMENT', 'EVENT', 'GALLERY', 'BANNER', 'FILE', 'SOFTWARE',
    'EXPERT', 'LEGEND', 'FORM', 'AFISH', 'DOCUMENT', 'SURVEY', 'FAQ', 'LINK'
);

CREATE TYPE content_status_enum AS ENUM (
    'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'REJECTED', 'DELETED'
);

CREATE TABLE IF NOT EXISTS content_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    content_type        CONTENT_TYPE_ENUM NOT NULL,
    status              CONTENT_STATUS_ENUM NOT NULL DEFAULT 'DRAFT',
    slug                VARCHAR(255) NOT NULL,
    title               JSONB NOT NULL,
    excerpt             JSONB,
    body                JSONB,
    metadata            JSONB NOT NULL DEFAULT '{}',
    scope_ids           UUID[] NOT NULL DEFAULT '{}',
    tags                UUID[] NOT NULL DEFAULT '{}',
    category_ids        UUID[] NOT NULL DEFAULT '{}',
    version             INT NOT NULL DEFAULT 1,
    published_at        TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,
    scheduled_archive_at TIMESTAMPTZ,
    author_id           UUID NOT NULL REFERENCES users(id),
    publisher_id        UUID REFERENCES users(id),
    owner_dept_id       UUID REFERENCES organization_units(id),
    deleted_at          TIMESTAMPTZ,
    deleted_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, content_type, slug)
);

-- Critical Indexes
CREATE INDEX idx_content_tenant_type_status ON content_items (tenant_id, content_type, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_scope_gin ON content_items USING GIN (scope_ids);
CREATE INDEX idx_content_tags_gin ON content_items USING GIN (tags);
CREATE INDEX idx_content_author ON content_items (author_id);
CREATE INDEX idx_content_published_at ON content_items (published_at DESC) WHERE status = 'PUBLISHED';

-- Full Text Search Vector
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title->>'fa', '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt->>'fa', '')), 'B')
) STORED;

CREATE INDEX idx_content_fts ON content_items USING GIN (search_vector);

-- Content Versions
CREATE TABLE IF NOT EXISTS content_versions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id      UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    version         INT NOT NULL,
    title           JSONB NOT NULL,
    body            JSONB,
    metadata        JSONB NOT NULL,
    status          content_status_enum NOT NULL,
    scope_ids       UUID[] NOT NULL,
    tags            UUID[] NOT NULL,
    category_ids    UUID[] NOT NULL,
    changed_by      UUID NOT NULL REFERENCES users(id),
    change_summary  VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id, version)
);

-- Tags & Categories
CREATE TABLE IF NOT EXISTS tags (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    name        JSONB NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    parent_id   UUID REFERENCES categories(id),
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

-- ============================================================
-- 5. Media & Storage
-- ============================================================

CREATE TYPE storage_provider_enum AS ENUM ('LOCAL_NFS', 'S3_MINIO', 'S3_AWS', 'CLOUDIAN');

CREATE TABLE IF NOT EXISTS storage_providers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    provider_type   STORAGE_PROVIDER_ENUM NOT NULL,
    config          JSONB NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    priority        INT NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS media_assets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    storage_provider_id UUID NOT NULL REFERENCES storage_providers(id),
    file_name           VARCHAR(255) NOT NULL,
    stored_path         VARCHAR(1024) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    file_size           BIGINT NOT NULL,
    checksum_sha256     CHAR(64) NOT NULL,
    variants            JSONB NOT NULL DEFAULT '{}',
    width               INT,
    height              INT,
    duration            INT,
    alt_text            JSONB,
    uploaded_by         UUID NOT NULL REFERENCES users(id),
    virus_scanned       BOOLEAN NOT NULL DEFAULT FALSE,
    virus_scan_result   VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE (tenant_id, checksum_sha256)
);

CREATE INDEX idx_media_checksum ON media_assets (checksum_sha256) WHERE deleted_at IS NULL;

-- ============================================================
-- 6. Widget Engine & Page Layouts
-- ============================================================

CREATE TABLE IF NOT EXISTS widget_manifests (
    widget_key        VARCHAR(100) PRIMARY KEY,
    tenant_id         UUID NOT NULL REFERENCES tenants(id),
    name              JSONB NOT NULL,
    category          VARCHAR(50) NOT NULL,
    default_size      JSONB NOT NULL,
    resizable         BOOLEAN NOT NULL DEFAULT TRUE,
    draggable         BOOLEAN NOT NULL DEFAULT TRUE,
    ssr               BOOLEAN NOT NULL DEFAULT TRUE,
    config_schema     JSONB NOT NULL,
    required_permissions UUID[] DEFAULT '{}',
    component_name    VARCHAR(100) NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS page_layouts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    page_key            VARCHAR(100) NOT NULL,
    version             INT NOT NULL DEFAULT 1,
    is_draft            BOOLEAN NOT NULL DEFAULT TRUE,
    layout_config       JSONB NOT NULL,
    theme_overrides     JSONB,
    created_by          UUID NOT NULL REFERENCES users(id),
    published_by        UUID REFERENCES users(id),
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, page_key, version)
);

CREATE INDEX idx_pl_page_key ON page_layouts (tenant_id, page_key);

-- Theme Tokens
CREATE TABLE IF NOT EXISTS theme_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    tokens      JSONB NOT NULL,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

-- ============================================================
-- 7. Forms & Workflow
-- ============================================================

CREATE TYPE form_type_enum AS ENUM ('DATA_COLLECTION', 'AFISH_STRUCTURED');

CREATE TYPE submission_status_enum AS ENUM (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED', 'RETURNED'
);

CREATE TABLE IF NOT EXISTS form_definitions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    slug                VARCHAR(100) NOT NULL,
    title               JSONB NOT NULL,
    description         JSONB,
    form_type           FORM_TYPE_ENUM NOT NULL DEFAULT 'DATA_COLLECTION',
    json_schema         JSONB NOT NULL,
    ui_schema           JSONB NOT NULL DEFAULT '{}',
    workflow_config     JSONB NOT NULL DEFAULT '{}',
    print_template_html TEXT,
    watermark_text      VARCHAR(255),
    record_number_prefix VARCHAR(20) DEFAULT 'AFISH',
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    scope_ids           UUID[] NOT NULL DEFAULT '{}',
    created_by          UUID NOT NULL REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    form_definition_id  UUID NOT NULL REFERENCES form_definitions(id),
    data                JSONB NOT NULL,
    calculated_fields   JSONB DEFAULT '{}',
    status              submission_status_enum NOT NULL DEFAULT 'DRAFT',
    current_state       VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    assignee_user_id    UUID REFERENCES users(id),
    assignee_role_id    UUID REFERENCES roles(id),
    record_number       VARCHAR(50),
    pdf_media_id        UUID REFERENCES media_assets(id),
    conversation_id     UUID,
    parent_submission_id UUID REFERENCES form_submissions(id),
    submitted_by        UUID NOT NULL REFERENCES users(id),
    submitted_at        TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_fs_form_status ON form_submissions (form_definition_id, status);
CREATE INDEX idx_fs_assignee ON form_submissions (assignee_user_id) WHERE status IN ('SUBMITTED', 'UNDER_REVIEW');

-- Afish Records
CREATE TABLE IF NOT EXISTS afish_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    form_definition_id  UUID NOT NULL REFERENCES form_definitions(id),
    record_number       VARCHAR(50) NOT NULL,
    row_index           INT NOT NULL,
    row_data            JSONB NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    pdf_media_id        UUID REFERENCES media_assets(id),
    created_by          UUID NOT NULL REFERENCES users(id),
    locked_by           UUID REFERENCES users(id),
    locked_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (form_definition_id, record_number)
);

-- ============================================================
-- 8. Communication (Thread-Based Inbox)
-- ============================================================

CREATE TYPE conversation_status_enum AS ENUM ('OPEN', 'CLOSED', 'PENDING', 'ARCHIVED');
CREATE TYPE participant_role_enum AS ENUM ('OWNER', 'ASSIGNEE', 'FOLLOWER', 'APPROVER', 'MENTIONED');

CREATE TABLE IF NOT EXISTS conversations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    subject             VARCHAR(500) NOT NULL,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    status              conversation_status_enum NOT NULL DEFAULT 'OPEN',
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    sla_due_at          TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    closed_by           UUID REFERENCES users(id),
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conv_entity ON conversations (entity_type, entity_id);
CREATE INDEX idx_conv_status ON conversations (status, updated_at) WHERE status IN ('OPEN', 'PENDING');

CREATE TABLE IF NOT EXISTS conversation_participants (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    role                participant_role_enum NOT NULL DEFAULT 'FOLLOWER',
    last_read_at        TIMESTAMPTZ,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at             TIMESTAMPTZ,
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_cp_user_unread ON conversation_participants (user_id, last_read_at) WHERE left_at IS NULL;

CREATE TABLE IF NOT EXISTS messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           UUID REFERENCES users(id),
    message_type        VARCHAR(20) NOT NULL DEFAULT 'USER',
    content             JSONB NOT NULL,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at           TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_msg_conv_created ON messages (conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_attachments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    media_id    UUID NOT NULL REFERENCES media_assets(id),
    tenant_id   UUID NOT NULL REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    type        VARCHAR(20) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    href        VARCHAR(500),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- 9. Knowledge & Identity
-- ============================================================

CREATE TABLE IF NOT EXISTS skills_taxonomy (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    name        JSONB NOT NULL,
    parent_id   UUID REFERENCES skills_taxonomy(id),
    path        LTREE NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_skills_path ON skills_taxonomy USING GIST (path);

CREATE TABLE IF NOT EXISTS expert_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    bio                 JSONB,
    skills              UUID[] NOT NULL DEFAULT '{}',
    specializations     TEXT[],
    education_history   JSONB DEFAULT '[]',
    professional_history JSONB DEFAULT '[]',
    contact_preferences JSONB DEFAULT '{}',
    is_public           BOOLEAN NOT NULL DEFAULT TRUE,
    is_legend           BOOLEAN NOT NULL DEFAULT FALSE,
    legend_data         JSONB,
    verified_by         UUID REFERENCES users(id),
    verified_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. Software Center & IT Ticketing
-- ============================================================

CREATE TABLE IF NOT EXISTS software_entries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    name                JSONB NOT NULL,
    slug                VARCHAR(100) NOT NULL,
    description         JSONB,
    category            VARCHAR(50),
    publisher           VARCHAR(100),
    license_type        VARCHAR(50),
    tags                UUID[],
    is_featured         BOOLEAN DEFAULT FALSE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS software_versions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_id         UUID NOT NULL REFERENCES software_entries(id) ON DELETE CASCADE,
    version             VARCHAR(50) NOT NULL,
    release_date        DATE,
    changelog           JSONB,
    file_media_id       UUID NOT NULL REFERENCES media_assets(id),
    checksum_sha256     CHAR(64) NOT NULL,
    min_os_version      VARCHAR(50),
    supported_archs     VARCHAR(50)[],
    is_active           BOOLEAN DEFAULT TRUE,
    download_count      BIGINT DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (software_id, version)
);

CREATE TABLE IF NOT EXISTS software_downloads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id      UUID NOT NULL REFERENCES software_versions(id),
    user_id         UUID REFERENCES users(id),
    ip_address      INET,
    user_agent      TEXT,
    downloaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sw_downloads_version ON software_downloads (version_id, downloaded_at DESC);

CREATE TABLE IF NOT EXISTS it_tickets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    ticket_number       VARCHAR(20) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         JSONB NOT NULL,
    category            VARCHAR(30) NOT NULL,
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    sla_due_at          TIMESTAMPTZ,
    requester_id        UUID NOT NULL REFERENCES users(id),
    assignee_id         UUID REFERENCES users(id),
    assignee_group_id   UUID REFERENCES organization_units(id),
    conversation_id     UUID,
    resolution_summary  JSONB,
    csat_score          SMALLINT,
    csat_comment        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at           TIMESTAMPTZ,
    UNIQUE (tenant_id, ticket_number)
);

-- ============================================================
-- 11. Platform Infrastructure
-- ============================================================

-- Outbox Events (Event-Driven Architecture)
CREATE TABLE IF NOT EXISTS outbox_events (
    id                  BIGSERIAL PRIMARY KEY,
    aggregate_id        UUID NOT NULL,
    aggregate_type      VARCHAR(100) NOT NULL,
    event_type          VARCHAR(100) NOT NULL,
    payload             JSONB NOT NULL,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    retry_count         SMALLINT NOT NULL DEFAULT 0,
    last_error          TEXT
);

CREATE INDEX idx_outbox_unprocessed ON outbox_events (created_at) WHERE processed_at IS NULL;

-- Audit Logs (Immutable, Partitioned)
CREATE TABLE IF NOT EXISTS audit_logs (
    id                  BIGSERIAL,
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    event_time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id            UUID REFERENCES users(id),
    actor_ip            INET,
    actor_user_agent    TEXT,
    trace_id            VARCHAR(32),
    action              VARCHAR(50) NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    old_values          JSONB,
    new_values          JSONB,
    changed_fields      TEXT[],
    row_hash            VARCHAR(64),
    PRIMARY KEY (tenant_id, event_time, id)
) PARTITION BY RANGE (event_time);

-- Create initial partition for current month
CREATE TABLE IF NOT EXISTS audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m05 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m06 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m07 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m08 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m09 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m10 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m11 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2025m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, event_time DESC);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id, event_time DESC);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key                 VARCHAR(100) PRIMARY KEY,
    value               JSONB NOT NULL,
    description         TEXT,
    is_public           BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by          UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    code                VARCHAR(50) PRIMARY KEY,
    channel             VARCHAR(20) NOT NULL,
    subject_template    VARCHAR(255),
    body_template       TEXT NOT NULL,
    locale              VARCHAR(10) NOT NULL DEFAULT 'fa',
    is_active           BOOLEAN DEFAULT TRUE
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferences         JSONB NOT NULL DEFAULT '{}',
    quiet_hours_start   TIME,
    quiet_hours_end     TIME,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy Connectors
CREATE TABLE IF NOT EXISTS legacy_connectors (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    type        VARCHAR(20) NOT NULL,
    base_url    VARCHAR(500),
    config      JSONB NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    url         VARCHAR(500) NOT NULL,
    events      TEXT[] NOT NULL,
    secret      VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
