FROM node:20-slim AS base

# Install OpenSSL + curl for Prisma and health checks
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Install dependencies (cached layer) ---
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY web/package.json ./web/

# Install all workspace deps in one shot
RUN npm install

# --- Build ---
COPY server/ ./server/
COPY web/ ./web/

# Generate Prisma client
RUN cd server && npx prisma generate

# Build frontend
RUN cd web && npm run build

# --- Production ---
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Migrate DB then start server
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && cd .. && node server/src/index.js"]
