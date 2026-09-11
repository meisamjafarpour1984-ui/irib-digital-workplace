# راهنمای تغییرات ساختار پروژه و بروزرسانی

## مقدمه

این راهنما توضیح می‌دهد که بعد از هر نوع تغییر در ساختار پروژه IRIB Digital Workplace، چه چیزهایی باید بروزرسانی، ریستارت یا دوباره ساخته شوند تا پروژه به درستی کار کند.

---

## تغییرات Frontend (Next.js)

### ۱. تغییرات Component و Page

**نوع تغییر:**

- ویرایش یا ایجاد کامپوننت‌های React
- ویرایش یا ایجاد صفحات Next.js
- تغییرات در CSS/Styles

**اقدام لازم:**

- ❌ نیازی به ریستارت نیست
- ✅ Hot Reload خودکار کار می‌کند

### ۲. تغییرات Environment Variables

**نوع تغییر:**

- تغییر متغیرهای محیطی در `.env.local` یا `.env`

**اقدام لازم:**

- ⚠️ **باید ریستارت شود**
- ```bash

  ```

# Stop dev server (Ctrl+C)

# Restart dev server

npm run dev

# یا

pnpm dev

````

### ۳. تغییرات next.config.js
**نوع تغییر:**
- تغییر تنظیمات Next.js
- اضافه کردن redirectها
- تغییر تنظیمات webpack

**اقدام لازم:**
- ⚠️ **باید ریستارت شود**
- ```bash
# Stop dev server (Ctrl+C)
# Restart dev server
npm run dev
````

### ۴. تغییرات package.json

**نوع تغییر:**

- اضافه/حذف dependency
- تغییر version dependency
- اضافه/حذف script

**اقدام لازم:**

- ⚠️ **باید نصب مجدد و ریستارت شود**
- ```bash

  ```

# Install dependencies

pnpm install

# Restart dev server

npm run dev

````

### ۵. تغییرات در app directory (Next.js 13+)
**نوع تغییر:**
- اضافه کردن route جدید
- تغییر layout
- تغییر route structure

**اقدام لازم:**
- ❌ نیازی به ریستارت نیست
- ✅ Next.js به صورت خودکار routes جدید را شناسایی می‌کند

---

## تغییرات Backend (NestJS)

### ۱. تغییرات Controller/Service/Module
**نوع تغییر:**
- اضافه کردن endpoint جدید
- ویرایش logic سرویس
- اضافه کردن module جدید

**اقدام لازم:**
- ⚠️ **باید ریستارت شود**
- ```bash
# Stop backend (Ctrl+C)
# Restart backend
npm run start:dev
# یا
pnpm start:dev
````

### ۲. تغییرات DTO (Data Transfer Objects)

**نوع تغییر:**

- تغییر validation rules
- اضافه کردن field جدید
- تغییر typeها

**اقدام لازم:**

- ⚠️ **باید ریستارت شود**
- ```bash

  ```

# Stop backend (Ctrl+C)

# Restart backend

npm run start:dev

````

### ۳. تغییرات Environment Variables
**نوع تغییر:**
- تغییر DATABASE_URL
- تغییر JWT_SECRET
- تغییر سایر متغیرهای محیطی

**اقدام لازم:**
- ⚠️ **باید ریستارت شود**
- ```bash
# Stop backend (Ctrl+C)
# Restart backend
npm run start:dev
````

### ۴. تغییرات package.json

**نوع تغییر:**

- اضافه/حذف dependency
- تغییر version dependency

**اقدام لازم:**

- ⚠️ **باید نصب مجدد و ریستارت شود**
- ```bash

  ```

# Install dependencies

pnpm install

# Restart backend

npm run start:dev

````

---

## تغییرات Database (Prisma)

### ۱. تغییرات Schema (prisma/schema.prisma)
**نوع تغییر:**
- اضافه کردن model جدید
- اضافه کردن field به model موجود
- تغییر type field
- اضافه/حذف relation

**اقدام لازم:**
- ⚠️ **باید sync شود**
- ```bash
# Development (push schema to DB)
npx prisma db push

# Production (create migration)
npx prisma migrate dev --name migration_name
npx prisma migrate deploy
````

### ۲. تغییرات Seed Data

**نوع تغییر:**

- ویرایش فایل seed
- اضافه کردن داده جدید

**اقدام لازم:**

- ⚠️ **باید اجرا شود**
- ```bash

  ```

pnpm dlx ts-node prisma/seed.ts

# یا

npx ts-node prisma/seed.ts

````

### ۳. تغییرات در client (Prisma Client)
**نوع تغییر:**
- تغییرات schema که نیاز به regeneration دارند

