FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend

RUN pnpm install --frozen-lockfile

RUN pnpm --filter irib-dwp-backend run prisma:generate \
  && pnpm --filter irib-dwp-backend build

FROM node:22-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=build /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/backend/package.json ./backend/package.json
COPY --from=build /workspace/backend/node_modules ./backend/node_modules
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma

WORKDIR /workspace/backend
EXPOSE 3001
CMD ["node", "dist/main"]