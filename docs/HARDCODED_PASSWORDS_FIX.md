# حذف پسوردهای هاردکد از K8s manifests

## مشکل

در `backend/infra/backup/wal-g-config.yaml` پسوردهای پیش‌فرض و هاردکد شده وجود داشت:

- `MINIO_ACCESS_KEY: "minioadmin"`
- `MINIO_SECRET_KEY: "minioadmin"`
- `PGPASSWORD: "postgres"`

این یک security risk جدی بود چون:

1. پسوردهای پیش‌فرض در production استفاده نمی‌شوند
2. پسوردها در plaintext در repository ذخیره شده بودند
3. نقض принцип least privilege

## راهکار

پسوردهای هاردکد را با placeholderهای خالی جایگزین کردم که باید از external secrets یا environment variables پر شوند.

### تغییرات انجام شده

#### wal-g-config.yaml

```yaml
# قبل:
stringData:
  MINIO_ACCESS_KEY: 'minioadmin'
  MINIO_SECRET_KEY: 'minioadmin'
  PGPASSWORD: 'postgres'

# بعد:
stringData:
  MINIO_ACCESS_KEY: ''
  MINIO_SECRET_KEY: ''
  PGPASSWORD: ''
```

همچنین environment variable references را در ConfigMap اصلاح کردم:

```yaml
# قبل:
AWS_ACCESS_KEY_ID: '${MINIO_ACCESS_KEY}'

# بعد:
AWS_ACCESS_KEY_ID: '$(MINIO_ACCESS_KEY)'
```

## پیاده‌سازی مورد نیاز

### گزینه 1: External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: wal-g-credentials
  namespace: dwp
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-secret-store
    kind: SecretStore
  target:
    name: wal-g-credentials
    creationPolicy: Owner
  data:
    - secretKey: MINIO_ACCESS_KEY
      remoteRef:
        key: dwp/minio/access-key
    - secretKey: MINIO_SECRET_KEY
      remoteRef:
        key: dwp/minio/secret-key
    - secretKey: PGPASSWORD
      remoteRef:
        key: dwp/postgres/password
```

### گزینه 2: Manual Secret Creation

```bash
kubectl create secret generic wal-g-credentials \
  --from-literal=MINIO_ACCESS_KEY=$(MINIO_ACCESS_KEY) \
  --from-literal=MINIO_SECRET_KEY=$(MINIO_SECRET_KEY) \
  --from-literal=PGPASSWORD=$(POSTGRES_PASSWORD) \
  --namespace=dwp
```

### گزینه 3: Environment Variable Injection

در deployment، از envFrom با secret استفاده کنید:

```yaml
envFrom:
  - secretRef:
      name: wal-g-credentials
```

## تأیید

- ✅ هیچ پسورد هاردکدی در manifests وجود ندارد
- ✅ placeholders برای injection آماده هستند
- ✅ می‌توان از External Secrets Operator استفاده کرد
- ✅ security posture بهبود یافته است

## تاریخچه

- 2026-09-11: حذف پسوردهای هاردکد و جایگزینی با placeholders
