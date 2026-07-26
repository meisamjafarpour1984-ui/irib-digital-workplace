# راهنمای استقرار — IRIB DWP

## خلاصه

راهنمای کامل استقرار پلتفرم DWP از محیط توسعه تا تولید.

---

## محیط‌ها

| محیط            | کاربرد      | URL                                    |
| --------------- | ----------- | -------------------------------------- |
| **Development** | توسعه محلی  | `http://localhost:3000`                |
| **Staging**     | تست و تأیید | `https://staging-portal.iribtabriz.ir` |
| **Production**  | تولید       | `https://portal.iribtabriz.ir`         |

---

## استقرار محلی (Development)

### پیش‌نیازها

```bash
# نصب ابزارها
node --version   # 18+
pnpm --version   # 8+
docker --version # 24+
```

### مراحل

```bash
# 1. نصب وابستگی‌ها
pnpm install

# 2. راه‌اندازی دیتابیس
cd backend
docker-compose up -d
cd ..

# 3. اجرای Migration
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
cd ..

# 4. اجرای توسعه
pnpm dev
```

---

## استقرار Staging

### Docker Build

```bash
# بیلد تصویر فرانت‌اند
docker build -t harbor.iribtabriz.ir/dwp/frontend:staging .

# بیلد تصویر بک‌اند
cd backend
docker build -t harbor.iribtabriz.ir/dwp/backend:staging .
cd ..
```

### Kubernetes Deploy

```bash
# استقرار با Helm
helm upgrade --install dwp-frontend infra/helm/dwp-frontend \
  -n dwp \
  -f infra/helm/dwp-frontend/values-staging.yaml

helm upgrade --install dwp-backend infra/helm/dwp-backend \
  -n dwp \
  -f infra/helm/dwp-backend/values-staging.yaml
```

---

## استقرار Production

### GitOps (ArgoCD)

```bash
# آپدیت تصاویر در Git
# push to infra/gitops/applications/overlays/prod/

# ArgoCD به صورت خودکار sync می‌کند
# یا دستی:
argocd app sync dwp-frontend
argocd app sync dwp-backend
```

### Zero-Downtime Deployment

```bash
# Rolling Update (پیش‌فرض)
kubectl rollout status deployment/dwp-backend -n dwp

# Blue/Green (اختیاری)
kubectl apply -f infra/k8s/blue-green/
```

---

## پیکربندی امنیتی

### Secret Management

```bash
# ذخیره اسرار در Vault
vault kv put secret/dwp/database url="postgresql://..."

# External Secrets Operator به صورت خودکار sync می‌کند
kubectl get externalsecrets -n dwp
```

### TLS Certificates

```bash
# cert-manager به صورت خودکار گواهی صادر می‌کند
kubectl get certificates -n dwp
```

---

## پشتیبان‌گیری

### PostgreSQL (WAL-G)

```bash
# پشتیبان‌گیری روزانه
wal-g backup-push /var/lib/postgresql/data

# بازیابی
wal-g backup-fetch /var/lib/postgresql/data LATEST
```

### MinIO

```bash
# پشتیبان‌گیری از باکت‌ها
mc mirror minio/media minio-backup/media
```

---

## نظارت و هشدار

### داشبوردهای Grafana

- K8s Cluster Overview
- PostgreSQL Performance
- Application Metrics
- Business KPIs

### هشدارهای حیاتی

| هشدار                  | شدت | اقدام          |
| ---------------------- | --- | -------------- |
| NodeDown               | P1  | بررسی فوری     |
| PodOOMKilled           | P1  | افزایش منابع   |
| APIErrorRate > 5%      | P1  | بررسی لاگ‌ها   |
| PgReplicationLag > 60s | P1  | بررسی ریپلیکا  |
| KafkaUnderReplicated   | P1  | بررسی برورکرها |

---

## بازیابی از فاجعه (DR)

### RTO/RPO

- **RPO:** < ۱ ساعت (WAL-G Backup)
- **RTO:** < ۴ ساعت (Restore + Deploy)

### مراحل بازیابی

1. بررسی میزان خسارت
2. راه‌اندازی زیرساخت جدید
3. بازیابی PostgreSQL
4. بازیابی MinIO
5. استقرار برنامه‌ها
6. تأیید بازیابی
7. تغییر DNS (در صورت نیاز)

---

## عیب‌یابی

### مشکل: سرور بالا نمی‌آید

```bash
# بررسی لاگ‌ها
kubectl logs -n dwp -l app=dwp-backend --tail=100

# بررسی وضعیت Pod
kubectl describe pod -n dwp <pod-name>
```

### مشکل: اتصال دیتابیس

```bash
# تست اتصال
kubectl exec -n dwp -it <pod> -- psql -h postgres -U irib_admin -d irib_dwp
```

### مشکل: عدم دسترسی

```bash
# بررسی مجوزها
kubectl auth can-i get pods -n dwp --as=system:serviceaccount:dwp:default
```

---

## تماس‌های اضطراری

| نقش           | نام | تلفن |
| ------------- | --- | ---- |
| مدیر فناوری   | —   | —    |
| دیتابیس‌آدمین | —   | —    |
| DevOps        | —   | —    |
| امنیت         | —   | —    |
