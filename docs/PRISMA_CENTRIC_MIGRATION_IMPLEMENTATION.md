# پیاده‌سازی استراتژی Prisma-Centric

## تغییرات انجام شده

### 1. تغییر نام پوشه

```bash
# قبل: backend/migrations/
# بعد: backend/db_extensions/
```

این تغییر نشان می‌دهد که این فایل‌ها برای SQL manual هستند، نه migration اصلی.

### 2. ایجاد scripts/migrate.sh

```bash
#!/bin/bash
# Database migration script for IRIB DWP
# Runs both Prisma migrations and manual SQL extensions

set -e

echo "🔄 Running database migrations..."

# 1. Run Prisma migrations (schema)
echo "📋 Running Prisma migrations..."
cd backend
pnpm prisma migrate deploy

# 2. Run SQL manual migrations (extensions, functions)
echo "🔧 Running SQL manual migrations..."
for file in ../db_extensions/*.sql; do
  if [ -f "$file" ]; then
    echo "Running $file..."
    psql "$DATABASE_URL" -f "$file"
  fi
done

echo "✅ Migrations completed successfully!"
```

### 3. ایجاد scripts/migrate.ps1

PowerShell version برای Windows.

### 4. ایجاد scripts/rollback.sh و rollback.ps1

Rollback scripts برای هر دو پلتفرم.

### 5. به‌روزرسانی backend/package.json

```json
"scripts": {
  "db:migrate": "bash scripts/migrate.sh",
  "db:rollback": "bash scripts/rollback.sh"
}
```

### 6. به‌روزرسانی CI/CD pipeline

```yaml
- name: Run database migrations
  working-directory: ./backend
  env:
    DATABASE_URL: postgresql://test:test@localhost:5432/irib_dwp_test
  run: bash scripts/migrate.sh
```

## استفاده

### Local Development

```bash
# Linux/Mac
cd backend
pnpm db:migrate

# Windows
cd backend
pnpm db:migrate
```

### Production

```bash
# Migration
bash backend/scripts/migrate.sh

# Rollback
bash backend/scripts/rollback.sh
```

## ساختار نهایی

```
backend/
├── prisma/
│   ├── schema.prisma              # Main schema (source of truth)
│   ├── migrations/                # Schema migrations (Prisma)
│   └── seed.ts                     # Seed data
├── db_extensions/                  # Advanced SQL (renamed from migrations/)
│   ├── 000_extensions.sql         # Extensions, functions
│   ├── 001_partitioning.sql       # Partitioning logic
│   └── 002_triggers.sql           # Triggers, complex logic
└── scripts/
    ├── migrate.sh                  # Runs both Prisma and SQL migrations
    ├── migrate.ps1                 # Windows version
    ├── rollback.sh                # Rollback procedure
    └── rollback.ps1               # Windows version
```

## استراتژی Migration

### برای Schema Changes

```bash
pnpm prisma migrate dev --name change_description
```

### برای Advanced SQL

1. فایل جدید در `backend/db_extensions/` ایجاد کنید
2. SQL code را بنویسید
3. در staging تست کنید
4. migration script اجرا می‌کند آن را

### Rollback

```bash
pnpm db:rollback
```

## تأیید

- ✅ پوشه `migrations/` به `db_extensions/` تغییر نام یافت
- ✅ Migration scripts ایجاد شدند
- ✅ Package.json scripts به‌روزرسانی شدند
- ✅ CI/CD pipeline به‌روزرسانی شد
- ✅ هماهنگی کامل بین Prisma و SQL manual

## تاریخچه

- 2026-09-11: پیاده‌سازی استراتژی Prisma-Centric با migration scripts
