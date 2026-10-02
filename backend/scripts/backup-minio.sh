#!/bin/bash
# MinIO Backup Script
# Usage: ./backup-minio.sh

set -e

# Configuration
BACKUP_DIR="./backups/minio"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/minio_backup_${TIMESTAMP}.tar.gz"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting MinIO backup at ${TIMESTAMP}"

# Archive MinIO data directory
docker run --rm \
  --volumes-from irib-minio \
  -v "${BACKUP_DIR}:/backup" \
  alpine tar czf "/backup/minio_backup_${TIMESTAMP}.tar.gz" /data

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "Backup size: ${BACKUP_SIZE}"
  
  # Remove old backups (retention policy)
  find "${BACKUP_DIR}" -name "minio_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
  echo "Old backups (older than ${RETENTION_DAYS} days) removed"
else
  echo "Backup failed!"
  exit 1
fi

echo "MinIO backup completed at $(date)"