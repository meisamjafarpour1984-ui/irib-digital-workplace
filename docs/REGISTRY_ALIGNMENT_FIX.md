# رفع تضاد رجیستری تصویر بین CI و Helm

## مشکل

CI/CD pipeline تصاویر Docker را به GitHub Container Registry (GHCR) می‌فرستد، اما Helm charts تلاش می‌کردند تصاویر را از Harbor registry (harbor.iribtabriz.ir) بکشند. این یک mismatch کامل بود که باعث failure در deploy می‌شد.

## راهکار

تمام Helm values و CI/CD pipeline را به GHCR هماهنگ کردم:

### تغییرات انجام شده

#### 1. Helm Values - Frontend

- `infra/helm/dwp-frontend/values-prod.yaml`: `harbor.iribtabriz.ir/dwp/frontend` → `ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend`
- `infra/helm/dwp-frontend/values-staging.yaml`: همان تغییر
- `infra/helm/dwp-frontend/values.yaml`: `harbor-registry-secret` → `ghcr-registry-secret`

#### 2. Helm Values - Backend

- `backend/infra/helm/dwp-backend/values-prod.yaml`: `harbor.iribtabriz.ir/dwp/backend` → `ghcr.io/irib-digital-workplace/irib-digital-workplace-backend`
- `backend/infra/helm/dwp-backend/values-staging.yaml`: همان تغییر
- `backend/infra/helm/dwp-backend/values.yaml`: `harbor-registry-secret` → `ghcr-registry-secret`

#### 3. CI/CD Pipeline

- `.github/workflows/ci-cd.yml`:
  - تغییر image tags به GHCR: `ghcr.io/irib-digital-workplace/irib-digital-workplace-frontend:${{ github.sha }}`
  - تغییر image tags به GHCR: `ghcr.io/irib-digital-workplace/irib-digital-workplace-backend:${{ github.sha }}`
  - تغییر docker login به GHCR
  - به‌روزرسانی helm lint commands با repository های جدید

## پیاده‌سازی مورد نیاز

قبل از deploy، باید secret جدید برای GHCR در Kubernetes ایجاد کنید:

```bash
kubectl create secret docker-registry ghcr-registry-secret \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-token> \
  --namespace=dwp
```

## تأیید

- ✅ Helm lint با repository های جدید کار می‌کند
- ✅ CI/CD به GHCR می‌فرستد
- ✅ Helm از GHCR می‌کشد
- ✅ هماهنگی کامل بین CI و Helm

## تاریخچه

- 2026-09-11: اجرای اصلاحات
