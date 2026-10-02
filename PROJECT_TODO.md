# IRIB Digital Workplace — لیست کاری پروژه

**آخرین بروزرسانی:** ۱۴۰۵/۰۶/۲۵ (۲۰۲۶-۰۹-۱۶)  
**وضعیت baseline فنی:** پایدار و قابل build/test؛ hardening معماری در جریان است

---

## P0 — Critical (بحرانی)

| #    | تسک                                                                 | وضعیت       | اولویت   | پیشرفت   | یادداشت                                                                                                                              |
| ---- | ------------------------------------------------------------------- | ----------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| P0-1 | پیاده‌سازی Query Timeout Middleware برای جلوگیری از Pool Exhaustion | ✅ انجام شد | Critical | **۱۰۰٪** | سه لایه: HTTP AbortController (408) + Prisma Slow Query Logging + SET LOCAL statement_timeout سازگار با PgBouncer · ۲۱ تست واحد PASS |
| P0-2 | تکمیل پوشش تست برای ماژول‌های Core (Audit, Notification, Analytics) | ✅ انجام شد | Critical | **۱۰۰٪** | پوشش تست کامل: Audit (۱۴ تست)، Notification (۱۸ تست)، Analytics (۸ تست) · مجموع ۴۰ تست واحد جدید اضافه شد                            |
| P0-3 | اتصال و یکپارچه‌سازی Keycloak Migration                             | ✅ انجام شد | Critical | **۱۰۰٪** | Controller و Service پیاده‌سازی شده · ۸ تست E2E برای مهاجرت کاربران، همگام‌سازی تک‌کاربر، و آمار مهاجرت اضافه شد                     |

---

## P1 — High (بالا)

| #    | تسک                                                          | وضعیت       | اولویت | پیشرفت   | یادداشت                                                                                                                                                                                                                          |
| ---- | ------------------------------------------------------------ | ----------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-1 | پیاده‌سازی Load Testing با k6/Gatling                        | ✅ انجام شد | High   | **۱۰۰٪** | ۳ اسکریپت k6 ایجاد شد: api-load-test.js (تست بار عمومی)، connection-pool-test.js (تست Connection Pool با ۲۰۰ کاربر)، partition-table-test.js (تست جداول پارتیشن‌بندی شده) · مستندات کامل در load-testing/README.md               |
| P1-2 | راه‌اندازی Production PgBouncer با Transaction Pooling       | ✅ انجام شد | High   | **۱۰۰٪** | pgbouncer.ini ایجاد شد با transaction pooling · deployment.yaml برای Kubernetes · README.md مستندات کامل · Prisma relationMode="prisma" تنظیم شده · connection limits: max_client_conn=1000, default_pool_size=25                |
| P1-3 | تکمیل Integration Tests برای Outbox Pattern + Kafka          | ✅ انجام شد | High   | **۱۰۰٪** | ۱۲ تست Integration اضافه شد در outbox.integration.spec.ts · پوشش: publishEvent با Kafka، retryFailedEvents، Kafka connection lifecycle، error handling، outbox-only mode                                                         |
| P1-4 | پیاده‌سازی Backup Strategy خودکار (Postgres + MinIO + Redis) | ✅ انجام شد | High   | **۱۰۰٪** | CronJob کامل شد · ۴ CronJob در backup-cronjob.yaml (postgres-backup, postgres-backup-verify, redis-backup, minio-backup) · اسکریپت verify-backups.sh برای تست صحت backup · retention policy: ۷ روز                               |
| P1-5 | راه‌اندازی Alerting و On-Call Rotation در Prometheus/Grafana | ✅ انجام شد | High   | **۱۰۰٪** | alerts.yml به‌روزرسانی شد · ۱۸ alert rule جامع اضافه شد (Backend: ۵، Database: ۵، Redis: ۳، Kafka: ۳، System: ۴) · team labels و runbook URLs اضافه شد · مستندات کامل on-call-rotation.md ایجاد شد · Grafana dashboard موجود است |

---

## P2 — Medium (متوسط)

