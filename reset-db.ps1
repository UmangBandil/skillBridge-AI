# Reset Database and Migrations Script
# This script will clean up migrations and recreate them

Write-Host "Resetting Database and Migrations..." -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
Set-Location server

Write-Host "Step 1: Resetting database (this will delete all data)..." -ForegroundColor Yellow
Write-Host "This is safe for development but will DELETE ALL DATA." -ForegroundColor Red
Write-Host ""

# Reset the database and migrations
Write-Host "Running: npx prisma migrate reset" -ForegroundColor White
npx prisma migrate reset --force --skip-seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Database reset complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 2: Creating fresh migration..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
} else {
    Write-Host ""
    Write-Host "Error occurred. Trying alternative approach..." -ForegroundColor Yellow
    Write-Host ""
    
    # Alternative: Delete migrations and recreate
    Write-Host "Deleting old migration directories..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force prisma\migrations\* -ErrorAction SilentlyContinue
    
    Write-Host "Creating fresh migration..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
}

Set-Location ..

Write-Host ""
Write-Host "Migration setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Generate Prisma client: cd server; npx prisma generate" -ForegroundColor White
Write-Host "  2. Start servers: npm run dev" -ForegroundColor White
Write-Host ""

