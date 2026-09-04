# IRIB Digital Workplace - Local Development Setup Wizard

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

## راه‌اندازی سریع محیط توسعه

این پکیج شامل دو روش برای راه‌اندازی محیط توسعه است:

### 1. CLI Command (برای Developerها)

```bash
npm run setup-local
```

این دستور یک interactive wizard را اجرا می‌کند که:
- محیط را بررسی می‌کند (Node.js, Docker, Git)
- Dependencies را نصب می‌کند
- Docker services را راه‌اندازی می‌کند
- Database را تنظیم می‌کند
- Development servers را راه‌اندازی می‌کند
- Setup را verify می‌کند

### 2. Desktop Shortcut (برای کاربران عادی)

**روش 1: ایجاد shortcut با PowerShell**

```powershell
# در PowerShell (با Run as Administrator)
.\create-shortcut-with-icon.ps1
```

**روش 2: ایجاد shortcut دستی**

1. فایل `setup-local.bat` را پیدا کنید
2. Right-click → Send to → Desktop (create shortcut)
3. Shortcut را rename کنید به "IRIB Digital Workplace Setup"

---

## مراحل Wizard

### 1. Environment Check 🔍
- بررسی Node.js installation و version
- بررسی npm installation و version
- بررسی Docker installation و version
- بررسی Git installation و version
- بررسی پورت‌های موجود

### 2. Install Dependencies 📦
- نصب frontend dependencies
- نصب backend dependencies

### 3. Docker Setup 🐳
- راه‌اندازی Docker services (PostgreSQL, Redis)
- بررسی Docker daemon

### 4. Database Setup 🗄️
- اجرای Prisma migrations
- اجرای seed data

### 5. Start Development Servers 🚀
- راه‌اندازی Frontend (http://localhost:3000)
- راه‌اندازی Backend (http://localhost:3001)

### 6. Verify Setup ✅
- تست connectivity
- بررسی database connection

---

## دو روش اجرا

### Auto Mode (خودکار)
- همه مراحل به صورت خودکار اجرا می‌شوند
- مناسب برای first-time setup

### Interactive Mode (دستی)
- هر مرحله را تایید می‌کنید
- می‌توانید مراحل را skip کنید
- مناسب برای troubleshooting

---

## پیش‌نیازها

- Node.js (v18+)
- npm
- Docker و Docker Compose
- Git
- پورت‌های آزاد: 3000, 3001, 5432, 6379

---

## پس از راه‌اندازی

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:3001
- 🗄️ Database: localhost:5432
- 📡 Redis: localhost:6379
- 🧪 Setup Wizard: http://localhost:3000/admin/local-dev-setup-wizard

---

## Troubleshooting

### اگر Node.js پیدا نشد:
```bash
# از https://nodejs.org نصب کنید
# یا با Chocolatey:
choco install nodejs
```

### اگر Docker پیدا نشد:
```bash
# از https://docker.com نصب کنید
# یا با Chocolatey:
choco install docker-desktop
```

### اگر پورت‌ها اشغال باشند:
```bash
# پورت‌های در حال استفاده را پیدا کنید
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# پروسس را kill کنید
taskkill /PID <PID> /F
```

---

## Custom Icon

Custom icon در `wizard-icon.svg` موجود است. برای استفاده در Windows shortcut:

1. به https://convertio.co/svg-ico/ بروید
2. `wizard-icon.svg` را آپلود کنید
3. Convert to .ico کنید
4. فایل .ico را در project folder ذخیره کنید
5. `create-shortcut-with-icon.ps1` را به‌روزرسانی کنید

---

## Next Steps

پس از راه‌اندازی موفق:

1. به http://localhost:3000 بروید
2. با credentials وارد شوید
3. به admin panel بروید
4. Production Setup Wizard را اجرا کنید (برای before-deployment)
