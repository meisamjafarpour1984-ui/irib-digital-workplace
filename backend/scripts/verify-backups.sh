#!/bin/bash
# Backup Verification Script
# Usage: ./verify-backups.sh

set -e

# Configuration
BACKUP_DIR="./backups"
LOG_FILE="./backups/verification.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FAILED_CHECKS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p "${BACKUP_DIR}"

echo "=== Backup Verification Started at ${TIMESTAMP} ===" | tee -a "${LOG_FILE}"

# Function to check backup file
check_backup() {
  local service=$1
  local backup_file=$2
  
  if [ -f "${backup_file}" ]; then
    # Check file size (should be > 0)
    local size=$(stat -f%z "${backup_file}" 2>/dev/null || stat -c%s "${backup_file}" 2>/dev/null)
    if [ "${size}" -gt 0 ]; then
      echo -e "${GREEN}✓${NC} ${service}: Backup exists and has size ${size} bytes" | tee -a "${LOG_FILE}"
      return 0
    else
      echo -e "${RED}✗${NC} ${service}: Backup file is empty" | tee -a "${LOG_FILE}"
      return 1
    fi
  else
    echo -e "${RED}✗${NC} ${service}: Backup file not found" | tee -a "${LOG_FILE}"
    return 1
  fi
}

# Function to check backup age
check_backup_age() {
  local service=$1
  local backup_file=$2
  local max_age_hours=24
  
  if [ -f "${backup_file}" ]; then
    local file_age=$(( ($(date +%s) - $(stat -f%m "${backup_file}" 2>/dev/null || stat -c%Y "${backup_file}" 2>/dev/null)) / 3600 ))
    if [ "${file_age}" -le "${max_age_hours}" ]; then
      echo -e "${GREEN}✓${NC} ${service}: Backup is ${file_age} hours old (within ${max_age_hours}h limit)" | tee -a "${LOG_FILE}"
      return 0
    else
      echo -e "${YELLOW}⚠${NC} ${service}: Backup is ${file_age} hours old (exceeds ${max_age_hours}h limit)" | tee -a "${LOG_FILE}"
      return 1
    fi
  fi
}

# Find latest backup for each service
LATEST_POSTGRES=$(find "${BACKUP_DIR}/postgres" -name "postgres_backup_*.sql.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
LATEST_REDIS=$(find "${BACKUP_DIR}/redis" -name "redis_backup_*.rdb" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
LATEST_MINIO=$(find "${BACKUP_DIR}/minio" -name "minio_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)

# Check PostgreSQL backup
echo -e "\n--- PostgreSQL Backup Verification ---" | tee -a "${LOG_FILE}"
if [ -n "${LATEST_POSTGRES}" ]; then
  check_backup "PostgreSQL" "${LATEST_POSTGRES}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  check_backup_age "PostgreSQL" "${LATEST_POSTGRES}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  
  # Verify gzip integrity
  if gzip -t "${LATEST_POSTGRES}" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL: Gzip integrity check passed" | tee -a "${LOG_FILE}"
  else
    echo -e "${RED}✗${NC} PostgreSQL: Gzip integrity check failed" | tee -a "${LOG_FILE}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
else
  echo -e "${RED}✗${NC} PostgreSQL: No backup found" | tee -a "${LOG_FILE}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check Redis backup
echo -e "\n--- Redis Backup Verification ---" | tee -a "${LOG_FILE}"
if [ -n "${LATEST_REDIS}" ]; then
  check_backup "Redis" "${LATEST_REDIS}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  check_backup_age "Redis" "${LATEST_REDIS}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  
  # Verify RDB file format (basic check)
  if head -c 9 "${LATEST_REDIS}" | grep -q "REDIS" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Redis: RDB file format valid" | tee -a "${LOG_FILE}"
  else
    echo -e "${RED}✗${NC} Redis: RDB file format invalid" | tee -a "${LOG_FILE}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
else
  echo -e "${RED}✗${NC} Redis: No backup found" | tee -a "${LOG_FILE}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check MinIO backup
echo -e "\n--- MinIO Backup Verification ---" | tee -a "${LOG_FILE}"
if [ -n "${LATEST_MINIO}" ]; then
  check_backup "MinIO" "${LATEST_MINIO}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  check_backup_age "MinIO" "${LATEST_MINIO}" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
  
  # Verify tar.gz integrity
  if tar -tzf "${LATEST_MINIO}" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MinIO: Tar.gz integrity check passed" | tee -a "${LOG_FILE}"
  else
    echo -e "${RED}✗${NC} MinIO: Tar.gz integrity check failed" | tee -a "${LOG_FILE}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
else
  echo -e "${RED}✗${NC} MinIO: No backup found" | tee -a "${LOG_FILE}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Summary
echo -e "\n=== Backup Verification Completed ===" | tee -a "${LOG_FILE}"
echo "Log file: ${LOG_FILE}" | tee -a "${LOG_FILE}"
if [ "${FAILED_CHECKS}" -gt 0 ]; then
  echo "Failed checks: ${FAILED_CHECKS}" | tee -a "${LOG_FILE}"
  exit 1
fi
