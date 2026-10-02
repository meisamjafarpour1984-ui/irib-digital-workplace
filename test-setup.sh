#!/bin/bash

# IRIB Digital Workplace - Test Setup Script
# Designer & Developer: میثم جعفرپور آلانق
# Education: Master of Software Engineering
# Position: Audio and Video Expert Level 4
# Client: Technical Deputy of IRIB East Azerbaijan Center
# All rights reserved © 2026

set -e

echo "=========================================="
echo "IRIB Digital Workplace - Test Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.test.yml down -v || true

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.test.yml pull

# Build and start containers
echo "🚀 Starting test environment..."
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
for service in postgres redis minio opensearch keycloak; do
    if docker-compose -f docker-compose.test.yml ps $service | grep -q "Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
    fi
done

echo ""
echo "=========================================="
echo "Test environment is ready!"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6379"
echo "  - MinIO: http://localhost:9000 (Console: http://localhost:9001)"
echo "  - OpenSearch: http://localhost:9200"
echo "  - Keycloak: http://localhost:8080"
echo "  - Mailhog: http://localhost:8025"
echo "  - Kafka: localhost:9092"
echo ""
echo "To view logs: docker-compose -f docker-compose.test.yml logs -f"
echo "To stop: docker-compose -f docker-compose.test.yml down"
echo ""
