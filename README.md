# IRIB Digital Workplace (DWP)

**نسخه:** ۰.۱.۰ (Frontend) / ۱.۰.۰ (Backend)  
**آخرین بروزرسانی مستندات:** ۱۴۰۵/۰۶/۱۸ (۲۰۲۶-۰۹-۰۸)  
**پیشرفت پروژه:** ۹۱٪  
**زبان اصلی کد:** TypeScript / Node.js

---

## 📖 فهرست مطالب

1. [مرور کلی پروژه](#-مرور-کلی-پروژه)
2. [پشته فناوری](#-پشته-فناوری)
3. [معماری پروژه](#-معماری-پروژه)
4. [زیرساخت داده](#-زیرساخت-داده)
5. [مشاهده‌پذیری و مانیتورینگ](#-مشاهدهپذیری-و-مانیتورینگ)
6. [شروع سریع](#-شروع-سریع)
7. [اسکریپت‌های مفید](#-اسکریپتهای-مفید)
8. [ماژول‌های اصلی](#-ماژولهای-اصلی)
9. [محدودیت‌های سخت (Hard Constraints)](#-محدودیتهای-سخت-hard-constraints)
10. [درس‌های آموخته‌شده](#-درس‌های-آموختهشده)
11. [لیست کاری پروژه](#-لیست-کاری-پروژه)

---

## 🔭 مرور کلی پروژه

پلتفرم **Digital Workplace** سازمان صدا و سیمای استان آذربایجان شرقی با هدف یکپارچه‌سازی ابزارها، فرآیندها و ارتباطات داخلی سازمان طراحی و پیاده‌سازی شده است. این پلتفرم شامل قابلیت‌های زیر است:

- **مدیریت هویت و دسترسی (IAM):** احراز هویت چندعاملی، مهاجرت Keycloak، RBAC + ABAC
- **مدیریت محتوا:** خبر، اطلاعیه، رویداد، بنر، گالری، صفحه‌ساز و ویجت‌ها
- **فرم‌ها و گردش کار:** سازنده فرم، گردش کار تایید، پوشه الکترونیک (Afish)
- **ارتباطات:** صندوق ورودی Thread-Based، اعلان‌ها، پیامک، ایمیل، Push Notification
- **سازمان:** چارت سازمانی، دفترچه تلفن، میراث و متخصصان
- **پشتیبانی IT:** مرکز نرم‌افزار، تیکت‌ینگ پشتیبانی
- **موبایل:** اپلیکیشن موبایل با احراز هویت QR و Push
- **میکروسایت:** صفحات اختصاصی برای هر دپارتمان

---

## 🧱 پشته فناوری

| لایه                       | فناوری                                                                                                    | نسخه           |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| **Frontend Framework**     | Next.js (App Router)                                                                                      | ۱۶.۲.۶         |
| **Frontend Language**      | React + TypeScript                                                                                        | ۱۹ / ۵.۷.۳     |
| **Styling**                | Tailwind CSS + shadcn/ui                                                                                  | ۴.۳.۳ / ۴.۸.۰  |
| **State Management**       | Zustand                                                                                                   | ۵.۰.۱۴         |
| **Data Fetching**          | TanStack Query (React Query)                                                                              | ۵.۱۰۱.۴        |
| **Form Management**        | React Hook Form + Zod                                                                                     | ۷.۸۳.۰ / ۴.۴.۳ |
| **Backend Framework**      | NestJS                                                                                                    | ۱۰.۳.۰         |
| **Database ORM**           | Prisma Client                                                                                             | ۵.۸.۰          |
| **Database**               | PostgreSQL                                                                                                | ۱۶             |
| **Cache / Message Broker** | Redis (IORedis)                                                                                           | ۵.۳.۲          |
| **Queue System**           | BullMQ                                                                                                    | ۵.۱.۰          |
| **Event Streaming**        | Kafka (Kafkajs)                                                                                           | ۲.۲.۴          |
| **Object Storage**         | MinIO                                                                                                     | ۸.۰.۰          |
| **Search Engine**          | OpenSearch                                                                                                | ۲.۵.۰          |
| **PDF Generation**         | Puppeteer                                                                                                 | ۲۱.۰.۰         |
| **SMS**                    | Ideh Payam (پیاده‌سازی‌شده) / Mock (تست) · Kavehnegar + Melli Payamak (فقط enum تعریف‌شده · بدون آداپتور) | —              |
| **Containerization**       | Docker + Docker Compose                                                                                   | —              |
| **Kubernetes**             | Helm Charts + Argo CD (GitOps)                                                                            | —              |
| **Package Manager**        | pnpm                                                                                                      | ۱۱.۲۵.۰        |
| **Node.js Runtime**        | Node.js                                                                                                   | ≥ ۲۰.۹.۰       |

---

## 🏗️ معماری پروژه

```
d:\irib-digital-workplace
├── app/                          # رابط کاربری Next.js (App Router)
│   ├── (admin)/                  # صفحات ادمین
│   ├── (authenticated)/          # صفحات نیازمند احراز هویت
│   ├── (public)/                 # صفحات عمومی (لاگین، میکروسایت‌ها، خبر...)
│   ├── api/                      # Route های API رابط کاربری
│   ├── components/               # کامپوننت‌های اختصاصی App
│   └── hooks/                    # Hooks اختصاصی رابط کاربری
├── backend/                      # سرور NestJS
│   ├── src/
│   │   ├── common/               # ابزارهای مشترک (Cache, Tracing, Queue...)
│   │   └── modules/              # ماژول‌های دامنه (IAM, Content, Forms, ...)
│   ├── prisma/                   # Schema و Migrationهای Prisma
│   ├── migrations/               # Migrationهای SQL سطح پایین (Flyway-style)
│   ├── devtools/wizard/          # Wizard راه‌اندازی فقط برای توسعه
│   ├── infra/                    # زیرساخت (Helm, Ansible, Monitoring)
│   └── monitoring/               # تنظیمات Prometheus / Loki / Grafana
├── components/                   # UI Library مشترک
│   ├── atoms/                    # Atoms طراحی
│   ├── molecules/                # Molecules طراحی
│   ├── organisms/                # Organisms طراحی
│   ├── ui/                       # کامپوننت‌های shadcn
│   ├── providers/                # Provider های React
│   └── widgets/                  # ویجت‌های صفحه‌ساز
├── lib/                          # کتابخانه‌های مشترک JS/TS
├── infra/helm/dwp-frontend/      # Helm Chart فرانت‌اند
├── e2e/                          # تست‌های Playwright E2E
├── tests/                        # تست‌های واحد/یکپارچه
└── app/wizard/                   # رابط کاربری Setup Wizard توسعه
```

### معماری بک‌اند

پروژه از معماری **Modular Monolith** با NestJS استفاده می‌کند:

```
src/
├── common/
│   ├── cache/                    # Multi-level Cache (Memory + Redis)
│   ├── circuit-breaker/          # Circuit Breaker Pattern
│   ├── middleware/               # Rate Limit + Security
│   ├── monitoring/               # Sentry Integration
│   ├── queues/                   # BullMQ Processors (Email, SMS, PDF, ...)
│   ├── tracing/                  # OpenTelemetry SDK
│   └── filters/guards/decorators # ابزارهای Cross-cutting
└── modules/
    ├── iam/                      # احراز هویت و مدیریت کاربران
    ├── access-control/           # RBAC و دسترسی‌ها
    ├── content/                  # مدیریت محتوا
    ├── forms/ + afish/           # فرم‌ها و پوشه الکترونیک
    ├── organization/             # ساختار سازمانی
    ├── media/ + storage/         # ذخیره‌سازی فایل
    ├── page-builder/             # صفحه‌ساز
    ├── widget-engine/            # موتور ویجت
    ├── theme/                    # تم و Design Tokens
    ├── tickets/                  # تیکت‌ینگ
    ├── sms/                      # سامانه پیامک
    ├── notification/             # اعلان‌ها
    ├── communication/            # ارتباطات و صندوق ورودی
    ├── analytics/                # آمار و تحلیل
    ├── audit/                    # لاگ حسابرسی
    ├── knowledge/                # دانش‌نامه و متخصصان
    ├── software/                 # مرکز نرم‌افزار
    ├── search/                   # جستجوی متنی
    ├── pdf-generator/            # تولید PDF
    ├── outbox/                   # Outbox Pattern
    ├── integration/              # اتصال به سیستم‌های قدیمی
    └── health/                   # Health Check و Metrics
```

---

## 💾 زیرساخت داده

### پایگاه داده PostgreSQL ۱۶

**اتصال:** Prisma + PgBouncer (Transaction Pooling Mode)  
**استراتژی اتصال:**

- `relationMode = "prisma"` برای سازگاری با PgBouncer
- Exponential Backoff برای اتصالات شکست‌خورده
- Connection Pool تنظیم شده بر اساس تعداد CPU ها

### پارتیشن‌بندی جداول پرحجم (Range Partitioning) — وضعیت واقعی

⚠️ Migration V030 در حال حاضر فقط **۳ جدول** زیر را پوشش می‌دهد (SmsMessage و OutboxEvent در تسک P2-1 باقی مانده‌اند):

| جدول            | کلید پارتیشن | استراتژی واقعی                 | نوع ایندکس                             | وضعیت                   |
| --------------- | ------------ | ------------------------------ | -------------------------------------- | ----------------------- |
| `AuditLogEntry` | `createdAt`  | **Range (فصلانه / Quarterly)** | B-tree (پس از پارتیشن)                 | ✅ انجام‌شده در V030    |
| `Notification`  | `createdAt`  | Range (ماهانه)                 | B-tree (userId + isRead + createdAt)   | ✅ انجام‌شده در V030    |
| `PageView`      | `createdAt`  | Range (ماهانه)                 | **BRIN** (۹۰٪ کاهش حجم نسبت به B-tree) | ✅ انجام‌شده در V030    |
| `SmsMessage`    | `createdAt`  | ماهانه (پیشنهادی)              | BRIN (پیشنهادی)                        | ⬜ در PROJECT_TODO P2-1 |
| `OutboxEvent`   | `createdAt`  | ماهانه (پیشنهادی)              | BRIN (پیشنهادی)                        | ⬜ در PROJECT_TODO P2-1 |

### مدل دامنه اصلی (۴۹ مدل جدول + ۲۱ Enum نوع داده)

- **IAM:** `User`, `AuthSession`, `OtpChallenge`, `UserDepartmentScope`
- **Access Control:** `Role`, `AtomicPermission`, `UserRoleAssignment` (RBAC + ABAC + Scope)
- **Organization:** `Department` (سلسله‌مراتبی با ltree)، `MicrositeConfig`
- **Content:** `Content` (Single Content Model با ۱۵ ContentType: NEWS, ANNOUNCEMENT, EVENT, GALLERY, BANNER, FILE, SOFTWARE, EXPERT, LEGEND, FORM, AFISH, DOCUMENT, SURVEY, FAQ, LINK)، نسخه‌بندی، برچسب، دسته‌بندی
- **Media:** `MediaAsset` (Deduplication با SHA-256 Hash)
- **Widgets:** `WidgetManifest`, `PageLayout`, `PageWidget`
- **Theme:** `ThemeToken` (Design Tokens با زمان‌بندی)
- **Forms:** `FormDefinition`, `FormSubmission`, `AfishRecord`
- **Knowledge:** `ExpertProfile` (متخصصان + میراث)
- **IT:** `SoftwareEntry`, `SoftwareVersion`, `DownloadLog`, `Ticket`
- **Communication:** `Conversation`, `Message`, `Notification`
- **Mobile:** `DeviceRegistration`, `QrLinkToken`, `PushSubscription`
- **Analytics:** `AuditLogEntry`, `PageView`
- **Reliability:** `OutboxEvent` (Outbox Pattern)
- **Integration:** `LegacyConnector`, `WebhookEndpoint`
- **SMS:** `SmsProviderConfig`, `SmsTemplate`, `SmsCampaign`, `SmsMessage`
- **Settings:** `SystemSetting` (تنظیمات سیستم + Feature Flags)

> **ارجاع کامل:** [schema.prisma](file:///d:/irib-digital-workplace/backend/prisma/schema.prisma)

---

## 🔍 مشاهده‌پذیری و مانیتورینگ

### Distributed Tracing — OpenTelemetry (OTLP)

- **SDK:** `@opentelemetry/sdk-node` v0.57.0
- **Exporter:** OTLP HTTP (Jaeger / Grafana Tempo)
- **Instrumentation:**
  - NestJS Core (Request Tracing)
  - HTTP Server/Client
  - PostgreSQL (pg)
  - BullMQ (Queue Jobs)
  - IORedis (Cache Operations)
  - Pino Logger

> **فایل پیاده‌سازی:** [tracing.ts](file:///d:/irib-digital-workplace/backend/src/common/tracing/tracing.ts)

### مانیتورینگ

| ابزار            | هدف                | مسیر                                                                                                        |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Prometheus**   | جمع‌آوری Metrics   | [backend/monitoring/prometheus.yml](file:///d:/irib-digital-workplace/backend/monitoring/prometheus.yml)    |
| **Grafana**      | داشبوردهای عملیاتی | [grafana-dashboard.json](file:///d:/irib-digital-workplace/backend/infra/monitoring/grafana-dashboard.json) |
| **Alertmanager** | قوانین هشدار       | [alerts/](file:///d:/irib-digital-workplace/backend/infra/monitoring/alerts/)                               |
| **Loki**         | جمع‌آوری Log ها    | [loki-config.yml](file:///d:/irib-digital-workplace/backend/monitoring/loki/loki-config.yml)                |
| **Promtail**     | ارسال Log به Loki  | [promtail-config.yml](file:///d:/irib-digital-workplace/backend/monitoring/promtail/promtail-config.yml)    |
| **Sentry**       | Error Tracking     | [sentry.module.ts](file:///d:/irib-digital-workplace/backend/src/common/monitoring/sentry.module.ts)        |

---

## 🚀 شروع سریع

### پیش‌نیازها

- **Node.js** ≥ ۲۰.۹.۰
- **pnpm** ۱۱.۲۵.۰ (`npm i -g pnpm@11.25.0`)
- **PostgreSQL** ۱۶ (با PgBouncer در Production)
- **Redis** ۷+
- **Docker** (برای Infrastructure سریع)

### راه‌اندازی محیط محلی

#### ۱. نصب وابستگی‌ها

```bash
pnpm install
```

#### ۲. راه‌اندازی زیرساخت دیتابیس و سرویس‌ها

```bash
# دیتابیس + ردیس + مینیو
docker-compose -f docker-compose.yml up -d

# فقط دیتابیس + تابع‌های اضافی
docker-compose -f backend/docker-compose.db.yml up -d
```

#### ۳. تنظیم متغیرهای محیطی

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# مقادیر را بر اساس محیط خود پر کنید
```

#### ۴. اجرای Migration و Seed دیتابیس

```bash
cd backend
pnpm prisma:migrate       # اجرای Migration های Prisma
pnpm prisma:seed          # درج داده‌های اولیه (دسترسی‌ها، نقش‌ها، کاربر نمونه)
cd ..
```

#### ۵. اجرای اسکریپت راه‌اندازی خودکار

```bash
pnpm setup-local
```

#### ۶. اجرای سرویس‌ها (پنجره‌های جداگانه)

```bash
# فرانت‌اند (Next.js - پورت ۳۰۰۰)
pnpm dev

# بک‌اند (NestJS - پورت ۳۰۰۱)
cd backend && pnpm dev
```

#### ۷. دسترسی به سرویس‌ها

| سرویس              | آدرس                           |
| ------------------ | ------------------------------ |
| Frontend (Next.js) | http://localhost:3000          |
| Backend (NestJS)   | http://localhost:3001          |
| Swagger API Docs   | http://localhost:3001/api/docs |
| Prisma Studio      | http://localhost:5۵۵۵          |
| Storybook          | http://localhost:6006          |
| Setup Wizard       | http://localhost:8080          |

---

## 📜 اسکریپت‌های مفید

### فرانت‌اند (ریشه پروژه)

| اسکریپت              | توضیح                               |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | اجرای سرور توسعه Next.js            |
| `pnpm build`         | ساخت بیلد Production                |
| `pnpm start`         | اجرای Production Server             |
| `pnpm lint`          | اجرای ESLint                        |
| `pnpm lint:fix`      | رفع خودکار خطاهای Lint              |
| `pnpm format`        | قالب‌بندی با Prettier               |
| `pnpm test`          | اجرای تست‌های Vitest (Watch Mode)   |
| `pnpm test:run`      | اجرای تست‌ها یک‌بار                 |
| `pnpm test:coverage` | اجرای تست‌ها با Coverage Report     |
| `pnpm test:e2e`      | اجرای تست‌های Playwright E2E        |
| `pnpm typecheck`     | بررسی Type بدون ساخت                |
| `pnpm knip`          | پیدا کردن کد وابسته استفاده‌نشده    |
| `pnpm storybook`     | اجرای Storybook                     |
| `pnpm setup-local`   | اسکریپت راه‌اندازی خودکار محیط محلی |

### بک‌اند (پوشه backend/)

| اسکریپت                    | توضیح                                 |
| -------------------------- | ------------------------------------- |
| `pnpm dev`                 | اجرای NestJS با Watch Mode            |
| `pnpm build`               | ساخت بیلد NestJS                      |
| `pnpm start`               | اجرای Production (node dist/main)     |
| `pnpm prisma:migrate`      | اجرای Migrationهای جدید در محیط توسعه |
| `pnpm prisma:migrate:prod` | اعمال Migration در Production         |
| `pnpm prisma:seed`         | درج داده‌های اولیه                    |
| `pnpm prisma:studio`       | اجرای رابط کاربری Prisma Studio       |
| `pnpm test`                | اجرای تست‌های Jest (Watch)            |
| `pnpm test:cov`            | تست با Coverage                       |
| `pnpm lint`                | Lint کد بک‌اند                        |

---

## 🧩 ماژول‌های اصلی

### ۱. احراز هویت و مدیریت کاربران (IAM)

- JWT + Refresh Token (تکمیل شده با Blacklist)
- OTP Challenge (رمز یکبارمصرف موبایل)
- مهاجرت تدریجی از Keycloak (Keycloak Sync + Dual Auth)
- ارتباط با `keycloak-admin-client`

### ۲. کنترل دسترسی (Access Control)

- **RBAC:** نقش‌ها + مجوزهای اتمی (AtomicPermission)
- **ABAC:** Scope های دسترسی (GLOBAL / DEPARTMENT / UNIT / OWNERSHIP)
- **Explicit Deny + Grant:** لیست سیاه و سفید در سطح UserRoleAssignment
- Permissions Guard + Decorator

### ۳. مدیریت محتوا (Content Management)

- **Single Content Model:** ۱۶ نوع محتوا با یک Schema واحد
- **نسخه‌بندی خودکار:** هر ویرایش → رکورد جدید در ContentVersion
- **Workflow انتشار:** DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED
- **Time-based Scheduling:** SCHEDULED + ARCHIVED با زمان‌بندی خودکار
- **Content Scoping:** محدودیت نمایش بر اساس دپارتمان

### ۴. فرم‌ها و پوشه الکترونیک (Forms + Afish)

- **Form Builder:** JSON Schema + UI Schema (Conditional Logic، Visibility Rules)
- **Workflow:** چندمرحله‌ای با Assignee، Comment، Attachment
- **Afish (پوشه الکترونیک):** ردیف‌های داده ساختاریافته + PDF خودکار + Watermark
- **شماره‌گذاری خودکار:** AFISH-YYYY-0001

### ۵. صفحه‌ساز و ویجت (Page Builder + Widget Engine)

- **Widget Manifest Registry:** ۱۲ ویجت مستقل پیاده‌سازی‌شده + دایرکتوری کامل (News Timeline, Weather, Prayer Calendar, Dept Announcements, Dept Experts, Dept Forms Center, Dept Document Center, Dept Service Cards, Hero Media, Quick Access, Research Highlights, Admin KPI) — هر ۱۲ ویجت دارای Storybook Story هستند
- **Grid Layout System:** Drag & Drop با تنظیم Breakpoint
- **SSR / CSR:** انتخابی برای هر ویجت (فیلد `ssr: true/false`)
- **Permissions:** بررسی دسترسی سطح ویجت قبل از رندر
- **Design Tokens:** تم‌های مبتنی بر Token با زمان‌بندی (مناسبت‌ها)

### ۶. ارتباطات (Communication)

- **Thread-Based Inbox:** هر موضوع → Conversation با چندین Message
- **Mention System:** @mention با اعلان همزمان
- **Attachment:** فایل پیوست از طریق MediaAsset
- **Push Notification:** Web Push (VAPID) + موبایل
- **Email:** Nodemailer با Queue (BullMQ)

### ۷. سامانه پیامک (SMS)

- **چند ارائه‌دهنده:** Ideh Payam و Mock Adapter **پیاده‌سازی‌شده** · Kavehnegar + Melli Payamak فقط در سطح `SmsProviderType` enum تعریف شده‌اند (Adapter فایل ندارند)
- **Template System:** قالب‌های پارامتریک با Placeholder
- **Campaign Management:** برنامه‌ریزی ارسال گروهی + گزارش تحویل
- **Queue + Retry:** BullMQ Queue با Exponential Backoff
- **Delivery Tracking:** پیگیری وضعیت تحویل تا ۳ تلاش

---

## 🚫 محدودیت‌های سخت (Hard Constraints)

1. **Migration دیتابیس:**
   - تمام تغییرات Schema باید از طریق Migrationهای استاندارد اعمال شوند
   - Migrationهای سطح پایین: `backend/migrations/V***__*.sql` (Flyway-style)
   - Migrationهای Prisma: `backend/prisma/migrations/*/migration.sql`
   - **ممنوع:** تغییر مستقیم دستی در پایگاه داده Production

2. **PgBouncer سازگاری:**
   - کوئری‌ها و تنظیمات Prisma باید با **PgBouncer Transaction Pooling Mode** سازگار باشند
   - استفاده از `relationMode = "prisma"` (غیرفعال‌سازی Foreign Key در سطح DB)
   - **ممنوع:** کوئری‌های Long-running که تراکنش را بیش از چند ثانیه نگه می‌دارند
   - **ممنوع:** استفاده از `pg_advisory_lock` یا ویژگی‌های Session-specific

---

## 📚 درس‌های آموخته‌شده (Lessons Learned)

### ۱. بهینه‌سازی ایندکس برای جداول پرحجم

> **BRIN Index در جداول Append-only (مانند PageView) باعث کاهش ۹۰ درصدی حجم ایندکس نسبت به B-tree شده است.**
>
> دلایل:
>
> - داده‌ها بر اساس `createdAt` به صورت ترتیبی وارد می‌شوند
> - BRIN فقط Blobk Range را ایندکس می‌کند (نه هر رکورد)
> - مناسب‌تر از B-tree برای داده‌های Time-series و تاریخچه‌ای

### ۲. مدیریت اتصال دیتابیس در Production

> **برای جلوگیری از Pool Exhaustion در محیط Production، پیاده‌سازی Query Timeout Middleware ضروری است.** (✅ **۱۴۰۵/۰۶/۱۸ پیاده‌سازی شد**)
>
> اقدامات انجام‌شده:
>
> - Prisma Connection Pool تنظیم شده (Exponential Backoff)
> - PgBouncer Transaction Pooling در Production
> - **لایه ۱ — HTTP AbortController:** `QueryTimeoutMiddleware` با زمان‌بندی متفاوت برای مسیرهای Export/Upload/Heavy Read/Default و پاسخ ۴۰۸
> - **لایه ۲ — Prisma Promise.race:** `connectionTimeoutMiddleware` داخلی Prisma با کد خطای P2024 Timeout
> - **لایه ۳ — Prisma Slow Query Detection:** `queryTimeoutMiddleware` با هشدار ۲/۵ ثانیه و خطای Risk ۸ ثانیه
> - **لایه ۴ — PostgreSQL SET LOCAL:** متد `QueryTimeoutMiddleware.getStatementTimeoutSQL()` برای تراکنش‌های پرهزینه (سازگار با PgBouncer)
> - ۲۱ تست واحد مستقل برای همه لایه‌ها PASS شده
> - **اقلام باقی‌مانده:** Load Testing رسمی با k6/Gatling برای تأیید عملکرد Pool تحت بار واقعی

---

## ✅ لیست کاری پروژه

لیست کامل تسک‌ها و پیشرفت هر کدام در فایل جداگانه مستند شده است:

> **ارتباط مستقیم:** [PROJECT_TODO.md](file:///d:/irib-digital-workplace/PROJECT_TODO.md)

### خلاصه سریع

- **تعداد کل تسک:** ۱۷ مورد (P0:۳ ، P1:۵ ، P2:۵ ، P3:۴)
- **بحرانی‌ترین تسک:** پیاده‌سازی Query Timeout Middleware (P0-1)
- **تسک‌های در حال انجام:** Keycloak Migration، PgBouncer Production، Backup Automation، OpenAPI Docs، E2E Tests

---

## 🔗 ارجاع‌های سریع

| فایل                                                                                                                | توضیح                             |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [PROJECT_TODO.md](file:///d:/irib-digital-workplace/PROJECT_TODO.md)                                                | لیست کامل تسک‌های پروژه           |
| [schema.prisma](file:///d:/irib-digital-workplace/backend/prisma/schema.prisma)                                     | مدل دیتابیس کامل                  |
| [V030 Partitioning](file:///d:/irib-digital-workplace/backend/migrations/V030__partitioning_high_volume_tables.sql) | پارتیشن‌بندی جداول پرحجم          |
| [tracing.ts](file:///d:/irib-digital-workplace/backend/src/common/tracing/tracing.ts)                               | OpenTelemetry Distributed Tracing |
| [CI Workflow](file:///d:/irib-digital-workplace/.github/workflows/ci.yml)                                           | CI Pipeline                       |
| [CI/CD Workflow](file:///d:/irib-digital-workplace/.github/workflows/ci-cd.yml)                                     | CI/CD Pipeline                    |
| [Frontend Helm](file:///d:/irib-digital-workplace/infra/helm/dwp-frontend/)                                         | Helm Chart فرانت‌اند              |
| [Backend Helm](file:///d:/irib-digital-workplace/backend/infra/helm/dwp-backend/)                                   | Helm Chart بک‌اند                 |
| [OpenAPI Spec](file:///d:/irib-digital-workplace/backend/docs/contracts/openapi.yaml)                               | مستندات قرارداد API               |

---

© ۱۴۰۵ — سازمان صدا و سیما، شبکه استان آذربایجان شرقی  
پشتیبانی و توسعه توسط تیم فناوری اطلاعات و ارتباطات
