# Operations & Maintenance Guide
# IRIB Digital Workplace Platform

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
- [README.md](../README.md) - برای اطلاعات کلی
- [DOCKER_DEPLOYMENT_GUIDE.md](../DOCKER_DEPLOYMENT_GUIDE.md) - برای راهنمای Docker

---

## Monitoring Stack

### Current Status
- ✅ Prometheus configured (port 9090)
- ✅ Grafana configured (port 3001)
- ✅ Loki configured (port 3100)
- ✅ Promtail configured (port 9080)
- ✅ Health check endpoints available

### Dashboard Setup

#### 1. System Metrics Dashboard
Create in Grafana:
- CPU, Memory, Disk usage
- Network I/O
- Container resource usage
- Database connection pool status

#### 2. Application Metrics Dashboard
Create in Grafana:
- Request rate and latency
- Error rate by endpoint
- Cache hit/miss ratio
- Queue job counts and processing time
- Active user sessions

#### 3. Business Metrics Dashboard
Create in Grafana:
- Content creation rate
- User activity
- Form submissions
- PDF generation rate
- Notification delivery rate

### Alerting Rules

#### Critical Alerts (Immediate Notification)
```yaml
# prometheus-alerts.yml
groups:
  - name: critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL database is not responding"

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        annotations:
          summary: "Redis is down"
          description: "Redis cache is not responding"
```

#### Warning Alerts (Slack/Email)
```yaml
  - name: warnings
    rules:
      - alert: LowCacheHitRate
        expr: cache_hit_rate < 0.8
        for: 10m
        annotations:
          summary: "Low cache hit rate"
          description: "Cache hit rate is {{ $value }}"

      - alert: QueueBacklog
        expr: queue_jobs_pending > 1000
        for: 5m
        annotations:
          summary: "Queue backlog detected"
          description: "{{ $labels.queue }} has {{ $value }} pending jobs"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        annotations:
          summary: "Low disk space"
          description: "Disk {{ $labels.device }} is {{ $value }}% full"
```

## Logging Strategy

### Log Levels
- **ERROR**: Critical errors requiring immediate attention
- **WARN**: Warning conditions that should be investigated
- **INFO**: Normal operational events
- **DEBUG**: Detailed debugging information (dev only)

### Log Aggregation
- Loki collects logs from all containers
- Promtail scrapes Docker container logs
- Logs stored for 30 days (configurable)
- Indexing by service, container, and severity

### Log Queries (Loki)
```logql
# Error logs from backend
{container_name="irib-backend"} |= "ERROR"

# Request logs with 5xx status
{container_name="irib-backend"} |~ "5[0-9]{2}"

# Slow requests (> 1s)
{container_name="irib-backend"} |~ "duration.*>.*1000"

# Database connection errors
{container_name="irib-postgres"} |= "ERROR"

# Redis connection errors
{container_name="irib-redis"} |= "ERROR"
```

## Disaster Recovery

### Backup Strategy

#### 1. Database Backups
- **Frequency**: Daily at 2:00 AM
- **Retention**: 7 days local, 30 days offsite
- **Method**: pg_dump + gzip
- **Offsite**: Upload to cloud storage (S3-compatible)

**Script**: `scripts/backup-postgres.sh` ✅

#### 2. Redis Backups
- **Frequency**: Every 6 hours
- **Retention**: 7 days
- **Method**: BGSAVE + RDB file copy
- **Offsite**: Upload to cloud storage

**Script**: `scripts/backup-redis.sh` ✅

#### 3. MinIO Backups
- **Frequency**: Daily at 3:00 AM
- **Retention**: 7 days local, 30 days offsite
- **Method**: Archive data directory
- **Offsite**: Upload to cloud storage

**Script**: `scripts/backup-minio.sh` ✅

### Restore Procedures

#### Database Restore
```bash
# Restore from backup
gunzip -c backups/postgres/postgres_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i irib-postgres psql -U irib_admin irib_dwp
```

**Script**: `scripts/restore-postgres.ps1` ✅

#### Point-in-Time Recovery (PostgreSQL)
- Configure WAL archiving
- Enable continuous archiving
- Test PITR procedures quarterly

### Failover Strategy

#### Database Failover
- **Manual**: Switch to read replica (if configured)
- **Automatic**: Configure HA with Patroni (future)
- **RTO**: 1 hour (manual), 5 minutes (automatic with Patroni)
- **RPO**: 15 minutes (with WAL archiving)

#### Cache Failover
- **Strategy**: Application continues without cache
- **Impact**: Increased database load
- **Mitigation**: Implement graceful degradation
- **RTO**: Immediate (automatic)
- **RPO**: 0 (cache rebuilds automatically)

#### Storage Failover
- **Strategy**: MinIO with erasure coding
- **Manual**: Restore from backup
- **RTO**: 4 hours
- **RPO**: 24 hours (daily backup)

## Deployment Automation

### CI/CD Pipeline

