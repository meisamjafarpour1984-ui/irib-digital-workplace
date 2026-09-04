# Architecture Decision Records (ADR) — IRIB DWP

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

## ADR-001: NestJS as Backend Framework

**Status:** Accepted

**Context:** Need a TypeScript backend framework for modular monolith architecture.

**Decision:** Use NestJS 10+ with TypeScript Strict Mode.

**Rationale:**

- Native TypeScript (shared types with frontend)
- Modular architecture (Bounded Contexts)
- Built-in DI, Guards, Interceptors
- OpenAPI generation
- WebSocket support for real-time features
- Strong community and enterprise adoption

**Consequences:**

- Learning curve for team
- Larger bundle size compared to Express
- Need to manage module boundaries carefully

---

## ADR-002: PostgreSQL as Primary Database

**Status:** Accepted

**Context:** Need a relational database with JSONB, hierarchical queries, and advanced features.

**Decision:** Use PostgreSQL 16 with extensions (ltree, pgcrypto, pg_partman).

**Rationale:**

- JSONB for flexible metadata (SCM)
- ltree for organizational hierarchy
- pgcrypto for PII encryption
- pg_partman for audit log partitioning
- Strong ACID compliance
- Mature ecosystem

**Consequences:**

- Need DBA expertise
- More complex than SQLite for development
- Requires backup strategy (WAL-G)

---

## ADR-003: Widget-Driven Architecture

**Status:** Accepted

**Context:** Need flexible page composition without code changes.

**Decision:** Implement Widget Engine with JSON-based page layouts.

**Rationale:**

- Admin can compose pages without developer intervention
- Widget reusability across pages
- Conditional visibility based on permissions
- Device-specific layouts

**Consequences:**

- Additional complexity in rendering
- Need widget registry and validation
- Performance optimization required (caching)

---

## ADR-004: Event-Driven Communication

**Status:** Accepted

**Context:** Need reliable async communication between modules.

**Decision:** Use Outbox Pattern with Kafka/Redpanda.

**Rationale:**

- Reliable event delivery (no message loss)
- Decoupled modules
- CDC for search indexing
- Audit trail integration

**Consequences:**

- Additional infrastructure (Kafka)
- Eventual consistency (need to handle)
- Complexity in event schema management

---

## ADR-005: Keycloak for IAM

**Status:** Accepted

**Context:** Need enterprise-grade identity management with MFA and AD sync.

**Decision:** Use Keycloak 24+ with PostgreSQL backend.

**Rationale:**

- OIDC/SAML support
- MFA (WebAuthn, OTP)
- LDAP/AD Federation
- Custom themes
- Open source

**Consequences:**

- Additional service to manage
- Need to maintain Keycloak configuration
- Integration testing required

---

## ADR-006: GitOps Deployment

**Status:** Accepted

**Context:** Need consistent, auditable, and rollback-capable deployments.

**Decision:** Use ArgoCD with Kustomize overlays.

**Rationale:**

- Declarative infrastructure
- Automatic drift detection
- Easy rollback (Git revert)
- Audit trail of changes
- Multi-environment support

**Consequences:**

- Learning curve for GitOps
- Need to maintain Kustomize overlays
- Initial setup complexity

---

## ADR-007: RTL-First Design

**Status:** Accepted

**Context:** Persian locale with right-to-left text direction.

**Decision:** Design all components RTL-first with LTR fallback.

**Rationale:**

- 100% of users are Persian-speaking
- Better UX with native RTL
- Easier to maintain single direction
- Tailwind CSS RTL utilities

**Consequences:**

- Need to test both directions
- Some third-party libraries may not support RTL
- RTL-specific CSS needed

---

## ADR-008: PWA for Mobile

**Status:** Accepted

**Context:** Need mobile access without app store distribution.

**Decision:** Implement Progressive Web App with offline support.

**Rationale:**

- No app store approval needed
- Works on all platforms
- Offline reading capability
- Push notifications
- Lower development cost

**Consequences:**

- Limited native features (camera, biometrics)
- Need to handle PWA installation
- iOS limitations (no push notifications until recently)

---

## ADR-009: MinIO for Object Storage

**Status:** Accepted

**Context:** Need S3-compatible storage on-premises.

**Decision:** Use MinIO in distributed mode with erasure coding.

**Rationale:**

- S3 API compatible (future migration to cloud)
- On-premises deployment (data sovereignty)
- Erasure coding for durability
- Performance (disk-level)

**Consequences:**

- Need to manage MinIO cluster
- Backup strategy for MinIO
- Network configuration for distributed mode

---

## ADR-010: OpenSearch for Search

**Status:** Accepted

**Context:** Need full-text search with Persian language support.

**Decision:** Use OpenSearch 2.x with custom Persian analyzer.

**Rationale:**

- Open source (Apache 2.0)
- Persian language support
- Faceted search
- Analytics capabilities
- Kubernetes operator available

**Consequences:**

- Need to manage search index
- Persian analyzer customization
- Resource intensive (RAM)