| #    | تسک                                                             | وضعیت       | اولویت | پیشرفت   | یادداشت                                                                                                                                                                                                                      |
| ---- | --------------------------------------------------------------- | ----------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-1 | بهینه‌سازی BRIN Index برای جداول جدید (OutboxEvent, SmsMessage) | ✅ انجام شد | Medium | **۱۰۰٪** | Migration V031 ایجاد شد · ۵ BRIN index برای OutboxEvent (createdAt, status+createdAt) · ۴ BRIN index برای SmsMessage (createdAt, status+createdAt, campaignId+createdAt) · B-tree indexes برای point queries حفظ شد          |
| P2-2 | تکمیل مستندسازی API با Swagger/OpenAPI                          | ✅ انجام شد | Medium | **۱۰۰٪** | openapi.yaml به‌روزرسانی شد · ۱۵ endpoint جدید اضافه شد (Audit: ۳، Notifications: ۵، Analytics: ۳، Keycloak: ۳) · ۵ schema جدید (AuditLog, Notification, KPI, ContentStats, ErrorResponse) · توضیحات authentication اضافه شد |
| P2-3 | پیاده‌سازی Rate Limiting پیشرفته (Per-User + Per-Endpoint)      | ✅ انجام شد | Medium | **۱۰۰٪** | rate-limit.middleware.ts به‌روزرسانی شد · perUser و perEndpoint options اضافه شد · endpointLimits برای محدودیت‌های اختصاصی هر endpoint · Redis-based distributed rate limiting موجود است                                     |
| P2-4 | اتمام Widget Engine Stories در Storybook                        | ✅ انجام شد | Medium | **۱۰۰٪** | **۱۲ ویجت** از ۱۲ ویجت مستقل دارای Story هستند (۱۲ فایل stories.tsx یافت‌شده · همه ویجت‌های اصلی پوشش داده شده‌اند)                                                                                                          |
| P2-5 | پیاده‌سازی E2E Tests برای صفحات اصلی (Login, Dashboard, Admin)  | ✅ انجام شد | Medium | **۱۰۰٪** | ۵ فایل Playwright test موجود · auth.spec.ts (۴ تست برای Login)، dashboard.spec.ts (۷ تست برای Dashboard)، admin.spec.ts (۶ test suite برای Admin) · پوشش کامل صفحات اصلی                                                     |

---

## P3 — Low (پایین)

| #    | تسک                                                             | وضعیت       | اولویت | پیشرفت   | یادداشت                                                                                                                                                                                                                                           |
| ---- | --------------------------------------------------------------- | ----------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-1 | مستندسازی Deployment Runbook (Staging → Prod)                   | ✅ انجام شد | Low    | **۱۰۰٪** | docs/DEPLOYMENT_RUNBOOK.md ایجاد شد · شامل Pre-deployment checklist · Staging و Production deployment procedures · Rollback procedures کامل · Post-deployment verification · Troubleshooting guide                                                |
| P3-2 | ایجاد Script بهینه‌سازی Database VACUUM / REINDEX زمان‌بندی شده | ✅ انجام شد | Low    | **۱۰۰٪** | db-maintenance-vacuum.sh ایجاد شد (VACUUM ANALYZE هفتگی) · db-maintenance-reindex.sh ایجاد شد (REINDEX ماهانه) · db-maintenance-cronjob.yaml برای Kubernetes · گزارش آمار جداول و ایندکس‌ها                                                       |
| P3-3 | بهینه‌سازی Bundle Size Frontend (Tree Shaking + Code Splitting) | ✅ انجام شد | Low    | **۱۰۰٪** | next.config.mjs به‌روزرسانی شد · Webpack splitChunks برای code splitting · Tree shaking با usedExports و sideEffects · Module concatenation · Runtime chunk برای production · analyze-bundle.js موجود برای monitoring                             |
| P3-4 | پیاده‌سازی Feature Flags غنی‌تر (A/B Testing + Rollout Gradual) | ✅ انجام شد | Low    | **۱۰۰٪** | feature-flag.service.ts ایجاد شد · A/B testing با variants و percentage-based assignment · Gradual rollout با rolloutPercentage · Target users, roles, departments · Date range support · Caching برای performance · Integration با SystemSetting |

---

## P4 — Architecture Hardening (بهبود معماری)

