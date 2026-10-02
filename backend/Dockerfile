# ============================================================
# IRIB DWP Backend — Dockerfile
# Multi-stage build for NestJS backend
# ============================================================
#
# Designer & Developer: میثم جعفرپور آلانق
# Education: Master of Software Engineering
# Position: Audio and Video Expert Level 4
# Client: Technical Deputy of IRIB East Azerbaijan Center
# All rights reserved © 2026
#

FROM node:22-slim AS base

# Install base dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    procps \
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
ENV PNPM_IGNORE_SCRIPTS=false
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --ignore-scripts --prefer-offline || pnpm install --ignore-scripts

# Rebuild bcrypt native module
RUN pnpm rebuild bcrypt || true
RUN find node_modules/.pnpm -type d -name "bcrypt@*" -exec sh -c 'cd "$1" && pnpm rebuild bcrypt || npm rebuild bcrypt' _ {} \;

# Copy source code
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/
COPY backend/nest-cli.json ./backend/

WORKDIR /workspace/backend

# Set DATABASE_URL for Prisma generation
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start development server with hot-reload
CMD ["pnpm", "run", "dev"]

# ============================================================
# Build stage - for production build
# ============================================================

FROM base AS build

# Build arguments for environment configuration
ARG NODE_ENV=production
ARG ENVIRONMENT=production

# Set build environment
ENV NODE_ENV=${NODE_ENV}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV PNPM_IGNORE_SCRIPTS=false
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable

# Configure pnpm for better network resilience
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set fetch-timeout 180000

WORKDIR /workspace

# Copy workspace package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package file first
COPY backend/package.json ./backend/

# Install workspace dependencies with network resilience
# Install only production dependencies
RUN pnpm install --ignore-scripts --prefer-offline || pnpm install --ignore-scripts

# Rebuild bcrypt native module to ensure it's compiled correctly for all locations
RUN pnpm rebuild bcrypt || true
RUN find node_modules/.pnpm -type d -name "bcrypt@*" -exec sh -c 'cd "$1" && pnpm rebuild bcrypt || npm rebuild bcrypt' _ {} \;

COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/
COPY backend/nest-cli.json ./backend/

WORKDIR /workspace/backend

# Set DATABASE_URL for Prisma generation
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client using locally installed Prisma
RUN npx prisma generate

# Build the application
RUN npm run build

# ============================================================
# Runtime stage
# ============================================================

FROM node:22-slim AS runtime

# Runtime arguments
ARG NODE_ENV=production
ARG PORT=3001

# Set runtime environment
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV HOME=/home/appuser

# Install runtime dependencies including Puppeteer and build tools for bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
    libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libxshmfence1 libxkbcommon0 libdrm2 libatspi2.0-0 xdg-utils \
    python3 make g++ procps \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable

WORKDIR /workspace

# Create non-root user before copying runtime files
RUN useradd -m -u 1001 appuser

# Copy backend package file for runtime
COPY --chown=appuser:appuser backend/package.json ./backend/

# Copy backend dependencies and build output
COPY --from=build --chown=appuser:appuser /workspace/node_modules ./node_modules
COPY --from=build --chown=appuser:appuser /workspace/backend/node_modules ./backend/node_modules
COPY --from=build --chown=appuser:appuser /workspace/backend/dist ./backend/dist
COPY --from=build --chown=appuser:appuser /workspace/backend/prisma ./backend/prisma
RUN mkdir -p /workspace/backend/uploads && chown appuser:appuser /workspace/backend/uploads

WORKDIR /workspace/backend

# Rebuild bcrypt native module for runtime using pnpm in both locations

# Run the application without root privileges
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main"]