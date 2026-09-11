#!/bin/bash
# Database migration script for IRIB DWP
# Runs both Prisma migrations and manual SQL extensions

set -e

echo "🔄 Running database migrations..."

# 1. Run Prisma migrations (schema)
echo "📋 Running Prisma migrations..."
cd backend
pnpm prisma migrate deploy

# 2. Run SQL manual migrations (extensions, functions)
echo "🔧 Running SQL manual migrations..."
for file in ../db_extensions/*.sql; do
  if [ -f "$file" ]; then
    echo "Running $file..."
    psql "$DATABASE_URL" -f "$file"
  fi
done

echo "✅ Migrations completed successfully!"