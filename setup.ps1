# SkillBridge AI - Automated Setup Script (PowerShell)
# This script helps set up the project quickly on Windows

Write-Host "🚀 SkillBridge AI Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Step 1: Start database
Write-Host ""
Write-Host "📦 Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Check if .env files exist
Write-Host ""
Write-Host "📝 Checking environment files..." -ForegroundColor Yellow

if (-Not (Test-Path "server\.env")) {
    Write-Host "⚠️  server/.env not found. Creating from template..." -ForegroundColor Yellow
    
    # Generate random JWT secret
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    
    @"
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"
JWT_SECRET="$jwtSecret"
JWT_EXPIRES_IN="24h"
PORT=4000
CLIENT_URL="http://localhost:5173"
STRIPE_SECRET_KEY=""
OPENAI_API_KEY=""
"@ | Out-File -FilePath "server\.env" -Encoding utf8
    
    Write-Host "✅ Created server/.env" -ForegroundColor Green
} else {
    Write-Host "✅ server/.env exists" -ForegroundColor Green
}

if (-Not (Test-Path "web\.env")) {
    Write-Host "⚠️  web/.env not found. Creating from template..." -ForegroundColor Yellow
    
    @"
VITE_API_URL="http://localhost:4000"
"@ | Out-File -FilePath "web\.env" -Encoding utf8
    
    Write-Host "✅ Created web/.env" -ForegroundColor Green
} else {
    Write-Host "✅ web/.env exists" -ForegroundColor Green
}

# Step 3: Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 4: Setup Prisma
Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location server
npx prisma generate
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    npx prisma migrate deploy
}
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host ""

