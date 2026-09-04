# Docker-based Deployment Guide

## 🐳 Docker Deployment for IRIB Digital Workplace

این guide برای Docker-based deployment از local development تا production است.

---

## ⚠️ مهم: این مستند برای کدام نسخه است؟

این مستند برای **هر دو نسخه پروژه** معتبر است، اما تفاوت‌های مهمی بین نسخه‌ها وجود دارد که باید توجه کنید.

### نسخه‌های پروژه

#### نسخه ۱: توسعه ساده (docker-compose.dev.yml)

**سرویس‌ها:**
- Frontend (Next.js)
- Backend (NestJS)
- PostgreSQL
- Redis

**مناسب برای:**
- توسعه روزمره با hot-reload
- توسعه‌دهندگان تازه‌کار
- سیستم‌هایی با منابع محدود (RAM < 8GB)

**راه‌اندازی:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**دسترسی:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5433
- Redis: localhost:6379

#### نسخه ۲: کامل زیرساختی (backend/docker-compose.db.yml)

**سرویس‌ها:**
- تمام سرویس‌های نسخه توسعه ساده
- PgBouncer (connection pooling)
- Kafka (message queue)
- Zookeeper (Kafka coordination)
- MinIO (object storage)
- OpenSearch (search engine)
- Keycloak (IAM)
- MailHog (email testing)

**مناسب برای:**
- توسعه کامل با تمام زیرساخت‌ها
- تست integration
- توسعه‌دهندگان باتجربه
- سیستم‌هایی با منابع کافی (RAM ≥ 16GB)

**راه‌اندازی:**
```bash
cd backend
docker-compose -f docker-compose.db.yml up
```

### کدام نسخه را انتخاب کنید؟

| سناریو | نسخه پیشنهادی |
|--------|---------------|
| توسعه روزمره frontend/backend | نسخه توسعه ساده |
| توسعه ویژگی‌های Kafka/Event Streaming | نسخه کامل زیرساختی |
| توسعه ویژگی‌های Search/OpenSearch | نسخه کامل زیرساختی |
| توسعه ویژگی‌های IAM/Keycloak | نسخه کامل زیرساختی |
| تست integration کامل | نسخه کامل زیرساختی |
| سیستم با منابع محدود (RAM < 8GB) | نسخه توسعه ساده |
| سیستم با منابع کافی (RAM ≥ 16GB) | نسخه کامل زیرساختی |

**نکته:** این guide دستورات هر دو نسخه را پوشش می‌دهد. لطفاً دستورات مربوط به نسخه انتخابی خود را استفاده کنید.

---

## 📋 Prerequisites

### Required:
- Docker (v20+)
- Docker Compose (v2+)
- Git
- Minimum 4GB RAM
- Minimum 20GB disk space

### Optional:
- Docker Hub account (برای cloud deployment)
- Private Docker registry (برای enterprise)

---

## 🚀 Quick Start

### Development (Local)

```bash
# Start development environment با hot-reload
docker-compose -f docker-compose.dev.yml up

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production (Deployment)

```bash
# Automated deployment wizard
npm run deploy-production

# یا
.\deploy-production.bat
```

---

## 📁 Docker Files Structure

```
irib-digital-workplace/
├── Dockerfile                          # Frontend Dockerfile
├── docker-compose.yml                 # Base services (PostgreSQL, Redis)
├── docker-compose.dev.yml             # Development configuration
├── docker-compose.prod.yml            # Production configuration
├── backend/
│   ├── Dockerfile                      # Backend Dockerfile
│   ├── docker-compose.prod.yml         # Advanced production config
│   └── .dockerignore
├── .dockerignore
└── scripts/
    ├── setup-local.js                 # Local setup wizard
    └── deploy-production.js           # Production deployment wizard
```

---

## 🔧 Development Workflow

### 1. Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up
```

این command:
- Frontend را روی http://localhost:3000 راه‌اندازی می‌کند
- Backend را روی http://localhost:3001 راه‌اندازی می‌کند
- PostgreSQL را روی localhost:5433 راه‌اندازی می‌کند
- Redis را روی localhost:6379 راه‌اندازی می‌کند
- Hot-reload را فعال می‌کند

### 2. Develop با Hot-Reload

هر تغییری در کد:
- Frontend changes → بلافاصله دیده می‌شود
- Backend changes → بلافاصله دیده می‌شود
- Database changes → می‌توانید مستقیماً تغییر دهید

### 3. Stop Development Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🚀 Production Deployment Workflow

