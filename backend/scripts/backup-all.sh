#!/bin/bash
# Master Backup Script - Runs all backups
# Usage: ./backup-all.sh

set -e

echo "=========================================="
echo "Starting Full System Backup"
echo "=========================================="
echo "Start time: $(date)"
echo ""

# Run PostgreSQL backup
echo "------------------------------------------"
echo "1. PostgreSQL Backup"
echo "------------------------------------------"
./scripts/backup-postgres.sh
echo ""

# Run Redis backup
echo "------------------------------------------"
echo "2. Redis Backup"
echo "------------------------------------------"
./scripts/backup-redis.sh
echo ""

# Run MinIO backup
echo "------------------------------------------"
echo "3. MinIO Backup"
echo "------------------------------------------"
./scripts/backup-minio.sh
echo ""

echo "=========================================="
echo "Full System Backup Completed"
echo "=========================================="
echo "End time: $(date)"
echo ""