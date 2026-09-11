-- ============================================================
-- IRIB DWP — Partitioning Strategy for High-Volume Tables
-- Target tables: AuditLogEntry, Notification, PageView, SmsMessage
-- Strategy: Declarative Range Partitioning by month (createdAt)
-- Prerequisite: PostgreSQL 11+ (we target PG16)
--
-- Rollout notes:
--   1. Run in a DDL-only window — acquires ACCESS EXCLUSIVE on parent tables.
--   2. Existing data: attached as a DEFAULT partition or migrated via
--      pg_repack / CREATE TABLE ... AS; swap names; attach.
--   3. Default partition captures rows that do not map to any explicit range.
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. AuditLogEntry — Append-only, time-series audit trail
-- ══════════════════════════════════════════════════════════════
DO $$
DECLARE
  _exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM   pg_class c
    JOIN   pg_namespace n ON n.oid = c.relnamespace
    WHERE  c.relname = 'AuditLogEntry' AND n.nspname = 'public'
           AND c.relkind = 'p'
  ) INTO _exists;

  IF NOT _exists THEN
    -- Partition existing table by renaming and rebuilding with PARTITION BY.
    -- This approach preserves data via the DEFAULT partition initially.
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='AuditLogEntry') THEN
      ALTER TABLE "AuditLogEntry" RENAME TO "AuditLogEntry_legacy";

      CREATE TABLE "AuditLogEntry" (
        LIKE "AuditLogEntry_legacy" INCLUDING ALL
      ) PARTITION BY RANGE ("createdAt");

      -- Attach legacy data as a default partition
      ALTER TABLE "AuditLogEntry" ATTACH PARTITION "AuditLogEntry_legacy" DEFAULT;

      -- Preserve PK / unique indices — they must include the partition key.
      -- NOTE: A global PK on (id) alone is incompatible with partitioning;
      -- composite PKs (id, createdAt) or application-enforced uniqueness recommended.
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'AuditLogEntry' AND indexname = 'AuditLogEntry_pkey'
      ) THEN
        -- Try to preserve uniqueness where possible (composite PK)
        BEGIN
          ALTER TABLE "AuditLogEntry" ADD PRIMARY KEY (id, "createdAt");
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Could not create composite PK on AuditLogEntry: %', SQLERRM;
        END;
      END IF;
    END IF;
  END IF;
END $$;

-- Create quarterly partitions for current + 2 future quarters
DO $$
DECLARE
  qstart DATE;
  qend   DATE;
  pname  TEXT;
  year   INT;
  qtr    INT;
BEGIN
  FOR year IN EXTRACT(YEAR FROM CURRENT_DATE) - 1 .. EXTRACT(YEAR FROM CURRENT_DATE) + 1 LOOP
    FOR qtr IN 1 .. 4 LOOP
      qstart := make_date(year, (qtr - 1) * 3 + 1, 1);
      qend   := qstart + INTERVAL '3 months';
      pname  := format('AuditLogEntry_%s_q%s', year, qtr);

      IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = pname AND relkind = 'r') THEN
        BEGIN
          EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF "AuditLogEntry"
             FOR VALUES FROM (%L) TO (%L)
             TABLESPACE pg_default',
            pname, qstart, qend
          );
          RAISE NOTICE 'Created partition: %', pname;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Partition % already attached / conflict: %', pname, SQLERRM;
        END;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Recreate supporting indices partition-aware
CREATE INDEX IF NOT EXISTS "AuditLogEntry_actorId_createdAt_idx"
  ON "AuditLogEntry" ("actorId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "AuditLogEntry_entityType_entityId_createdAt_idx"
  ON "AuditLogEntry" ("entityType", "entityId", "createdAt" DESC);

-- ══════════════════════════════════════════════════════════════
-- 2. Notification — Per-user time-series
-- ══════════════════════════════════════════════════════════════
DO $$
DECLARE
  _exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM   pg_class c
    JOIN   pg_namespace n ON n.oid = c.relnamespace
    WHERE  c.relname = 'Notification' AND n.nspname = 'public'
           AND c.relkind = 'p'
  ) INTO _exists;

  IF NOT _exists THEN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='Notification') THEN
      ALTER TABLE "Notification" RENAME TO "Notification_legacy";

      CREATE TABLE "Notification" (
        LIKE "Notification_legacy" INCLUDING ALL
      ) PARTITION BY RANGE ("createdAt");

      ALTER TABLE "Notification" ATTACH PARTITION "Notification_legacy" DEFAULT;

      BEGIN
        ALTER TABLE "Notification" ADD PRIMARY KEY (id, "createdAt");
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create composite PK on Notification: %', SQLERRM;
      END;
    END IF;
  END IF;
END $$;

-- Monthly partitions for Notifications (higher write volume than audit,
-- smaller partitions = better pruning for 30-day retention windows).
DO $$
DECLARE
  mstart DATE;
  mend   DATE;
  pname  TEXT;
  yyyymm TEXT;
