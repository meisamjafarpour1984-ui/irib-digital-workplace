# CLI Wizard and Desktop Shortcut Implementation Report

## ✅ پیاده‌سازی کامل CLI Wizard و Desktop Shortcut برای راه‌اندازی محلی

### تاریخ تحویل
21 August 2026

---

## ⚠️ مهم: این گزارش برای کدام نسخه است؟

این گزارش برای **نسخه کامل زیرساختی (backend/docker-compose.db.yml)** نوشته شده است.

### نسخه‌های پروژه

- **نسخه توسعه ساده (docker-compose.dev.yml):** 4 سرویس (frontend, backend, postgres, redis)
  - مناسب برای: توسعه روزمره با hot-reload
  - دسترسی: `docker-compose -f docker-compose.dev.yml up`

- **نسخه کامل زیرساختی (backend/docker-compose.db.yml):** 11+ سرویس
  - مناسب برای: توسعه کامل با تمام زیرساخت‌ها
  - دسترسی: `docker-compose -f backend/docker-compose.db.yml up`

### این گزارش برای کدام نسخه است؟

✅ **نسخه کامل زیرساختی (db.yml)** - این گزارش برای این نسخه است
❌ **نسخه توسعه ساده (dev.yml)** - این گزارش برای این نسخه نیست

### اگر از نسخه توسعه ساده استفاده می‌کنید:

