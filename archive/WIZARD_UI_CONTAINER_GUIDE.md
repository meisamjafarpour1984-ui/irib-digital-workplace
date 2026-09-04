# Self-contained Wizard UI Container - راهنمای استفاده کامل

## 🎯 راهنمای جامع Wizard UI Container

یک سیستم Wizard UI Container self-contained که بدون dependency به frontend اصلی عمل می‌کند و Docker services را orchestrate می‌کند.

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

## 📋 مطالب

1. [معرفی](#معرفی)
2. [ویژگی‌ها](#ویژگی‌ها)
3. [نصب و راه‌اندازی](#نصب-و-راهاندازی)
4. [استفاده](#استفاده)
5. [معماری](#معماری)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Quick Reference](#quick-reference)

---

## معرفی

### چیست Wizard UI Container؟

یک Docker container جداگانه که شامل:
- **Simple HTML/JS dashboard** - بدون Next.js complexity
- **Express backend** - با Docker API integration
- **Docker socket mount** - برای control کردن Docker services
- **REST API** - برای orchestrating docker-compose

### چرا به frontend dependency ندارد؟

- **Self-contained** - همه چیز در container است
- **Docker-native** - مستقیماً با Docker API کار می‌کند
- **Independent** - نیاز به frontend اصلی ندارد
- **Lightweight** - بدون heavy dependencies

---

## ویژگی‌ها

### 🎨 Dashboard Features

#### 1. **Tab Navigation**
- **Setup محلی** - برای local development setup
- **Production Deployment** - برای production deployment
- **مدیریت سرویس‌ها** - برای Docker service management

#### 2. **Real-time Logs**
- Terminal-style logs با timestamps
- Color-coded log entries (success/error)
- Auto-scroll functionality

#### 3. **Progress Tracking**
- Visual progress bar
- Step-by-step status indicators
- Overall completion percentage

#### 4. **Service Status Dashboard**
- Live status of all services
- Running/Stopped indicators
- Quick service overview

#### 5. **Docker Integration**
- Start/Stop/Restart containers
- View container logs
- Execute docker-compose commands
- Real-time Docker info

---

## نصب و راه‌اندازی

### پیش‌نیازها

- Docker (v20+)
- Docker Compose (v2+)
- Node.js (v18+) - برای local development
- دسترسی به `/var/run/docker.sock`

### راه‌اندازی

#### روش 1: با NPM Script (پیشنهاد شده)

```bash
npm run wizard
```

این command:
- Wizard UI container را build می‌کند
- Container را راه‌اندازی می‌کند
- روی http://localhost:9002 در دسترس می‌کند

#### روش 2: با Docker Compose

```bash
docker-compose -f docker-compose.wizard.yml up
```

#### روش 3: Manual Build و Run

```bash
# Build image
docker build -t irib-wizard-ui -f wizard-ui/Dockerfile .

# Run container
docker run -d \
  -p 9002:3003 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --name irib-wizard-ui \
  irib-wizard-ui
```

---

## استفاده

### 🚀 دسترسی به Wizard UI

پس از راه‌اندازی:
```
http://localhost:9002
```

---

### 📋 تب Setup محلی

#### هدف
Setup کامل برای local development با hot-reload

#### مراحل خودکار
1. **🔍 بررسی محیط** - Docker، disk space، requirements
2. **📦 نصب Dependencies** - Frontend و backend dependencies
3. **🐳 راه‌اندازی Docker Services** - PostgreSQL و Redis
4. **🗄️ راه‌اندازی Database** - Prisma migrations و seed data
5. **🚀 راه‌اندازی Development Servers** - Frontend و Backend با hot-reload

#### نحوه استفاده
1. به تب "Setup محلی" بروید
2. دکمه "اجرای Setup محلی" را کلیک کنید
3. مراحل به صورت خودکار اجرا می‌شوند
4. Logs در real-time نمایش داده می‌شوند
5. پس از اتمام، به http://localhost:3000 بروید

#### Reset
- دکمه "Reset" را کلیک کنید
- همه status indicators reset می‌شوند
- می‌توانید دوباره اجرا کنید

---

### 🚀 تب Production Deployment

#### هدف
Deployment کامل به production environment

#### مراحل خودکار
1. **🔍 بررسی Production Environment** - Docker، disk space، production requirements
2. **🔒 تنظیمات امنیتی** - تولید encryption keys و secrets
3. **📥 دریافت آخرین کد** - Git pull از repository
4. **🏗️ ساخت Docker Images** - Build frontend و backend images
5. **🚀 Deploy سرویس‌ها** - Deploy با Docker Compose

#### نحوه استفاده
1. به تب "Production Deployment" بروید
2. دکمه "اجرای Production Deployment" را کلیک کنید
3. مراحل به صورت خودکار اجرا می‌شوند
4. Secrets تولید و نمایش داده می‌شوند
5. پس از اتمام، به http://localhost:3000 بروید

#### Reset
- دکمه "Reset" را کلیک کنید
- همه status indicators reset می‌شوند
- می‌توانید دوباره اجرا کنید

---

### 🎛️ تب مدیریت سرویس‌ها

#### هدف
Manual management از Docker services

#### ویژگی‌ها
1. **بررسی سرویس‌ها** - Live status check همه containers
2. **Start همه** - Start تمام services
3. **Stop همه** - Stop تمام services
4. **مشاهده Logs** - View container logs

#### نحوه استفاده
1. به تب "مدیریت سرویس‌ها" بروید
2. وضعیت سرویس‌ها را ببینید
3. دکمه مورد نظر را کلیک کنید
4. Logs در terminal-style panel نمایش داده می‌شوند

---

## معماری

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Wizard UI Container (Self-contained)          │
│  - Port: 9002                                 │
│  - Express Server (port 3003)                   │
│  - Static HTML/JS Dashboard                    │
│  - Docker API Integration                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Docker Engine                                │
│  - Docker Socket mounted                     │
│  - Orchestrates all containers                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Target Services (via docker-compose)        │
│  - Frontend (Next.js)                         │
│  - Backend (NestJS)                           │
│  - PostgreSQL                                │
│  - Redis                                     │
└─────────────────────────────────────────────────┘
```

### API Endpoints

#### Docker API
- `GET /health` - Health check
- `GET /docker/info` - Docker system info
- `GET /docker/containers` - List all containers
- `POST /docker/containers/:id/start` - Start container
- `POST /docker/containers/:id/stop` - Stop container
- `POST /docker/containers/:id/restart` - Restart container
- `GET /docker/containers/:id/logs` - Get container logs
- `POST /docker/compose` - Execute docker-compose command

---

## Troubleshooting

### Wizard UI راه‌اندازی نمی‌شود

#### مشکل: Container نمی‌start شود

**راه‌حل:**
```bash
# Check Docker daemon
docker ps

# Check logs
docker logs irib-wizard-ui

# Restart container
docker restart irib-wizard-ui
```

#### مشکل: Port 9002 در حال استفاده است

**راه‌حل:**
```bash
# پورت را پیدا کنید
netstat -tuln | grep :9002

# پورت را تغییر دهید در docker-compose.wizard.yml
# یا پروسس را kill کنید
taskkill /PID <PID> /F
```

---

### Docker commands fail

#### مشکل: Docker socket permission denied

**راه‌حل:**
```bash
# روی Linux
sudo chmod 666 /var/run/docker.sock

# روی Windows، در Docker Desktop settings:
# Settings > Shared Drives > Enable Docker socket
```

#### مشکل: docker-compose not found

**راه‌حل:**
```bash
# Install Docker Compose
# روی Windows: Docker Desktop includes it
# روی Linux:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

### Local setup fails

#### مشکل: Dependencies نصب نمی‌شوند

**راه‌حل:**
```bash
# Manual install
cd frontend
npm install

cd ../backend
npm install
```

#### مشکل: Database migrations fail

**راه‌حل:**
```bash
# Manual migration
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

---

### Production deployment fails

#### مشکل: Build fails

**راه‌حل:**
```bash
# Clean build cache
docker system prune -a

# Rebuild بدون cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### مشکل: Secrets تولید نمی‌شوند

**راه‌حل:**
```bash
# Manual secrets generation
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.production file manually
```

---

## Best Practices

### 🎯 برای Daily Development

1. **Wizard UI را همیشه اجرا کنید**
   ```bash
   npm run wizard
   ```

2. **از Wizard UI برای initial setup استفاده کنید**
   - Setup محلی را یک بار اجرا کنید
   - Production deployment را با Wizard UI انجام دهید

3. **برای daily management از Docker Compose استفاده کنید**
   ```bash
   docker-compose -f docker-compose.dev.yml logs
   docker-compose -f docker-compose.dev.yml restart backend
   ```

### 🔒 برای Production

1. **Wizard UI را در production deploy نکنید**
   - Wizard UI برای development است
   - برای production از CLI wizard استفاده کنید
   ```bash
   npm run deploy-production
   ```

2. **Secrets را در محیط امن نگه دارید**
   - Secrets را در environment variables ذخیره کنید
   - هیچ وقت در code commit نکنید

3. **Regular backups**
   - Database backups را schedule کنید
   - Redis backups را تنظیم کنید

### 📊 برای Monitoring

1. **Logs را regularly بررسی کنید**
   - از Wizard UI logs استفاده کنید
   - از Docker logs استفاده کنید

2. **Resource usage را monitor کنید**
   ```bash
   docker stats
   ```

3. **Health checks را اجرا کنید**
   - از Wizard UI service status استفاده کنید
   - Health check endpoints را test کنید

---

## Quick Reference

### Docker Compose Commands

#### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs backend

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up -d --build frontend
```

#### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Rebuild all services
docker-compose -f docker-compose.prod.yml up -d --build
```

#### Wizard UI
```bash
# Start wizard
docker-compose -f docker-compose.wizard.yml up

# Stop wizard
docker-compose -f docker-compose.wizard.yml down

# View wizard logs
docker-compose -f docker-compose.wizard.yml logs
```

### NPM Scripts

```bash
# Start wizard UI
npm run wizard

# Local setup (CLI)
npm run setup-local

# Production deployment (CLI)
npm run deploy-production
```

### URLs

- **Wizard UI:** http://localhost:9002
- **Frontend (Development):** http://localhost:3000
- **Backend (Development):** http://localhost:3001
- **Frontend (Production):** http://localhost:3000
- **Backend (Production):** http://localhost:3001

---

## نتیجه نهایی

### ✅ مزایای این approach

1. **No chicken-and-egg problem** - Wizard UI به frontend dependency ندارد
2. **Docker-native** - مستقیماً با Docker API کار می‌کند
3. **Visual interface** - برای non-technical users
4. **Self-contained** - بدون external dependencies
5. **Professional** - مطابق با استانداردهای صنعتی

### 🎯 چه زمانی از Wizard UI استفاده کنید؟

- **برای initial local setup** - یک بار در beginning
- **برای initial production deployment** - یک بار در production
- **برای monitoring** - periodic checks
- **برای troubleshooting** - وقتی مشکلی هست

### 🎯 چه زمانی از CLI استفاده کنید؟

- **برای daily development** - Docker Compose commands
- **برای daily updates** - git pull و rebuild
- **برای automation** - CI/CD pipelines
- **برای scripts** - automation workflows

---

## Next Steps

پس از راه‌اندازی Wizard UI:

1. **Access Wizard UI:** http://localhost:9002
2. **Run initial setup:** از Wizard UI یا CLI wizard
3. **Start development:** از Docker Compose
4. **Monitor services:** از Wizard UI یا Docker commands
5. **Deploy to production:** از CLI wizard یا Wizard UI

این یک **production-ready system** است که همه چیز را از initial setup تا daily management پوشش می‌دهد، بدون chicken-and-egg problem و با حداکثر professionalism و efficiency.