BEGIN
  FOR offset_months IN -3 .. 6 LOOP
    mstart := date_trunc('month', CURRENT_DATE) + (offset_months || ' month')::interval;
    mend   := mstart + INTERVAL '1 month';
    yyyymm := to_char(mstart, 'YYYY_MM');
    pname  := 'Notification_' || yyyymm;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = pname AND relkind = 'r') THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF "Notification"
           FOR VALUES FROM (%L) TO (%L)',
          pname, mstart, mend
        );
        RAISE NOTICE 'Created partition: %', pname;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Partition % conflict: %', pname, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_createdAt_idx"
  ON "Notification" ("userId", "isRead", "createdAt" DESC);

-- ══════════════════════════════════════════════════════════════
-- 3. PageView — Very-high-volume analytics table
-- ══════════════════════════════════════════════════════════════
DO $$
DECLARE
  _exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM   pg_class c
    JOIN   pg_namespace n ON n.oid = c.relnamespace
    WHERE  c.relname = 'PageView' AND n.nspname = 'public'
           AND c.relkind = 'p'
  ) INTO _exists;

  IF NOT _exists THEN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='PageView') THEN
      ALTER TABLE "PageView" RENAME TO "PageView_legacy";

      CREATE TABLE "PageView" (
        LIKE "PageView_legacy" INCLUDING ALL
      ) PARTITION BY RANGE ("createdAt");

      ALTER TABLE "PageView" ATTACH PARTITION "PageView_legacy" DEFAULT;

      BEGIN
        ALTER TABLE "PageView" ADD PRIMARY KEY (id, "createdAt");
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create composite PK on PageView: %', SQLERRM;
      END;
    END IF;
  END IF;
END $$;

-- Monthly partitions for PageView + BRIN index (append-heavy pattern)
DO $$
DECLARE
  mstart DATE;
  mend   DATE;
  pname  TEXT;
BEGIN
  FOR offset_months IN -6 .. 12 LOOP
    mstart := date_trunc('month', CURRENT_DATE) + (offset_months || ' month')::interval;
    mend   := mstart + INTERVAL '1 month';
    pname  := 'PageView_' || to_char(mstart, 'YYYY_MM');

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = pname AND relkind = 'r') THEN
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF "PageView"
           FOR VALUES FROM (%L) TO (%L)',
          pname, mstart, mend
        );
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END LOOP;
END $$;

-- BRIN is optimal for append-ordered, large tables (much smaller than B-tree)
CREATE INDEX IF NOT EXISTS "PageView_createdAt_brin_idx"
  ON "PageView" USING BRIN ("createdAt")
  WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS "PageView_path_createdAt_idx"
  ON "PageView" ("path", "createdAt" DESC);

-- ══════════════════════════════════════════════════════════════
-- 4. Maintenance: Retention helpers (drop partitions older than N months)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION drop_old_partitions(p_table TEXT, p_keep_months INT)
RETURNS TABLE (dropped_partition TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff DATE := date_trunc('month', CURRENT_DATE) - (p_keep_months || ' month')::interval;
  rec    RECORD;
BEGIN
  FOR rec IN
    SELECT c.relname AS part,
           pg_get_expr(c.relpartbound, c.oid) AS bound
    FROM   pg_class c
    JOIN   pg_inherits i ON i.inhrelid = c.oid
    JOIN   pg_class p  ON p.oid = i.inhparent
    WHERE  p.relname = p_table
      AND  c.relkind = 'r'
  LOOP
    -- Bound format: FOR VALUES FROM ('2024-01-01') TO ('2024-04-01')
    IF rec.bound ~* 'TO \(''([0-9\-]+)''' THEN
      IF to_date(substring(rec.bound FROM 'TO \(''([0-9\-]+)'''), 'YYYY-MM-DD') <= cutoff THEN
        EXECUTE format('DROP TABLE IF EXISTS %I', rec.part);
        dropped_partition := rec.part;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Example scheduled call (wire into pg_cron or external orchestrator):
--   SELECT drop_old_partitions('Notification', 12);  -- keep 12 months
--   SELECT drop_old_partitions('AuditLogEntry', 24); -- keep 24 months
--   SELECT drop_old_partitions('PageView', 6);       -- keep 6 months

-- ══════════════════════════════════════════════════════════════
-- Verify / Report
-- ══════════════════════════════════════════════════════════════
SELECT
  nmsp_parent.nspname   AS parent_schema,
  parent.relname         AS parent,
  nmsp_child.nspname     AS child_schema,
  child.relname          AS partition,
  pg_get_expr(child.relpartbound, child.oid) AS partition_bound
FROM pg_inherits
JOIN pg_class parent            ON pg_inherits.inhparent = parent.oid
JOIN pg_class child             ON pg_inherits.inhrelid   = child.oid
JOIN pg_namespace nmsp_parent   ON nmsp_parent.oid  = parent.relnamespace
JOIN pg_namespace nmsp_child    ON nmsp_child.oid   = child.relnamespace
WHERE parent.relname IN ('AuditLogEntry', 'Notification', 'PageView')
ORDER BY parent.relname, partition;