#### GitHub Actions (Recommended)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && docker-compose down && docker-compose up -d'
```

### Deployment Strategy

#### Blue-Green Deployment
- Maintain two identical production environments
- Deploy to inactive environment first
- Run smoke tests
- Switch traffic to new environment
- Rollback is instant by switching traffic back

#### Canary Deployment
- Deploy new version to subset of users
- Monitor metrics and errors
- Gradually increase traffic
- Rollback if issues detected

### Rollback Procedure
```bash
# Rollback to previous version
git checkout previous-version
docker-compose down
docker-compose up -d

# Or use database migrations rollback
npx prisma migrate resolve --rolled-back <migration-name>
```

## Runbooks

### 1. High Error Rate
**Symptoms**: Error rate > 5% for 5 minutes

**Investigation**:
1. Check Grafana error rate dashboard
2. Check Loki logs for error patterns
3. Check database connectivity
4. Check external service dependencies

**Actions**:
- If database down: Failover to replica or restore from backup
- If external service down: Enable circuit breaker
- If bug in code: Rollback to previous version
- If DDOS: Enable rate limiting, add firewall rules

### 2. High Latency
**Symptoms**: P95 latency > 500ms for 5 minutes

**Investigation**:
1. Check database query performance
2. Check cache hit rate
3. Check resource usage (CPU, memory, disk)
4. Check network latency

**Actions**:
- Slow queries: Add indexes, optimize queries
- Low cache hit rate: Increase cache size, adjust TTL
- High resource usage: Scale horizontally or vertically
- Network issues: Check network configuration

### 3. Queue Backlog
**Symptoms**: Pending jobs > 1000

**Investigation**:
1. Check queue processing rate
2. Check worker health
3. Check job failure rate
4. Check resource availability

**Actions**:
- Slow processing: Add more workers
- High failure rate: Fix job processing logic
- Resource constraint: Scale workers
- Deadlocked queue: Restart queue

### 4. Database Connection Exhaustion
**Symptoms**: Connection pool exhausted, new connections fail

**Investigation**:
1. Check active connection count
2. Check for connection leaks
3. Check query execution time
4. Check PgBouncer configuration

**Actions**:
- Connection leaks: Fix application code
- Slow queries: Optimize queries
- Pool size too small: Increase pool size
- Too many clients: Implement connection pooling

### 5. Redis Down
**Symptoms**: Cache service unavailable

**Investigation**:
1. Check Redis container status
2. Check Redis logs
3. Check memory availability
4. Check network connectivity

**Actions**:
- Container down: Restart container
- Out of memory: Increase memory limit
- Network issue: Fix network configuration
- Data corruption: Restore from backup

## Security Auditing

### Regular Security Tasks

#### Daily
- Review security logs
- Check for unauthorized access attempts
- Monitor for suspicious activity

#### Weekly
- Review and update dependencies
- Check for security vulnerabilities
- Review access logs

#### Monthly
- Conduct security audit
- Review and update security policies
- Test disaster recovery procedures
- Review and update firewall rules

#### Quarterly
- Penetration testing
- Security training for team
- Review and update incident response plan

### Security Checklist

#### Authentication
- [ ] Password complexity requirements
- [ ] Multi-factor authentication for admin users
- [ ] Session timeout configuration
- [ ] Login attempt limits
- [ ] Account lockout policy

#### Authorization
- [ ] Role-based access control (RBAC)
- [ ] Attribute-based access control (ABAC)
- [ ] Regular access reviews
- [ ] Principle of least privilege
- [ ] Audit logging for sensitive operations

#### Data Protection
- [ ] Encryption at rest (PostgreSQL, Redis, MinIO)
- [ ] Encryption in transit (TLS/SSL)
- [ ] Data classification
- [ ] Data retention policy
- [ ] Data backup encryption

#### Network Security
- [ ] Firewall rules
- [ ] Network segmentation
- [ ] Ingress/Egress controls
- [ ] DDoS protection
- [ ] API rate limiting

#### Application Security
- [ ] Input validation
- [ ] Output encoding
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Content Security Policy (CSP)

## Maintenance Schedule

### Daily (Automated)
- Backup verification
- Log rotation
- Cache cleanup
- Queue monitoring

### Weekly (Manual)
- Security log review
- Performance metrics review
- Capacity planning review
- Dependency update check

### Monthly (Manual)
- Full security audit
- Disaster recovery test
- Performance optimization review
- Capacity planning update

### Quarterly (Manual)
- Penetration testing
- Architecture review
- Technology stack review
- Cost optimization review

## Support Escalation

### Level 1: On-Call Engineer
- First responder
- Initial triage
- Issue documentation
- ETA: 15 minutes

### Level 2: Senior Engineer
- Complex issue resolution
- Code deployment
- Database operations
- ETA: 1 hour

### Level 3: Engineering Lead
- Critical incident management
- Cross-team coordination
- Incident post-mortem
- ETA: 2 hours

### Level 4: CTO/VP Engineering
- Executive communication
- Major incident management
- Business impact assessment
- ETA: Immediate

## Documentation

### Required Documentation
- [ ] Architecture documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] Runbooks for common issues
- [ ] Incident response plan
- [ ] Disaster recovery plan
- [ ] Security policies
- [ ] Compliance documentation

### Documentation Updates
- Update documentation with every change
- Review documentation quarterly
- Keep documentation in version control
- Use clear, concise language
- Include diagrams where helpful