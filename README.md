# پرتال دیجیتال کارکنان صدا و سیمای آذربایجان شرقی

> **Digital Workplace Platform (DWP)** — پلتفرم محیط کار دیجیتال نسل جدید

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1)](https://www.postgresql.org/)

---

## چشم‌انداز پروژه

تبدیل پورتال سنتی به یک **پلتفرم محیط کار دیجیتال** تعاملی، خدمات‌محور و دانش‌محور با هویت بصری منحصر به فرد **صدا و سیمای آذربایجان شرقی**.

---

## فهرست مطالب

- [شروع سریع](#شروع-سریع)
- [ساختار پروژه](#ساختار-پروژه)
- [فناوری‌ها](#فناوری‌ها)
- [صفحات و مسیرها](#صفحات-و-مسیرها)
- [سیستم ویجت](#سیستم-ویجت)
- [طراحی (PEDS)](#طراحی-peds)
- [بک‌اند](#بک‌اند)
- [دیتابیس](#دیتابیس)
- [استقرار](#استقرار)
- [تست](#تست)
- [دستورات](#دستورات)
- [ساختار فایل‌ها](#ساختار-فایل‌ها)

---

## شروع سریع

### پیش‌نیازها

| ابزار   | نسخه | توضیح             |
| ------- | ---- | ----------------- |
| Node.js | 18+  | Runtime           |
| pnpm    | 8+   | Package Manager   |
| Docker  | 24+  | برای دیتابیس محلی |

### نصب و اجرا

```bash
# 1. کلون کردن پروژه
git clone https://git.iribtabriz.ir/irib/dwp-frontend.git
cd dwp-frontend

# 2. نصب وابستگی‌ها
pnpm install

# 3. راه‌اندازی دیتابیس (اختیاری - برای بک‌اند)
cd backend
docker-compose up -d
cd ..

# 4. اجرای توسعه
pnpm dev
```

سرور روی `http://localhost:3000` راه‌اندازی می‌شود.

---

## ساختار پروژه

```
irib-digital-workplace/
├── app/                              ← صفحات (Next.js App Router)
│   ├── (public)/                     ← صفحات عمومی
│   │   ├── page.tsx                  ← صفحه اصلی (Widget-Driven)
│   │   ├── login/page.tsx            ← ورود
│   │   ├── search/page.tsx           ← جستجو
│   │   ├── departments/[slug]/       ← میکروسایت‌های پویا
│   │   ├── news/[slug]/              ← جزئیات خبر
│   │   ├── forms/[slug]/             ← رندرر فرم
│   │   ├── mobile/welcome/           ← خوش‌آمدگویی موبایل
│   │   ├── mobile/register/          ← ثبت‌نام موبایل
│   │   ├── mobile/link/              ← لینک دسکتاپ (QR)
│   │   └── offline/                  ← حالت آفلاین
│   ├── (authenticated)/              ← صفحات احراز هویت شده
│   │   ├── dashboard/page.tsx        ← داشبورد مدیریتی
│   │   ├── dashboard/content/        ← مدیریت محتوا
│   │   ├── dashboard/content/editor/ ← ویرایشگر محتوا
│   │   ├── dashboard/inbox/          ← کارتابل ارتباطات
│   │   ├── dashboard/forms/builder/  ← سازنده فرم
│   │   ├── dashboard/forms/submissions/ ← ارسال‌های فرم
│   │   ├── profile/page.tsx          ← پروفایل
│   │   ├── settings/page.tsx         ← تنظیمات
│   │   ├── notifications/page.tsx    ← اعلان‌ها
│   │   └── manager/[dept]/           ← داشبورد معاونت
│   └── (admin)/                      ← صفحات مدیریتی
│       └── admin/
│           ├── page.tsx              ← کنسول مدیریت
│           ├── pages/page.tsx        ← سازنده صفحه
│           ├── themes/page.tsx       ← مدیریت تم
│           ├── rbac/page.tsx         ← مدیریت دسترسی
│           ├── org-chart/page.tsx    ← نمودار سازمانی
│           ├── storage/page.tsx      ← مدیریت استوریج
│           ├── audit/page.tsx        ← لاگ فعالیت
│           └── users/page.tsx        ← مدیریت کاربران
│
├── components/                       ← کامپوننت‌ها
│   ├── ui/                           ← ۲۴ کامپوننت shadcn/ui
│   ├── atoms/                        ← اتم‌ها (SkipLink, Breadcrumb, Pagination, Spinner)
│   ├── molecules/                    ← مولکول‌ها (SearchBar, RichTextEditor, FileUploader, AfishTable)
│   ├── organisms/                    ← ارگانیسم‌ها (BroadcastComposer, ChatThread, NotificationCenter)
│   ├── widgets/                      ← ۱۹ ویجت
│   ├── layout/                       ← لایه‌بندی (Container, Section, GridLayout, MobileNav)
│   ├── providers/                    ← پروایدرها (Theme, Permission, Query, Toaster)
│   ├── identity/                     ← IdentityPattern SVG
│   ├── portal/                       ← کامپوننت‌های پرتال (۱۵)
│   ├── dashboard/                    ← کامپوننت‌های داشبورد (۷)
│   └── microsite/                    ← کامپوننت‌های میکروسایت (۶)
│
├── lib/                              ← ابزارها
│   ├── api-client.ts                 ← کلاینت API + WebSocket
│   ├── validators.ts                 ← Zod Schemas
│   ├── jalali.ts                     ← تاریخ شمسی
│   ├── i18n.ts                       ← ترجمه‌ها
│   ├── utils.ts                      ← cn() utility
│   └── stores/                       ← Zustand Stores
│
├── hooks/                            ← هوک‌ها
│   ├── use-media-query.ts            ← useMediaQuery, useIsMobile
│   └── use-debounce.ts               ← useDebounce
│
├── backend/                          ← بک‌اند (NestJS)
│   ├── src/modules/                  ← ۱۴ بخش مرزی
│   ├── prisma/schema.prisma          ← مدل دیتابیس (۴۰+ مدل)
│   ├── migrations/                   ← SQL Migrations + RLS
│   ├── seeds/                        ← داده‌های اولیه
│   ├── docs/contracts/               ← OpenAPI 3.1
│   └── infra/                        ← زیرساخت استقرار
│
├── public/                           ← فایل‌های استاتیک + PWA
├── tests/                            ← تست‌های Vitest
├── e2e/                              ← تست‌های Playwright
└── .storybook/                       ← Storybook
```

---

## فناوری‌ها

### فرانت‌اند

| لایه               | فناوری                    | نسخه  |
| ------------------ | ------------------------- | ----- |
| **Framework**      | Next.js (App Router, RSC) | 16    |
| **Language**       | TypeScript (Strict)       | 5.7   |
| **UI Library**     | React                     | 19    |
| **Styling**        | Tailwind CSS (JIT)        | 4     |
| **UI Components**  | shadcn/ui + Radix UI      | —     |
| **State (Server)** | TanStack Query            | 5     |
| **State (Client)** | Zustand                   | 5     |
| **Forms**          | React Hook Form + Zod     | 7 + 4 |
| **Rich Text**      | TipTap (ProseMirror)      | 3     |
| **Drag & Drop**    | @dnd-kit                  | 6     |
| **Charts**         | Recharts                  | 3     |
| **File Upload**    | Uppy                      | 5     |
| **Table**          | TanStack Table            | 8     |
| **i18n**           | next-intl                 | 4     |
| **PWA**            | Service Worker + Manifest | —     |

### بک‌اند

| لایه           | فناوری                | نسخه |
| -------------- | --------------------- | ---- |
| **Framework**  | NestJS (TypeScript)   | 10   |
| **ORM**        | Prisma                | 5    |
| **API Docs**   | Swagger (OpenAPI 3.1) | —    |
| **Auth**       | Keycloak (OIDC/SAML)  | 24   |
| **WebSocket**  | Socket.io             | —    |
| **Validation** | class-validator + Zod | —    |

### دیتابیس و Storage

| سرویس              | فناوری         | نسخه   |
| ------------------ | -------------- | ------ |
| **Primary DB**     | PostgreSQL     | 16     |
| **Cache/Session**  | Redis          | 7      |
| **Search**         | OpenSearch     | 2.x    |
| **Object Storage** | MinIO (S3 API) | Latest |
| **Message Broker** | Kafka/Redpanda | —      |

### DevOps و استقرار

| ابزار             | کاربرد                      |
| ----------------- | --------------------------- |
| **Container**     | Docker + Docker Compose     |
| **Orchestration** | Kubernetes (K3s/RKE2)       |
| **GitOps**        | ArgoCD                      |
| **IaC**           | Terraform + Ansible         |
| **Helm**          | Chart for Backend/Frontend  |
| **CI/CD**         | GitHub Actions / GitLab CI  |
| **Monitoring**    | Grafana + Prometheus + Loki |
| **Security**      | Trivy, Snyk, OWASP ZAP      |

---

## صفحات و مسیرها

### صفحات عمومی (۱۰ صفحه)

| مسیر                  | توضیح                                         |
| --------------------- | --------------------------------------------- |
| `/`                   | صفحه اصلی (Widget-Driven)                     |
| `/login`              | ورود (OTP + Password)                         |
| `/search`             | جستجوی یکپارچه                                |
| `/departments/[slug]` | میکروسایت‌های پویا (IT, Research, Production) |
| `/news/[slug]`        | جزئیات خبر                                    |
| `/forms/[slug]`       | رندرر فرم (Wizard/Single)                     |
| `/mobile/welcome`     | خوش‌آمدگویی موبایل                            |
| `/mobile/register`    | ثبت‌نام موبایل (OTP)                          |
| `/mobile/link`        | لینک دسکتاپ (QR Code)                         |
| `/offline`            | حالت آفلاین                                   |

### صفحات احراز هویت شده (۱۰ صفحه)

| مسیر                           | توضیح                            |
| ------------------------------ | -------------------------------- |
| `/dashboard`                   | داشبورد مدیریتی                  |
| `/dashboard/content`           | مدیریت محتوا (TanStack Table)    |
| `/dashboard/content/editor`    | ویرایشگر محتوا (RichText)        |
| `/dashboard/inbox`             | کارتابل ارتباتات (Master-Detail) |
| `/dashboard/forms/builder`     | سازنده فرم (Drag-Drop)           |
| `/dashboard/forms/submissions` | ارسال‌های فرم                    |
| `/profile`                     | پروفایل کاربر                    |
| `/settings`                    | تنظیمات (پوسته، اعلان‌ها)        |
| `/notifications`               | اعلان‌ها                         |
| `/manager/[dept]`              | داشبورد معاونت                   |

### صفحات مدیریتی (۸ صفحه)

| مسیر               | توضیح                       |
| ------------------ | --------------------------- |
| `/admin`           | کنسول مدیریت                |
| `/admin/pages`     | سازنده صفحه (Page Builder)  |
| `/admin/themes`    | مدیریت تم و توکن‌ها         |
| `/admin/rbac`      | مدیریت دسترسی (RBAC Matrix) |
| `/admin/org-chart` | نمودار سازمانی              |
| `/admin/storage`   | مدیریت استوریج (Local/S3)   |
| `/admin/audit`     | لاگ فعالیت‌ها               |
| `/admin/users`     | مدیریت کاربران              |

---

## سیستم ویجت

### ویجت‌های موجود (۱۹ ویجت)

| شناسه                      | نام                | دسته       | توضیح               |
| -------------------------- | ------------------ | ---------- | ------------------- |
| `hero-media`               | Hero Media         | Hero       | اسلایدر سینمایی     |
| `quick-access`             | دسترسی سریع        | Navigation | شبکه آیکونی         |
| `internet-login`           | لاگین اینترنت      | Auth       | فرم ورود سازمانی    |
| `news-timeline`            | خط زمان اخبار      | Content    | آخرین اخبار         |
| `dept-announcements`       | اطلاعیه‌های واحدها | Content    | تب‌دار              |
| `media-gallery`            | گالری رویدادها     | Media      | Masonry             |
| `it-services`              | سرویس‌های IT       | Services   | کارت‌های خدمات      |
| `research-highlights`      | برجسته‌های پژوهش   | Knowledge  | کارشناسان و ایده‌ها |
| `calendar-prayer`          | تقویم و اوقات      | Utility    | شمسی + شرعی         |
| `weather-tabriz`           | آب و هوا           | Utility    | تبریز               |
| `admin-kpi-stats`          | KPI مدیریتی        | Admin      | شاخص‌ها             |
| `dept-document-center`     | مرکز اسناد         | Department | فهرست اسناد         |
| `dept-forms-center`        | مرکز فرم‌ها        | Department | فرم‌های فعال        |
| `dept-experts-directory`   | فهرست کارشناسان    | Department | مهارت‌ها            |
| `dept-service-cards`       | کارت‌های خدمات     | Department | سرویس‌ها            |
| `services-grid`            | خدمات و سامانه‌ها  | Services   | گرید                |
| `help-cards`               | کارت‌های راهنما    | Support    | تیکت، FAQ           |
| `dept-announcements-basic` | اطلاعیه‌ها         | Content    | ساده                |
| `occasion-banner`          | بنر مناسبتی        | Content    | تبریک               |

### ایجاد ویجت جدید

```tsx
// components/widgets/my-widget.tsx
'use client'
import type { WidgetProps } from './types'

export function MyWidget({ instance, config }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-heading-1 text-foreground">عنوان ویجت</h2>
      {/* محتوا */}
    </div>
  )
}
```

```tsx
// components/widgets/manifest.ts
import { MyWidget } from './my-widget'

widgetRegistry.register(
  {
    id: 'my-widget',
    name: 'ویجت من',
    category: 'Custom',
    defaultSize: { cols: 6, rows: 4 },
  },
  MyWidget
)
```

---

## طراحی (PEDS)

### سیستم رنگ

| توکن              | مقدار     | کاربرد              |
| ----------------- | --------- | ------------------- |
| `--brand-primary` | `#00A6B6` | فیروزه تبریز        |
| `--gold`          | `#CDA349` | طلا (افتخارات)      |
| `--navy`          | `#0F172A` | سرمه‌ای (Dark Mode) |
| `--success`       | `#059669` | موفقیت              |
| `--warning`       | `#D97706` | هشدار               |
| `--error`         | `#DC2626` | خطا                 |
| `--info`          | `#0284C7` | اطلاعات             |

### تایپوگرافی

| توکن             | فونت           | کاربرد   |
| ---------------- | -------------- | -------- |
| `--font-display` | Estedad        | عنوان‌ها |
| `--font-sans`    | Vazirmatn      | متن      |
| `--font-mono`    | JetBrains Mono | کد       |

### افکت‌ها

- **Glassmorphism:** کارت‌های بلوری (`glass` class)
- **Identity Pattern:** SVG گره‌چینی مسجد کبود (`peds-pattern` class)
- **RTL-First:** راست به چپ

---

## بک‌اند

### ساختار ماژول‌ها (۱۴ بخش مرزی)

| ماژول             | مسئولیت                      |
| ----------------- | ---------------------------- |
| `iam`             | هویت و احراز هویت            |
| `access-control`  | RBAC + ABAC                  |
| `organization`    | ساختار سازمانی (ltree)       |
| `content`         | CMS Core (SCM)               |
| `media`           | مدیریت فایل                  |
| `widget-engine`   | موتور ویجت                   |
| `forms`           | فرم‌ساز دوحالت               |
| `knowledge`       | کارشناسان و نخبگان           |
| `software`        | مرکز نرم‌افزار               |
| `search`          | جستجو (OpenSearch)           |
| `communication`   | ارتباطات (WebSocket)         |
| `mobile-identity` | هویت موبایل (OTP/QR)         |
| `analytics`       | تحلیل و آمار                 |
| `integration`     | یکپارچگی با سامانه‌های قدیمی |

### API‌های کلیدی

```
GET    /api/v1/contents                    ← لیست محتوا
POST   /api/v1/contents                    ← ایجاد محتوا
POST   /api/v1/contents/{id}/publish       ← انتشار
GET    /api/v1/widget-engine/pages/{key}/render-data  ← داده ویجت‌ها
POST   /api/v1/forms/{slug}/submit         ← ارسال فرم
GET    /api/v1/conversations               ← لیست مکاتبات
WS     /ws/inbox                           ← ارتباطات بلادرنگ
GET    /api/v1/search/unified              ← جستجوی یکپارچه
```

---

## دیتابیس

### مدل داده (۴۰+ مدل)

| بخش                | جداول                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **IAM**            | `users`, `user_devices`, `qr_link_tokens`, `push_subscriptions`            |
| **RBAC**           | `atomic_permissions`, `roles`, `role_permissions`, `user_role_assignments` |
| **Organization**   | `organization_units` (ltree), `microsite_configs`                          |
| **Content**        | `content_items`, `content_versions`, `tags`, `categories`                  |
| **Media**          | `storage_providers`, `media_assets`                                        |
| **Widget**         | `widget_manifests`, `page_layouts`, `theme_tokens`                         |
| **Forms**          | `form_definitions`, `form_submissions`, `afish_records`                    |
| **Communication**  | `conversations`, `messages`, `notifications`                               |
| **Software**       | `software_entries`, `it_tickets`                                           |
| **Infrastructure** | `outbox_events`, `audit_logs`, `system_settings`                           |

### RLS (Row Level Security)

تمام جداول دارای RLS فعال هستند. کنترل دسترسی از طریق `current_tenant_id()` و `current_user_id()` انجام می‌شود.

---

## استقرار

### Docker Compose (محلی)

```bash
cd backend
docker-compose up -d
```

سرویس‌ها: PostgreSQL, Redis, MinIO, OpenSearch, Keycloak

### Kubernetes (تولید)

```bash
# بوت‌استرپ
ansible-playbook -i inventory/hosts infra/ansible/bootstrap.yml

# استقرار با ArgoCD
kubectl apply -f infra/gitops/argocd-applications.yaml
```

### هرمونی (Helm)

```bash
helm upgrade --install dwp-backend infra/helm/dwp-backend -n dwp
```

---

## تست

### تست‌های Unit (Vitest)

```bash
pnpm test:run
pnpm test:coverage
```

### تست‌های E2E (Playwright)

```bash
pnpm test:e2e
pnpm test:e2e:ui
```

### تست‌های بار (k6)

```bash
k6 run --vus 400 --duration 30m scenarios/load-test.js
```

### تست‌های امنیتی

```bash
trivy image --severity CRITICAL,HIGH harbor.iribtabriz.ir/dwp/backend:latest
zap-api-scan.py -t https://api.iribtabriz.ir/openapi.yaml
```

---

## دستورات

| دستور            | توضیح                 |
| ---------------- | --------------------- |
| `pnpm dev`       | سرور توسعه            |
| `pnpm build`     | بیلد تولید            |
| `pnpm start`     | سرور تولید            |
| `pnpm lint`      | بررسی ESLint          |
| `pnpm lint:fix`  | اصلاح خودکار          |
| `pnpm format`    | فرمت Prettier         |
| `pnpm typecheck` | بررسی TypeScript      |
| `pnpm test`      | تست‌های Unit          |
| `pnpm test:run`  | اجرای تست‌ها          |
| `pnpm test:e2e`  | تست‌های E2E           |
| `pnpm storybook` | Storybook             |
| `pnpm knip`      | بررسی کد استفاده نشده |

---

## متغیرهای محیطی

```env
# فرانت‌اند
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# بک‌اند
DATABASE_URL=postgresql://irib_admin:***@localhost:5432/irib_dwp
REDIS_URL=redis://:***@localhost:6379
KEYCLOAK_URL=http://localhost:8080
MINIO_ENDPOINT=localhost:9000
JWT_SECRET=your-secret-key
```

---

## تیم پروژه

| نقش                       | مسئولیت                    |
| ------------------------- | -------------------------- |
| **معمار ارشد**            | معماری سیستم و تصمیمات فنی |
| **مدیر پروژه**            | برنامه‌ریزی و هماهنگی      |
| **توسعه‌دهنده فرانت‌اند** | رابط کاربری و تجربه کاربری |
| **توسعه‌دهنده بک‌اند**    | API و منطق کسب‌وکار        |
| **دیتابیس‌آدمین**         | مدل‌سازی و بهینه‌سازی      |
| ** DevOps Engineer**      | استقرار و نظارت            |
| **امنیت**                 | تست نفوذ و سخت‌سازی        |

---

## مجوز

کلیه حقوق این پروژه متعلق به **صدا و سیمای مرکز آذربایجان شرقی** است.

© ۱۴۰۴
