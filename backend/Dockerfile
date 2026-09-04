<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
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

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
    libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libxshmfence1 libxkbcommon0 libdrm2 libatspi2.0-0 xdg-utils \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /workspace
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=build /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/backend/package.json ./backend/package.json
COPY --from=build /workspace/backend/node_modules ./backend/node_modules
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma

WORKDIR /workspace/backend
EXPOSE 3001
=======
FROM node:22-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /workspace

# Cache bust to force rebuild
RUN echo "Build timestamp: $(date)" > /tmp/build-timestamp.txt

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend

# Cache bust to force rebuild
RUN echo "Build timestamp: $(date)" > /tmp/build-timestamp.txt

RUN pnpm install --frozen-lockfile

RUN pnpm --filter irib-dwp-backend run prisma:generate \
  && pnpm --filter irib-dwp-backend build

<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
# Verify the prisma.middleware.js file was compiled
RUN ls -la /workspace/backend/dist/prisma/
=======
# Verify prisma.middleware.js was compiled
RUN ls -la /workspace/backend/dist/prisma/ || echo "ERROR: prisma.middleware.js not found"
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Verify prisma.middleware.js exists
RUN test -f /workspace/backend/dist/prisma/prisma.middleware.js || (echo "ERROR: prisma.middleware.js not found" && exit 1)
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Verify prisma.middleware.js exists
RUN test -f /workspace/backend/dist/prisma/prisma.middleware.js || (echo "ERROR: prisma.middleware.js not found" && exit 1)
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Verify prisma.middleware.js exists
RUN test -f /workspace/backend/dist/prisma/prisma.middleware.js || (echo "ERROR: prisma.middleware.js not found" && exit 1)
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Debug: list what was actually compiled
RUN ls -la /workspace/backend/dist/prisma/
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc src/prisma/prisma.middleware.ts --outDir dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

# Debug: list what was actually compiled
RUN ls -la /workspace/backend/dist/prisma/
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

# Debug: list what was actually compiled
RUN ls -la /workspace/backend/dist/prisma/
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile

=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

# Compile all DTO files that might be missed
RUN find backend/src -name "*.dto.ts" -exec npx tsc {} --outDir backend/dist --module commonjs --target ES2021 --esModuleInterop --skipLibCheck \;

<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/Dockerfile
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Manually compile prisma.middleware.ts since nest build doesn't pick it up
RUN npx tsc backend/src/prisma/prisma.middleware.ts --outDir backend/dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

# Manually compile all DTO files
RUN npx tsc backend/src/modules/iam/dto/auth.dto.ts --outDir backend/dist/modules/iam/dto --module commonjs --target ES2021 --esModuleInterop --skipLibCheck
RUN npx tsc backend/src/modules/content/dto/content.dto.ts --outDir backend/dist/modules/content/dto --module commonjs --target ES2021 --esModuleInterop --skipLibCheck
RUN npx tsc backend/src/modules/forms/dto/forms.dto.ts --outDir backend/dist/modules/forms/dto --module commonjs --target ES2021 --esModuleInterop --skipLibCheck
RUN npx tsc backend/src/modules/communication/dto/communication.dto.ts --outDir backend/dist/modules/communication/dto --module commonjs --target ES2021 --esModuleInterop --skipLibCheck
RUN npx tsc backend/src/modules/pdf-generator/dto/pdf-generator.dto.ts --outDir backend/dist/modules/pdf-generator/dto --module commonjs --target ES2021 --esModuleInterop --skipLibCheck
RUN npx tsc backend/src/modules/search/search.dto.ts --outDir backend/dist/modules/search --module commonjs --target ES2021 --esModuleInterop --skipLibCheck

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Use tsc with project config to ensure all files are compiled
RUN cd backend && npx tsc --project tsconfig.json

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
=======
# Use tsc with project config to ensure all files are compiled
RUN cd backend && npx tsc --project tsconfig.json

>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
FROM node:22-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
    libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libxshmfence1 libxkbcommon0 libdrm2 libatspi2.0-0 xdg-utils \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /workspace
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=build /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/backend/package.json ./backend/package.json
COPY --from=build /workspace/backend/node_modules ./backend/node_modules
COPY --from=build /workspace/backend/dist ./backend/dist
COPY --from=build /workspace/backend/prisma ./backend/prisma

WORKDIR /workspace/backend
EXPOSE 3001
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/Dockerfile
CMD ["node", "dist/main"]