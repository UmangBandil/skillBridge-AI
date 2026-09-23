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
| **Testing** | Vitest (70 total tests across 13 test suites in server unit/integration/E2E and frontend component/flow suites) |
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

### Empirical Evaluation Benchmark

SkillBridge AI includes an open evaluation harness ([`evaluation/`](evaluation/)) running over 20 candidate profiles across 8 distinct micro-internships:

| Metric | Hybrid Pipeline (Semantic + Rules) | Degraded Mode (Rules Only) | Delta / Improvement |
| :--- | :---: | :---: | :---: |
| **Top-1 Accuracy** | **1.00 (100%)** | 0.88 (87.5%) | **+12.5%** |
| **Mean Reciprocal Rank (MRR)** | **1.00** | 0.94 | **+0.06** |
| **Average Precision (MAP)** | **0.99** | 0.93 | **+0.06** |
| **Mean Latency (Cached)** | **1.25 ms** | 0.88 ms | +0.37 ms |

See [docs/AI_EVALUATION.md](docs/AI_EVALUATION.md) for full evaluation methodology and benchmark details.
For mathematical formulas and the `pgvector` migration roadmap, see [docs/AI_MATCHING.md](docs/AI_MATCHING.md).

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

The platform includes **70 automated tests across 13 test suites** covering unit logic, database transactions, authorization guards, AI embeddings, and frontend user flows.

```bash
# Run all tests across both server and web workspaces (70 tests)
npm test

# Run backend test suite (58 tests across 9 test suites)
npm test -w server

# Run frontend test suite (12 tests across 4 test suites)
npm test -w web

# Build frontend production bundle (TypeScript check & Vite bundling)
npm run build -w web

# Run production deployment readiness verification
node scripts/verify-production.mjs

# Run automated HTTP smoke test against running server
node scripts/smoke-test.mjs http://localhost:5000
```

### Test Coverage Highlights
- **ML & Scoring**: Validates cosine similarity, lookaround word boundary skill extraction, keyword tokenization, and degraded mode mathematical weighting.
- **Security & Auth**: Validates bcrypt salt hashing, JWT lifecycle, SHA-256 hashed refresh token storage, refresh token rotation, and reuse attack detection.
- **Real Database Recruiter-Student E2E**: End-to-end multi-party marketplace lifecycle against live PostgreSQL (`server/test/e2e.recruiter-student.test.js`).
- **Data Integrity**: Enforces compound unique constraints, prevents author self-application, and validates strict application status state machine transitions (`APPLIED` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `ACCEPTED`).
- **Frontend User Simulation**: Simulates student onboarding, resume upload, browse filtering, transparent formula toggles, task application, and stage tracking.

---

## Security & Reliability Architecture

- **CORS Whitelist**: Disallows wildcard (`*`) origins in production mode; requires explicit `CORS_ORIGIN` or `FRONTEND_URL` environment variables.
- **Hashed Refresh Tokens**: Refresh tokens are stored strictly as SHA-256 hashes in PostgreSQL. Replay attacks trigger immediate revocation of all user tokens.
- **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT`, draining active HTTP connections and safely disconnecting Prisma client pools.
- **Container Isolation**: Multi-stage `Dockerfile` drops root privileges and executes as non-root `USER node` with built-in Docker `HEALTHCHECK`.

For details on security controls, rate limiting, and threat vectors, see [docs/SECURITY.md](docs/SECURITY.md) and [docs/PRODUCTION_AUDIT.md](docs/PRODUCTION_AUDIT.md).

---

## Containerization & Production Deployment

### Run with Docker Compose
```bash
docker compose up -d --build
```
Launches PostgreSQL 15 and the hardened SkillBridge API container with automatic migrations and `/health` probes.

### Deploy to Render via Blueprint
1. Connect your repository to Render.
2. Select **New +** $\rightarrow$ **Blueprint**.
3. Render automatically provisions the database and API service using [`render.yaml`](render.yaml).

For comprehensive deployment steps, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Documentation Index

- [docs/FINAL_STATUS.md](docs/FINAL_STATUS.md) — Comprehensive production readiness audit and verification report.
- [docs/SECURITY.md](docs/SECURITY.md) — Security controls, refresh token rotation, input sanitization, and CORS configuration.
- [docs/AI_EVALUATION.md](docs/AI_EVALUATION.md) — Empirical AI benchmark results, precision metrics, and latency analysis.
- [docs/PRODUCTION_AUDIT.md](docs/PRODUCTION_AUDIT.md) — Production audit report and remediation details.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Layered architecture, repositories, and data flow.
- [docs/AI_MATCHING.md](docs/AI_MATCHING.md) — Semantic embeddings, scoring formulas, and pgvector roadmap.
- [docs/API.md](docs/API.md) — Complete REST API specification with request/response envelopes.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Render Blueprint and Docker deployment guide.
- [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) — Catalog of MVP technical debt remediated.

---

## Contributing & Guidelines

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for code style conventions, test requirements, and git workflow before submitting pull requests.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
