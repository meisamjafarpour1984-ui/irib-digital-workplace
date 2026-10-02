#!/bin/bash
# Redis Backup Script
# Usage: ./backup-redis.sh

set -e

# Configuration
BACKUP_DIR="./backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/redis_backup_${TIMESTAMP}.rdb"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting Redis backup at ${TIMESTAMP}"

# Save Redis data to disk first
docker exec irib-redis redis-cli -a irib_redis_2024 BGSAVE

# Wait for save to complete
sleep 5

# Copy RDB file from container
docker cp irib-redis:/data/dump.rdb "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "Backup size: ${BACKUP_SIZE}"
  
  # Remove old backups (retention policy)
  find "${BACKUP_DIR}" -name "redis_backup_*.rdb" -mtime +${RETENTION_DAYS} -delete
  echo "Old backups (older than ${RETENTION_DAYS} days) removed"
else
  echo "Backup failed!"
  exit 1
fi

echo "Redis backup completed at $(date)"