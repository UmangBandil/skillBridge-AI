#!/bin/bash

# SkillBridge AI - Automated Setup Script
# This script helps set up the project quickly

set -e  # Exit on error

echo "🚀 SkillBridge AI Setup Script"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Step 1: Start database
echo "📦 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Step 2: Check if .env files exist
echo ""
echo "📝 Checking environment files..."

if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating from template..."
    cat > server/.env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="24h"
PORT=4000
CLIENT_URL="http://localhost:5173"
STRIPE_SECRET_KEY=""
OPENAI_API_KEY=""
EOF
    echo "✅ Created server/.env"
else
    echo "✅ server/.env exists"
fi

if [ ! -f "web/.env" ]; then
    echo "⚠️  web/.env not found. Creating from template..."
    cat > web/.env << EOF
VITE_API_URL="http://localhost:4000"
EOF
    echo "✅ Created web/.env"
else
    echo "✅ web/.env exists"
fi

# Step 3: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 4: Setup Prisma
echo ""
echo "🗄️  Setting up database..."
cd server
npx prisma generate
npx prisma migrate dev --name init || npx prisma migrate deploy
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""

