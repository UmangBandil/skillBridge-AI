# SkillBridge AI - Quick Setup Guide (3 Hours)

This guide will help you get SkillBridge AI up and running in under 3 hours.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Step 1: Start Database (5 minutes)

1. Start PostgreSQL using Docker Compose:
```bash
docker-compose up -d
```

2. Verify the database is running:
```bash
docker ps
```

You should see a PostgreSQL container running on port 5432.

## Step 2: Environment Setup (10 minutes)

### Backend Environment Variables

Create `server/.env` file:

```bash
cd server
cp .env.example .env  # If .env.example exists, or create manually
```

Add the following to `server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=4000
CLIENT_URL="http://localhost:5173"

# Stripe (optional - can add later)
STRIPE_SECRET_KEY=""

# OpenAI (optional - for future features)
OPENAI_API_KEY=""
```

### Frontend Environment Variables

Create `web/.env` file:

```bash
cd ../web
cp .env.example .env  # If .env.example exists, or create manually
```

Add the following to `web/.env`:

```env
VITE_API_URL="http://localhost:4000"
```

## Step 3: Install Dependencies (10 minutes)

From the project root:

```bash
# Install root dependencies
npm install

# This will install dependencies for both server and web (monorepo)
```

Or install separately:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../web
npm install
```

## Step 4: Database Setup (5 minutes)

1. Generate Prisma client:
```bash
cd server
npx prisma generate
```

2. Run database migrations:
```bash
npx prisma migrate dev --name init
```

Or if migrations already exist:
```bash
npx prisma migrate deploy
```

## Step 5: Start Development Servers (2 minutes)

From the project root:

```bash
npm run dev
```

This will start both:
- Backend server on `http://localhost:4000`
- Frontend dev server on `http://localhost:5173`

## Step 6: Verify Setup

1. Open browser to `http://localhost:5173`
2. Click "Get Started" or go to `/signup`
3. Create a test account
4. Try creating a task (go to `/recruiter`)
5. Try matching (go to `/match` and upload a resume)

## Common Issues & Solutions

### Database Connection Error

**Issue**: `Can't reach database server`

**Solution**:
```bash
# Check if Docker is running
docker ps

# If not running, start it
docker-compose up -d

# Check database logs
docker-compose logs postgres
```

### Port Already in Use

**Issue**: `Port 4000 or 5173 already in use`

**Solution**:
- Change `PORT` in `server/.env`
- Change port in `web/vite.config.ts`

### Prisma Client Not Generated

**Issue**: `Cannot find module @prisma/client`

**Solution**:
```bash
cd server
npx prisma generate
```

### Environment Variables Not Loading

**Issue**: Environment variables not working

**Solution**:
- Ensure `.env` files exist in both `server/` and `web/` directories
- Restart the development servers
- Check that `dotenv.config()` is called in `server/src/index.js`

## Testing the Complete Flow

1. **Sign Up**: Create a new account at `/signup`
2. **Create Task**: Go to `/recruiter` and create a task with skills
3. **Match Resume**: Go to `/match`, upload a text resume with skills section
4. **View Matches**: See matched tasks appear

## Next Steps

- Add real resume PDF parsing
- Configure Stripe for payments
- Set up production deployment
- Add more ML features

## Project Structure

```
skillBridge-AI/
├── server/          # Backend API
│   ├── src/
│   │   ├── routes/  # API routes
│   │   ├── ml/      # ML matching logic
│   │   └── middleware/
│   └── prisma/      # Database schema
├── web/             # Frontend React app
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/
└── docker-compose.yml  # PostgreSQL database
```

## Time Breakdown

- Step 1: 5 min
- Step 2: 10 min
- Step 3: 10 min
- Step 4: 5 min
- Step 5: 2 min
- Testing: 30 min
- **Total: ~1 hour setup, 2 hours for testing and customization**

Good luck! 🚀