### روش 1: Automated Deployment Wizard (پیشنهاد من)

```bash
npm run deploy-production
```

یا:
```bash
.\deploy-production.bat
```

این wizard:
1. Environment check (Docker, disk space, ports)
2. Security setup (generate secrets)
3. Pull latest code از Git
4. Build Docker images
5. Deploy services
6. Database setup (migrations, seed data)
7. Health checks
8. Post-deployment instructions

### روش 2: Manual Deployment

```bash
# 1. Pull latest code
git pull

# 2. Build images
docker-compose -f docker-compose.prod.yml build

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# 5. Verify
curl http://localhost:3000
curl http://localhost:3001/api/v1/health/live
```

---

## 🔄 Update/Redeployment Workflow

### با هر تغییر:

```bash
# 1. Pull latest code
git pull

# 2. Rebuild و redeploy
docker-compose -f docker-compose.prod.yml up -d --build

# 3. اگر database schema تغییر کرده است
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
```

---

## 📦 Docker Image Management

### برای Offline Deployment:

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Save images به tar files
docker save irib-frontend:latest irib-backend:latest postgres:16 redis:7 > irib-complete.tar

# 3. Transfer tar file به production server

# 4. در production server، load کنید
docker load < irib-complete.tar

# 5. Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### برای Cloud Deployment:

```bash
# 1. Build و tag images
docker build -t your-registry.com/irib-frontend:latest .
docker build -t your-registry.com/irib-backend:latest ./backend

# 2. Push به registry
docker push your-registry.com/irib-frontend:latest
docker push your-registry.com/irib-backend:latest

# 3. در production server، pull کنید
docker pull your-registry.com/irib-frontend:latest
docker pull your-registry.com/irib-backend:latest

# 4. Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Security Configuration

### Environment Variables

در production، این environment variables را تنظیم کنید:

```env
NODE_ENV=production
ENVIRONMENT=production
JWT_SECRET=<generated-secret>
SETTINGS_ENCRYPTION_KEY=<generated-secret>
DATABASE_URL=postgresql://postgres:<password>@postgres:5432/irib_dwp
REDIS_URL=redis://:<password>@redis:6379
```

### Secrets Generation

Deployment wizard به صورت خودکار secrets را تولید می‌کند، اما می‌توانید دستی تولید کنید:

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛠️ Troubleshooting

### اگر container نمی‌start شود:

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend

# Restart specific service
docker-compose -f docker-compose.prod.yml restart frontend
```

### اگر port در حال استفاده است:

```bash
# پورت‌های در حال استفاده را پیدا کنید
netstat -tuln | grep :3000
netstat -tuln | grep :3001

# پروسس را kill کنید
taskkill /PID <PID> /F
```

### اگر build fails:

```bash
# Clean build cache
docker system prune -a

# Rebuild بدون cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

---

## 📊 Monitoring

### Check container status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

### View logs:

```bash
# All logs
docker-compose -f docker-compose.prod.yml logs

# Specific service logs
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

### Resource usage:

```bash
docker stats
```

---

## 💾 Backup & Restore

### Backup Database:

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres irib_dwp > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres irib_dwp < backup.sql
```

### Backup Redis:

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec redis redis-cli SAVE

# Restore
# Copy Redis data volume
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker Images
        run: |
          docker-compose -f docker-compose.prod.yml build
      
      - name: Deploy to Production
        run: |
          ssh user@production-server
          docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📝 Best Practices

### Development:
- ✅ استفاده از `docker-compose.dev.yml` برای development
- ✅ Hot-reload برای rapid development
- ✅ Local database برای isolated development

### Production:
- ✅ استفاده از `docker-compose.prod.yml` برای production
- ✅ Secrets را در environment variables نگه دارید
- ✅ Health checks را فعال کنید
- ✅ Monitoring و logging setup کنید

### Security:
- ✅ Never commit secrets to Git
- ✅ Use strong encryption keys
- ✅ Regular backups
- ✅ Network isolation

---

## 🎯 Next Steps

پس از deployment:

1. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

2. **Configure System:**
   - Admin Panel: http://localhost:3000/admin
   - Settings: http://localhost:3000/admin/settings
   - Production Setup Wizard: http://localhost:3000/admin/setup-wizard

3. **Setup Backups:**
   - Database backups
   - Redis backups
   - Application backups

4. **Monitoring:**
   - Set up logging
   - Set up monitoring
   - Set up alerts

---

## 🆘 Support

اگر مشکلی دارید:
1. Check logs: `docker-compose logs`
2. Check container status: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review این documentation
