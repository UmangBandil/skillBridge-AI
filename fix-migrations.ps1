# Fix Prisma Migration Issues
# This script helps resolve migration problems

Write-Host "Fixing Prisma Migration Issues..." -ForegroundColor Cyan
Write-Host ""

# Option 1: Try to apply existing migrations
Write-Host "Option 1: Applying existing migrations..." -ForegroundColor Yellow
Write-Host ""
Write-Host "If migrations are in a bad state, try these options:" -ForegroundColor White
Write-Host ""
Write-Host "1. RESET DATABASE (Recommended for development):" -ForegroundColor Yellow
Write-Host "   This will delete all data and recreate the database" -ForegroundColor Gray
Write-Host "   npx prisma migrate reset" -ForegroundColor White
Write-Host ""
Write-Host "2. MARK MIGRATIONS AS APPLIED (If DB already has tables):" -ForegroundColor Yellow
Write-Host "   This marks existing migrations as applied without running them" -ForegroundColor Gray
Write-Host "   npx prisma migrate resolve --applied 20251118060251_init" -ForegroundColor White
Write-Host ""
Write-Host "3. DEPLOY MIGRATIONS (Production-like):" -ForegroundColor Yellow
Write-Host "   This applies migrations without creating new ones" -ForegroundColor Gray
Write-Host "   npx prisma migrate deploy" -ForegroundColor White
Write-Host ""
Write-Host "4. CREATE FRESH MIGRATION:" -ForegroundColor Yellow
Write-Host "   Delete migrations folder and create fresh" -ForegroundColor Gray
Write-Host "   Remove-Item -Recurse -Force prisma\migrations" -ForegroundColor White
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor White
Write-Host ""

# Check if database is accessible
Write-Host "Checking database connection..." -ForegroundColor Cyan
try {
    $env:CheckDB = "true"
    cd server
    $result = npx prisma db pull 2>&1 | Select-Object -First 5
    if ($LASTEXITCODE -eq 0 -or $result -match "introspecting|schema") {
        Write-Host "Database is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not connect to database" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in server\.env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Choose an option above based on your needs." -ForegroundColor Cyan
Write-Host "For a fresh start, use Option 1 (reset)." -ForegroundColor White
Write-Host ""

