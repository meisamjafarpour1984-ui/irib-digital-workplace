# Runbook: PostgreSQL Failover (Patroni)

## Severity: P1 (Critical)

## Response Time: 5 minutes

## On-Call: DBA Team

---

## Symptoms

- PostgreSQL primary unreachable
- Patroni automatic failover triggered
- Application errors: "connection refused"
- Grafana shows PostgreSQL DOWN

## Diagnosis Steps

### 1. Check Patroni Status

```bash
kubectl exec -n data -it postgres-0 -- patronictl list
```

### 2. Check PostgreSQL Pods

```bash
kubectl get pods -n data -l app=postgresql
kubectl describe pod -n data postgres-0
```

### 3. Check Replication Lag

```bash
kubectl exec -n data -it postgres-0 -- psql -U postgres -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

### 4. Check Patroni Logs

```bash
kubectl logs -n data postgres-0 --tail=50 -l app=postgresql
```

## Resolution Steps

### Automatic Failover (Expected):

1. Patroni automatically promotes a replica
2. Verify new primary:
   ```bash
   patronictl list
   ```
3. Verify application connectivity:
   ```bash
   kubectl exec -n dwp -it <backend-pod> -- curl http://localhost:3001/api/v1/health/ready
   ```

### Manual Failover (If Auto-Failover Fails):

```bash
# Force failover
kubectl exec -n data -it postgres-0 -- patronictl failover --master postgres-0 --candidate postgres-1
```

### Recovery (Bring Old Primary Back):

```bash
# Rejoin as replica
kubectl exec -n data -it postgres-0 -- patronictl reinit
```

## Post-Incident

1. Verify data consistency
2. Check WAL archives for PITR capability
3. Review Patroni configuration
4. Update incident report

## Prevention

- 3-node Patroni cluster
- Synchronous replication for critical data
- Regular backup testing (WAL-G)
- Monitoring replication lag
