-- ============================================================
-- IRIB DWP Database — Seeds: Organization Structure
-- ============================================================

-- Root Department
INSERT INTO "Department" (id, name, slug, type, path, depth, isActive, sortOrder) VALUES
('00000000-0000-0000-0000-000000000001', 
 '{"fa": "صدا و سیمای آذربایجان شرقی", "en": "IRIB East Azerbaijan"}', 
 'irib-east-az', 
 'DEPARTMENT', 
 'irib-east-az', 
 0, 
 TRUE, 
 0);

-- Deputy Directorates (معاونت‌ها)
INSERT INTO "Department" (id, name, slug, type, path, depth, parentId, isActive, sortOrder) VALUES
-- معاونت توسعه و فناوری
('10000000-0000-0000-0000-000000000001',
 '{"fa": "معاونت توسعه و فناوری", "en": "Deputy of Development and Technology"}',
 'deputy-tech',
 'DEPARTMENT',
 'irib-east-az.deputy-tech',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 1),

-- معاونت برنامه‌ریزی
('10000000-0000-0000-0000-000000000002',
 '{"fa": "معاونت برنامه‌ریزی", "en": "Deputy of Planning"}',
 'deputy-planning',
 'DEPARTMENT',
 'irib-east-az.deputy-planning',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 2),

-- معاونت خبر
('10000000-0000-0000-0000-000000000003',
 '{"fa": "معاونت خبر", "en": "Deputy of News"}',
 'deputy-news',
 'DEPARTMENT',
 'irib-east-az.deputy-news',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 3),

-- معاونت سیما
('10000000-0000-0000-0000-000000000004',
 '{"fa": "معاونت سیما", "en": "Deputy of TV"}',
 'deputy-tv',
 'DEPARTMENT',
 'irib-east-az.deputy-tv',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 4),

-- معاونت صدا
('10000000-0000-0000-0000-000000000005',
 '{"fa": "معاونت صدا", "en": "Deputy of Radio"}',
 'deputy-radio',
 'DEPARTMENT',
 'irib-east-az.deputy-radio',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 5);

-- IT Units under Deputy of Technology
INSERT INTO "Department" (id, name, slug, type, path, depth, parentId, isActive, sortOrder) VALUES
-- واحد شبکه
('20000000-0000-0000-0000-000000000001',
 '{"fa": "واحد شبکه و زیرساخت", "en": "Network and Infrastructure Unit"}',
 'unit-network',
 'UNIT',
 'irib-east-az.deputy-tech.unit-network',
 2,
 '10000000-0000-0000-0000-000000000001',
 TRUE,
 1),

-- واحد نرم‌افزار
('20000000-0000-0000-0000-000000000002',
 '{"fa": "واحد نرم‌افزار", "en": "Software Unit"}',
 'unit-software',
 'UNIT',
 'irib-east-az.deputy-tech.unit-software',
 2,
 '10000000-0000-0000-0000-000000000001',
 TRUE,
 2),

-- واحد سخت‌افزار
('20000000-0000-0000-0000-000000000003',
 '{"fa": "واحد سخت‌افزار", "en": "Hardware Unit"}',
 'unit-hardware',
 'UNIT',
 'irib-east-az.deputy-tech.unit-hardware',
 2,
 '10000000-0000-0000-0000-000000000001',
 TRUE,
 3),

-- واحد امنیت
('20000000-0000-0000-0000-000000000004',
 '{"fa": "واحد امنیت اطلاعات", "en": "Information Security Unit"}',
 'unit-security',
 'UNIT',
 'irib-east-az.deputy-tech.unit-security',
 2,
 '10000000-0000-0000-0000-000000000001',
 TRUE,
 4);

-- Administrative Units
INSERT INTO "Department" (id, name, slug, type, path, depth, parentId, isActive, sortOrder) VALUES
-- واحد منابع انسانی
('30000000-0000-0000-0000-000000000001',
 '{"fa": "واحد منابع انسانی", "en": "Human Resources Unit"}',
 'unit-hr',
 'UNIT',
 'irib-east-az.unit-hr',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 10),

-- واحد مالی
('30000000-0000-0000-0000-000000000002',
 '{"fa": "واحد مالی", "en": "Finance Unit"}',
 'unit-finance',
 'UNIT',
 'irib-east-az.unit-finance',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 11),

-- واحد اداری
('30000000-0000-0000-0000-000000000003',
 '{"fa": "واحد اداری", "en": "Administrative Unit"}',
 'unit-admin',
 'UNIT',
 'irib-east-az.unit-admin',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 12);

-- Content Units
INSERT INTO "Department" (id, name, slug, type, path, depth, parentId, isActive, sortOrder) VALUES
-- واحد تولید
('40000000-0000-0000-0000-000000000001',
 '{"fa": "واحد تولید", "en": "Production Unit"}',
 'unit-production',
 'UNIT',
 'irib-east-az.deputy-tv.unit-production',
 2,
 '10000000-0000-0000-0000-000000000004',
 TRUE,
 1),

-- واحد روابط عمومی
('40000000-0000-0000-0000-000000000002',
 '{"fa": "واحد روابط عمومی", "en": "Public Relations Unit"}',
 'unit-pr',
 'UNIT',
 'irib-east-az.unit-pr',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 20),

-- واحد آرشیو
('40000000-0000-0000-0000-000000000003',
 '{"fa": "واحد آرشیو", "en": "Archive Unit"}',
 'unit-archive',
 'UNIT',
 'irib-east-az.unit-archive',
 1,
 '00000000-0000-0000-0000-000000000001',
 TRUE,
 21);
