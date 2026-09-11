# Deployment Runbook - Staging to Production

**Version:** 1.0  
**Last Updated:** ۱۴۰۵/۰۶/۱۸ (۲۰۲۶-۰۹-۰۸)  
**Author:** میثم جعفرپور آلانق

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Rollback Procedures](#rollback-procedures)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)
9. [Emergency Contacts](#emergency-contacts)

---

## Overview

This runbook provides step-by-step instructions for deploying the IRIB Digital Workplace platform from Staging to Production environments. It includes automated deployment procedures, manual verification steps, and rollback procedures in case of issues.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Development                             │
│  Local Development → Git Repository → CI/CD Pipeline       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Staging Environment                    │
│  - Automated deployments from main branch                   │
│  - Integration testing                                       │
│  - Performance testing                                      │
│  - Security scanning                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Production Environment                      │
│  - Manual approval required                                 │
│  - Blue-Green deployment strategy                           │
│  - Health checks                                             │
│  - Monitoring & alerting                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements

- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Node.js:** 18.x+
- **Git:** 2.x+
- **kubectl:** 1.25+ (for Kubernetes deployments)
- **Helm:** 3.x+ (for Helm deployments)

### Access Requirements

- Git repository access (read/write)
- Docker registry access (push/pull)
- Database access (for migrations)
- Kubernetes cluster access (for K8s deployments)
- Monitoring system access (Grafana, Prometheus)

### Tools Required

- `scripts/deploy-production.js` - Automated deployment wizard
- `deploy-production.bat` - Windows deployment launcher
- `docker-compose.prod.yml` - Production Docker Compose configuration
- Helm charts (for Kubernetes deployments)

---

## Pre-Deployment Checklist

### Code Review

- [ ] All code changes reviewed and approved
- [ ] No merge conflicts in target branch
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Performance benchmarks met

### Staging Verification

- [ ] Staging deployment successful
- [ ] All smoke tests passing on staging
- [ ] Database migrations tested on staging
- [ ] API endpoints verified on staging
- [ ] Frontend functionality verified on staging
- [ ] Load testing completed (if applicable)

### Backup Verification

- [ ] Database backup created (timestamp: _________)
- [ ] MinIO backup created (timestamp: _________)
- [ ] Redis backup created (timestamp: _________)
- [ ] Configuration backup created (timestamp: _________)
- [ ] Backup restoration tested

### Environment Configuration

- [ ] Production environment variables configured
- [ ] Secrets updated (JWT, encryption keys, passwords)
- [ ] SSL/TLS certificates valid
- [ ] DNS records configured
- [ ] Firewall rules updated
- [ ] Monitoring dashboards configured

### Team Notification

- [ ] Development team notified
- [ ] Operations team notified
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled
- [ ] On-call engineer assigned

---

## Staging Deployment

### Automated Deployment

Staging deployments are automated and triggered on every merge to the `main` branch.

```bash
# Trigger staging deployment via CI/CD
git push origin main
```

### Manual Staging Deployment

If manual deployment is required:

```bash
# Option 1: Using the deployment wizard
node scripts/deploy-production.js

# Option 2: Using Docker Compose directly
cd backend
docker-compose -f docker-compose.staging.yml up -d

# Option 3: Using Helm (Kubernetes)
helm upgrade --install irib-dwp-staging ./infra/helm/dwp-backend \
  --namespace staging \
  --values ./infra/helm/dwp-backend/values-staging.yaml
```

### Staging Verification

After deployment, run verification tests:

```bash
# Health checks
curl -f https://staging.irib-dwp.ir/api/v1/health/live
curl -f https://staging.irib-dwp.ir/api/v1/health/ready

# Smoke tests
npm run test:e2e:staging

# Performance tests
npm run test:performance:staging
```

---

## Production Deployment

### Deployment Methods

#### Method 1: Automated Deployment Wizard (Recommended)

```bash
# Windows
deploy-production.bat

# Linux/Mac
node scripts/deploy-production.js
```

The wizard will guide you through:

1. Environment check
2. Security setup
3. Code pull
4. Image build
5. Service deployment
6. Database setup
7. Health checks
8. Post-deployment configuration

#### Method 2: Docker Compose Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker-compose -f docker-compose.prod.yml build

# 3. Stop existing containers
docker-compose -f docker-compose.prod.yml down

# 4. Start new containers
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# 6. Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

#### Method 3: Kubernetes/Helm Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build and push images
docker build -t registry.irib-dwp.ir/dwp-backend:latest ./backend
docker push registry.irib-dwp.ir/dwp-backend:latest

# 3. Deploy using Helm
helm upgrade --install irib-dwp-prod ./infra/helm/dwp-backend \
  --namespace production \
  --values ./infra/helm/dwp-backend/values-prod.yaml \
  --set image.tag=latest \
  --timeout 10m

# 4. Verify deployment
kubectl rollout status deployment/dwp-backend -n production
kubectl get pods -n production
```

### Blue-Green Deployment Strategy

For zero-downtime deployments:

```bash
 # 1. Deploy to green environment
helm upgrade --install irib-dwp-green ./infra/helm/dwp-backend \
  --namespace production \
  --values ./infra/helm/dwp-backend/values-green.yaml

# 2. Verify green environment
kubectl get pods -n production -l app=irib-dwp,env=green

# 3. Switch traffic to green
kubectl patch service irib-dwp-service -n production \
  -p '{"spec":{"selector":{"env":"green"}}}'

# 4. Monitor for issues (wait 15-30 minutes)

# 5. If successful, remove blue environment
helm uninstall irib-dwp-blue -n production
```

### Database Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Verify migration status
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate status

# Rollback if needed (manual intervention required)
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate resolve --applied "migration_name"
```

---

## Rollback Procedures

### Immediate Rollback (Critical Issues)

If critical issues are detected immediately after deployment:

#### Docker Compose Rollback

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Restore previous version
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d

# 3. Restore database if needed
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d irib_dwp < /backups/postgres/backup-<timestamp>.sql
```

#### Kubernetes Rollback

```bash
# 1. Rollback to previous revision
helm rollback irib-dwp-prod -n production

# 2. Verify rollback
kubectl rollout status deployment/dwp-backend -n production

# 3. If Helm rollback fails, manually scale down
kubectl scale deployment/dwp-backend -n production --replicas=0
kubectl scale deployment/dwp-backend -n production --replicas=3
```

### Database Rollback

```bash
# 1. Stop application
docker-compose -f docker-compose.prod.yml stop backend

# 2. Restore database backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d irib_dwp < /backups/postgres/backup-<timestamp>.sql

# 3. Rollback migrations (if needed)
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate resolve --rolled-back "migration_name"

# 4. Restart application
docker-compose -f docker-compose.prod.yml start backend
```

### Configuration Rollback

```bash
# 1. Restore previous configuration
git checkout <previous-commit-hash> .env.production

# 2. Restart services
docker-compose -f docker-compose.prod.yml restart

# 3. Verify configuration
docker-compose -f docker-compose.prod.yml exec -T backend env | grep DATABASE_URL
```

### Rollback Verification

After rollback, verify:

```bash
# Health checks
curl -f https://irib-dwp.ir/api/v1/health/live
curl -f https://irib-dwp.ir/api/v1/health/ready

# Database connectivity
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres

# Redis connectivity
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping

# Application logs
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl -f https://irib-dwp.ir/api/v1/health/live
curl -f https://irib-dwp.ir/api/v1/health/ready
curl -f https://irib-dwp.ir/api/v1/health/metrics

# Frontend health
curl -f https://irib-dwp.ir/
curl -f https://irib-dwp.ir/admin
```

### Database Verification

```bash
# Check database connectivity
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres -d irib_dwp

# Check table counts
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d irib_dwp -c "
  SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count
  FROM pg_stat_user_tables
  ORDER BY tablename;
"

# Check migration status
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate status
```

### Service Verification

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check service logs
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
docker-compose -f docker-compose.prod.yml logs --tail=50 frontend
docker-compose -f docker-compose.prod.yml logs --tail=50 postgres
docker-compose -f docker-compose.prod.yml logs --tail=50 redis
```

### Functional Verification

- [ ] Login functionality working
- [ ] Dashboard loading correctly
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] Cache operations working
- [ ] File uploads/downloads working
- [ ] Email/SMS notifications working

### Performance Verification

- [ ] Response times within SLA (< 500ms for API calls)
- [ ] Error rate < 1%
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Database connections stable
- [ ] Redis memory usage stable

---

## Troubleshooting

### Common Issues

#### Issue: Database Migration Failed

**Symptoms:**

- Migration command fails
- Application unable to start
- Database connection errors

**Resolution:**

```bash
# Check migration status
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate status

# Resolve failed migration
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate resolve --applied "migration_name"

# If needed, rollback and retry
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d irib_dwp < /backups/postgres/backup-<timestamp>.sql
```

#### Issue: Container Won't Start

**Symptoms:**

- Container exits immediately
- Container in restart loop
- Health checks failing

**Resolution:**

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs backend

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Inspect container
docker inspect <container-id>

# Restart container
docker-compose -f docker-compose.prod.yml restart backend
```

#### Issue: High Memory/CPU Usage

**Symptoms:**

- System slow response
- High resource utilization
- OOM errors

**Resolution:**

```bash
# Check resource usage
docker stats

# Check application logs for memory leaks
docker-compose -f docker-compose.prod.yml logs --tail=1000 backend

# Restart services
docker-compose -f docker-compose.prod.yml restart

# If persistent, scale up resources
# Update docker-compose.prod.yml with higher resource limits
```

#### Issue: SSL/TLS Certificate Issues

**Symptoms:**

- HTTPS not working
- Certificate errors
- Mixed content warnings

**Resolution:**

```bash
# Check certificate expiry
openssl s_client -connect irib-dwp.ir:443 -servername irib-dwp.ir

# Renew certificate (if using Let's Encrypt)
certbot renew

# Restart services after certificate renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

### Escalation Procedures

If issues cannot be resolved within 30 minutes:

1. **Level 1 Escalation (30 min):** Notify senior engineer
2. **Level 2 Escalation (60 min):** Notify engineering lead
3. **Level 3 Escalation (90 min):** Notify CTO/VP Engineering
4. **Critical Escalation (immediate):** If system is down or data loss

---

## Emergency Contacts

### On-Call Rotation

| Role              | Name   | Contact          | Hours          |
| ----------------- | ------ | ---------------- | -------------- |
| Primary On-Call   | [Name] | +98 XXX XXX XXXX | 24/7           |
| Secondary On-Call | [Name] | +98 XXX XXX XXXX | 24/7           |
| Engineering Lead  | [Name] | +98 XXX XXX XXXX | Business Hours |
| DevOps Engineer   | [Name] | +98 XXX XXX XXXX | Business Hours |

### Communication Channels

- **Slack:** #irib-dwp-ops
- **Email:** ops@irib-dwp.ir
- **Phone:** +98 XXX XXX XXXX (Emergency line)

### External Services

| Service            | Contact   | Priority |
| ------------------ | --------- | -------- |
| Cloud Provider     | [Contact] | High     |
| DNS Provider       | [Contact] | Medium   |
| SSL Provider       | [Contact] | Medium   |
| Monitoring Service | [Contact] | Low      |

---

## Appendix

### A. Environment Variables Reference

| Variable                | Description                  | Example                             |
| ----------------------- | ---------------------------- | ----------------------------------- |
| NODE_ENV                | Environment mode             | production                          |
| DATABASE_URL            | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| REDIS_URL               | Redis connection string      | redis://:pass@host:6379             |
| JWT_SECRET              | JWT signing secret           | [32-char random string]             |
| SETTINGS_ENCRYPTION_KEY | Settings encryption key      | [32-char random string]             |

### B. Useful Commands

```bash
# View all containers
docker ps -a

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Execute command in container
docker-compose -f docker-compose.prod.yml exec backend bash

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Check disk usage
docker system df

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres irib_dwp > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres irib_dwp < backup.sql
```

### C. Deployment Timeline

| Phase                        | Duration     | Notes                     |
| ---------------------------- | ------------ | ------------------------- |
| Pre-deployment checks        | 30 min       | Automated + manual        |
| Code pull & build            | 15 min       | Depends on code size      |
| Service deployment           | 10 min       | Docker Compose / Helm     |
| Database migrations          | 5 min        | Depends on migration size |
| Health checks                | 10 min       | Automated verification    |
| Post-deployment verification | 30 min       | Manual verification       |
| **Total**                    | **~100 min** | **~1.5 hours**            |

---

**Document History:**

| Version | Date       | Changes          | Author             |
| ------- | ---------- | ---------------- | ------------------ |
| 1.0     | ۱۴۰۵/۰۶/۱۸ | Initial creation | میثم جعفرپور آلانق |
