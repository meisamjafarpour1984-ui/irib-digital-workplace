-- ============================================================
-- IRIB DWP Database — Seeds: System Roles
-- ============================================================

-- Get tenant ID
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'irib-east-az';

    -- Super Admin (Full Access)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'SUPER_ADMIN', '{"fa": "مدیر ارشد سیستم", "en": "Super Admin"}', 'دسترسی کامل به تمام بخش‌ها', TRUE);

    -- Portal Manager (P5)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'PORTAL_MANAGER', '{"fa": "مدیر ارشد پورتال", "en": "Portal Manager"}', 'مدیریت کل پورتال، کاربران، نقش‌ها، تم‌ها', TRUE);

    -- IT Admin (P6)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'IT_ADMIN', '{"fa": "مدیر فناوری اطلاعات", "en": "IT Admin"}', 'مدیریت نرم‌افزارها، تیکتینگ، زیرساخت IT', TRUE);

    -- Deputy Director (P4)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'DEPUTY_DIRECTOR', '{"fa": "مدیر معاونت", "en": "Deputy Director"}', 'تأیید محتوا، مشاهده داشبورد تحلیلی معاونت', FALSE);

    -- Department Officer (P3)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'DEPARTMENT_OFFICER', '{"fa": "کارشناس/مسئول واحد", "en": "Department Officer"}', 'ثبت خبر/اطلاعیه/رویداد، مدیریت فرم‌های واحد', FALSE);

    -- Content Manager
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'CONTENT_MANAGER', '{"fa": "مدیر محتوا", "en": "Content Manager"}', 'ایجاد، ویرایش، انتشار و مدیریت محتوا', FALSE);

    -- Employee (P2)
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'EMPLOYEE', '{"fa": "کارمند", "en": "Employee"}', 'دسترسی پایه: مشاهده محتوا، ارسال فرم، ثبت تیکت', FALSE);

    -- Research Officer
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'RESEARCH_OFFICER', '{"fa": "مسئول پژوهش", "en": "Research Officer"}', 'مدیریت بانک کارشناسان، نخبگان، حافظه سازمانی', FALSE);

    -- PR Officer
    INSERT INTO roles (tenant_id, code, name, description, is_system) VALUES
    (v_tenant_id, 'PR_OFFICER', '{"fa": "روابط عمومی", "en": "PR Officer"}', 'مدیریت اخبار، گالری تصاویر، بنرهای مناسبتی', FALSE);

END $$;

-- ============================================================
-- Assign Permissions to Roles
-- ============================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_super_admin_id UUID;
    v_portal_manager_id UUID;
    v_it_admin_id UUID;
    v_deputy_id UUID;
    v_officer_id UUID;
    v_content_manager_id UUID;
    v_employee_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'irib-east-az';
    SELECT id INTO v_super_admin_id FROM roles WHERE code = 'SUPER_ADMIN' AND tenant_id = v_tenant_id;
    SELECT id INTO v_portal_manager_id FROM roles WHERE code = 'PORTAL_MANAGER' AND tenant_id = v_tenant_id;
    SELECT id INTO v_it_admin_id FROM roles WHERE code = 'IT_ADMIN' AND tenant_id = v_tenant_id;
    SELECT id INTO v_deputy_id FROM roles WHERE code = 'DEPUTY_DIRECTOR' AND tenant_id = v_tenant_id;
    SELECT id INTO v_officer_id FROM roles WHERE code = 'DEPARTMENT_OFFICER' AND tenant_id = v_tenant_id;
    SELECT id INTO v_content_manager_id FROM roles WHERE code = 'CONTENT_MANAGER' AND tenant_id = v_tenant_id;
    SELECT id INTO v_employee_id FROM roles WHERE code = 'EMPLOYEE' AND tenant_id = v_tenant_id;

    -- Super Admin: All Permissions
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_super_admin_id, id FROM atomic_permissions;

    -- Portal Manager: Most Permissions (except system-level)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_portal_manager_id, id FROM atomic_permissions
    WHERE entity NOT IN ('SystemSetting') OR action != 'MANAGE';

    -- IT Admin: Software, Ticket, Media, System Settings
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_it_admin_id, id FROM atomic_permissions
    WHERE entity IN ('Software', 'Ticket', 'Media', 'SystemSetting', 'User', 'Organization', 'Analytics', 'AuditLog');

    -- Deputy Director: Content Approval, Analytics, User Management for their scope
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_deputy_id, id FROM atomic_permissions
    WHERE entity IN ('Content', 'FormSubmission', 'Analytics', 'User', 'Organization')
    AND action IN ('READ', 'APPROVE', 'UPDATE');

    -- Department Officer: Content CRUD for their scope, Form Management
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_officer_id, id FROM atomic_permissions
    WHERE entity IN ('Content', 'Form', 'FormSubmission', 'Media', 'Conversation', 'Message')
    AND action IN ('CREATE', 'READ', 'UPDATE', 'PUBLISH', 'ARCHIVE');

    -- Content Manager: Full Content Management
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_content_manager_id, id FROM atomic_permissions
    WHERE entity IN ('Content', 'Media', 'Widget', 'PageLayout')
    AND action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE', 'ARCHIVE', 'MANAGE');

    -- Employee: Read-only + Form Submit + Ticket Create
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_employee_id, id FROM atomic_permissions
    WHERE (entity = 'Content' AND action = 'READ')
    OR (entity = 'FormSubmission' AND action IN ('CREATE', 'READ'))
    OR (entity = 'Ticket' AND action IN ('CREATE', 'READ'))
    OR (entity = 'Software' AND action = 'READ')
    OR (entity = 'Media' AND action = 'READ')
    OR (entity = 'Expert' AND action = 'READ')
    OR (entity = 'Notification' AND action = 'READ')
    OR (entity = 'Conversation' AND action IN ('READ', 'CREATE'))
    OR (entity = 'Message' AND action IN ('READ', 'CREATE'));

END $$;
