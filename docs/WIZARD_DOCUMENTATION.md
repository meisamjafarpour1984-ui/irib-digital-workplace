# مستندات جامع ویزارد سیستم IRIB Digital Workplace

## مقدمه

ویزارد سیستم IRIB Digital Workplace یک ابزار یکپارچه و حرفه‌ای برای مدیریت کامل lifecycle پروژه است. این ویزارد تمامی عملیات لازم برای setup، configuration، و management را در یک API واحد فراهم می‌کند.

---

## معماری ویزارد

### مسیر API پایه

```
/api/v1/admin/wizard
```

### حالت‌های عملیاتی

- **Development:** برای محیط توسعه محلی
- **Production:** برای محیط production

---

## بخش‌های ویزارد

### ۱. مراحل Setup (Setup Steps)

#### ۱.۱. Health Check (بررسی سلامت سیستم)

- **مسیر:** `POST /steps/health-check/execute`
- **توضیح:** بررسی سلامت کامل سیستم شامل Node.js، PostgreSQL، Redis، Docker و منابع سیستم
- **نتیجه:**
  - `nodeVersion`: نسخه Node.js
  - `postgres`: وضعیت اتصال PostgreSQL
  - `redis`: وضعیت اتصال Redis
  - `diskSpace`: فضای دیسک موجود
  - `memory`: مصرف حافظه
  - `dockerRunning`: وضعیت Docker
  - `isContainerized`: آیا درون container اجرا می‌شود
  - `platform`: سیستم عامل
  - `dockerInfo`: اطلاعات Docker (در صورت وجود)
- **توصیه‌ها در صورت مشکل:**
  - اگر `postgres` false است: بررسی کنید PostgreSQL container اجرا شده است
  - اگر `redis` false است: بررسی کنید Redis container اجرا شده است
  - اگر `dockerRunning` false است: Docker را نصب و اجرا کنید
  - اگر `diskSpace` کم است: فضای دیسک را آزاد کنید

#### ۱.۲. Security Setup (تنظیمات امنیتی)

- **مسیر:** `POST /steps/security-setup/execute`
- **توضیح:** تولید کلیدهای رمزنگاری برای امنیت سیستم
- **نتیجه:**
  - `encryptionKey`: کلید رمزنگاری (64 hex characters)
  - `jwtSecret`: JWT secret (64 hex characters)
  - `sessionSecret`: Session secret (64 hex characters)
  - `warning`: هشدار برای ذخیره کلیدها
- **توصیه‌ها در صورت مشکل:**
  - **بسیار مهم:** کلیدهای تولید شده را فوراً در environment variables ذخیره کنید
  - اگر کلیدها از دست بروند، تمامی sessionها و tokens نامعتبر می‌شوند
  - کلیدها را در یک مکان امن نگه دارید و در git commit نکنید

#### ۱.۳. Database Setup (تنظیمات دیتابیس)

- **مسیر:** `POST /steps/database-setup/execute`
- **توضیح:** بررسی و تنظیم schema، migrations و seed data
- **نتیجه:**
  - `schemaSync`: وضعیت sync شدن schema
  - `migrations`: وضعیت migrations
  - `seedData`: آمادگی seed data
  - `tables`: لیست جداول موجود
- **توصیه‌ها در صورت مشکل:**
  - اگر `schemaSync` false است: `npx prisma db push` را اجرا کنید
  - اگر `migrations` up-to-date نیست: `npx prisma migrate deploy` را اجرا کنید
  - اگر `seedData` ready نیست: `pnpm dlx ts-node prisma/seed.ts` را اجرا کنید

#### ۱.۴. Docker Check (بررسی Docker) - فقط Development

- **مسیر:** `POST /steps/docker-check/execute`
- **توضیح:** بررسی نصب و اجرای Docker و Docker Compose
- **نتیجه:**
  - `dockerRunning`: وضعیت اجرای Docker
  - `dockerComposeReady`: آمادگی Docker Compose
  - `imagesPulled`: وضعیت pull شدن images
  - `isContainerized`: آیا درون container است
