# Quick Fix for Migration Issues
# Removes empty migration directories and creates a fresh migration

Write-Host "Quick Fix for Prisma Migrations" -ForegroundColor Cyan
Write-Host ""

# Navigate to server
Set-Location server

# Check if we're in the right directory
if (-Not (Test-Path "prisma")) {
    Write-Host "Error: prisma directory not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

Write-Host "Found empty migration directories. Cleaning up..." -ForegroundColor Yellow

# Remove all migration directories (they're empty anyway)
Write-Host "Removing old migration directories..." -ForegroundColor Yellow
if (Test-Path "prisma\migrations") {
    Remove-Item -Recurse -Force "prisma\migrations" -ErrorAction SilentlyContinue
    Write-Host "Old migrations removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating fresh migration..." -ForegroundColor Yellow
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Setup complete!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "Error creating migration. Trying reset..." -ForegroundColor Yellow
    Write-Host ""
    
    # If migrate dev fails, try reset
    Write-Host "Resetting database..." -ForegroundColor Yellow
    npx prisma migrate reset --force --skip-seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Creating fresh migration..." -ForegroundColor Yellow
        npx prisma migrate dev --name init
        npx prisma generate
    }
}

Set-Location ..

Write-Host ""
Write-Host "Done! Your database should be ready now." -ForegroundColor Green
Write-Host ""

