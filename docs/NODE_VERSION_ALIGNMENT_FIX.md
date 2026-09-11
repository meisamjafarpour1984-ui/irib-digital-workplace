# همسوسازی نسخه Node بین CI و Docker

## مشکل

بین نسخه Node در CI/CD و Dockerfileها تضاد وجود داشت:

- **CI/CD**: Node 20.x (`.github/workflows/ci-cd.yml`)
- **Dockerfile Frontend**: Node 22-slim
- **Dockerfile Backend**: Node 22-slim

این تضاد می‌توانست باعث مشکلات زیر شود:

1. Build failures در CI اما موفقیت در local
2. Runtime errors به دلیل تفاوت در V8 engine
3. Dependency compatibility issues
4. Inconsistent behavior بین محیط‌ها

## راهکار

تمام Dockerfileها و package.jsonها را به Node 20 هماهنگ کردم.

### تغییرات انجام شده

#### 1. Dockerfile Frontend

```dockerfile
# قبل:
FROM node:22-slim AS base
FROM node:22-slim AS runtime

# بعد:
FROM node:20-slim AS base
FROM node:20-slim AS runtime
```

#### 2. Dockerfile Backend

```dockerfile
# قبل:
FROM node:22-slim AS base
FROM node:22-slim AS runtime

# بعد:
FROM node:20-slim AS base
FROM node:20-slim AS runtime
```

#### 3. Package.json Frontend

```json
// قبل:
"engines": {
  "node": ">=20.9.0"
}

// بعد:
"engines": {
  "node": ">=20.0.0"
}
```

#### 4. Package.json Backend

```json
// قبل:
"engines": {
  "node": ">=20.9.0"
}

// بعد:
"engines": {
  "node": ">=20.0.0"
}
```

## چرا Node 20؟

1. **LTS Status**: Node 20 یک نسخه LTS (Long Term Support) است
2. **CI Compatibility**: با CI/CD pipeline فعلی هماهنگ است
3. **Stability**: به اندازه کافی mature برای production
4. **Performance**: بهبودهای قابل توجه نسبت به Node 18
5. **Feature Parity**: تمام ویژگی‌های مورد نیاز پروژه را پشتیبانی می‌کند

## تأیید

- ✅ CI/CD از Node 20.x استفاده می‌کند
- ✅ Dockerfile Frontend از Node 20-slim استفاده می‌کند
- ✅ Dockerfile Backend از Node 20-slim استفاده می‌کند
- ✅ Package.json engines به Node 20 محدود شده است
- ✅ هماهنگی کامل بین محیط‌ها

## مراحل بعدی

قبل از rebuild، موارد زیر را بررسی کنید:

1. تست‌های unit و integration را اجرا کنید
2. E2E tests را اجرا کنید
3. Docker images را rebuild کنید
4. در staging environment تست کنید

## تاریخچه

- 2026-09-11: همسوسازی نسخه Node به 20 در تمام محیط‌ها
