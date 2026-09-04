# Environment Configuration Guide

This guide explains how to configure and deploy the IRIB Digital Workplace platform across different environments (development, staging, production).

---

## ⚠️ Important: Which version is this document for?

This document is for the **full infrastructure version (backend/docker-compose.db.yml)**.

### Project Versions

- **Simple Development Version (docker-compose.dev.yml):** 4 services (frontend, backend, postgres, redis)
  - Suitable for: Daily development with hot-reload
  - Access: `docker-compose -f docker-compose.dev.yml up`

- **Full Infrastructure Version (backend/docker-compose.db.yml):** 11+ services
  - Suitable for: Full development with all infrastructure
  - Access: `docker-compose -f backend/docker-compose.db.yml up`

### Which version is this document for?

✅ **Full Infrastructure Version (db.yml)** - This document is for this version
❌ **Simple Development Version (dev.yml)** - This document is not for this version

### If you are using the simple development version:

Please refer to the following documents:
- [README.md](./README.md) - For general information
- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - For Docker deployment guide

---

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Development Setup](#development-setup)
- [Staging Setup](#staging-setup)
- [Production Setup](#production-setup)
- [Environment Variables](#environment-variables)
- [Docker Configuration](#docker-configuration)
- [Security Best Practices](#security-best-practices)

## 🌐 Overview

The project supports three main environments:

| Environment | Purpose | URL Pattern |
|-------------|---------|-------------|
| **Development** | Local development | `http://localhost:3000` |
| **Staging** | Pre-production testing | `https://staging.iribtabriz.ir` |
| **Production** | Live production | `https://portal.iribtabriz.ir` |

## 📁 Environment Files

### Frontend Environment Files

- `.env.example` - Template for environment variables
- `.env.development` - Development environment configuration
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration

### Backend Environment Files

- `backend/.env.example` - Backend environment template
- `backend/.env.development` - Development backend configuration
- `backend/.env.staging` - Staging backend configuration
- `backend/.env.production` - Production backend configuration

## 🔧 Development Setup

### 1. Initial Setup

```bash
# Clone the repository
git clone https://git.iribtabriz.ir/irib/dwp-frontend.git
cd dwp-frontend

# Copy environment files
cp .env.example .env.local
cp backend/.env.example backend/.env.local

# Install dependencies
pnpm install
cd backend
pnpm install
cd ..
```

### 2. Start Database Services

```bash
# Start development database services
docker-compose -f docker-compose.development.yml up -d

# Verify services are running
docker-compose -f docker-compose.development.yml ps
```

### 3. Run Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
pnpm dev

# Terminal 2: Start frontend
pnpm dev
```

### 5. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Keycloak**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

## 🚀 Staging Setup

### 1. Configure Environment

```bash
# Copy staging environment files
cp .env.staging .env.local
cp backend/.env.staging backend/.env.local

# Update sensitive values with actual staging credentials
# Edit the files and replace placeholder values
```

### 2. Build and Deploy

```bash
# Build frontend
pnpm build

# Build backend
cd backend
pnpm build
cd ..
```

### 3. Docker Deployment

```bash
# Deploy frontend
docker-compose -f docker-compose.staging.yml up -d

# Deploy backend
cd backend
docker-compose -f docker-compose.staging.yml up -d
cd ..
```

### 4. Verify Deployment

```bash
# Check frontend
curl https://staging.iribtabriz.ir

# Check backend health
curl https://api-staging.iribtabriz.ir/api/v1/health/live
```

## 🏭 Production Setup

### 1. Security Preparations

⚠️ **IMPORTANT**: Before deploying to production:

1. Generate secure secrets:
   ```bash
   # Generate JWT secret (min 32 characters)
   openssl rand -base64 32
   
   # Generate database passwords
   openssl rand -base64 24
   ```

2. Update SSL certificates
3. Configure firewall rules
4. Set up monitoring and alerting

### 2. Configure Environment

```bash
# Copy production environment files
cp .env.production .env.local
cp backend/.env.production backend/.env.local

# UPDATE ALL SENSITIVE VALUES WITH ACTUAL PRODUCTION CREDENTIALS
# Never commit production .env files to version control
```

### 3. Build and Deploy

```bash
# Build for production
NODE_ENV=production pnpm build

cd backend
NODE_ENV=production pnpm build
cd ..
```

### 4. Production Deployment

Production deployment should use Kubernetes/Helm charts (see `DEPLOYMENT.md`):

```bash
# Deploy using Helm
helm upgrade --install dwp-frontend infra/helm/dwp-frontend -n production
helm upgrade --install dwp-backend infra/helm/dwp-backend -n production
```

## 🔑 Environment Variables

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `IRIB Digital Workplace` | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api/v1` | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:3001` | Yes |
| `NEXT_PUBLIC_AUTH_TYPE` | Auth provider (`local`/`keycloak`) | `local` | Yes |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak URL | - | Conditional |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm | - | Conditional |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client ID | - | Conditional |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` | No |
| `NEXT_PUBLIC_DEBUG_MODE` | Debug mode | `false` | No |

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3001` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - | Yes |
| `JWT_ISSUER` | JWT issuer | `irib-dwp` | No |
| `JWT_AUDIENCE` | JWT audience | `irib-dwp-web` | No |
| `REDIS_HOST` | Redis host | `localhost` | Yes |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password | - | Yes |
| `OPENSEARCH_HOST` | OpenSearch host | `localhost` | Yes |
| `OPENSEARCH_PORT` | OpenSearch port | `9200` | No |
| `MINIO_ENDPOINT` | MinIO endpoint | `localhost:9000` | Yes |
| `MINIO_ACCESS_KEY` | MinIO access key | - | Yes |
| `MINIO_SECRET_KEY` | MinIO secret key | - | Yes |
| `KEYCLOAK_URL` | Keycloak URL | `http://localhost:8080` | Yes |
| `LOG_LEVEL` | Logging level | `debug` | No |

## 🐳 Docker Configuration

### Development Docker Compose

The development environment includes all required services:

```bash
# Start all development services
docker-compose -f docker-compose.development.yml up -d

# View logs
docker-compose -f docker-compose.development.yml logs -f

# Stop services
docker-compose -f docker-compose.development.yml down

# Stop and remove volumes
docker-compose -f docker-compose.development.yml down -v
```

### Staging/Production Docker

Staging and production use separate Docker Compose files:

```bash
# Staging Frontend
docker-compose -f docker-compose.staging.yml up -d

# Staging Backend
cd backend
docker-compose -f docker-compose.staging.yml up -d

# Production Frontend
docker-compose -f docker-compose.production.yml up -d

# Production Backend
cd backend
docker-compose -f docker-compose.production.yml up -d
```

### Dockerfile Features

Both frontend and backend Dockerfiles include:

- **Multi-stage builds** for optimized image size
- **Environment-specific builds** using build arguments
- **Non-root user** for security
- **Health checks** for container monitoring
- **Optimized dependencies** for production

### Build Arguments

Frontend Dockerfile supports:
- `NODE_ENV` - Environment mode (development/production)
- `ENVIRONMENT` - Environment name (development/staging/production)

Backend Dockerfile supports:
- `NODE_ENV` - Environment mode (development/production)
- `ENVIRONMENT` - Environment name (development/staging/production)

### Resource Limits

Production Docker configurations include resource limits:

**Frontend:**
- CPU: 2 cores limit, 0.5 cores reservation
- Memory: 2GB limit, 512MB reservation

**Backend:**
- CPU: 4 cores limit, 1 core reservation
- Memory: 4GB limit, 1GB reservation

### Docker Networks

All services use dedicated bridge networks:
- `irib-network` - Isolated network for IRIB services
- Enables secure communication between containers
- Prevents external access to internal services

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ **Never commit** `.env.local` or production `.env` files
- ✅ **Use different secrets** for each environment
- ✅ **Rotate secrets** regularly
- ✅ **Use strong secrets** (min 32 characters for JWT)
- ✅ **Store secrets** in secret management systems (Vault, AWS Secrets Manager)

### 2. Database Security

- ✅ **Use strong passwords** for database connections
- ✅ **Enable SSL** for database connections in production
- ✅ **Restrict access** to database from specific IPs only
- ✅ **Regular backups** with encryption

### 3. API Security

- ✅ **Enable HTTPS** in production
- ✅ **Implement rate limiting**
- ✅ **Use CORS** properly
- ✅ **Validate all inputs**
- ✅ **Sanitize outputs**

### 4. Deployment Security

- ✅ **Use image scanning** (Trivy, Snyk)
- ✅ **Sign container images** (cosign)
- ✅ **Use non-root users** in containers
- ✅ **Minimal attack surface** (alpine images)
- ✅ **Regular security updates**

## 📝 Environment-Specific Notes

### Development

- Debug mode enabled
- Mock data available
- Local database services
- Permissive CORS settings
- Detailed logging

### Staging

- Production-like configuration
- Test authentication flow
- Test integrations
- Performance testing
- User acceptance testing

### Production

- Maximum security
- Optimized performance
- Monitoring enabled
- Error reporting enabled
- Minimal logging (warn level)

## 🔄 Environment Switching

To switch between environments:

```bash
# Development
cp .env.development .env.local
cp backend/.env.development backend/.env.local

# Staging
cp .env.staging .env.local
cp backend/.env.staging backend/.env.local

# Production
cp .env.production .env.local
cp backend/.env.production backend/.env.local
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Kubernetes Deployment Guide](./DEPLOYMENT.md)
- [Security Best Practices](./ARCHITECTURE.md#security)

## 🆘 Troubleshooting

### Common Issues

**Issue**: Environment variables not loading
- **Solution**: Ensure `.env.local` exists and variables are properly formatted

**Issue**: Database connection failed
- **Solution**: Check DATABASE_URL format and ensure database service is running

**Issue**: CORS errors
- **Solution**: Verify CORS_ORIGINS includes your frontend URL

**Issue**: Build fails in production
- **Solution**: Ensure all required environment variables are set for build time

---

For additional help, refer to the project documentation or contact the DevOps team.
