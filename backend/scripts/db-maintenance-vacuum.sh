#!/bin/bash
# Database Maintenance Script - VACUUM and ANALYZE
# Usage: ./db-maintenance-vacuum.sh
# Schedule: Run weekly on Sunday at 2 AM via CronJob

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-irib_dwp}"
DB_USER="${DB_USER:-irib_admin}"
DB_PASSWORD="${DB_PASSWORD:-irib_secret_2024}"
LOG_FILE="./logs/db-maintenance-$(date +%Y%m%d_%H%M%S).log"

# Create log directory
mkdir -p ./logs

echo "=== Database Maintenance Started at $(date) ===" | tee -a "${LOG_FILE}"
echo "Database: ${DB_NAME}" | tee -a "${LOG_FILE}"

# Tables to maintain (high-volume tables first)
TABLES=(
  "PageView"
  "AuditLogEntry"
  "Notification"
  "OutboxEvent"
  "SmsMessage"
  "ContentItem"
  "User"
)

echo "Starting VACUUM ANALYZE for high-volume tables..." | tee -a "${LOG_FILE}"

# VACUUM ANALYZE for each table
for table in "${TABLES[@]}"; do
  echo "Processing table: ${table}" | tee -a "${LOG_FILE}"
  
  PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -c "VACUUM (VERBOSE, ANALYZE) \"${table}\";" \
    2>&1 | tee -a "${LOG_FILE}"
  
  echo "Completed VACUUM ANALYZE for ${table}" | tee -a "${LOG_FILE}"
done

echo "Starting VACUUM ANALYZE for all tables (full maintenance)..." | tee -a "${LOG_FILE}"

# Full VACUUM ANALYZE for all tables
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "VACUUM (VERBOSE, ANALYZE);" \
  2>&1 | tee -a "${LOG_FILE}"

echo "Checking table statistics..." | tee -a "${LOG_FILE}"

# Report table sizes and statistics
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
      n_live_tup AS live_tuples,
      n_dead_tup AS dead_tuples,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  " \
  2>&1 | tee -a "${LOG_FILE}"

echo "Checking index statistics..." | tee -a "${LOG_FILE}"

# Report index statistics
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  -c "
    SELECT 
      schemaname,
      tablename,
      indexname,
      pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
      idx_scan AS index_scans,
      idx_tup_read AS tuples_read,
      idx_tup_fetch AS tuples_fetched
    FROM pg_stat_user_indexes
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 20;
  " \
  2>&1 | tee -a "${LOG_FILE}"

echo "=== Database Maintenance Completed at $(date) ===" | tee -a "${LOG_FILE}"
echo "Log file: ${LOG_FILE}" | tee -a "${LOG_FILE}"
