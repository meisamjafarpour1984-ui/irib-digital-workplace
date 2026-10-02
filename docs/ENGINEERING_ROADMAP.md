# IRIB Digital Workplace Engineering Roadmap

**هدف:** تبدیل workspace فعلی به یک محصول قابل build، قابل تست و قابل استقرار، سپس تکمیل قابلیت‌ها به‌صورت vertical slice.

**مبنای این roadmap:** وضعیت واقعی workspace در 2026-09-16؛ نه صرفاً وضعیت ادعاشده در گزارش‌های قبلی.

## Definition of Done مشترک

هر آیتم فقط زمانی تمام‌شده است که:

- تغییرات با قرارداد فعلی کد سازگار باشند.
- typecheck مربوط به لایه بدون خطا اجرا شود.
- تست مرتبط سبز باشد یا دلیل مستند برای تغییر تست وجود داشته باشد.
- migration و قرارداد API در صورت نیاز به‌روزرسانی شده باشند.
- تغییرات unrelated وارد همان کار نشده باشند.

## P0 - Build Baseline

### P0.1 ثبت baseline و تفکیک تغییرات

- [x] وضعیت فعلی Git، packageها و تست‌ها ثبت شد.
- [ ] تغییرات موجود workspace در یک نقطه مرجع ثبت شود.
- [x] فایل‌های snapshot، archive و خروجی build از ابزارهای validation خارج شدند.

### P0.2 سلامت frontend

- [x] `pnpm typecheck` بدون خطای production source
- [x] `pnpm build` موفق
- [x] رفع mismatchهای export بین implementation و تست‌ها
- [x] تثبیت `ApiClient` با retry، timeout و پیام خطای سازگار
- [x] افزودن `getDashboardData` با cache و invalidation تست‌پذیر
- [x] ایجاد facadeهای سازگار برای hookهای admin/dashboard
- [x] همسان‌سازی Storage، AuthUser، settings و export فایل blob
- [x] همسان‌سازی قراردادهای RBAC و Audit با مصرف‌کننده‌های UI
- [x] ساخت adapterهای Organization tree/stats و Theme tokens/actions
- [x] تثبیت Analytics، Integrations، SMS، Ticket، User و Widget contracts
- [x] رفع compatibilityهای Content/Jalali و blockers مربوط به Next.js build
- [x] ادغام middleware و proxy برای Next.js 16
- [x] حذف warningهای build مربوط به API خارجی و Cache-Control داخلی Next
- [x] hardening دسترسی API خارجی با timeout و fallback کنترل‌شده
- [x] عملیاتی‌کردن PostgreSQL restore و exit code قابل‌اعتماد backup verification
- [x] مهاجرت access token به حافظه و استفاده از HttpOnly refresh cookie
- [x] رفع duplicate dependency/type در TipTap
- [x] اصلاح typeهای role، user و form data

### P0.3 سلامت backend

- [x] `backend/pnpm typecheck` موفق
- [x] `backend/pnpm build` موفق
- [x] هم‌راستاسازی `prisma`، `@prisma/client` و generated client
- [x] اصلاح state transition محتوا و public return typeهای Wizard
- [x] اصلاح mock factoryهای Prisma برای سرویس محتوا
- [x] اصلاح تست‌های رفتاری سرویس محتوا؛ ۱۳ تست سبز
- [x] تثبیت Forms، Organization، Knowledge، Widget، Storage، Theme، System Settings، Tickets، Search و SMS suites
- [x] full backend Jest: ۳۰ suite و ۲۱۶ تست سبز هستند؛ هشدارهای ts-jest نیز با `isolatedModules` رفع شد.
- [ ] حذف تست‌ها و قراردادهای منسوخ Outbox یا پیاده‌سازی قرارداد نهایی

## P1 - Contract and Security

- [ ] تعیین قرارداد نهایی API client و تولید type از OpenAPI یا schema مشترک
- [ ] یکپارچه‌سازی RBAC/ABAC در یک policy boundary
- [ ] تصمیم و اجرای مدل امن refresh token و access token
- [ ] تست منفی برای 401، 403، scope و explicit deny
- [ ] تطبیق کامل OpenAPI YAML با endpointهای واقعی؛ export واقعی اکنون در `backend/docs/contracts/generated-openapi.json` تولید می‌شود.
- [x] اندازه‌گیری drift OpenAPI: YAML دستی ۲۶ مسیر و export واقعی ۲۵۲ مسیر دارد.

## P1 - Architecture Hardening

- [x] انتقال Wizard به `backend/src/devtools/wizard/` و غیرفعال‌سازی آن در production
- [x] یکسان‌سازی proxyهای Next و forward کردن Authorization/Cookie
- [x] اصلاح مسیر Docker backend و حذف ناسازگاری TypeScript/ESM در baseline
- [x] تعیین source of truth برای OpenAPI و حذف drift بین YAML دستی و export واقعی؛ builder مشترک در `backend/src/common/swagger/openapi.ts` برای runtime و export استفاده می‌شود.
- [x] تعیین مالکیت نهایی `infra/` و `backend/infra/`؛ `infra/` برای deployment/workspace-level، `backend/infra/` برای backend-local operations و runtime configs.
- [ ] تحلیل query و ایجاد relation indexهای Prisma بر اساس شواهد production
- [ ] کاهش warningهای lint بدون ورود به refactor گسترده‌ی featureها

## P1 - First Vertical Slice: Content Workflow

- [ ] login و permission check
- [ ] فهرست محتوا
- [ ] ایجاد و ویرایش draft
- [ ] optimistic version check
- [ ] submit for review
- [ ] approve/reject
- [ ] publish و public rendering
- [ ] audit log، notification و outbox event
- [ ] integration test و E2E test کامل این جریان

## P2 - Operational Readiness

- [ ] migration روی database تمیز
- [ ] backup و restore واقعی در staging
- [ ] failure test برای Redis، Kafka و MinIO
- [ ] load test روی محیط مشابه production
- [ ] تعریف SLO برای login، content list، publish و queue lag
- [ ] rollback drill

## ترتیب اجرای فعلی

1. تعیین source of truth قرارداد OpenAPI
2. inventory و تصمیم‌گیری درباره دو مرز infrastructure
3. تحلیل queryهای پرتکرار و relation indexهای Prisma
4. کاهش warningهای lint به‌صورت دسته‌ای و قابل‌تست
5. اجرای validation عملیاتی در staging
6. شروع vertical slice مدیریت محتوا

## معیار عبور از فاز baseline

```text
Frontend typecheck: PASS
Frontend build: PASS
Frontend unit tests: PASS
Backend typecheck: PASS
Backend build: PASS
Backend unit tests: PASS
```
