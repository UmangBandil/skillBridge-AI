# Fixing Prisma Migration Error

## Problem
The error `P3015: Could not find the migration file at migration.sql` occurs because some migration directories exist but are empty (missing their `migration.sql` files).

## Quick Fix

Run this PowerShell script from the project root:

```powershell
.\quick-fix-migrations.ps1
```

This will:
1. Remove the empty migration directories
2. Create a fresh migration based on your current schema
3. Apply it to the database
4. Generate the Prisma client

## Manual Fix

If you prefer to fix it manually:

### Step 1: Navigate to server directory
```powershell
cd server
```

### Step 2: Remove old migrations (they're empty anyway)
```powershell
Remove-Item -Recurse -Force prisma\migrations
```

### Step 3: Create fresh migration
```powershell
npx prisma migrate dev --name init
```

This will:
- Create a new migration based on your current `schema.prisma`
- Apply it to the database
- Create the `prisma/migrations` directory with the migration

### Step 4: Generate Prisma client
```powershell
npx prisma generate
```

### Step 5: Go back to root
```powershell
cd ..
```

## Alternative: Reset Database (If above doesn't work)

If you want to completely reset the database and start fresh:

```powershell
cd server
npx prisma migrate reset --force --skip-seed
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

**Warning:** This will delete all data in the database!

## Verify

After fixing, verify everything works:

```powershell
cd server
npx prisma migrate status
```

You should see:
```
Database schema is up to date!
```

## Next Steps

Once migrations are fixed:
1. Generate Prisma client: `cd server; npx prisma generate`
2. Start servers: `npm run dev`
3. Test the application

