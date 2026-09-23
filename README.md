# SkillBridge AI — AI Internship Marketplace

SkillBridge AI is a full-stack, production-grade AI marketplace connecting students with real-world micro-internships. It features a transparent 4-factor hybrid semantic matching engine, multi-format resume processing (PDF, DOCX, TXT), full candidate application lifecycle tracking, and layered backend architecture.

---

## Architecture Overview

```mermaid
graph TD
    Client["React 18 + TypeScript Client (Vite)"]
    API["Express.js RESTful API (/api/v1)"]
    Auth["JWT Authentication & RBAC Middleware"]
    DB[(PostgreSQL 15 + Prisma ORM)]
    AI["Hybrid AI Matching Engine"]
    Parser["Multi-Format Resume Parser (PDF/DOCX/TXT)"]
    ONNX["Xenova all-MiniLM-L6-v2 ONNX Runtime"]

    Client -->|HTTP / JSON| API
    API --> Auth
    Auth --> DB
    API --> Parser
    API --> AI
    AI --> ONNX
    AI --> DB
```

### Key Technical Pillars
- **Layered Backend Architecture**: Strict `Routes -> Controllers -> Services -> Repositories -> Prisma` boundary separation.
- **Truthful Hybrid AI Matching**: Real 4-factor scoring combining 384-dimensional dense semantic embeddings (`Xenova/all-MiniLM-L6-v2`), lookaround boundary skill extraction, tokenized keyword overlap, and verified experience depth.
- **Graceful Fallback Mode**: Deterministic scoring operates smoothly even during memory-constrained cold starts or offline periods.
- **Multi-Format Resume Ingestion**: Validates magic bytes, enforces size limits, and sanitizes filenames across `.pdf`, `.docx`, and `.txt` files.
- **Role-Based Workflow**: Dedicated recruiter dashboards (task creation, candidate pipelines, status updates) and student portals (resume drop, recommendation feed, application tracker).
- **Hardened Security**: Helmet security headers, configurable CORS, structured Winston/Pino-style JSON request logging with PII redaction, and IP-based rate limiting.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Vitest, Happy-DOM |
| **Backend** | Node.js (ESM), Express.js, Prisma ORM, Zod, Multer, Helmet, Express Rate Limit |
| **Database** | PostgreSQL 15 (Relational models with compound unique keys and indexes) |
| **AI / NLP** | `@xenova/transformers` (`all-MiniLM-L6-v2`), `ml-distance` (Cosine Similarity) |
| **Document Processing** | `pdf-parse` (PDF), `mammoth` (DOCX), UTF-8 Stream Parser (TXT) |
| **Testing** | Vitest (51 total tests across server unit, integration, and frontend component/E2E suites) |
| **DevOps & Infra** | Docker (Multi-stage build), Docker Compose, GitHub Actions CI/CD, Render Blueprint |

---

## Transparent AI Matching Engine

SkillBridge AI rejects black-box scoring. Every recommendation calculates and returns an auditable mathematical breakdown:

$$\text{Final Score} = (\text{Semantic} \times 0.55) + (\text{Skill Overlap} \times 0.25) + (\text{Keyword Overlap} \times 0.10) + (\text{Experience Depth} \times 0.10)$$

```json
{
  "taskId": "cmu101...",
  "title": "Full Stack Engineering Micro-Internship",
  "matchScore": 0.93,
  "breakdown": {
    "semantic": 1.0,
    "skills": 1.0,
    "keywords": 0.63,
    "experience": 0.65
  },
  "matchedSkills": ["react", "typescript", "node.js", "postgresql"],
  "missingSkills": ["tailwind css"],
  "isDegraded": false
}
```

If vector embeddings are unavailable or initializing, the system activates **Degraded Mode** ($60\%$ Skills + $25\%$ Keywords + $15\%$ Experience) with an explicit `isDegraded: true` flag.

For in-depth mathematical formulas and the `pgvector` migration roadmap, see [docs/AI_MATCHING.md](docs/AI_MATCHING.md).

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+ (Local instance or Docker container)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/UmangBandil/skillBridge-AI.git
cd skillBridge-AI

# Install all workspace dependencies
npm install
```

### 3. Environment Setup
```bash
# Copy and configure server environment
cp .env.example server/.env

# Update server/.env with your PostgreSQL credentials:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillbridge?schema=public"
# JWT_SECRET="your-secure-jwt-secret-minimum-32-chars-long!"
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client and apply migrations
npm run db:deploy -w server

# Seed realistic micro-internships and demo accounts
npm run db:seed -w server
```
*Demo Recruiter*: `recruiter@skillbridge.dev` / `password123`  
*Demo Student*: `student@skillbridge.dev` / `password123`

### 5. Launch Development Servers
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## Automated Verification & Testing

The platform includes 51 automated tests covering unit logic, database transactions, authorization guards, and frontend user flows.

```bash
# Run all tests across both server and web workspaces
npm test

# Run backend test suite (41 tests)
npm test -w server

# Run frontend test suite (10 tests)
npm test -w web

# Build frontend production bundle
npm run build -w web

# Run production deployment readiness verification
node scripts/verify-production.mjs
```

### Test Coverage Highlights
- **ML & Scoring**: Validates cosine similarity, lookaround word boundary skill extraction, keyword tokenization, and degraded mode mathematical weighting.
- **Security & Auth**: Validates bcrypt salt hashing, JWT lifecycle, expired token rejection, and student vs. recruiter RBAC.
- **Data Integrity**: Enforces uniqueness constraints, prevents author self-application, and validates application status transitions (`APPLIED` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `ACCEPTED`).
- **E2E User Simulation**: Simulates student onboarding, resume upload, browse filtering, matching, task application, and tracking.

---

## Containerization & Production Deployment

### Run with Docker Compose
```bash
docker compose up -d --build
```
Launches PostgreSQL 15 and the multi-stage SkillBridge API container with automatic migrations and `/health` probes.

### Deploy to Render via Blueprint
1. Connect your repository to Render.
2. Select **New +** $\rightarrow$ **Blueprint**.
3. Render automatically provisions the database and API service using [`render.yaml`](render.yaml).

For comprehensive deployment steps, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Documentation Index

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Layered architecture, repositories, and data flow.
- [docs/AI_MATCHING.md](docs/AI_MATCHING.md) — Semantic embeddings, scoring formulas, and pgvector roadmap.
- [docs/API.md](docs/API.md) — Complete REST API specification with request/response envelopes.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Render Blueprint and Docker deployment guide.
- [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) — Catalog of MVP technical debt remediated.

---

## License
MIT
