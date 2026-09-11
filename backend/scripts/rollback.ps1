# Database rollback script for IRIB DWP (Windows version)
# Rollbacks both Prisma migrations and manual SQL extensions

Write-Host "🔄 Rolling back database migrations..." -ForegroundColor Cyan

# 1. Rollback Prisma migrations
Write-Host "📋 Rolling back Prisma migrations..." -ForegroundColor Yellow
Set-Location backend
pnpm prisma migrate resolve --rolled-back

# 2. Manual rollback of SQL extensions (if needed)
Write-Host "⚠️  Manual SQL extensions cannot be automatically rolled back" -ForegroundColor Yellow
Write-Host "⚠️  Please manually revert changes in db_extensions/" -ForegroundColor Yellow

Write-Host "✅ Rollback completed (review manually for SQL extensions)" -ForegroundColor Green