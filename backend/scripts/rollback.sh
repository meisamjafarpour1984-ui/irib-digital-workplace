#!/bin/bash
# Database rollback script for IRIB DWP
# Rollbacks both Prisma migrations and manual SQL extensions

set -e

echo "🔄 Rolling back database migrations..."

# 1. Rollback Prisma migrations
echo "📋 Rolling back Prisma migrations..."
cd backend
pnpm prisma migrate resolve --rolled-back

# 2. Manual rollback of SQL extensions (if needed)
echo "⚠️  Manual SQL extensions cannot be automatically rolled back"
echo "⚠️  Please manually revert changes in db_extensions/"

echo "✅ Rollback completed (review manually for SQL extensions)"