- **توصیه‌ها در صورت مشکل:**
  - اگر `dockerRunning` false است: Docker Desktop را نصب و اجرا کنید
  - اگر `dockerComposeReady` false است: Docker Compose را نصب کنید
  - اگر `imagesPulled` false است: `docker-compose pull` را اجرا کنید

#### ۱.۵. Install Dependencies (نصب Dependencies) - فقط Development

- **مسیر:** `POST /steps/install-dependencies/execute`
- **توضیح:** نصب dependencies با pnpm workspace
- **نتیجه:**
  - `workspace`: نصب workspace
  - `frontend`: نصب dependencies frontend
  - `backend`: نصب dependencies backend
- **توصیه‌ها در صورت مشکل:**
  - اگر `workspace` false است: pnpm را نصب کنید
  - اگر `frontend` یا `backend` false است: `pnpm install` را دستی اجرا کنید
  - اگر خطای network دارید: VPN یا proxy را بررسی کنید

#### ۱.۶. Environment Configuration (تنظیم Environment Variables) - فقط Development

- **مسیر:** `POST /steps/env-config/execute`
- **توضیح:** ایجاد و تنظیم فایل‌های .env
- **نتیجه:**
  - `envFilesCreated`: ایجاد فایل‌های env
  - `envVarsConfigured`: تنظیم متغیرها
  - `nextStep`: مرحله بعدی
- **توصیه‌ها در صورت مشکل:**
  - فایل `.env.example` را به `.env` کپی کنید
  - مقادیر مناسب را در `.env` تنظیم کنید
  - از commit کردن `.env` به git جلوگیری کنید

#### ۱.۷. Start Services (راه‌اندازی سرویس‌ها) - فقط Development

- **مسیر:** `POST /steps/start-services/execute`
- **توضیح:** راه‌اندازی Docker services
- **نتیجه:**
  - `servicesStarted`: وضعیت شروع سرویس‌ها
  - `services`: لیست سرویس‌ها
  - `note`: یادآوری برای frontend
- **توصیه‌ها در صورت مشکل:**
  - اگر سرویس‌ها شروع نشدند: `docker-compose logs` را بررسی کنید
  - اگر خطای port دارید: پورت‌های اشغال شده را آزاد کنید
  - frontend را جداگانه با `npm run dev` شروع کنید

#### ۱.۸. Run Tests (اجرای تست‌ها) - اختیاری

- **مسیر:** `POST /steps/run-tests/execute`
- **توضیح:** اجرای unit tests و integration tests
- **نتیجه:**
  - `backend.passed`: تعداد تست‌های موفق
  - `backend.failed`: تعداد تست‌های ناموفق
  - `backend.total`: تعداد کل تست‌ها
- **توصیه‌ها در صورت مشکل:**
  - اگر تست‌ها fail شدند: کد را بررسی و اصلاح کنید
  - اگر تستی وجود ندارد: تست‌ها را بنویسید

#### ۱.۹. Service Configuration (تنظیمات سرویس‌ها) - فقط Production

- **مسیر:** `POST /steps/service-config/execute`
- **توضیح:** تنظیم Keycloak، SMS، Email و Storage
- **نتیجه:**
  - `keycloak`: تنظیمات Keycloak
  - `sms`: تنظیمات SMS
  - `email`: تنظیمات Email
  - `storage`: تنظیمات Storage
- **توصیه‌ها در صورت مشکل:**
  - Keycloak را نصب و configure کنید
  - SMS gateway را تنظیم کنید
  - SMTP server را configure کنید
  - MinIO یا S3 را تنظیم کنید

#### ۱.۱۰. Initialize Settings (مقداردهی اولیه تنظیمات) - فقط Production

- **مسیر:** `POST /steps/initialize-settings/execute`
- **توضیح:** تنظیمات پیش‌فرض سیستم و feature flags
- **نتیجه:**
  - `settingsInitialized`: وضعیت تنظیمات
  - `adminUserExists`: وجود admin user
  - `adminRoleExists`: وجود admin role
- **توصیه‌ها در صورت مشکل:**
  - اگر `adminUserExists` false است: seed script را اجرا کنید
  - اگر `adminRoleExists` false است: seed script را اجرا کنید

