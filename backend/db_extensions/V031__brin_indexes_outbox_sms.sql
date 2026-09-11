-- ============================================================
-- IRIB DWP — BRIN Indexes for High-Volume Append-Only Tables
-- Target tables: OutboxEvent, SmsMessage
-- Strategy: BRIN indexes on time-series columns for append-heavy workloads
-- Prerequisite: PostgreSQL 9.5+ (we target PG16)
--
-- Benefits of BRIN:
--   - Much smaller index size than B-tree (pages_per_range = 128)
--   - Efficient for append-ordered data (time-series)
--   - Faster index maintenance (less overhead during inserts)
--   - Suitable for large tables where data is naturally ordered
--
-- Rollout notes:
--   1. Can run concurrently with normal operations
--   2. CREATE INDEX CONCURRENTLY if needed for production
--   3. Monitor query performance after deployment
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. OutboxEvent — Append-only event queue for reliable messaging
-- ══════════════════════════════════════════════════════════════

-- BRIN index on createdAt for time-based queries (cleanup, retry logic)
CREATE INDEX IF NOT EXISTS "OutboxEvent_createdAt_brin_idx"
  ON "OutboxEvent" USING BRIN ("createdAt")
  WITH (pages_per_range = 128);

-- BRIN index on status for filtering by processing state
-- Combined with createdAt for efficient retry queries
CREATE INDEX IF NOT EXISTS "OutboxEvent_status_createdAt_brin_idx"
  ON "OutboxEvent" USING BRIN (status, "createdAt")
  WITH (pages_per_range = 128);

-- B-tree index for aggregate lookups (still needed for point queries)
CREATE INDEX IF NOT EXISTS "OutboxEvent_aggregateId_aggregateType_idx"
  ON "OutboxEvent" ("aggregateId", "aggregateType");

-- ══════════════════════════════════════════════════════════════
-- 2. SmsMessage — Append-only SMS delivery tracking
-- ══════════════════════════════════════════════════════════════

-- BRIN index on createdAt for time-based queries (delivery tracking, cleanup)
CREATE INDEX IF NOT EXISTS "SmsMessage_createdAt_brin_idx"
  ON "SmsMessage" USING BRIN ("createdAt")
  WITH (pages_per_range = 128);

-- BRIN index on status for filtering by delivery state
-- Combined with createdAt for efficient monitoring queries
CREATE INDEX IF NOT EXISTS "SmsMessage_status_createdAt_brin_idx"
  ON "SmsMessage" USING BRIN (status, "createdAt")
  WITH (pages_per_range = 128);

-- BRIN index on campaignId for campaign-based analytics
CREATE INDEX IF NOT EXISTS "SmsMessage_campaignId_createdAt_brin_idx"
  ON "SmsMessage" USING BRIN ("campaignId", "createdAt")
  WITH (pages_per_range = 128);

-- B-tree index for recipient lookups (still needed for point queries)
CREATE INDEX IF NOT EXISTS "SmsMessage_recipientPhone_idx"
  ON "SmsMessage" ("recipientPhone");

-- ══════════════════════════════════════════════════════════════
-- Verify / Report
-- ══════════════════════════════════════════════════════════════
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('OutboxEvent', 'SmsMessage')
  AND indexname LIKE '%brin%'
ORDER BY tablename, indexname;

-- Report index sizes for monitoring
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('OutboxEvent', 'SmsMessage')
  AND indexname LIKE '%brin%'
ORDER BY tablename, indexname;
