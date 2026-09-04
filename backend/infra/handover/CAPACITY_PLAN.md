# Capacity Plan — IRIB DWP

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
- [README.md](../../../README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](../../../DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## Current Capacity (Launch)

| Resource       | Current                  | Target               | Headroom |
| -------------- | ------------------------ | -------------------- | -------- |
| **K8s Nodes**  | 3 (Control) + 3 (Worker) | 200 concurrent users | 3x       |
| **CPU**        | 12 vCPU (Workers)        | 50% utilization      | 2x       |
| **Memory**     | 24 GB (Workers)          | 50% utilization      | 2x       |
| **PostgreSQL** | 1 Primary + 1 Replica    | 1M rows content      | 10x      |
| **Redis**      | 1 Instance (256MB)       | 10K sessions         | 10x      |
| **MinIO**      | 4 Nodes (1TB each)       | 100GB media          | 40x      |
| **OpenSearch** | 3 Nodes (512GB)          | 1M documents         | 10x      |
| **Kafka**      | 3 Brokers                | 10K msg/sec          | 10x      |

## Growth Projections (5 Years)

| Year   | Concurrent Users | Content Items | Media Storage | Database Size |
| ------ | ---------------- | ------------- | ------------- | ------------- |
| Year 1 | 200              | 10,000        | 50 GB         | 5 GB          |
| Year 2 | 500              | 25,000        | 100 GB        | 10 GB         |
| Year 3 | 1,000            | 50,000        | 200 GB        | 20 GB         |
| Year 4 | 1,500            | 75,000        | 300 GB        | 30 GB         |
| Year 5 | 2,000            | 100,000       | 500 GB        | 50 GB         |

## Scaling Triggers

| Metric               | Threshold      | Action                             |
| -------------------- | -------------- | ---------------------------------- |
| CPU Utilization      | > 70% for 5m   | Add worker node or scale pods      |
| Memory Utilization   | > 80% for 5m   | Add worker node or increase limits |
| Database Connections | > 80% pool     | Add read replica                   |
| Storage Usage        | > 80%          | Add MinIO node or expand PV        |
| Request Queue        | > 1000 pending | Scale backend pods                 |

## Scaling Procedures

### Horizontal Scaling (Pods)

```bash
# Manual scale
kubectl scale deployment dwp-backend -n dwp --replicas=5

# Auto-scaling (already configured)
kubectl get hpa -n dwp
```

### Vertical Scaling (Resources)

```bash
# Update resource limits
kubectl patch deployment dwp-backend -n dwp -p '{"spec":{"template":{"spec":{"containers":[{"name":"dwp-backend","resources":{"limits":{"memory":"8Gi","cpu":"4"}}}]}}}}'
```

### Node Scaling

```bash
# Add worker node (Ansible)
ansible-playbook -i inventory/new-node bootstrap.yml --limit k3s_agents

# Verify
kubectl get nodes
```

## Cost Optimization

| Strategy                        | Expected Savings |
| ------------------------------- | ---------------- |
| Spot Instances (Non-critical)   | 60-70%           |
| Right-sizing based on metrics   | 20-30%           |
| Storage tiering (Hot/Warm/Cold) | 30-40%           |
| Resource quotas per namespace   | 10-20%           |

## Monitoring for Capacity

- Grafana Dashboard: "Capacity Overview"
- Prometheus Alerts: "HighResourceUsage"
- Monthly Capacity Review Meeting