#### ۱.۱۱. Pre-Deployment Checklist (چک‌لیست قبل از تحویل) - فقط Production

- **مسیر:** `POST /steps/pre-deployment-checklist/execute`
- **توضیح:** اعتبارسنجی امنیتی و تنظیمات
- **نتیجه:**
  - `security`: وضعیت امنیت
  - `database`: وضعیت دیتابیس
  - `services`: وضعیت سرویس‌ها
  - `score`: امتیاز کلی
  - `warnings`: لیست هشدارها
- **توصیه‌ها در صورت مشکل:**
  - اگر `score` کم است: هشدارها را برطرف کنید
  - اگر `encryptionKey` warning دارد: کلید را در env vars ذخیره کنید
  - قبل از deployment backup بگیرید

#### ۱.۱۲. Verify Application (تطبیق برنامه)

- **مسیر:** `POST /steps/verify-app/execute`
- **توضیح:** تست connectivity و basic functionality
- **نتیجه:**
  - `databaseConnection`: اتصال دیتابیس
  - `backendReachable`: دسترسی به backend
- **توصیه‌ها در صورت مشکل:**
  - اگر `databaseConnection` false است: PostgreSQL را بررسی کنید
  - اگر `backendReachable` false است: backend container را بررسی کنید

---

### ۲. مدیریت سیستم (System Management)

#### ۲.۱. Reset Database (بازنشانی دیتابیس)

- **مسیر:** `POST /management/reset-database`
- **توضیح:** حذف تمام داده‌های دیتابیس (DESTRUCTIVE)
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
  - `nextStep`: دستور بعدی
- **توصیه‌ها در صورت مشکل:**
  - **هشدار:** این عملیات تمامی داده‌ها را حذف می‌کند
  - قبل از اجرا backup بگیرید
  - پس از اجرا seed script را اجرا کنید

#### ۲.۲. Reset Redis (بازنشانی Redis)

- **مسیر:** `POST /management/reset-redis`
- **توضیح:** پاک کردن cache Redis
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
  - `command`: دستور اجرایی
- **توصیه‌ها در صورت مشکل:**
  - اگر دستور ناموفق بود: `docker-compose exec redis redis-cli FLUSHALL` را دستی اجرا کنید
  - Redis container را بررسی کنید

#### ۲.۳. Reset All (بازنشانی کل سیستم)

- **مسیر:** `POST /management/reset-all`
- **توضیح:** بازنشانی دیتابیس و Redis (DESTRUCTIVE)
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - **هشدار:** این عملیات تمامی داده‌ها را حذف می‌کند
  - قبل از اجرا backup بگیرید
  - پس از اجرا seed script را اجرا کنید

#### ۲.۴. Backup Current State (پشتیبان‌گیری)

- **مسیر:** `POST /management/backup`
- **توضیح:** ایجاد backup از وضعیت فعلی
- **نتیجه:**
  - `timestamp`: زمان backup
  - `version`: نسخه
  - `settings`: تنظیمات
  - `databaseSchema`: schema دیتابیس
- **توصیه‌ها در صورت مشکل:**
  - backup را در مکانی امن ذخیره کنید
  - از backup تست کنید

#### ۲.۵. Restore from Backup (بازگردانی از backup)

- **مسیر:** `POST /management/restore`
- **توضیح:** بازگردانی از backup
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - backup را قبل از restore بررسی کنید
  - از compatibility نسخه مطمئن شوید

#### ۲.۶. Stop Services (توقف سرویس‌ها)

- **مسیر:** `POST /management/stop-services`
- **توضیح:** توقف تمام Docker services
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - اگر سرویس‌ها توقف نشدند: `docker-compose down -f` را اجرا کنید
  - containerهای گیر کرده را با `docker kill` متوقف کنید

#### ۲.۷. Restart Services (راه‌اندازی مجدد سرویس‌ها)

- **مسیر:** `POST /management/restart-services`
- **توضیح:** راه‌اندازی مجدد تمام Docker services
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - اگر سرویس‌ها راه‌اندازی نشدند: logs را بررسی کنید
  - از صحت docker-compose.yml مطمئن شوید

