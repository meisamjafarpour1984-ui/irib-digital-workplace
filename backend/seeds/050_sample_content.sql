-- ============================================================
-- IRIB DWP Database — Seeds: Sample Content
-- ============================================================

-- Sample Categories
INSERT INTO "Category" (id, name, slug, sortOrder) VALUES
('cat-001', '{"fa": "اخبار داخلی", "en": "Internal News"}', 'internal-news', 1),
('cat-002', '{"fa": "اطلاعیه‌ها", "en": "Announcements"}', 'announcements', 2),
('cat-003', '{"fa": "رویدادها", "en": "Events"}', 'events', 3),
('cat-004', '{"fa": "گالری تصاویر", "en": "Photo Gallery"}', 'gallery', 4);

-- Sample Tags
INSERT INTO "Tag" (id, name, slug) VALUES
('tag-001', 'معاونت', 'deputy'),
('tag-002', 'فناوری', 'technology'),
('tag-003', 'رویداد', 'event'),
('tag-004', 'جشنواره', 'festival'),
('tag-005', 'تولید', 'production');

-- Sample News Content
INSERT INTO "Content" (
    id, contentType, status, slug, title, excerpt, body, 
    metadata, authorId, publishedAt, version
) VALUES
('cont-001', 'NEWS', 'PUBLISHED', 'first-deputy-meeting-1403', 
 '{"fa": "جلسه اول معاونت توسعه در سال ۱۴۰۳", "en": "First Deputy Meeting of 1403"}',
 '{"fa": "جلسه معاونت توسعه و فناوری برای برنامه‌ریزی سال جدید برگزار شد.", "en": "Deputy of Development and Technology meeting held for new year planning."}',
 '{"fa": "<p>جلسه معاونت توسعه و فناوری صدا و سیمای آذربایجان شرقی روز دوشنبه با حضور مدیران واحدهای مختلف برگزار شد.</p><p>در این جلسه اهداف و برنامه‌های سال ۱۴۰۳ مورد بحث و بررسی قرار گرفت.</p>", "en": "<p>The meeting of the Deputy of Development and Technology of IRIB East Azerbaijan was held on Monday with the presence of managers of various units.</p><p>In this meeting, the goals and programs for the year 1403 were discussed and reviewed.</p>"}',
 '{"featured": true, "image": "/images/meeting.jpg", "priority": "high"}',
 (SELECT id FROM "User" WHERE personnelCode = '10001'),
 NOW(),
 1),

('cont-002', 'NEWS', 'PUBLISHED', 'new-network-infrastructure',
 '{"fa": "ارتقای زیرساخت شبکه", "en": "Network Infrastructure Upgrade"}',
 '{"fa": "زیرساخت شبکه مرکزی ارتقا یافت و سرعت اینترنت افزایش یافت.", "en": "Central network infrastructure upgraded and internet speed increased."}',
 '{"fa": "<p>با تلاش واحد شبکه و زیرساخت، زیرساخت شبکه مرکزی ارتقا یافت.</p><p>این ارتقا شامل جایگزینی سوئیچ‌های قدیمی با مدل‌های جدید و افزایش پهنای باند بود.</p>", "en": "<p>With the efforts of the Network and Infrastructure Unit, the central network infrastructure was upgraded.</p><p>This upgrade included replacing old switches with new models and increasing bandwidth.</p>"}',
 '{"featured": false, "image": "/images/network.jpg", "priority": "normal"}',
 (SELECT id FROM "User" WHERE personnelCode = '10005'),
 NOW(),
 1),

('cont-003', 'ANNOUNCEMENT', 'PUBLISHED', 'spring-holidays-1403',
 '{"fa": "تعطیلات نوروز ۱۴۰۳", "en": "Nowruz 1403 Holidays"}',
 '{"fa": "ساعات کاری و تعطیلات ایام نوروز اعلام شد.", "en": "Working hours and Nowruz holidays announced."}',
 '{"fa": "<p>ضمن تبریک سال نو، ساعات کاری ایام نوروز به شرح زیر است:</p><ul><li>۲۵ اسفند تا ۵ فروردین: تعطیل</li><li>۶ فروردین onwards:恢复正常</li></ul>", "en": "<p>Congratulating the New Year, the working hours during Nowruz are as follows:</p><ul><li>March 16 to March 26: Closed</li><li>March 27 onwards: Normal hours</li></ul>"}',
 '{"featured": true, "priority": "high"}',
 (SELECT id FROM "User" WHERE personnelCode = '10002'),
 NOW(),
 1),

('cont-004', 'EVENT', 'PUBLISHED', 'tech-festival-1403',
 '{"fa": "جشنواره فناوری ۱۴۰۳", "en": "Technology Festival 1403"}',
 '{"fa": "جشنواره فناوری و نوآوری در تابستان ۱۴۰۳ برگزار می‌شود.", "en": "Technology and Innovation Festival will be held in summer 1403."}',
 '{"fa": "<p>جشنواره فناوری و نوآوری صدا و سیمای آذربایجان شرقی در تیر ماه ۱۴۰۳ برگزار می‌شود.</p><p>علاقه‌مندان می‌توانند تا ۱۵ خرداد آثار خود را ثبت کنند.</p>", "en": "<p>The Technology and Innovation Festival of IRIB East Azerbaijan will be held in July 1403.</p><p>Interested parties can submit their works until June 5.</p>"}',
 '{"featured": true, "eventDate": "1403-04-15", "eventLocation": "تهران", "priority": "high"}',
 (SELECT id FROM "User" WHERE personnelCode = '10009'),
 NOW(),
 1);

-- Content Categories
INSERT INTO "ContentCategory" (contentId, categoryId) VALUES
('cont-001', 'cat-001'),
('cont-002', 'cat-001'),
('cont-003', 'cat-002'),
('cont-004', 'cat-003');

-- Content Tags
INSERT INTO "ContentTag" (contentId, tagId) VALUES
('cont-001', 'tag-001'),
('cont-001', 'tag-002'),
('cont-002', 'tag-002'),
('cont-003', 'tag-003'),
('cont-004', 'tag-003'),
('cont-004', 'tag-004');

-- Content Scope (assign content to departments)
INSERT INTO "ContentScope" (contentId, departmentId) VALUES
('cont-001', (SELECT id FROM "Department" WHERE slug = 'irib-east-az')),
('cont-002', (SELECT id FROM "Department" WHERE slug = 'unit-network')),
('cont-003', (SELECT id FROM "Department" WHERE slug = 'irib-east-az')),
('cont-004', (SELECT id FROM "Department" WHERE slug = 'irib-east-az'));
