-- ============================================================
-- IRIB DWP Database — V020: Row Level Security (RLS) Policies
-- SRS v1.0 Baseline
-- ============================================================

-- ============================================================
-- Helper Functions (Security Definer)
-- ============================================================

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(
    p_entity TEXT,
    p_action TEXT,
    p_resource_ids UUID[] DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := current_user_id();
    v_has_perm BOOLEAN := FALSE;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if user has SUPER_ADMIN role with GLOBAL scope
    IF EXISTS (
        SELECT 1 FROM user_role_assignments ura
        JOIN roles r ON r.id = ura.role_id
        WHERE ura.user_id = v_user_id
        AND r.code = 'SUPER_ADMIN'
        AND ura.scope_type = 'GLOBAL'
        AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check specific permission
    SELECT EXISTS (
        SELECT 1
        FROM user_role_assignments ura
        JOIN role_permissions rp ON rp.role_id = ura.role_id
        JOIN atomic_permissions ap ON ap.id = rp.permission_id
        WHERE ura.user_id = v_user_id
        AND ap.entity = p_entity
        AND ap.action = p_action
        AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
        -- Check not in denied permissions
        AND NOT (ap.id::text = ANY(ura.denied_permissions))
        -- Check granted or in role permissions
        AND (ap.id::text = ANY(ura.granted_permissions) OR rp.role_id IS NOT NULL)
    ) INTO v_has_perm;

    RETURN v_has_perm;
END;
$$;

-- Check if user has access to specific scope
CREATE OR REPLACE FUNCTION has_scope_access(p_scope_ids UUID[])
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := current_user_id();
    v_user_scopes UUID[];
BEGIN
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- If resource has no scopes (Global), everyone can access
    IF array_length(p_scope_ids, 1) IS NULL OR array_length(p_scope_ids, 1) = 0 THEN
        RETURN TRUE;
    END IF;

    -- Get user's assigned scopes
    SELECT array_agg(DISTINCT unnest)
    INTO v_user_scopes
    FROM unnest(scope_ids)
    WHERE user_id = v_user_id
    AND (expires_at IS NULL OR expires_at > NOW());

    -- Check intersection
    RETURN v_user_scopes && p_scope_ids;
END;
$$;

-- ============================================================
-- Enable RLS on All Tables
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsite_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE atomic_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE afish_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Force RLS on Table Owners too
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE content_items FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- ============================================================
-- Users Policies
-- ============================================================

CREATE POLICY users_tenant_isolation ON users
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY users_read_own ON users
    FOR SELECT
    USING (
        id = current_user_id()
        OR has_permission('User', 'READ')
    );

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (
        id = current_user_id()
        OR has_permission('User', 'UPDATE')
    );

-- ============================================================
-- Content Items Policies
-- ============================================================

CREATE POLICY content_tenant_isolation ON content_items
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY content_read_published ON content_items
    FOR SELECT
    USING (
        -- Published content visible to all in scope
        (status = 'PUBLISHED' AND (scope_ids = '{}' OR has_scope_access(scope_ids)))
        -- Author can see their own content
        OR author_id = current_user_id()
        -- Admin/Manager can see all
        OR has_permission('Content', 'READ')
    );

CREATE POLICY content_insert_author ON content_items
    FOR INSERT
    WITH CHECK (
        author_id = current_user_id()
        AND has_permission('Content', 'CREATE')
    );

CREATE POLICY content_update_author ON content_items
    FOR UPDATE
    USING (
        author_id = current_user_id()
        OR has_permission('Content', 'UPDATE')
    );

CREATE POLICY content_delete_admin ON content_items
    FOR DELETE
    USING (
        has_permission('Content', 'DELETE')
    );

-- ============================================================
-- Form Submissions Policies
-- ============================================================

CREATE POLICY form_sub_tenant_isolation ON form_submissions
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY form_sub_read_own ON form_submissions
    FOR SELECT
    USING (
        submitted_by = current_user_id()
        OR assignee_user_id = current_user_id()
        OR has_permission('FormSubmission', 'READ')
    );

CREATE POLICY form_sub_insert_own ON form_submissions
    FOR INSERT
    WITH CHECK (
        submitted_by = current_user_id()
    );

CREATE POLICY form_sub_update_assignee ON form_submissions
    FOR UPDATE
    USING (
        assignee_user_id = current_user_id()
        OR has_permission('FormSubmission', 'UPDATE')
    );

-- ============================================================
-- Conversations Policies
-- ============================================================

CREATE POLICY conv_tenant_isolation ON conversations
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY conv_read_participant ON conversations
    FOR SELECT
    USING (
        -- Participant can read
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = id
            AND cp.user_id = current_user_id()
            AND cp.left_at IS NULL
        )
        -- Admin can read all
        OR has_permission('Conversation', 'READ')
    );

CREATE POLICY conv_insert_auth ON conversations
    FOR INSERT
    WITH CHECK (
        created_by = current_user_id()
    );

-- ============================================================
-- Messages Policies
-- ============================================================

CREATE POLICY msg_tenant_isolation ON messages
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY msg_read_participant ON messages
    FOR SELECT
    USING (
        -- Participant of conversation can read
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = current_user_id()
            AND cp.left_at IS NULL
        )
        OR has_permission('Message', 'READ')
    );

