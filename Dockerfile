# ============================================================
# IRIB DWP Frontend — Dockerfile
# Multi-stage build for Next.js 16 with standalone output
# ============================================================
#
# Designer & Developer: میثم جعفرپور آلانق
# Education: Master of Software Engineering
# Position: Audio and Video Expert Level 4
# Client: Technical Deputy of IRIB East Azerbaijan Center
# All rights reserved © 2026
#

FROM node:20-slim AS base

# Install base dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable

# Configure pnpm for better network resilience
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set fetch-timeout 180000

WORKDIR /workspace

# ============================================================
# Development stage - for hot-reload development
# ============================================================

FROM base AS development

# Build arguments for environment configuration
ARG NODE_ENV=development
ARG ENVIRONMENT=development

# Set build environment
ENV NODE_ENV=${NODE_ENV}
ENV ENVIRONMENT=${ENVIRONMENT}

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --ignore-scripts --prefer-offline || \
    pnpm install --ignore-scripts

# Copy source code
COPY . .

# Copy environment file for development
COPY .env.development .env.development

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]

# ============================================================
# Build stage - for production build
# ============================================================

FROM base AS build

# Build arguments for environment configuration
ARG NODE_ENV=production
ARG ENVIRONMENT=production
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_AUTH_TYPE
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID

# Set build environment
ENV NODE_ENV=${NODE_ENV}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_AUTH_TYPE=${NEXT_PUBLIC_AUTH_TYPE}
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies with network resilience
RUN pnpm install --frozen-lockfile --prefer-offline || \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# ============================================================
# Runtime stage
# ============================================================

FROM node:20-slim AS runtime

# Runtime arguments
ARG NODE_ENV=production
ARG PORT=3000

# Set runtime environment
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable

WORKDIR /workspace

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy production dependencies only
COPY --from=build /workspace/node_modules ./node_modules

# Copy Next.js build output and standalone files
COPY --from=build /workspace/.next/standalone ./
COPY --from=build /workspace/.next/static ./.next/static
COPY --from=build /workspace/public ./public

# Create non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /workspace
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