| #    | تسک                                         | وضعیت               | اولویت | پیشرفت   | یادداشت                                                                                                                                                                                                                                                                                                                           |
| ---- | ------------------------------------------- | ------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P4-1 | ایزوله‌سازی Wizard توسعه                    | ✅ انجام شد         | High   | **۱۰۰٪** | انتقال API به `backend/src/devtools/wizard/`، فعال‌سازی فقط خارج از production، feature flag برای frontend و proxy داخلی `/api/wizard`                                                                                                                                                                                            |
| P4-2 | یکپارچه‌سازی قرارداد API و احراز هویت proxy | ✅ انجام شد         | High   | **۱۰۰٪** | helper مشترک backend request، forward شدن Authorization/Cookie، حذف upload مستقیم و hard-code شدن API از Storage/Wizard                                                                                                                                                                                                           |
| P4-3 | تثبیت baseline ابزارهای build و test        | ✅ انجام شد         | High   | **۱۰۰٪** | frontend/backend typecheck و build موفق، frontend: ۷۷ تست، backend: ۲۱۶ تست، backend lint بدون error                                                                                                                                                                                                                              |
| P4-4 | تعیین مسیر canonical برای component و hook  | ✅ inventory شد     | Medium | **۱۰۰٪** | `components/` و `hooks/` مسیر shared؛ `app/components/` و `app/hooks/` فقط route-local؛ facadeهای root حفظ می‌شوند                                                                                                                                                                                                                |
| P4-5 | رفع warningهای relation index در Prisma     | ✅ بررسی و تائید شد | Medium | **۱۰۰٪** | Prisma warning درباره `relationMode = "prisma"` یک هشدار عمومی برای پایگاه‌های بدون foreign keys است؛ در schema فعلی شاخص‌های اصلی برای `OutboxEvent` و `SmsMessage`، و همچنین فیلدهای پرتکرار مانند `status`, `campaignId`, `processedAt` و `recipient` در دسترس‌اند. بدون شواهد query hot-path، افزودن index حدسی انجام نمی‌شود |
| P4-6 | کاهش ۳۸۷ warning کیفیتی backend lint        | ⏳ نیازمند refactor | Medium | **۰٪**   | اولویت با `any`های مرزی، stubهای غیرقابل‌استفاده و repositoryهای ناقص؛ جدا از feature work اجرا شود                                                                                                                                                                                                                               |
| P4-7 | تطبیق OpenAPI تولیدی با قرارداد دستی        | ✅ انجام شد         | High   | **۱۰۰٪** | source of truth به builder مشترک `backend/src/common/swagger/openapi.ts` منتقل شد؛ export runtime و Swagger از یک مسیر واحد می‌آیند و drift بین contract اجرا و export حذف شد                                                                                                                                                     |
| P4-8 | validation عملیاتی staging                  | ⏳ باز است          | High   | **۰٪**   | restore واقعی، failure test سرویس‌ها، load test مشابه production و rollback drill                                                                                                                                                                                                                                                 |

---

## 📊 خلاصه پیشرفت

| دسته                       | تعداد کل | انجام شده | در حال انجام | انجام نشده |
| -------------------------- | -------- | --------- | ------------ | ---------- |
| P0 Critical                | ۳        | **۳**     | ۰            | ۰          |
| P1 High                    | ۵        | **۵**     | ۰            | ۰          |
| P2 Medium                  | ۵        | **۵**     | ۰            | ۰          |
| P3 Low                     | ۴        | **۴**     | ۰            | ۰          |
| **Baseline قبلی**          | **۱۷**   | **۱۷**    | ۰            | ۰          |
| **Architecture Hardening** | **۸**    | **۴**     | ۲            | ۲          |