**اقدام لازم:**
- ⚠️ **باید regenerate شود**
- ```bash
npx prisma generate
````

---

## تغییرات Docker

### ۱. تغییرات docker-compose.yml

**نوع تغییر:**

- اضافه کردن service جدید
- تغییر پورت‌ها
- تغییر environment variables
- تغییر volumes

**اقدام لازم:**

- ⚠️ **باید recreate شود**
- ```bash

  ```

# Stop containers

docker-compose down

# Rebuild and start

docker-compose up -d --build

# یا فقط recreate بدون rebuild

docker-compose up -d --force-recreate

````

### ۲. تغییرات Dockerfile
**نوع تغییر:**
- تغییر base image
- اضافه کردن dependency جدید
- تغییر build steps

**اقدام لازم:**
- ⚠️ **باید rebuild شود**
- ```bash
# Rebuild specific service
docker-compose build service_name

# Rebuild all services
docker-compose build

# Start containers
docker-compose up -d
````

### ۳. تغییرات در Docker volumes

**نوع تغییر:**

- تغییر path volume
- اضافه کردن volume جدید

**اقدام لازم:**

- ⚠️ **باید recreate شود (با حذف volumes)**
- ```bash

  ```

# ⚠️ این دستور تمام داده‌ها را حذف می‌کند

docker-compose down -v

# Recreate

docker-compose up -d

````

---

## تغییرات Shared/Types

### ۱. تغییرات در shared types/interfaces
**نوع تغییر:**
- تغییر typeهای مشترک بین frontend و backend
- تغییر interfaceهای API

**اقدام لازم:**
- ⚠️ **هر دو باید ریستارت شوند**
- ```bash
# Frontend
# Stop dev server (Ctrl+C)
npm run dev

# Backend
# Stop backend (Ctrl+C)
npm run start:dev
````

---

## چک‌لیست سریع

| نوع تغییر          | ریستارت Frontend | ریستارت Backend | Sync DB | Rebuild Docker |
| ------------------ | ---------------- | --------------- | ------- | -------------- |
| Component/Page     | ❌               | -               | -       | -              |
| Env Var (Frontend) | ⚠️               | -               | -       | -              |
| Env Var (Backend)  | -                | ⚠️              | -       | -              |
| Controller/Service | -                | ⚠️              | -       | -              |
| Prisma Schema      | -                | -               | ⚠️      | -              |
| Seed Data          | -                | -               | ⚠️      | -              |
| docker-compose.yml | -                | -               | -       | ⚠️             |
| Dockerfile         | -                | -               | -       | ⚠️             |
| Shared Types       | ⚠️               | ⚠️              | -       | -              |

---

## دستورات مفید

### ریستارت کامل Development

```bash
# Stop everything
docker-compose down

# Install dependencies
pnpm install

# Sync database
npx prisma db push

# Seed database
pnpm dlx ts-node prisma/seed.ts

# Start Docker services
docker-compose up -d

# Start backend
cd backend
npm run start:dev

# Start frontend (در terminal جداگانه)
cd ..
npm run dev
```

### ریستارت سریع (فقط code changes)

```bash
# Backend
# Ctrl+C در terminal backend
npm run start:dev

# Frontend
# Ctrl+C در terminal frontend
npm run dev
```

### پاکسازی کامل cache

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules (اگر dependency مشکل دارد)
rm -rf node_modules
pnpm install

# Clear Docker cache
docker system prune -a
```

---

## عیب‌یابی

### مشکل: تغییرات اعمال نمی‌شود

**راه‌حل:**

1. مطمئن شوید dev server ریستارت شده است
2. cache را پاک کنید
3. browser را hard refresh کنید (Ctrl+Shift+R)

### مشکل: Database connection failed

**راه‌حل:**

1. مطمئن شوید PostgreSQL container اجرا است: `docker ps`
2. DATABASE_URL را بررسی کنید
3. Schema را sync کنید: `npx prisma db push`

### مشکل: Docker container start نمی‌شود

**راه‌حل:**

1. Logs را بررسی کنید: `docker-compose logs service_name`
2. پورت اشغال شده را بررسی کنید
3. Container را recreate کنید: `docker-compose up -d --force-recreate`

### مشکل: Wizard کار نمی‌کند

**راه‌حل:**

1. مطمئن شوید backend روی پورت 3001 اجرا است
2. Backend را ریستارت کنید
3. اگر backend در Docker است، Docker socket را mount کنید
4. CORS را بررسی کنید

---

## نکات مهم

1. **همیشه قبل از تغییرات مهم backup بگیرید**
2. **در production، همیشه از migration استفاده کنید نه db push**
3. **environment variables را هرگز در git commit نکنید**
4. **پس از تغییرات database، همیشه seed را اجرا کنید**
5. **برای تغییرات Docker، همیشه docker-compose.yml را بررسی کنید**

---

**نسخه:** 1.0  
**تاریخ:** 2026-09-09  
**توسعه‌دهنده:** میثم جعفرپور آلانق