#### ۲.۸. Clean Everything (پاکسازی کامل)

- **مسیر:** `POST /management/clean-everything`
- **توضیح:** حذف تمام سرویس‌ها و volumes (DESTRUCTIVE)
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - **هشدار:** این عملیات تمامی داده‌ها را حذف می‌کند
  - قبل از اجرا backup بگیرید
  - پس از اجرا همه چیز از نو باید setup شود

---

### ۳. مدیریت Docker (Docker Management)

#### ۳.۱. Get Docker Containers (دریافت لیست containerها)

- **مسیر:** `GET /docker/containers`
- **توضیح:** دریافت لیست تمام Docker containers
- **نتیجه:**
  - `id`: شناسه container
  - `name`: نام container
  - `status`: وضعیت container
  - `state`: state container
  - `created`: زمان ایجاد
  - `image`: image استفاده شده
- **توصیه‌ها در صورت مشکل:**
  - اگر لیست خالی است: Docker را بررسی کنید
  - اگر containerها در حال اجرا نیستند: آنها را start کنید

#### ۳.۲. Start Container (راه‌اندازی container)

- **مسیر:** `POST /docker/containers/:id/start`
- **توضیح:** راه‌اندازی یک Docker container
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - اگر container start نشد: logs را بررسی کنید
  - از صحت image و configuration مطمئن شوید
  - پورت‌های اشغال شده را بررسی کنید

#### ۳.۳. Stop Container (توقف container)

- **مسیر:** `POST /docker/containers/:id/stop`
- **توضیح:** توقف یک Docker container
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - اگر container توقف نشد: `docker kill` را استفاده کنید
  - از وجود processهای گیر کرده مطمئن شوید

#### ۳.۴. Restart Container (راه‌اندازی مجدد container)

- **مسیر:** `POST /docker/containers/:id/restart`
- **توضیح:** راه‌اندازی مجدد یک Docker container
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
- **توصیه‌ها در صورت مشکل:**
  - اگر container restart نشد: logs را بررسی کنید
  - از صحت configuration مطمئن شوید

#### ۳.۵. Get Container Logs (دریافت logs container)

- **مسیر:** `GET /docker/containers/:id/logs?tail=100`
- **توضیح:** دریافت logs یک Docker container
- **نتیجه:**
  - `logs`: متن logs
- **توصیه‌ها در صورت مشکل:**
  - اگر logs خالی است: container را بررسی کنید
  - اگر logs زیاد است: `tail` را افزایش دهید

#### ۳.۶. Execute Docker Compose (اجرای docker-compose)

- **مسیر:** `POST /docker/compose`
- **توضیح:** اجرای دستور docker-compose
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `message`: پیام نتیجه
  - `command`: دستور اجرا شده
  - `stdout`: خروجی استاندارد
  - `stderr`: خطای استاندارد
- **توصیه‌ها در صورت مشکل:**
  - از صحت docker-compose.yml مطمئن شوید
  - Docker daemon را بررسی کنید
  - syntax را بررسی کنید

#### ۳.۷. Execute Backend Command (اجرای دستور در backend container)

- **مسیر:** `POST /docker/backend-command`
- **توضیح:** اجرای دستور در backend container
- **نتیجه:**
  - `success`: موفقیت عملیات
  - `stdout`: خروجی استاندارد
  - `stderr`: خطای استاندارد
- **توصیه‌ها در صورت مشکل:**
  - اگر backend container اجرا نیست: آن را start کنید
  - از صحت دستور مطمئن شوید
  - permissions را بررسی کنید

#### ۳.۸. Get Docker Info (دریافت اطلاعات Docker)

- **مسیر:** `GET /docker/info`
- **توضیح:** دریافت اطلاعات سیستم Docker
- **نتیجه:**
  - اطلاعات کامل Docker (JSON)
- **توصیه‌ها در صورت مشکل:**
  - اگر اطلاعات دریافت نشد: Docker daemon را بررسی کنید
  - از اجرای Docker مطمئن شوید

