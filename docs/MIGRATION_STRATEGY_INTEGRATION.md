# یکپارچه‌سازی استراتژی مایگریشن - پیشنهاد

## وضعیت فعلی

پروژه دارای دو سیستم migration متفاوت است:

### 1. SQL Manual Migrations

- مسار: `backend/migrations/`
- فایل‌ها: V000__extensions.sql, V010__core_domain.sql, V020__rls_policies.sql, V030__partitioning_high_volume_tables.sql, V031__brin_indexes_outbox_sms.sql
- کاربرد: Extensions, functions, partitioning, complex SQL logic

### 2. Prisma Migrations

- مسار: `backend/prisma/migrations/`
- فایل‌ها: 20260821220546_145050531/migration.sql
- کاربرد: Schema تعریف شده در Prisma

## مشکل

دو سیستم migration متفاوت یک **anti-pattern** است:

1. Risk of conflicts بین دو سیستم
2. Difficult to track source of truth
3. Potential for schema drift
4. Complex rollback procedures
5. Hard to audit changes

## پیشنهاد استراتژی

### گزینه 1: Prisma-Centric (توصیه شده)

**منبع حقیقت:** Prisma Schema
**SQL Manual:** فقط برای موارد خاص که Prisma پشتیبانی نمی‌کند

#### مزایا

- ✅ Single source of truth
- ✅ Type safety
- ✅ Better developer experience
- ✅ Automatic migration generation
- ✅ Better rollback support

#### معایب

- ❌ Limited support برای complex SQL (extensions, functions)
- ❌ Need for manual intervention برای advanced features

#### پیاده‌سازی

1. Prisma schema را به عنوان منبع اصلی نگه دارید
2. SQL manual migrations را برای موارد زیر استفاده کنید:
   - Extensions (uuid-ossp, pgcrypto, ltree, etc.)
   - Custom functions
   - Triggers
   - Partitioning logic
   - Complex constraints

3. Migration flow:
   ```bash
   # برای schema changes:
   pnpm prisma migrate dev --name change_description

   # برای SQL manual:
   # فایل جدید در backend/migrations/ ایجاد کنید
   # و آن را دستی اجرا کنید
   ```

### گزینه 2: SQL-Centric

**منبع حقیقت:** SQL Manual Migrations
**Prisma:** فقط برای type generation و ORM

#### مزایا

- ✅ Full control over SQL
- ✅ Better برای complex database operations
- ✅ Transparent migration process

#### معایب

- ❌ Manual schema sync با Prisma
- ❌ Risk of schema drift
- ❌ More boilerplate code
- ❌ Harder to maintain

#### پیاده‌سازی

1. SQL manual migrations را به عنوان منبع اصلی نگه دارید
2. Prisma schema را با SQL sync کنید
3. Prisma را فقط برای ORM استفاده کنید

### گزینه 3: Flyway Migration

**منبع حقیقت:** Flyway
**Prisma:** فقط برای ORM
**SQL Manual:** حذف شود

#### مزایا

- ✅ Industry standard برای database migrations
- ✅ Better enterprise support
- ✅ Strong versioning and rollback

#### معایب

- ❌ Need to learn new tool
- ❌ More complex setup
- ❌ Additional dependency

## توصیه نهایی: گزینه 1 (Prisma-Centric)

### دلیل انتخاب

1. پروژه قبلاً از Prisma استفاده می‌کند
2. Prisma schema کامل و جامع است
3. تیم با Prisma آشنا است
4. بهتر است از ابزار موجود استفاده کنیم تا معرفی ابزار جدید

### ساختار پیشنهادی

```
backend/
├── prisma/
│   ├── schema.prisma              # Main schema (source of truth)
│   ├── migrations/                # Schema migrations (Prisma)
│   └── seed.ts                     # Seed data
├── migrations/                     # Advanced SQL (renamed to db_extensions/)
│   ├── 000_extensions.sql         # Extensions, functions
│   ├── 001_partitioning.sql       # Partitioning logic
│   └── 002_triggers.sql           # Triggers, complex logic
└── scripts/
    ├── migrate.sh                  # Runs both Prisma and SQL migrations
    └── rollback.sh                # Rollback procedure
```

### Migration Script پیشنهادی

```bash
#!/bin/bash
# scripts/migrate.sh

set -e

echo "Running database migrations..."

# 1. Run Prisma migrations (schema)
cd backend
pnpm prisma migrate deploy

# 2. Run SQL manual migrations (extensions, functions)
for file in ../migrations/*.sql; do
    echo "Running $file..."
    psql "$DATABASE_URL" -f "$file"
done

echo "Migrations completed successfully!"
```

## مراحل پیاده‌سازی

### فاز 1: Preparation

1. Backup از database فعلی
2. Review همه SQL manual migrations
3. Identify موارد که باید در Prisma باقی بمانند

### فاز 2: Migration

1. Rename `backend/migrations/` به `backend/db_extensions/`
2. Update CI/CD برای اجرای هر دو نوع migration
3. Update documentation

### فاز 3: Validation

1. Test migration روی staging
2. Verify schema consistency
3. Test rollback procedure

### فاز 4: Documentation

1. Write migration guide
2. Update team onboarding docs
3. Create troubleshooting guide

## تأیید و Approvals

- [ ] Tech Lead approval
- [ ] DBA review
- [ ] Team consensus
- [ ] Staging test successful

## تاریخچه

- 2026-09-11: پیشنهاد استراتژی migration
