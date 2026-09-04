# معماری سیستم — IRIB DWP

**طراح و توسعه‌دهنده:** میثم جعفرپور آلانق  
**مدرک تحصیلی:** کارشناسی ارشد مهندسی نرم‌افزار  
**عنوان شغلی:** کارشناس صدا و تصویر ۴  
**کارفرما/سفارش‌دهنده:** به سفارش معاونت فنی صدا و سیمای مرکز آذربایجان شرقی  

کلیه حقوق محفوظ است © ۱۴۰۴

---

## ⚠️ مهم: این مستند برای کدام نسخه است؟

این مستند برای **نسخه کامل زیرساختی (backend/docker-compose.db.yml)** نوشته شده است.

### نسخه‌های پروژه

- **نسخه توسعه ساده (docker-compose.dev.yml):** 4 سرویس (frontend, backend, postgres, redis)
  - مناسب برای: توسعه روزمره با hot-reload
  - دسترسی: `docker-compose -f docker-compose.dev.yml up`
  
- **نسخه کامل زیرساختی (backend/docker-compose.db.yml):** 11+ سرویس
  - مناسب برای: توسعه کامل با تمام زیرساخت‌ها
  - دسترسی: `docker-compose -f backend/docker-compose.db.yml up`

### این مستند برای کدام نسخه است؟

✅ **نسخه کامل زیرساختی (db.yml)** - این مستند برای این نسخه است
❌ **نسخه توسعه ساده (dev.yml)** - این مستند برای این نسخه نیست

### اگر از نسخه توسعه ساده استفاده می‌کنید:

