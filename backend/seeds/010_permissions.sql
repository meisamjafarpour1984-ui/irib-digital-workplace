-- ============================================================
-- IRIB DWP Database — Seeds: Atomic Permissions
-- ============================================================

INSERT INTO atomic_permissions (entity, action, description) VALUES
-- Content Management
('Content', 'CREATE', 'ایجاد محتوای جدید'),
('Content', 'READ', 'مشاهده محتوا'),
('Content', 'UPDATE', 'ویرایش محتوا'),
('Content', 'DELETE', 'حذف محتوا'),
('Content', 'PUBLISH', 'انتشار محتوا'),
('Content', 'APPROVE', 'تأیید محتوا'),
('Content', 'ARCHIVE', 'بایگانی محتوا'),
('Content', 'MANAGE_SCOPE', 'مدیریت دامنه دسترسی محتوا'),

-- Form Management
('Form', 'CREATE', 'ایجاد فرم جدید'),
('Form', 'READ', 'مشاهده فرم'),
('Form', 'UPDATE', 'ویرایش فرم'),
('Form', 'DELETE', 'حذف فرم'),
('Form', 'MANAGE', 'مدیریت تنظیمات فرم'),

-- Form Submission
('FormSubmission', 'CREATE', 'ارسال فرم'),
('FormSubmission', 'READ', 'مشاهده ارسال فرم'),
('FormSubmission', 'UPDATE', 'بررسی و تغییر وضعیت فرم'),
('FormSubmission', 'APPROVE', 'تأیید فرم'),
('FormSubmission', 'REJECT', 'رد فرم'),

-- Media Management
('Media', 'CREATE', 'آپلود فایل'),
('Media', 'READ', 'مشاهده فایل'),
('Media', 'UPDATE', 'ویرایش اطلاعات فایل'),
('Media', 'DELETE', 'حذف فایل'),

-- User Management
('User', 'CREATE', 'ایجاد کاربر جدید'),
('User', 'READ', 'مشاهده اطلاعات کاربر'),
('User', 'UPDATE', 'ویرایش اطلاعات کاربر'),
('User', 'DELETE', 'حذف کاربر'),
('User', 'MANAGE', 'مدیریت کاربران'),

-- Role & Permission Management
('Role', 'CREATE', 'ایجاد نقش جدید'),
('Role', 'READ', 'مشاهده نقش'),
('Role', 'UPDATE', 'ویرایش نقش'),
('Role', 'DELETE', 'حذف نقش'),
('Role', 'MANAGE', 'مدیریت نقش‌ها و مجوزها'),

('UserRole', 'READ', 'مشاهده تخصیص نقش'),
('UserRole', 'MANAGE', 'تخصیص نقش به کاربران'),

-- Organization Management
('Organization', 'READ', 'مشاهده ساختار سازمانی'),
('Organization', 'CREATE', 'ایجاد واحد سازمانی'),
('Organization', 'UPDATE', 'ویرایش واحد سازمانی'),
('Organization', 'DELETE', 'حذف واحد سازمانی'),
('Organization', 'MANAGE', 'مدیریت ساختار سازمان'),

-- Widget & Layout Management
('Widget', 'READ', 'مشاهده ویجت‌ها'),
('Widget', 'MANAGE', 'مدیریت ویجت‌ها'),

('PageLayout', 'READ', 'مشاهده چیدمان صفحه'),
('PageLayout', 'CREATE', 'ایجاد چیدمان جدید'),
('PageLayout', 'UPDATE', 'ویرایش چیدمان صفحه'),
('PageLayout', 'PUBLISH', 'انتشار چیدمان صفحه'),

-- Theme Management
('Theme', 'READ', 'مشاهده تم'),
('Theme', 'MANAGE', 'مدیریت تم و توکن‌ها'),

-- Conversation & Message
('Conversation', 'READ', 'مشاهده مکاتبات'),
('Conversation', 'CREATE', 'ایجاد مکاتبه جدید'),
('Conversation', 'UPDATE', 'تغییر وضعیت مکاتبه'),

('Message', 'READ', 'مشاهده پیام'),
('Message', 'CREATE', 'ارسال پیام'),

-- Notification
('Notification', 'READ', 'مشاهده اعلان'),
('Notification', 'MANAGE', 'مدیریت اعلان‌ها'),

-- Software Management
('Software', 'READ', 'مشاهده نرم‌افزار'),
('Software', 'CREATE', 'افزودن نرم‌افزار'),
('Software', 'UPDATE', 'ویرایش نرم‌افزار'),
('Software', 'DELETE', 'حذف نرم‌افزار'),
('Software', 'MANAGE', 'مدیریت مرکز نرم‌افزار'),

-- Ticket Management
('Ticket', 'CREATE', 'ثبت تیکت جدید'),
('Ticket', 'READ', 'مشاهده تیکت'),
('Ticket', 'UPDATE', 'بررسی و پاسخ تیکت'),
('Ticket', 'MANAGE', 'مدیریت تیکت‌ها'),

-- Analytics & Reporting
('Analytics', 'READ', 'مشاهده تحلیل و آمار'),
('Analytics', 'EXPORT', 'خروجی گزارش'),

('AuditLog', 'CREATE', 'ثبت لاگ فعالیت'),
('AuditLog', 'READ', 'مشاهده لاگ فعالیت'),

-- System Settings
('SystemSetting', 'READ', 'مشاهده تنظیمات سیستم'),
('SystemSetting', 'MANAGE', 'تغییر تنظیمات سیستم'),

-- Expert & Knowledge
('Expert', 'READ', 'مشاهده پروفایل کارشناس'),
('Expert', 'CREATE', 'ایجاد پروفایل کارشناس'),
('Expert', 'UPDATE', 'ویرایش پروفایل کارشناس'),
('Expert', 'DELETE', 'حذف پروفایل کارشناس'),
('Expert', 'MANAGE', 'مدیریت بانک کارشناسان'),

-- Afish (Structured Forms)
('Afish', 'CREATE', 'ایجاد آفیش جدید'),
('Afish', 'READ', 'مشاهده آفیش'),
('Afish', 'UPDATE', 'ویرایش آفیش'),
('Afish', 'LOCK', 'قفل کردن آفیش'),
('Afish', 'PRINT', 'چاپ/پی‌دی‌اف آفیش'),
('Afish', 'ARCHIVE', 'بایگانی آفیش')

ON CONFLICT (entity, action) DO NOTHING;
