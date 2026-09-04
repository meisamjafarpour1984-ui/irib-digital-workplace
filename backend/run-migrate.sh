#!/bin/sh
cd /app
apt-get update -y && apt-get install -y openssl
npm install -g pnpm@10
export CI=true
pnpm install --frozen-lockfile
pnpm prisma:migrate
