# Multi-stage production build for SkillBridge AI
# Stage 1: Dependencies
FROM node:20-bookworm-slim AS deps
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY web/package.json ./web/

RUN npm ci

# Stage 2: Builder
FROM node:20-bookworm-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY package.json ./
COPY server ./server
COPY web ./web

# Generate Prisma Client
RUN cd server && npx prisma generate

# Build frontend production bundle
RUN cd web && npm run build

# Stage 3: Runner
FROM node:20-bookworm-slim AS runner
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/web/dist ./web/dist
COPY --from=builder /app/web/package.json ./web/package.json

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

EXPOSE 10000

CMD ["sh", "-c", "cd server && npx prisma migrate deploy && cd .. && node server/src/index.js"]
