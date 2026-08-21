FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY server/package.json server/
COPY web/package.json web/

# Install all workspace dependencies
RUN npm install --workspace=server --workspace=web

# Copy source code
COPY server/ server/
COPY web/ web/

# Generate Prisma client
RUN cd server && npx prisma generate

# Build frontend
RUN cd web && npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Run migrations and start
CMD cd server && npx prisma migrate deploy && cd .. && node server/src/index.js
