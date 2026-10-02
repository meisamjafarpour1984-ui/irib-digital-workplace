#!/bin/bash
# PostgreSQL Backup Script
# Usage: ./backup-postgres.sh

set -e

# Configuration
BACKUP_DIR="./backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/postgres_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL backup at ${TIMESTAMP}"

# Perform backup
docker exec irib-postgres pg_dump -U irib_admin irib_dwp | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "Backup size: ${BACKUP_SIZE}"
  
  # Remove old backups (retention policy)
  find "${BACKUP_DIR}" -name "postgres_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
  echo "Old backups (older than ${RETENTION_DAYS} days) removed"
else
  echo "Backup failed!"
  exit 1
fi

echo "PostgreSQL backup completed at $(date)"