CREATE POLICY msg_insert_participant ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = current_user_id()
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = current_user_id()
            AND cp.left_at IS NULL
        )
    );

-- ============================================================
-- Notifications Policies
-- ============================================================

CREATE POLICY notif_tenant_isolation ON notifications
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY notif_read_own ON notifications
    FOR SELECT
    USING (
        user_id = current_user_id()
    );

CREATE POLICY notif_update_own ON notifications
    FOR UPDATE
    USING (
        user_id = current_user_id()
    );

-- ============================================================
-- Media Assets Policies
-- ============================================================

CREATE POLICY media_tenant_isolation ON media_assets
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY media_read_auth ON media_assets
    FOR SELECT
    USING (
        uploaded_by = current_user_id()
        OR has_permission('Media', 'READ')
    );

CREATE POLICY media_insert_auth ON media_assets
    FOR INSERT
    WITH CHECK (
        uploaded_by = current_user_id()
        AND has_permission('Media', 'CREATE')
    );

-- ============================================================
-- Organization Units Policies
-- ============================================================

CREATE POLICY org_tenant_isolation ON organization_units
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY org_read_auth ON organization_units
    FOR SELECT
    USING (
        has_permission('Organization', 'READ')
    );

-- ============================================================
-- Roles & Permissions Policies (Admin Only)
-- ============================================================

CREATE POLICY roles_tenant_isolation ON roles
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY roles_read_auth ON roles
    FOR SELECT
    USING (
        has_permission('Role', 'READ')
    );

CREATE POLICY roles_write_admin ON roles
    FOR ALL
    USING (
        has_permission('Role', 'MANAGE')
    );

CREATE POLICY rp_tenant_isolation ON role_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM roles r
            WHERE r.id = role_id
            AND r.tenant_id = current_tenant_id()
        )
    );

CREATE POLICY ura_tenant_isolation ON user_role_assignments
    FOR ALL
    USING (tenant_id = current_tenant_id());

CREATE POLICY ura_read_auth ON user_role_assignments
    FOR SELECT
    USING (
        user_id = current_user_id()
        OR has_permission('UserRole', 'READ')
    );

CREATE POLICY ura_write_admin ON user_role_assignments
    FOR ALL
    USING (
        has_permission('UserRole', 'MANAGE')
    );

-- ============================================================
-- Audit Logs (Append Only)
-- ============================================================

-- Audit logs can only be inserted and read, never updated or deleted
CREATE POLICY audit_insert_auth ON audit_logs
    FOR INSERT
    WITH CHECK (
        has_permission('AuditLog', 'CREATE')
    );

CREATE POLICY audit_read_auth ON audit_logs
    FOR SELECT
    USING (
        has_permission('AuditLog', 'READ')
    );

-- NO UPDATE or DELETE policies for audit_logs (immutable)

-- ============================================================
-- System Settings Policies
-- ============================================================

CREATE POLICY settings_read_public ON system_settings
    FOR SELECT
    USING (
        is_public = TRUE
        OR has_permission('SystemSetting', 'READ')
    );

CREATE POLICY settings_write_admin ON system_settings
    FOR ALL
    USING (
        has_permission('SystemSetting', 'MANAGE')
    );