> **۱۴۰۵/۰۶/۱۸ (P0-1 تکمیل شد):** Query Timeout Middleware سه‌لایه پیاده‌سازی شد + ۲۱ تست واحد PASS.  
> **۱۴۰۵/۰۶/۱۸ (P0-2 تکمیل شد):** پوشش تست Core modules کامل شد · Audit (۱۴ تست)، Notification (۱۸ تست)، Analytics (۸ تست) · مجموع ۴۰ تست واحد جدید اضافه شد  
> **۱۴۰۵/۰۶/۱۸ (P0-3 تکمیل شد):** Keycloak Migration کامل شد · Controller و Service پیاده‌سازی شده · ۸ تست E2E برای مهاجرت کاربران، همگام‌سازی تک‌کاربر، و آمار مهاجرت اضافه شد  
> **۱۴۰۵/۰۶/۱۸ (P1-1 تکمیل شد):** Load Testing با k6 پیاده‌سازی شد · ۳ اسکریپت: api-load-test.js، connection-pool-test.js، partition-table-test.js · مستندات کامل در load-testing/README.md  
> **۱۴۰۵/۰۶/۱۸ (P1-2 تکمیل شد):** Production PgBouncer با Transaction Pooling کامل شد · pgbouncer.ini، deployment.yaml برای Kubernetes · README.md مستندات · Prisma relationMode="prisma" · connection limits تنظیم شد  
> **۱۴۰۵/۰۶/۱۸ (P1-3 تکمیل شد):** Integration Tests برای Outbox Pattern + Kafka کامل شد · ۱۲ تست Integration در outbox.integration.spec.ts · پوشش: publishEvent، retryFailedEvents، Kafka lifecycle، error handling  
> **۱۴۰۵/۰۶/۱۸ (P1-4 تکمیل شد):** Backup Strategy خودکار کامل شد · ۴ CronJob (postgres-backup, postgres-backup-verify, redis-backup, minio-backup) · اسکریپت verify-backups.sh · retention policy: ۷ روز  
> **۱۴۰۵/۰۶/۱۸ (P1-5 تکمیل شد):** Alerting و On-Call Rotation کامل شد · ۱۸ alert rule در alerts.yml (Backend: ۵، Database: ۵، Redis: ۳، Kafka: ۳، System: ۴) · team labels و runbook URLs · مستندات on-call-rotation.md  
> **۱۴۰۵/۰۶/۱۸ (P2-1 تکمیل شد):** BRIN Index برای OutboxEvent و SmsMessage کامل شد · Migration V031 ایجاد شد · ۵ BRIN index برای OutboxEvent · ۴ BRIN index برای SmsMessage · B-tree indexes برای point queries حفظ شد  
> **۱۴۰۵/۰۶/۱۸ (P2-2 تکمیل شد):** Swagger/OpenAPI documentation کامل شد · ۱۵ endpoint جدید اضافه شد (Audit: ۳، Notifications: ۵، Analytics: ۳، Keycloak: ۳) · ۵ schema جدید · توضیحات authentication  
> **۱۴۰۵/۰۶/۱۸ (P2-3 تکمیل شد):** Rate Limiting پیشرفته کامل شد · perUser و perEndpoint options اضافه شد · endpointLimits برای محدودیت‌های اختصاصی هر endpoint · Redis-based distributed rate limiting  
> **۱۴۰۵/۰۶/۱۸ (P2-4 تکمیل شد):** Widget Engine Stories کامل شد · ۱۲/۱۲ ویجت دارای Storybook Story هستند (۱۰۰٪)  
> **۱۴۰۵/۰۶/۱۸ (P2-5 تکمیل شد):** E2E Tests برای صفحات اصلی کامل شد · ۵ فایل Playwright test · auth.spec.ts (۴ تست Login)، dashboard.spec.ts (۷ تست Dashboard)، admin.spec.ts (۶ suite Admin) · پوشش کامل  
> **۱۴۰۵/۰۶/۱۸ (P3-1 تکمیل شد):** Deployment Runbook کامل شد · docs/DEPLOYMENT_RUNBOOK.md ایجاد شد · Pre-deployment checklist · Staging و Production procedures · Rollback procedures · Post-deployment verification · Troubleshooting guide  
> **۱۴۰۵/۰۶/۱۸ (P3-2 تکمیل شد):** Database VACUUM/REINDEX Script کامل شد · db-maintenance-vacuum.sh (هفتگی) · db-maintenance-reindex.sh (ماهانه) · db-maintenance-cronjob.yaml برای Kubernetes · گزارش آمار جداول و ایندکس‌ها  
> **۱۴۰۵/۰۶/۱۸ (P3-3 تکمیل شد):** Frontend Bundle Size Optimization کامل شد · next.config.mjs به‌روزرسانی شد · Webpack splitChunks برای code splitting · Tree shaking با usedExports و sideEffects · Module concatenation · Runtime chunk برای production · analyze-bundle.js برای monitoring  
> **۱۴۰۵/۰۶/۱۸ (P3-4 تکمیل شد):** Enhanced Feature Flags کامل شد · feature-flag.service.ts ایجاد شد · A/B testing با variants و percentage-based assignment · Gradual rollout با rolloutPercentage · Target users, roles, departments · Date range support · Caching برای performance · Integration با SystemSetting  
> **بروزرسانی پس از ممیزی ۱۴۰۵/۰۶/۱۸:** ۳ جدول (از ۵ جدول) پارتیشن‌بندی واقعی در V030 دارند · ۲ آداپتور SMS واقعی پیاده‌سازی شده (IdehPayam + Mock) · ۱۵ ContentType واقعی وجود دارد
> **بروزرسانی ۱۴۰۵/۰۶/۲۵:** Wizard به devtools منتقل و از production جدا شد · proxyهای API و upload یکپارچه شدند · backend lint به ۰ خطای واقعی رسید · frontend و backend در مجموع ۲۹۳ تست سبز دارند.

---

## 🔗 ارجاع‌ها

- [schema.prisma](file:///d:/irib-digital-workplace/backend/prisma/schema.prisma)
- [Migration: Partitioning](file:///d:/irib-digital-workplace/backend/migrations/V030__partitioning_high_volume_tables.sql)
- [OpenTelemetry Tracing](file:///d:/irib-digital-workplace/backend/src/common/tracing/tracing.ts)
- [README.md](file:///d:/irib-digital-workplace/README.md)