---

### ۴. Health Status (وضعیت سلامت)

#### ۴.۱. Get System Health (دریافت وضعیت سلامت سیستم)

- **مسیر:** `GET /health`
- **توضیح:** دریافت وضعیت سلامت کامل سیستم
- **نتیجه:**
  - همان نتیجه Health Check
- **توصیه‌ها در صورت مشکل:**
  - همان توصیه‌های Health Check

---

## مثال‌های استفاده

### مثال ۱: اجرای کامل setup در حالت development

```bash
# 1. دریافت مراحل
GET /api/v1/admin/wizard/steps?mode=development

# 2. اجرای هر مرحله
POST /api/v1/admin/wizard/steps/health-check/execute
POST /api/v1/admin/wizard/steps/security-setup/execute
POST /api/v1/admin/wizard/steps/database-setup/execute
POST /api/v1/admin/wizard/steps/docker-check/execute
POST /api/v1/admin/wizard/steps/install-dependencies/execute
POST /api/v1/admin/wizard/steps/env-config/execute
POST /api/v1/admin/wizard/steps/start-services/execute
POST /api/v1/admin/wizard/steps/verify-app/execute
```

### مثال ۲: مدیریت Docker containers

```bash
# دریافت لیست containers
GET /api/v1/admin/wizard/docker/containers

# راه‌اندازی یک container
POST /api/v1/admin/wizard/docker/containers/{id}/start

# دریافت logs
GET /api/v1/admin/wizard/docker/containers/{id}/logs?tail=200
```

### مثال ۳: اجرای دستور در backend container

```bash
POST /api/v1/admin/wizard/docker/backend-command
{
  "command": "pnpm dlx ts-node prisma/seed.ts"
}
```

---

## توصیه‌های عمومی

### قبل از استفاده

1. از نصب Docker و Docker Compose مطمئن شوید
2. از اجرای Docker daemon مطمئن شوید
3. فضای دیسک کافی داشته باشید
4. از وجود Node.js و pnpm مطمئن شوید

### حین استفاده

1. مراحل را به ترتیب اجرا کنید
2. نتیجه هر مرحله را بررسی کنید
3. در صورت خطا، توصیه‌ها را دنبال کنید
4. logs را مرتب بررسی کنید

### پس از استفاده

1. کلیدهای امنیتی را در env vars ذخیره کنید
2. backup بگیرید
3. documentation را به‌روز کنید
4. team را مطلع کنید

---

## عیب‌یابی (Troubleshooting)

### مشکلات رایج

#### ۱. Docker container start نمی‌شود

- **علت:** پورت اشغال شده
- **راه‌حل:** پورت را آزاد کنید یا پورت را تغییر دهید

#### ۲. Database connection failed

- **علت:** PostgreSQL container اجرا نشده
- **راه‌حل:** PostgreSQL container را start کنید

#### ۳. Redis connection failed

- **علت:** Redis container اجرا نشده
- **راه‌حل:** Redis container را start کنید

#### ۴. Seed script failed

- **علت:** schema sync نشده
- **راه‌حل:** `npx prisma db push` را اجرا کنید

#### ۵. Docker command failed

- **علت:** Docker daemon اجرا نیست
- **راه‌حل:** Docker Desktop را اجرا کنید

#### ۶. Backend command failed

- **علت:** Backend container اجرا نیست
- **راه‌حل:** Backend container را start کنید

---

## امنیت

### نکات امنیتی

1. کلیدهای امنیتی را هرگز در git commit نکنید
2. از environment variables استفاده کنید
3. از strong passwords استفاده کنید
4. از HTTPS در production استفاده کنید
5. از rate limiting استفاده کنید

### Permissions

- همه endpoints نیاز به authentication دارند
- admin role برای دسترسی لازم است
- JWT token در header Authorization باید ارسال شود

---

## پشتیبانی

برای گزارش مشکلات یا سوالات، با تیم توسعه تماس بگیرید.

---

**نسخه:** 1.0  
**تاریخ:** 2026-09-08  
**توسعه‌دهنده:** میثم جعفرپور آلانق
