# Database migration script for IRIB DWP (Windows version)
# Runs both Prisma migrations and manual SQL extensions

Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan

# 1. Run Prisma migrations (schema)
Write-Host "📋 Running Prisma migrations..." -ForegroundColor Yellow
Set-Location backend
pnpm prisma migrate deploy

# 2. Run SQL manual migrations (extensions, functions)
Write-Host "🔧 Running SQL manual migrations..." -ForegroundColor Yellow
Set-Location ..

if (Test-Path "db_extensions") {
    foreach ($file in Get-ChildItem "db_extensions\*.sql") {
        Write-Host "Running $($file.Name)..." -ForegroundColor Gray
        psql $env:DATABASE_URL -f $file.FullName
    }
} else {
    Write-Host "⚠️  db_extensions directory not found" -ForegroundColor Yellow
}

Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green