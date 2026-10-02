# PostgreSQL Backup Script (PowerShell)
# Usage: .\backup-postgres.ps1

$ErrorActionPreference = "Stop"

# Configuration
$BACKUP_DIR = ".\backups\postgres"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\postgres_backup_$TIMESTAMP.sql.gz"
$RETENTION_DAYS = 7

# Create backup directory if it doesn't exist
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

Write-Host "Starting PostgreSQL backup at $TIMESTAMP"

# Perform backup
docker exec irib-postgres pg_dump -U irib_admin irib_dwp | gzip > $BACKUP_FILE

# Check if backup was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully: $BACKUP_FILE"
    
    # Calculate backup size
    $BACKUP_SIZE = (Get-Item $BACKUP_FILE).Length / 1MB
    Write-Host "Backup size: $([math]::Round($BACKUP_SIZE, 2)) MB"
    
    # Remove old backups (retention policy)
    Get-ChildItem $BACKUP_DIR -Filter "postgres_backup_*.sql.gz" | 
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENTION_DAYS) } | 
        Remove-Item -Force
    Write-Host "Old backups (older than $RETENTION_DAYS days) removed"
} else {
    Write-Host "Backup failed!"
    exit 1
}

Write-Host "PostgreSQL backup completed at $(Get-Date)"