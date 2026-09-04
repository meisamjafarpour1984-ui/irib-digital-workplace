# Runbook: Disaster Recovery (DR)

## Severity: P0 (Emergency)

## Response Time: Immediate

## On-Call: Platform Lead + DBA Lead

---

## ⚠️ مهم: این runbook برای کدام نسخه است؟

این runbook برای **نسخه کامل زیرساختی (backend/docker-compose.db.yml)** نوشته شده است.

### نسخه‌های پروژه

- **نسخه توسعه ساده (docker-compose.dev.yml):** 4 سرویس (frontend, backend, postgres, redis)
  - مناسب برای: توسعه روزمره با hot-reload
  - دسترسی: `docker-compose -f docker-compose.dev.yml up`

- **نسخه کامل زیرساختی (backend/docker-compose.db.yml):** 11+ سرویس
  - مناسب برای: توسعه کامل با تمام زیرساخت‌ها
  - دسترسی: `docker-compose -f backend/docker-compose.db.yml up`

### این runbook برای کدام نسخه است؟

✅ **نسخه کامل زیرساختی (db.yml)** - این runbook برای این نسخه است
❌ **نسخه توسعه ساده (dev.yml)** - این runbook برای این نسخه نیست

### اگر از نسخه توسعه ساده استفاده می‌کنید:

لطفاً به مستندات زیر مراجعه کنید:
- [README.md](../../../../README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](../../../../DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## Objective

Recover the entire DWP platform from backup in case of:

- Complete cluster failure
- Data center outage
- Data corruption

## RTO/RPO Targets

- **RPO (Recovery Point Objective):** < 1 hour
- **RTO (Recovery Time Objective):** < 4 hours

## DR Components

- PostgreSQL (WAL-G backups to MinIO)
- MinIO (Erasure Coded, Cross-Site Replication)
- Redis (AOF persistence)
- Keycloak (PostgreSQL backup)
- Application Config (GitOps)

## Recovery Steps

### Step 1: Assess Damage

```bash
# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running

# Check storage
mc admin info minio
```

### Step 2: Provision New Infrastructure

```bash
# If cluster is down, provision new VMs
ansible-playbook -i inventory/new-cluster bootstrap.yml

# If only data is lost, skip to Step 3
```

### Step 3: Restore PostgreSQL

```bash
# List available backups
wal-g backup-list --s3.endpoint=minio:9000 --s3.bucket=backups --s3.access-key=xxx --s3.secret-key=xxx

# Restore to specific point in time
wal-g backup-fetch /var/lib/postgresql/data LATEST --s3.endpoint=minio:9000 --s3.bucket=backups

# Or restore to specific time
wal-g backup-fetch /var/lib/postgresql/data 2024-01-15T10:30:00+00:00
```

### Step 4: Restore MinIO

```bash
# If MinIO is down, restore from backup
minio server /data --console-address :9001

# Verify buckets
mc ls minio/
```

### Step 5: Restore Keycloak

```bash
# Keycloak uses same PostgreSQL, restored in Step 3
# Verify realm exists
kc.sh get realms -n keycloak
```

### Step 6: Redeploy Applications

```bash
# ArgoCD will sync automatically
argocd app sync dwp-backend
argocd app sync dwp-frontend

# Or manual deployment
helm upgrade --install dwp-backend ./infra/helm/dwp-backend -n dwp -f ./infra/helm/dwp-backend/values-prod.yaml
```

### Step 7: Verify Recovery

```bash
# Health checks
curl -k https://api.iribtabriz.ir/health/ready
curl -k https://portal.iribtabriz.ir

# Database connectivity
kubectl exec -n dwp -it <pod> -- psql -h postgres -U irib_admin -d irib_dwp -c "SELECT 1;"

# Search functionality
curl -k "https://api.iribtabriz.ir/search?q=test"
```

### Step 8: DNS Failover (If Needed)

```bash
# Update DNS to new cluster IP
# Wait for propagation (TTL: 60s)
dig portal.iribtabriz.ir
```

## Communication

1. **Internal:** Notify IT Director, Platform Team
2. **External:** Post maintenance notice on portal
3. **Status Page:** Update status.iribtabriz.ir

## Post-Recovery

1. Verify data integrity (row counts, checksums)
2. Run application smoke tests
3. Monitor for 24 hours
4. Document lessons learned
