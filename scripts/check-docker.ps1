# Docker Health Check Script for Windows
# This script checks if Docker is ready to use

Write-Host "Checking Docker Status..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker command exists
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker daemon is running
Write-Host ""
Write-Host "Checking Docker daemon..." -ForegroundColor Cyan
try {
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "Docker daemon is not running" -ForegroundColor Red
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Yellow
        Write-Host "  1. Open Docker Desktop from Start menu" -ForegroundColor White
        Write-Host "  2. Wait for Docker to fully start (green icon in system tray)" -ForegroundColor White
        Write-Host "  3. Run this script again" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "Cannot connect to Docker daemon" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop is running" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
Write-Host ""
Write-Host "Checking Docker Compose..." -ForegroundColor Cyan
try {
    $composeVersion = docker-compose --version 2>&1
    Write-Host "Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose not found, trying 'docker compose' (newer syntax)..." -ForegroundColor Yellow
    try {
        $composeVersion = docker compose version 2>&1
        Write-Host "Docker Compose (new syntax) is available: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "Docker Compose is not available" -ForegroundColor Red
        exit 1
    }
}

# Check if PostgreSQL container is already running
Write-Host ""
Write-Host "Checking for existing PostgreSQL container..." -ForegroundColor Cyan
$existingContainer = docker ps -a --filter "name=postgres" --format "{{.Names}}" 2>&1
if ($existingContainer) {
    Write-Host "Found existing container: $existingContainer" -ForegroundColor Yellow
    
    $runningContainer = docker ps --filter "name=postgres" --format "{{.Names}}" 2>&1
    if ($runningContainer) {
        Write-Host "PostgreSQL container is already running" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL container exists but is not running" -ForegroundColor Yellow
        Write-Host "Starting container..." -ForegroundColor Yellow
        docker-compose up -d
    }
} else {
    Write-Host "No existing PostgreSQL container found" -ForegroundColor Gray
    Write-Host "You can start one with: docker-compose up -d" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Docker is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start database: docker-compose up -d" -ForegroundColor White
Write-Host "  2. Check logs: docker-compose logs postgres" -ForegroundColor White
Write-Host "  3. Stop database: docker-compose down" -ForegroundColor White
Write-Host ""