لطفاً به مستندات زیر مراجعه کنید:
- [README.md](./README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## چشم‌انداز معماری

پلتفرم محیط کار دیجیتال (DWP) بر اساس اصول **Domain-Driven Design (DDD)**، **API-First**، **Widget-Driven** و **Zero Trust Security** طراحی شده است.

---

## اصول معماری

| اصل                          | توضیح                                       |
| ---------------------------- | ------------------------------------------- |
| **API-First**                | قراردادهای OpenAPI 3.1 منبع حقیقت هستند     |
| **Single Content Model**     | تمام موجودیت‌ها از یک متا مدل مشتق می‌شوند  |
| **Widget-Driven**            | صفحات از ترکیب ویجت‌های مستقل ساخته می‌شوند |
| **Dynamic RBAC + ABAC**      | کنترل دسترسی ترکیبی نقش + حوزه + مجوز اتمیک |
| **Design Token Centric**     | تمام تصمیمات بصری از توکن‌ها مدیریت می‌شوند |
| **Mobile-First PWA**         | موبایل یک First-Class Citizen است           |
| **Observability by Default** | لاگ، متریک و ردیابی خطا در تمام لایه‌ها     |

---

## نمای کلی معماری (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────┐
│                      کاربران                                │
│  (کارمند / مدیر / کارشناس / نخبگان / ادمین)              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / PWA
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Ingress (NGINX + WAF)                      │
│                  TLS 1.3 + Rate Limiting                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Frontend  │  │   Backend   │  │   PDF Gen   │
│  (Next.js)  │  │  (NestJS)   │  │  (Puppeteer)│
│  Port: 3000 │  │  Port: 3001 │  │  Port: 3002 │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │                ▼                │
       │       ┌────────────────┐        │
       │       │  API Gateway   │        │
       │       │  (Kong/NGINX)  │        │
       │       └───────┬────────┘        │
       │               │                 │
       │    ┌──────────┼──────────┐      │
       │    ▼          ▼          ▼      │
       │ ┌──────┐ ┌────────┐ ┌──────┐   │
       │ │ Post │ │ Redis  │ │Kafka │   │
       │ │ greSQL│ │Cluster │ │      │   │
       │ └──────┘ └────────┘ └──────┘   │
       │               │                 │
       │               ▼                 │
       │       ┌────────────────┐        │
       │       │   OpenSearch   │        │
       │       └────────────────┘        │
       │               │                 │
       │               ▼                 │
       │       ┌────────────────┐        │
       └──────▶│     MinIO      │◀───────┘
               │ (S3 Storage)   │
               └────────────────┘
```

---

## لایه‌های سیستم

### ۱. لایه ارائه (Presentation Layer)

**تکنولوژی:** Next.js 16, React 19, Tailwind CSS 4

**سئولیت‌ها:**

- رندر صفحات (SSR/SSG/ISR)
- مدیریت state (TanStack Query + Zustand)
- اعتبارسنجی فرم‌ها (React Hook Form + Zod)
- رندر ویجت‌ها (Widget Engine)
- PWA و آفلاین
- امنیت کلاینت (CSP, XSS Protection)

### ۲. لایه API (API Layer)

**تکنولوژی:** NestJS 10, OpenAPI 3.1

**سئولیت‌ها:**

- اعتبارسنجی درخواست‌ها (DTO + Zod)
- کنترل دسترسی (RBAC Guards)
- مسیریابی درخواست‌ها
- WebSocket (بلادرنگ)
- Rate Limiting
- مستندسازی (Swagger)

### ۳. لایه کسب‌وکار (Business Layer)

**تکنولوژی:** NestJS Modules (14 Bounded Contexts)

**سئولیت‌ها:**

- منطق کسب‌وکار هر بخش
- گردش کار محتوا (Workflow)
- مدیریت فرم‌ها (Dual Mode)
- ارتباطات (Thread-based)
- جستجو و تحلیل

### ۴. لایه دسترسی به داده (Data Access Layer)

**تکنولوژی:** Prisma ORM, PostgreSQL 16

**سئولیت‌ها:**

- ORM Mapping
- Migration Management
- RLS Enforcement
- Connection Pooling
- Query Optimization

### ۵. لایه زیرساخت (Infrastructure Layer)

**تکنولوژی:** Docker, Kubernetes, ArgoCD

**سئولیت‌ها:**

- استقرار (Deployment)
- مقیاس‌پذیری (Scaling)
- نظارت (Monitoring)
- امنیت (Security)
- پشتیبان‌گیری (Backup)

---

## الگوهای طراحی

### Widget Engine Pattern

```
Page → Layout Config → Widget Instances → Widget Registry → Rendered Components
```

- هر ویجت یک کامپوننت مجزا با Manifest
- پیکربندی از CMS/API دریافت می‌شود
- Conditional Visibility بر اساس مجوز

### Outbox Pattern (Event-Driven)

```
Business Logic → INSERT INTO outbox_events → Debezium CDC → Kafka → Consumers
```

- تضمین تحویل قابل اعتماد پیام‌ها
- جداسازی ماژول‌ها
- قابلیت بازیابی

### RBAC + Scope Pattern

```
User → Role → AtomicPermissions ∩ Scope → Effective Permissions
```

- مجوز اتمیک: `Content.Create`, `Form.Submit`, ...
- حوزه اجرا: Global, Department, Unit, Ownership
- Override: `grantedPermissions` / `deniedPermissions`

---

## مدل داده (SCM)

### Single Content Model

تمام موجودیت‌ها (خبر، اطلاعیه، رویداد، فرم، ...) از یک مدل `ContentItem` مشتق می‌شوند:

```
ContentItem
├── contentType (Enum: NEWS, ANNOUNCEMENT, EVENT, ...)
├── status (Enum: DRAFT, PUBLISHED, ARCHIVED, ...)
├── title (JSONB: {fa, en})
├── body (JSONB: TipTap/HTML)
├── metadata (JSONB: فیلدهای پویا)
├── scope_ids (UUID[]): حوزه دسترسی
├── tags (UUID[]): برچسب‌ها
└── version (INT): نسخه‌بندی
```

---

## امنیت

### لایه‌های امنیتی

| لایه            | کنترل                                                           |
| --------------- | --------------------------------------------------------------- |
| **شبکه**        | NetworkPolicy (Default Deny), mTLS, WAF                         |
| **application** | RBAC, Input Validation, CSP Headers                             |
| **داده**        | Encryption at Rest (LUKS), In Transit (TLS 1.3), PII (pgcrypto) |
| **زیرساخت**     | Pod Security (Restricted), Image Scanning, Secret Management    |

### Zero Trust Model

- هیچ درخواستی بدون احراز هویت پذیرفته نمی‌شود
- کنترل دسترسی در ۳ لایه: Gateway, Backend, Database (RLS)
- لاگ تمام فعالیت‌ها (Audit Trail)

---

## مقیاس‌پذیری

### Horizontal Scaling

- Backend: HPA (CPU/Memory + Custom Metrics)
- Frontend: CDN + ISR Cache
- Database: Read Replicas
- Search: OpenSearch Cluster

### Vertical Scaling

- Resource Limits قابل تنظیم
- Connection Pooling (PgBouncer)
- Query Optimization (Indexes, Partitioning)

---

## مشاهده‌پذیری (Observability)

| ستون       | ابزار                | کاربرد                   |
| ---------- | -------------------- | ------------------------ |
| **متریک**  | Prometheus + Grafana | KPIs, Alerts, Dashboards |
| **لاگ**    | Loki + Grafana       | Application Logs, Audit  |
| **Trace**  | Tempo + Grafana      | Distributed Tracing      |
| **Uptime** | Blackbox Exporter    | Health Checks            |

---

## تصمیمات معماری (ADR)

| شماره   | تصمیم                                  | وضعیت      |
| ------- | -------------------------------------- | ---------- |
| ADR-001 | NestJS به عنوان Framework بک‌اند       | ✅ پذیرفته |
| ADR-002 | PostgreSQL به عنوان دیتابیس اصلی       | ✅ پذیرفته |
| ADR-003 | معماری Widget-Driven                   | ✅ پذیرفته |
| ADR-004 | ارتباطات Event-Driven (Outbox + Kafka) | ✅ پذیرفته |
| ADR-005 | Keycloak برای IAM                      | ✅ پذیرفته |
| ADR-006 | GitOps Deployment (ArgoCD)             | ✅ پذیرفته |
| ADR-007 | طراحی RTL-First                        | ✅ پذیرفته |
| ADR-008 | PWA برای موبایل                        | ✅ پذیرفته |
| ADR-009 | MinIO برای Object Storage              | ✅ پذیرفته |
| ADR-010 | OpenSearch برای جستجو                  | ✅ پذیرفته |