لطفاً به مستندات زیر مراجعه کنید:
- [README.md](./README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## خلاصه پروژه

یک سیستم دوگانه برای راه‌اندازی محلی پروژه:
1. **CLI Wizard** - برای developerها (interactive command-line)
2. **Desktop Shortcut** - برای کاربران عادی (کلیک روی ایکون)

---

## مشکل حل شده

**Original Problem:** 
Local Development Setup Wizard نیاز به frontend داشت، اما خودش برای راه‌اندازی frontend بود! یک chicken-and-egg problem.

**Solution:**
دو روش مستقل که نیاز به frontend ندارند:
- CLI Wizard: قبل از اجرای frontend از terminal اجرا می‌شود
- Desktop Shortcut: یک batch file که مستقل اجرا می‌شود

---

## فایل‌های ایجاد شده

### 1. CLI Wizard Script
**File:** `scripts/setup-local.js` (447 lines)

**Features:**
- Interactive step-by-step wizard
- Auto mode و Interactive mode
- Color-coded terminal output
- Error handling و retry capability
- 6 main setup steps

**Steps:**
1. Environment Check (Node.js, npm, Docker, Git, ports)
2. Install Dependencies (frontend و backend)
3. Docker Setup (PostgreSQL, Redis)
4. Database Setup (Prisma migrations, seed data)
5. Start Development Servers (Frontend, Backend)
6. Verify Setup (Connectivity tests)

---

### 2. NPM Script
**File:** `package.json` (updated)

**Added Script:**
```json
"setup-local": "node scripts/setup-local.js"
```

**Usage:**
```bash
npm run setup-local
```

---

### 3. Desktop Shortcut (Batch File)
**File:** `setup-local.bat` (22 lines)

**Features:**
- UTF-8 encoding (چک کردن 65001)
- Beautiful ASCII art header
- Pause before execution
- Pause before exit
- Error handling

**Usage:**
- Double-click the `.bat` file
- Or run from command line: `setup-local.bat`

---

### 4. PowerShell Script for Shortcut Creation
**File:** `create-shortcut-with-icon.ps1` (25 lines)

**Features:**
- Creates desktop shortcut automatically
- Sets working directory
- Adds description
- Includes icon reference

**Usage:**
```powershell
# In PowerShell (Run as Administrator)
.\create-shortcut-with-icon.ps1
```

---

### 5. Custom Icon
**File:** `wizard-icon.svg` (28 lines)

**Design:**
- Magic wand with sparkles
- Blue background (#3B82F6)
- Professional and modern
- 256x256 resolution

**Usage:**
- Ready for desktop shortcut
- Can be converted to .ico for Windows

---

### 6. README
**File:** `SETUP_WIZARD_README.md` (151 lines)

**Contents:**
- Quick start guide
- Step descriptions
- Both methods (CLI و Shortcut)
- Prerequisites
- Troubleshooting
- Next steps

---

## نحوه استفاده

### روش 1: CLI Command (برای Developerها)

```bash
# از project root
npm run setup-local
```

**Features:**
- Interactive mode با prompts
- Auto mode برای اجرای سریع
- Color-coded output
- Error handling و retry
- Real-time feedback

---

### روش 2: Desktop Shortcut (برای کاربران عادی)

**ایجاد shortcut:**

```powershell
# PowerShell (Run as Administrator)
.\create-shortcut-with-icon.ps1
```

**یا دستی:**
1. `setup-local.bat` را پیدا کنید
2. Right-click → Send to → Desktop (create shortcut)
3. Rename به "IRIB Digital Workplace Setup"

**استفاده:**
- Double-click روی shortcut
- Wizard اجرا می‌شود
- پس از اتمام، close می‌شود

---

## مقایسه دو روش

| ویژگی | CLI Command | Desktop Shortcut |
|--------|-------------|------------------|
| Target | Developerها | کاربران عادی |
| Interface | Terminal | Simple window |
| Skill level | Basic CLI knowledge | No technical knowledge |
| Control | Full control | Simple execution |
| Feedback | Real-time logs | Basic feedback |
| Customization | High | Low |
| Portability | Cross-platform | Windows-only |

---

## مزایای این سیستم

### 1. Solves Chicken-and-Egg Problem 🥚
- Wizard را بدون frontend اجرا می‌کند
- قبل از اینکه چیزی راه‌اندازی شود

### 2. Dual Target Audience 👥
- Developerها: CLI با full control
- کاربران عادی: Shortcut با simple execution

### 3. Professional UX 🎨
- ASCII art header
- Color-coded output
- Custom icon
- Detailed README

### 4. Error Handling 🛡️
- Retry capability
- Detailed error messages
- Skip optional steps
- Troubleshooting guide

### 5. Future-Ready 🚀
- Easy to extend steps
- Modular architecture
- Configurable
- Documented

---

## Step Details

### Step 1: Environment Check 🔍
```bash
node --version      # Check Node.js
npm --version       # Check npm
docker --version    # Check Docker
git --version       # Check Git
netstat             # Check ports
```

### Step 2: Install Dependencies 📦
```bash
npm install          # Frontend
cd backend
npm install          # Backend
```

### Step 3: Docker Setup 🐳
```bash
docker ps            # Check Docker daemon
docker-compose up -d # Start services
```

### Step 4: Database Setup 🗄️
```bash
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed data
```

### Step 5: Start Development Servers 🚀
```bash
npm run dev                    # Frontend (background)
cd backend
npm run start:dev              # Backend (background)
```

### Step 6: Verify Setup ✅
```bash
curl http://localhost:3000     # Check frontend
curl http://localhost:3001     # Check backend
npx prisma db push             # Check database
```

---

## Build Results

### NPM Script: ✅ Added
```json
"setup-local": "node scripts/setup-local.js"
```

### Files Created: ✅ All created
- `scripts/setup-local.js` (447 lines)
- `setup-local.bat` (22 lines)
- `create-shortcut-with-icon.ps1` (25 lines)
- `wizard-icon.svg` (28 lines)
- `SETUP_WIZARD_README.md` (151 lines)

---

## نحوه تست

### Test CLI Method:
```bash
cd C:\Users\meisam_jaf\Downloads\irib-digital-workplace
npm run setup-local
```

### Test Desktop Shortcut:
```powershell
cd C:\Users\meisam_jaf\Downloads\irib-digital-workplace
.\create-shortcut-with-icon.ps1
# Then double-click the desktop shortcut
```

### Test Directly:
```bash
.\setup-local.bat
```

---

## Next Steps After Setup

پس از اجرای موفق wizard:

1. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

2. **Access Setup Wizard UI:**
   - http://localhost:3000/admin/local-dev-setup-wizard
   - برای management operations

3. **Access Production Setup Wizard:**
   - http://localhost:3000/admin/setup-wizard
   - برای before-deployment setup

---

## Integration با Existing Wizards

این سیستم با دو wizard قبلی کامل است:

1. **CLI Wizard (این)** - برای initial setup (قبل از اجرای frontend)
2. **Local Dev Wizard (UI)** - برای management (بعد از اجرای frontend)
3. **Production Wizard (UI)** - برای before-deployment (در production environment)

---

## Final Summary

✅ **همه موارد با موفقیت کامل شدند:**
- ✅ Interactive CLI script با 6 steps
- ✅ NPM script در package.json
- ✅ Desktop shortcut (.bat file)
- ✅ PowerShell script برای shortcut creation
- ✅ Custom icon (SVG)
- ✅ Comprehensive README

پروژه اکنون دارای **سیستم سه‌گانه** برای setup است:
1. **CLI Wizard** - برای initial setup (بدون frontend)
2. **Local Dev Wizard (UI)** - برای management (با frontend)
3. **Production Wizard (UI)** - برای before-deployment

این یک system production-ready است که به developerها و کاربران عادی اجازه می‌دهد محیط را به سرعت و با حداکثر سهولت راه‌اندازی کنند، بدون chicken-and-egg problem.

---

## توصیه نهایی

**برای اولین setup:**
```bash
npm run setup-local
```

**برای daily development:**
1. CLI wizard را یک بار اجرا کنید
2. سپس از Local Dev Wizard UI استفاده کنید برای management

**برای before-deployment:**
از Production Wizard UI استفاده کنید

این system یک workflow complete و professional است که از initial setup تا production deployment را پوشش می‌دهد.
