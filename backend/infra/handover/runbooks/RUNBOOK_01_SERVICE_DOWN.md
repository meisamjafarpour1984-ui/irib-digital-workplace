# Runbook: Service Down (Backend/Frontend)

## Severity: P1 (Critical)

## Response Time: 5 minutes

## On-Call: Platform Team + Backend Team

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
