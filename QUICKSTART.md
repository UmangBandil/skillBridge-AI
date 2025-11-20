# 🚀 Quick Start Guide - Get Running in 10 Minutes

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Git installed

## Option 1: Automated Setup (Recommended)

### Windows (PowerShell)
```powershell
.\setup.ps1
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

Then start the servers:
```bash
npm run dev
```

## Option 2: Manual Setup

### 1. Start Database (1 minute)
```bash
docker-compose up -d
```

### 2. Create Environment Files (2 minutes)

**Create `server/.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"
JWT_SECRET="your-random-secret-key-change-this"
JWT_EXPIRES_IN="24h"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

**Create `web/.env`:**
```env
VITE_API_URL="http://localhost:4000"
```

### 3. Install Dependencies (3 minutes)
```bash
npm install
```

### 4. Setup Database (2 minutes)
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 5. Start Servers (1 minute)
```bash
npm run dev
```

## Verify Setup

1. Open http://localhost:5173
2. Click "Get Started" → Sign Up
3. Create an account
4. Go to `/recruiter` → Create a task
5. Go to `/match` → Upload resume (text file) → See matches!

## Troubleshooting

**Database not connecting?**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Port already in use?**
- Change `PORT` in `server/.env`
- Or kill the process using the port

**Prisma errors?**
```bash
cd server
npx prisma generate
npx prisma migrate reset  # Only if you want to reset DB
```

## Next Steps

- Create your first task
- Upload a resume to test matching
- Customize the UI
- Add Stripe for payments

**You're ready to go! 🎉**

