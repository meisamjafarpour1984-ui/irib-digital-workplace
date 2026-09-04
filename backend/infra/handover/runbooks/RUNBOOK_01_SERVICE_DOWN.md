# Runbook: Service Down (Backend/Frontend)

## Severity: P1 (Critical)

## Response Time: 5 minutes

## On-Call: Platform Team + Backend Team

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

## Symptoms

- HTTP 5xx errors on health checks
- Grafana dashboard shows service DOWN
- Users cannot access the portal
- ArgoCD shows sync failure

## Diagnosis Steps

### 1. Check Pod Status

```bash
kubectl get pods -n dwp -l app.kubernetes.io/name=dwp-backend
kubectl describe pod -n dwp <pod-name>
kubectl logs -n dwp <pod-name> --tail=100
```

### 2. Check Deployment Status

```bash
kubectl get deployment -n dwp dwp-backend
kubectl rollout status deployment/dwp-backend -n dwp
```

### 3. Check Recent Events

```bash
kubectl get events -n dwp --sort-by='.lastTimestamp' | head -20
```

### 4. Check Resource Usage

```bash
kubectl top pods -n dwp -l app.kubernetes.io/name=dwp-backend
```

## Resolution Steps

### If OOMKilled:

```bash
# Increase memory limit
kubectl patch deployment dwp-backend -n dwp -p '{"spec":{"template":{"spec":{"containers":[{"name":"dwp-backend","resources":{"limits":{"memory":"6Gi"}}}]}}}}'
```

### If CrashLoopBackOff:

```bash
# Check logs for errors
kubectl logs -n dwp <pod-name> --previous

# Rollback to previous version
kubectl rollout undo deployment/dwp-backend -n dwp
```

### If ImagePullBackOff:

```bash
# Check image pull secrets
kubectl get secrets -n dwp | grep harbor

# Verify image exists
crane digest harbor.iribtabriz.ir/dwp/backend:latest
```

## Escalation

- If not resolved in 15 minutes → Page Platform Lead
- If database issue suspected → Page DBA
- If network issue → Page Network Team

## Prevention

- PodDisruptionBudget: minAvailable=1
- Resource limits set correctly
- Health checks configured
- Auto-scaling enabled
