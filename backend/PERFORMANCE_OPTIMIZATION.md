# Performance Optimization Guide
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

## Database Optimization

### Current Status
- PostgreSQL 16 with PgBouncer connection pooling
- 72 indexes defined in Prisma schema
- Connection pooling configured (transaction mode, 20 pool size, 100 max connections)

### Recommendations

#### 1. Index Review
**Status**: ✅ Good baseline - 72 indexes defined

**Actions**:
- Monitor slow queries using `pg_stat_statements` (already enabled)
- Add composite indexes for common query patterns
- Consider partial indexes for filtered queries (e.g., `WHERE status = 'PUBLISHED'`)
- Remove unused indexes to reduce write overhead

**Priority**: Medium

#### 2. Query Optimization
**Status**: ⚠️ Needs monitoring

**Actions**:
- Implement query result caching for frequently accessed data
- Use `select` only required fields in Prisma queries
- Batch queries using `findMany` with `where` instead of N+1 queries
- Implement pagination with cursor-based pagination for large datasets

**Priority**: High

#### 3. Connection Pooling
**Status**: ✅ Configured with PgBouncer

**Current Config**:
- Pool mode: transaction
- Default pool size: 20
- Max client connections: 100
- Server idle timeout: 600s

**Recommendations**:
- Monitor connection pool metrics
- Adjust pool size based on actual concurrent connections
- Consider session pooling for read-heavy workloads

**Priority**: Low (monitoring needed)

## Caching Strategy

### Current Status
- Redis 7 with noeviction policy
- Multi-level cache service implemented
- Cache decorators and interceptors available
- Default TTL: 1 hour

### Recommendations

#### 1. Cache Layering
**Status**: ✅ Multi-level cache service exists

**Actions**:
- Implement in-memory cache (L1) for frequently accessed small data
- Use Redis (L2) for shared cache across instances
- Set appropriate TTLs based on data volatility:
  - User sessions: 30 minutes
  - Content feed: 5 minutes
  - Department data: 1 hour
  - Static config: 24 hours

**Priority**: High

#### 2. Cache Invalidation
**Status**: ✅ Smart invalidation methods exist

**Actions**:
- Implement cache warming on application startup
- Use cache tags for grouped invalidation
- Implement cache versioning for schema changes
- Add cache hit/miss monitoring

**Priority**: High

#### 3. Cache Patterns
**Status**: ⚠️ Needs implementation

**Actions**:
- Implement cache-aside pattern for read-heavy data
- Use write-through cache for critical data
- Implement read-through cache for user preferences
- Add caching for API responses where appropriate

**Priority**: Medium

## Queue Optimization

### Current Status
- BullMQ with Redis backend
- 5 queues: emails, notifications, pdf-generation, content-indexing, sms
- No explicit retry/backoff configuration

### Recommendations

#### 1. Retry Configuration
**Status**: ⚠️ Missing explicit configuration

**Actions**:
```typescript
// Add to queue configuration
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 50,
}
```

**Priority**: High

#### 2. Job Prioritization
**Status**: ⚠️ Not configured

**Actions**:
- Assign priorities to jobs (1 = highest, 10 = lowest)
- Critical: notifications (priority 1-3)
- Normal: email, sms (priority 4-6)
- Low: pdf-generation, indexing (priority 7-10)

**Priority**: Medium

#### 3. Rate Limiting
**Status**: ⚠️ Not configured

**Actions**:
- Implement rate limiting per queue
- Add concurrency limits for resource-intensive jobs
- Implement job deduplication to prevent duplicate work

**Priority**: Medium

## Frontend Optimization

### Current Status
- Next.js 16.2.6 with App Router
- Turbopack enabled
- Dynamic imports for heavy components
- PWA-oriented

### Recommendations

#### 1. Code Splitting
**Status**: ✅ Dynamic imports used

**Actions**:
- Implement route-based code splitting (automatic with App Router)
- Use dynamic imports for heavy components
- Implement lazy loading for dashboard widgets
- Use React.lazy for conditionally rendered components

**Priority**: Low (already good)

#### 2. Bundle Optimization
**Status**: ⚠️ Needs configuration

**Actions**:
- Analyze bundle size with `@next/bundle-analyzer`
- Implement tree shaking for unused exports
- Use compression middleware (gzip/brotli)
- Minify JavaScript and CSS

**Priority**: High

#### 3. Image Optimization
**Status**: ⚠️ Needs implementation

**Actions**:
- Use Next.js Image component with proper sizing
- Implement responsive images with srcset
- Use WebP format with fallback
- Implement lazy loading for below-fold images

**Priority**: High

#### 4. Caching
**Status**: ⚠️ Needs implementation

**Actions**:
- Implement Service Worker for offline capability
- Cache static assets with long TTL
- Implement API response caching where appropriate
- Use SWR or React Query for data fetching

**Priority**: High

## OpenSearch Optimization

### Current Status
- OpenSearch 2.11.0 single-node
- Fallback to PostgreSQL if unavailable
- Index: content-items

### Recommendations

#### 1. Index Configuration
**Status**: ⚠️ Default configuration

**Actions**:
- Configure index refresh interval (default 1s, can be increased)
- Implement index aliases for zero-downtime reindexing
- Configure index sharding for large datasets
- Implement index lifecycle management (ILM)

**Priority**: Medium

#### 2. Query Optimization
**Status**: ✅ Good multi-field search

**Actions**:
- Implement query caching for frequent searches
- Use filter queries for exact matches
- Implement search result pagination
- Add search analytics for query optimization

**Priority**: Medium

## Monitoring and Alerting

### Current Status
- Prometheus + Grafana configured
- Loki + Promtail for logging
- Health check endpoints

### Recommendations

#### 1. Metrics
**Status**: ✅ Prometheus configured

**Actions**:
- Add custom metrics for business KPIs
- Implement SLI/SLO monitoring
- Add alerting rules for critical metrics
- Implement dashboard for real-time monitoring

**Priority**: High

#### 2. Alerting
**Status**: ⚠️ Not configured

**Actions**:
- Set up alerting for:
  - High error rates (> 5%)
  - High latency (> 500ms p95)
  - Low cache hit rate (< 80%)
  - Queue backlog (> 1000 jobs)
  - Database connection pool exhaustion

**Priority**: High

## Implementation Priority

### Critical (Week 1)
1. Add retry/backoff configuration to queues
2. Implement frontend bundle optimization
3. Add caching for frequently accessed data
4. Set up alerting rules

### High (Week 2)
1. Optimize database queries with monitoring
2. Implement image optimization
3. Add query result caching
4. Configure job prioritization

### Medium (Week 3-4)
1. Review and optimize database indexes
2. Implement cache warming
3. Configure OpenSearch index settings
4. Add custom business metrics

### Low (Week 5+)
1. Adjust connection pool settings based on monitoring
2. Implement rate limiting for queues
3. Add search analytics
4. Optimize index lifecycle management