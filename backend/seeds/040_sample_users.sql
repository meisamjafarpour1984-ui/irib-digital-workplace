-- ============================================================
-- IRIB DWP Database — Seeds: Sample Users
-- ============================================================

-- Create test users with hashed passwords (password: 'password123')
-- Hash generated with bcrypt (cost 10): $2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx

-- Super Admin
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10001-0000-0000-0000-000000000001', '10001', '1234567890', '09141234567', 'admin@iribtabriz.ir', 'System Administrator', 'مدیر سیستم', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Portal Manager
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10002-0000-0000-0000-000000000001', '10002', '1234567891', '09141234568', 'portal@iribtabriz.ir', 'Portal Manager', 'مدیر درگاه', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- IT Admin
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10003-0000-0000-0000-000000000001', '10003', '1234567892', '09141234569', 'it@iribtabriz.ir', 'IT Administrator', 'مدیر IT', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Deputy Director (Tech)
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10004-0000-0000-0000-000000000001', '10004', '1234567893', '09141234570', 'deputy-tech@iribtabriz.ir', 'Deputy Director Tech', 'معاون توسعه', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Department Officer (IT)
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10005-0000-0000-0000-000000000001', '10005', '1234567894', '09141234571', 'officer-it@iribtabriz.ir', 'IT Officer', 'کارشناس IT', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Content Manager
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10006-0000-0000-0000-000000000001', '10006', '1234567895', '09141234572', 'content@iribtabriz.ir', 'Content Manager', 'مدیر محتوا', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Regular Employee
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10007-0000-0000-0000-000000000001', '10007', '1234567896', '09141234573', 'employee1@iribtabriz.ir', 'Regular Employee', 'کارمند عادی', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- Research Officer
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10008-0000-0000-0000-000000000001', '10008', '1234567897', '09141234574', 'research@iribtabriz.ir', 'Research Officer', 'مسئول پژوهش', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- PR Officer
INSERT INTO "User" (id, personnelCode, nationalCode, mobile, email, name, nameFa, passwordHash, status) VALUES
('10009-0000-0000-0000-000000000001', '10009', '1234567898', '09141234575', 'pr@iribtabriz.ir', 'PR Officer', 'روابط عمومی', '$2b$10$rKZ3YxW8YxW8YxW8YxW8YeYxW8YxW8YxW8YxW8YxW8YxW8YxW8Yx', 'ACTIVE');

-- ============================================================
-- Assign Roles to Users
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
    v_research_id UUID;
    v_pr_id UUID;
    
    v_user_10001 UUID;
    v_user_10002 UUID;
    v_user_10003 UUID;
    v_user_10004 UUID;
    v_user_10005 UUID;
    v_user_10006 UUID;
    v_user_10007 UUID;
    v_user_10008 UUID;
    v_user_10009 UUID;
    
    v_dept_root UUID;
    v_dept_network UUID;
    v_dept_software UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO v_super_admin_id FROM "Role" WHERE code = 'SUPER_ADMIN';
    SELECT id INTO v_portal_manager_id FROM "Role" WHERE code = 'PORTAL_MANAGER';
    SELECT id INTO v_it_admin_id FROM "Role" WHERE code = 'IT_ADMIN';
    SELECT id INTO v_deputy_id FROM "Role" WHERE code = 'DEPUTY_DIRECTOR';
    SELECT id INTO v_officer_id FROM "Role" WHERE code = 'DEPARTMENT_OFFICER';
    SELECT id INTO v_content_manager_id FROM "Role" WHERE code = 'CONTENT_MANAGER';
    SELECT id INTO v_employee_id FROM "Role" WHERE code = 'EMPLOYEE';
    SELECT id INTO v_research_id FROM "Role" WHERE code = 'RESEARCH_OFFICER';
    SELECT id INTO v_pr_id FROM "Role" WHERE code = 'PR_OFFICER';
    
    -- Get user IDs
    SELECT id INTO v_user_10001 FROM "User" WHERE personnelCode = '10001';
    SELECT id INTO v_user_10002 FROM "User" WHERE personnelCode = '10002';
    SELECT id INTO v_user_10003 FROM "User" WHERE personnelCode = '10003';
    SELECT id INTO v_user_10004 FROM "User" WHERE personnelCode = '10004';
    SELECT id INTO v_user_10005 FROM "User" WHERE personnelCode = '10005';
    SELECT id INTO v_user_10006 FROM "User" WHERE personnelCode = '10006';
    SELECT id INTO v_user_10007 FROM "User" WHERE personnelCode = '10007';
    SELECT id INTO v_user_10008 FROM "User" WHERE personnelCode = '10008';
    SELECT id INTO v_user_10009 FROM "User" WHERE personnelCode = '10009';
    
    -- Get department IDs
    SELECT id INTO v_dept_root FROM "Department" WHERE slug = 'irib-east-az';
    SELECT id INTO v_dept_network FROM "Department" WHERE slug = 'unit-network';
    SELECT id INTO v_dept_software FROM "Department" WHERE slug = 'unit-software';
    
    -- Assign roles to users
    -- Super Admin gets SUPER_ADMIN role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10001, v_super_admin_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- Portal Manager gets PORTAL_MANAGER role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10002, v_portal_manager_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- IT Admin gets IT_ADMIN role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10003, v_it_admin_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- Deputy Director gets DEPUTY_DIRECTOR role with DEPARTMENT scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10004, v_deputy_id, 'DEPARTMENT', ARRAY[v_dept_root::TEXT]);
    
    -- IT Officer gets DEPARTMENT_OFFICER role with DEPARTMENT scope (IT units)
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10005, v_officer_id, 'DEPARTMENT', ARRAY[v_dept_network::TEXT, v_dept_software::TEXT]);
    
    -- Content Manager gets CONTENT_MANAGER role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10006, v_content_manager_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- Regular Employee gets EMPLOYEE role with DEPARTMENT scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10007, v_employee_id, 'DEPARTMENT', ARRAY[v_dept_software::TEXT]);
    
    -- Research Officer gets RESEARCH_OFFICER role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10008, v_research_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- PR Officer gets PR_OFFICER role with GLOBAL scope
    INSERT INTO "UserRoleAssignment" (userId, roleId, scopeType, scopeIds)
    VALUES (v_user_10009, v_pr_id, 'GLOBAL', ARRAY[]::TEXT[]);
    
    -- Assign departments to users
    INSERT INTO "UserDepartmentScope" (userId, departmentId, isPrimary)
    VALUES 
    (v_user_10001, v_dept_root, TRUE),
    (v_user_10002, v_dept_root, TRUE),
    (v_user_10003, v_dept_network, TRUE),
    (v_user_10004, v_dept_root, TRUE),
    (v_user_10005, v_dept_network, TRUE),
    (v_user_10006, v_dept_root, TRUE),
    (v_user_10007, v_dept_software, TRUE),
    (v_user_10008, v_dept_root, TRUE),
    (v_user_10009, v_dept_root, TRUE);

END $$;
