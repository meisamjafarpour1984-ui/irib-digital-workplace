#!/bin/bash
# Database Maintenance Script - REINDEX
# Usage: ./db-maintenance-reindex.sh
# Schedule: Run monthly on first Sunday at 3 AM via CronJob

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-irib_dwp}"
DB_USER="${DB_USER:-irib_admin}"
DB_PASSWORD="${DB_PASSWORD:-irib_secret_2024}"
LOG_FILE="./logs/db-reindex-$(date +%Y%m%d_%H%M%S).log"

# Create log directory
mkdir -p ./logs

echo "=== Database REINDEX Started at $(date) ===" | tee -a "${LOG_FILE}"
echo "Database: ${DB_NAME}" | tee -a "${LOG_FILE}"

# Tables to reindex (high-volume tables with heavy index usage)
TABLES=(
  "PageView"
  "AuditLogEntry"
  "Notification"
  "OutboxEvent"
  "SmsMessage"
  "ContentItem"
)

echo "Starting REINDEX CONCURRENTLY for high-volume tables..." | tee -a "${LOG_FILE}"

# REINDEX CONCURRENTLY for each table (allows concurrent operations)
for table in "${TABLES[@]}"; do
  echo "Processing table: ${table}" | tee -a "${LOG_FILE}"
  
  PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -c "REINDEX INDEX CONCURRENTLY IF EXISTS \"${table}_pkey\";" \
    2>&1 | tee -a "${LOG_FILE}" || true
  
  PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -c "REINDEX INDEX CONCURRENTLY IF EXISTS \"${table}_createdAt_idx\";" \
    2>&1 | tee -a "${LOG_FILE}" || true
  
  echo "Completed REINDEX for ${table}" | tee -a "${LOG_FILE}"
done

echo "Starting REINDEX for BRIN indexes..." | tee -a "${LOG_FILE}"

# REINDEX BRIN indexes (these are smaller and can be reindexed quickly)
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    SELECT 'REINDEX INDEX CONCURRENTLY IF EXISTS ' || quote_ident(indexname) || ';'
    FROM pg_indexes
    WHERE indexname LIKE '%brin%'
    AND schemaname = 'public';
  " \
  2>&1 | tee -a "${LOG_FILE}"

# Execute the generated REINDEX commands
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    DO \$\$
    DECLARE
      idx RECORD;
    BEGIN
      FOR idx IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE indexname LIKE '%brin%' 
        AND schemaname = 'public'
      LOOP
        EXECUTE 'REINDEX INDEX CONCURRENTLY IF EXISTS ' || quote_ident(idx.indexname);
        RAISE NOTICE 'Reindexed: %', idx.indexname;
      END LOOP;
    END \$\$;
  " \
  2>&1 | tee -a "${LOG_FILE}"

echo "Checking index bloat..." | tee -a "${LOG_FILE}"

# Check for index bloat (indexes that need reindexing)
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    SELECT 
      schemaname,
      tablename,
      indexname,
      pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
      idx_scan AS index_scans,
      idx_tup_read AS tuples_read,
      CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_tup_read = 0 THEN 'INEFFICIENT'
        ELSE 'OK'
      END AS status
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY pg_relation_size(indexrelid) DESC;
  " \
  2>&1 | tee -a "${LOG_FILE}"

echo "Checking for corrupted indexes..." | tee -a "${LOG_FILE}"

# Check for corrupted indexes
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    SELECT 
      schemaname,
      tablename,
      indexname,
      indisvalid AS is_valid,
      indisready AS is_ready,
      indisprimary AS is_primary
    FROM pg_index
    JOIN pg_class ON pg_index.indexrelid = pg_class.oid
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE schemaname = 'public'
    AND (NOT indisvalid OR NOT indisready);
  " \
  2>&1 | tee -a "${LOG_FILE}"

echo "=== Database REINDEX Completed at $(date) ===" | tee -a "${LOG_FILE}"
echo "Log file: ${LOG_FILE}" | tee -a "${LOG_FILE}"
