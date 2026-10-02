-- ============================================================
-- IRIB DWP Database — Seeds: System Roles
-- ============================================================

-- Super Admin (Full Access)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('SUPER_ADMIN', '{"fa": "مدیر ارشد سیستم", "en": "Super Admin"}', 'دسترسی کامل به تمام بخش‌ها', TRUE);

-- Portal Manager (P5)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('PORTAL_MANAGER', '{"fa": "مدیر ارشد درگاه", "en": "Portal Manager"}', 'مدیریت کل درگاه، کاربران، نقش‌ها، تم‌ها', TRUE);

-- IT Admin (P6)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('IT_ADMIN', '{"fa": "مدیر فناوری اطلاعات", "en": "IT Admin"}', 'مدیریت نرم‌افزارها، تیکتینگ، زیرساخت IT', TRUE);

-- Deputy Director (P4)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('DEPUTY_DIRECTOR', '{"fa": "مدیر معاونت", "en": "Deputy Director"}', 'تأیید محتوا، مشاهده داشبورد تحلیلی معاونت', FALSE);

-- Department Officer (P3)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('DEPARTMENT_OFFICER', '{"fa": "کارشناس/مسئول واحد", "en": "Department Officer"}', 'ثبت خبر/اطلاعیه/رویداد، مدیریت فرم‌های واحد', FALSE);

-- Content Manager
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('CONTENT_MANAGER', '{"fa": "مدیر محتوا", "en": "Content Manager"}', 'ایجاد، ویرایش، انتشار و مدیریت محتوا', FALSE);

-- Employee (P2)
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('EMPLOYEE', '{"fa": "کارمند", "en": "Employee"}', 'دسترسی پایه: مشاهده محتوا، ارسال فرم، ثبت تیکت', FALSE);

-- Research Officer
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('RESEARCH_OFFICER', '{"fa": "مسئول پژوهش", "en": "Research Officer"}', 'مدیریت بانک کارشناسان، نخبگان، حافظه سازمانی', FALSE);

-- PR Officer
INSERT INTO "Role" (code, name, description, isSystem) VALUES
('PR_OFFICER', '{"fa": "روابط عمومی", "en": "PR Officer"}', 'مدیریت اخبار، گالری تصاویر، بنرهای مناسبتی', FALSE);

-- ============================================================
-- Assign Permissions to Roles
-- ============================================================

DO $$
DECLARE
    v_super_admin_id UUID;
    v_portal_manager_id UUID;
    v_it_admin_id UUID;
    v_deputy_id UUID;
    v_officer_id UUID;
    v_content_manager_id UUID;
    v_employee_id UUID;
BEGIN
    SELECT id INTO v_super_admin_id FROM "Role" WHERE code = 'SUPER_ADMIN';
    SELECT id INTO v_portal_manager_id FROM "Role" WHERE code = 'PORTAL_MANAGER';
    SELECT id INTO v_it_admin_id FROM "Role" WHERE code = 'IT_ADMIN';
    SELECT id INTO v_deputy_id FROM "Role" WHERE code = 'DEPUTY_DIRECTOR';
    SELECT id INTO v_officer_id FROM "Role" WHERE code = 'DEPARTMENT_OFFICER';
    SELECT id INTO v_content_manager_id FROM "Role" WHERE code = 'CONTENT_MANAGER';
    SELECT id INTO v_employee_id FROM "Role" WHERE code = 'EMPLOYEE';

    -- Super Admin: All Permissions
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_super_admin_id, id FROM "AtomicPermission";

    -- Portal Manager: Most Permissions (except system-level delete)
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_portal_manager_id, id FROM "AtomicPermission"
    WHERE entity != 'SystemSettings' OR action != 'DELETE';

    -- IT Admin: Software, Ticket, Media, System Settings
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_it_admin_id, id FROM "AtomicPermission"
    WHERE entity IN ('Software', 'Ticket', 'Media', 'SystemSettings', 'User', 'Organization', 'Analytics', 'AuditLog');

    -- Deputy Director: Content Approval, Analytics, User Management for their scope
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_deputy_id, id FROM "AtomicPermission"
    WHERE entity IN ('Content', 'FormSubmission', 'Analytics', 'User', 'Organization')
    AND action IN ('READ', 'APPROVE', 'UPDATE');

    -- Department Officer: Content CRUD for their scope, Form Management
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_officer_id, id FROM "AtomicPermission"
    WHERE entity IN ('Content', 'Form', 'FormSubmission', 'Media', 'Conversation', 'Message')
    AND action IN ('CREATE', 'READ', 'UPDATE', 'PUBLISH', 'ARCHIVE');

    -- Content Manager: Full Content Management
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_content_manager_id, id FROM "AtomicPermission"
    WHERE entity IN ('Content', 'Media', 'Widget', 'PageLayout')
    AND action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE', 'ARCHIVE', 'MANAGE');

    -- Employee: Read-only + Form Submit + Ticket Create
    INSERT INTO "_RolePermissions" (roleId, permissionId)
    SELECT v_employee_id, id FROM "AtomicPermission"
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
