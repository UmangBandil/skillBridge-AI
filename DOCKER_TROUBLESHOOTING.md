# Docker Troubleshooting Guide for Windows

## Issue: "The system cannot find the file specified" / "dockerDesktopLinuxEngine"

This error means **Docker Desktop is not running** on Windows.

## Quick Fix

### Step 1: Start Docker Desktop

1. **Open Docker Desktop**
   - Search for "Docker Desktop" in Windows Start menu
   - Click to launch it
   - Wait for it to fully start (icon in system tray should be green/steady)

2. **Verify Docker is Running**
   ```powershell
   docker ps
   ```
   If this command works without errors, Docker is running!

3. **Try Again**
   ```powershell
   docker-compose up -d
   ```

## Alternative: Manual Start

If Docker Desktop doesn't start automatically:

1. **Check if Docker Desktop is Installed**
   - Search for "Docker Desktop" in Windows Start menu
   - If not found, download from: https://www.docker.com/products/docker-desktop/

2. **Launch Docker Desktop**
   - Double-click Docker Desktop icon
   - Accept the terms
   - Wait for "Docker Desktop is running" message

3. **Check System Requirements**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 15063 or later)
   - OR Windows 11 64-bit
   - WSL 2 enabled (Docker Desktop will guide you through this)

## Common Issues & Solutions

### Issue 1: Docker Desktop Won't Start

**Solution:**
1. Check if virtualization is enabled in BIOS
2. Ensure WSL 2 is installed and updated
3. Run as Administrator: Right-click Docker Desktop → Run as Administrator
4. Restart Docker Desktop service:
   ```powershell
   # Open PowerShell as Administrator
   Restart-Service docker
   ```

### Issue 2: WSL 2 Not Installed

Docker Desktop on Windows requires WSL 2.

**Install WSL 2:**
```powershell
# Run PowerShell as Administrator
wsl --install
```

Then restart your computer and Docker Desktop.

### Issue 3: "Docker daemon is not running"

**Solution:**
1. Open Docker Desktop
2. Go to Settings → General
3. Ensure "Use the WSL 2 based engine" is checked
4. Click "Apply & Restart"

### Issue 4: Port Already in Use

If port 5432 (PostgreSQL) is already in use:

**Option 1: Change PostgreSQL port in docker-compose.yml:**
```yaml
services:
  postgres:
    # ... other config ...
    ports:
      - '5433:5432'  # Changed from 5432:5432
```

Then update `DATABASE_URL` in `server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5433/skillbridge"
```

**Option 2: Find and stop the process using port 5432:**
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

## Verification Steps

After starting Docker Desktop, verify everything works:

```powershell
# 1. Check Docker is running
docker --version

# 2. Check Docker Compose is working
docker-compose --version

# 3. Check Docker daemon is accessible
docker ps

# 4. Start PostgreSQL
docker-compose up -d

# 5. Check container is running
docker ps

# 6. Check database logs (optional)
docker-compose logs postgres
```

## If Docker Desktop Can't Be Used

### Alternative: Use Local PostgreSQL Installation

If Docker Desktop continues to have issues, you can install PostgreSQL locally:

1. **Download PostgreSQL**
   - https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set for `postgres` user

2. **Update `server/.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/skillbridge"
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE skillbridge;
   ```

4. **Run migrations:**
   ```powershell
   cd server
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Still Having Issues?

1. **Check Docker Desktop Logs:**
   - Docker Desktop → Settings → Troubleshoot → View logs

2. **Restart Docker Desktop:**
   - Right-click Docker Desktop icon in system tray → Quit Docker Desktop
   - Wait a few seconds
   - Start Docker Desktop again

3. **Restart Computer:**
   - Sometimes a simple restart fixes connectivity issues

4. **Reinstall Docker Desktop:**
   - Uninstall Docker Desktop
   - Download fresh installer
   - Reinstall

## Quick Reference Commands

```powershell
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs postgres

# Check status
docker ps

# Restart database
docker-compose restart postgres

# Remove everything and start fresh
docker-compose down -v
docker-compose up -d
```

## Need More Help?

- Docker Desktop docs: https://docs.docker.com/desktop/windows/
- Docker Community forums: https://forums.docker.com/
- WSL 2 docs: https://docs.microsoft.com/en-us/windows/wsl/


