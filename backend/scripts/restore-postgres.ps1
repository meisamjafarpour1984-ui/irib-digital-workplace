# PostgreSQL Restore Script (PowerShell)
# Usage: .\restore-postgres.ps1 <backup-file>

$ErrorActionPreference = "Stop"

if ($args.Count -eq 0) {
    Write-Host "Usage: .\restore-postgres.ps1 <backup-file>"
    Write-Host "Example: .\restore-postgres.ps1 .\backups\postgres\postgres_backup_20240101_120000.sql.gz"
    exit 1
}

$BACKUP_FILE = $args[0]
$CONTAINER = if ($env:POSTGRES_CONTAINER) { $env:POSTGRES_CONTAINER } else { "irib-postgres" }
$DATABASE = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "irib_dwp" }
$USER = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "irib_admin" }

if (-not (Test-Path $BACKUP_FILE)) {
    Write-Host "Error: Backup file not found: $BACKUP_FILE"
    exit 1
}

Write-Host "Starting PostgreSQL restore from: $BACKUP_FILE"
Write-Host "WARNING: This will overwrite the current database!"
$CONFIRM = Read-Host "Type 'yes' to confirm"

if ($CONFIRM -ne "yes") {
    Write-Host "Restore cancelled"
    exit 0
}

$temporarySql = $null
try {
    $sqlFile = $BACKUP_FILE
    if ($BACKUP_FILE -match '\.gz$') {
        $temporarySql = Join-Path ([System.IO.Path]::GetTempPath()) "dwp-restore-$([guid]::NewGuid()).sql"
        if (Get-Command gzip -ErrorAction SilentlyContinue) {
            & gzip -dc $BACKUP_FILE | Set-Content -Path $temporarySql -Encoding UTF8
        } elseif (Get-Command 7z -ErrorAction SilentlyContinue) {
            & 7z e $BACKUP_FILE "-o$([System.IO.Path]::GetDirectoryName($temporarySql))" -y | Out-Null
            $extracted = Join-Path ([System.IO.Path]::GetDirectoryName($temporarySql)) ([System.IO.Path]::GetFileNameWithoutExtension($BACKUP_FILE))
            Move-Item -Force $extracted $temporarySql
        } else {
            throw "gzip or 7z is required to decompress .gz backups"
        }
        $sqlFile = $temporarySql
    }

    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "docker command was not found"
    }

    Get-Content -Raw -Path $sqlFile | & docker exec -i $CONTAINER psql -U $USER $DATABASE
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL restore command failed with exit code $LASTEXITCODE"
    }
    Write-Host "Restore completed successfully"
} finally {
    if ($temporarySql -and (Test-Path $temporarySql)) {
        Remove-Item -Force $temporarySql
    }
}

Write-Host "PostgreSQL restore completed at $(Get-Date)"