# راهنمای دیتابیس — IRIB DWP

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
- [README.md](../README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](../DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## ساختار دیتابیس

### PostgreSQL 16 Extensions

- `uuid-ossp` — تولید UUID
- `pgcrypto` — رمزنگاری PII
- `ltree` — ساختار درختی سازمان
- `pg_trgm` — جستجوی فازی فارسی
- `pg_partman` — پارتیشن‌بندی خودکار
- `pg_cron` — وظایف زمان‌بندی شده

### ERD (Mermaid)

```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    USERS ||--o{ USER_DEVICES : has
    USERS ||--o{ USER_ROLE_ASSIGNMENTS : has
    ROLES ||--o{ USER_ROLE_ASSIGNMENTS : has
    ROLES ||--o{ ROLE_PERMISSIONS : has
    ATOMIC_PERMISSIONS ||--o{ ROLE_PERMISSIONS : has

    ORGANIZATION_UNITS ||--o{ ORGANIZATION_UNITS : parent
    ORGANIZATION_UNITS ||--o{ MICROSITE_CONFIGS : has
    USERS ||--o{ ORGANIZATION_UNITS : manages

    USERS ||--o{ CONTENT_ITEMS : authors
    ORGANIZATION_UNITS ||--o{ CONTENT_ITEMS : scopes
    CONTENT_ITEMS ||--o{ CONTENT_VERSIONS : versions
    CONTENT_ITEMS ||--o{ CONTENT_TAGS : tags

    MEDIA_ASSETS ||--o{ CONTENT_MEDIA : attached
    CONTENT_ITEMS ||--o{ CONTENT_MEDIA : has

    FORM_DEFINITIONS ||--o{ FORM_SUBMISSIONS : has
    FORM_SUBMISSIONS ||--o{ AFISH_RECORDS : has

    CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : has
    CONVERSATIONS ||--o{ MESSAGES : has
    USERS ||--o{ MESSAGES : sends

    ORGANIZATION_UNITS ||--o{ IT_TICKETS : has
    USERS ||--o{ IT_TICKETS : creates
```

### جداول اصلی

| بخش                | جداول                                                                      | توضیح                    |
| ------------------ | -------------------------------------------------------------------------- | ------------------------ |
| **IAM**            | `users`, `user_devices`, `qr_link_tokens`, `push_subscriptions`            | هویت و احراز هویت        |
| **Access Control** | `atomic_permissions`, `roles`, `role_permissions`, `user_role_assignments` | کنترل دسترسی پویا        |
| **Organization**   | `organization_units`, `microsite_configs`                                  | ساختار سازمانی (ltree)   |
| **Content (SCM)**  | `content_items`, `content_versions`, `tags`, `categories`                  | مدل محتوای واحد          |
| **Media**          | `storage_providers`, `media_assets`                                        | مدیریت فایل‌ها           |
| **Widget Engine**  | `widget_manifests`, `page_layouts`, `theme_tokens`                         | موتور ویجت و چیدمان      |
| **Forms**          | `form_definitions`, `form_submissions`, `afish_records`                    | فرم‌ساز دوحالت           |
| **Communication**  | `conversations`, `conversation_participants`, `messages`, `notifications`  | کارتابل ارتباطات         |
| **Knowledge**      | `expert_profiles`, `skills_taxonomy`                                       | بانک کارشناسان           |
| **Software & IT**  | `software_entries`, `software_versions`, `it_tickets`                      | مرکز نرم‌افزار و تیکتینگ |
| **Infrastructure** | `outbox_events`, `audit_logs`, `system_settings`                           | زیرساخت پلتفرم           |

## RLS (Row Level Security)

### فعال‌سازی

```sql
-- RLS on ALL tables
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items FORCE ROW LEVEL SECURITY;
```

### تنظیم Context (Application Layer)

```sql
-- Per Request
SET app.current_tenant = 'irib-east-az-uuid';
SET app.current_user_id = 'user-uuid';
SET app.current_scopes = 'dept-it-uuid,dept-hr-uuid';
```

### تست RLS

```sql
-- As app_role (Application)
SET ROLE app_role;
SET app.current_tenant = '...';
SET app.current_user_id = '...';

-- Should only see published content in scope
SELECT * FROM content_items; -- RLS Filtered

-- Reset
RESET ROLE;
```

## Performance Indexes

### Critical Indexes

```sql
-- Content Search
CREATE INDEX idx_content_fts ON content_items USING GIN (search_vector);
CREATE INDEX idx_content_scope_gin ON content_items USING GIN (scope_ids);
CREATE INDEX idx_content_published_at ON content_items (published_at DESC) WHERE status = 'PUBLISHED';

-- Organization Hierarchy
CREATE INDEX idx_org_units_path_gist ON organization_units USING GIST (path);

-- Inbox/Conversations
CREATE INDEX idx_cp_user_unread ON conversation_participants (user_id, last_read_at) WHERE left_at IS NULL;
CREATE INDEX idx_msg_conv_created ON messages (conversation_id, created_at DESC);

-- Audit Logs (Partitioned)
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, event_time DESC);
```

## Partitioning

### Audit Logs (Monthly)

```sql
-- pg_partman setup
SELECT partman.create_parent(
    'public.audit_logs',
    'event_time',
    'native',
    'monthly'
);
```

### Outbox Events (Retention)

```sql
-- Keep 30 days
SELECT partman.drop_old_partitions(
    'public.outbox_events',
    p_retention := '30 days'
);
```

## Connection Pooling (PgBouncer)

### Config

```ini
[pgbouncer]
pool_mode = transaction
default_pool_size = 20
max_client_conn = 100
server_idle_timeout = 600
```

### Connection String

```
postgresql://irib_admin:***@localhost:6432/irib_dwp
```

## Naming Conventions

| نوع         | الگو                    | مثال                          |
| ----------- | ----------------------- | ----------------------------- |
| Table       | `snake_case`            | `content_items`               |
| Column      | `snake_case`            | `created_at`                  |
| Primary Key | `id`                    | `id UUID`                     |
| Foreign Key | `{table}_id`            | `author_id`                   |
| Boolean     | `is_` or `has_`         | `is_active`, `has_permission` |
| Timestamp   | `_at`                   | `created_at`, `deleted_at`    |
| Enum        | `_enum` suffix          | `content_type_enum`           |
| Index       | `idx_{table}_{columns}` | `idx_content_published_at`    |

## Backup & Restore

### WAL-G Backup

```bash
# Backup
wal-g backup-push /var/lib/postgresql/data

# Restore
wal-g backup-fetch /var/lib/postgresql/data LATEST
```

### pg_dump

```bash
# Full Backup
pg_dump -h localhost -U irib_admin irib_dwp > backup.sql

# Schema Only
pg_dump --schema-only -h localhost -U irib_admin irib_dwp > schema.sql
```
