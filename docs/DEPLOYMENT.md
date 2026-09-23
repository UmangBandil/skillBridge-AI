# SkillBridge AI — Production Deployment Guide

This guide covers deploying SkillBridge AI to **Render** via Blueprint Infrastructure-as-Code and running with **Docker** / **Docker Compose** locally or on cloud Virtual Machines.

---

## 1. Architecture Topology

```mermaid
graph TD
    Client[Web Browser / Client] -->|HTTPS| LoadBalancer[Render / Reverse Proxy]
    LoadBalancer -->|Port 10000| Container[SkillBridge API Container (Node.js)]
    Container -->|Vite Static Files| StaticAssets[Frontend Static Bundle]
    Container -->|Express API| REST[RESTful API Engine]
    REST -->|ONNX Runtime| Transformers[Xenova/all-MiniLM-L6-v2 Embeddings]
    REST -->|Prisma Client| PostgreSQL[(Managed PostgreSQL)]
```

---

## 2. Deploying to Render via Blueprint

The repository includes a ready-to-deploy [`render.yaml`](../render.yaml) specification configuring both the web service and the managed PostgreSQL database.

### Step-by-step Setup:
1. Fork or push this repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your `skillBridge-AI` repository.
5. Render will automatically detect `render.yaml` and provision:
   - **`skillbridge-db`**: A managed PostgreSQL database instance.
   - **`skillbridge-api`**: A multi-stage Docker container running migrations and launching the server.
6. Configure environment variables in the Render dashboard:
   - `CLIENT_URL`: The production URL of your frontend (e.g. `https://skillbridge-api.onrender.com`).
   - `FRONTEND_URL`: Whitelisted origin for CORS.
   - `OPENAI_API_KEY`: *(Optional)* For LLM enhanced parsing fallback; falls back cleanly to deterministic engine if omitted.
   - `STRIPE_SECRET_KEY`: *(Optional)* For future billing integration.
7. Click **Apply Blueprint**.

---

## 3. Local & Self-Hosted Deployment via Docker

### Quick Start with Docker Compose
To run the full stack (PostgreSQL + SkillBridge API container) in one command:

```bash
# 1. Clone repository
git clone https://github.com/UmangBandil/skillBridge-AI.git
cd skillBridge-AI

# 2. Launch container stack
docker compose up -d --build

# 3. Verify services are healthy
docker compose ps
```

The database container will initialize, execute healthchecks via `pg_isready`, and the application container will run Prisma migrations and start serving traffic on `http://localhost:10000`.

### Manual Docker Build & Run
If using an external managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS):

```bash
# Build multi-stage image
docker build -t skillbridge-api:latest .

# Run container with production environment
docker run -d \
  --name skillbridge-api \
  -p 10000:10000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" \
  -e JWT_SECRET="your-secure-production-jwt-secret-at-least-32-chars" \
  -e CLIENT_URL="https://your-domain.com" \
  -e FRONTEND_URL="https://your-domain.com" \
  skillbridge-api:latest
```

---

## 4. Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime mode (`development`, `production`, `test`) |
| `PORT` | No | `5000` (local) / `10000` (Docker) | Port to bind HTTP server |
| `DATABASE_URL` | Yes | — | PostgreSQL connection URI |
| `JWT_SECRET` | Yes | — | Secret string for HMAC-SHA256 JWT tokens ($\ge 16$ chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Lifetime of access tokens |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed frontend origin for strict CORS |
| `FRONTEND_URL` | No | `http://localhost:5173` | Additional allowed origin for decoupled frontends |
| `CORS_ORIGIN` | No | — | Comma-separated whitelist of allowed origins (no wildcard in prod) |
| `RATE_LIMIT_WINDOW_MS`| No | `900000` (15m) | Rate limiting rolling window |
| `RATE_LIMIT_MAX` | No | `300` | Max requests per IP window |
| `EMBEDDING_MODEL` | No | `Xenova/all-MiniLM-L6-v2` | Embedding model identifier |
| `WEIGHT_SEMANTIC` | No | `0.55` | Weight for vector semantic match |
| `WEIGHT_SKILL` | No | `0.25` | Weight for exact skill overlap |
| `WEIGHT_KEYWORD` | No | `0.10` | Weight for keyword token overlap |
| `WEIGHT_EXPERIENCE`| No | `0.10` | Weight for experience baseline |
| `OPENAI_API_KEY` | No | — | Optional key for LLM resume extraction fallback |

---

## 5. Automated Verification & Smoke Testing

### 5.1 Pre-Deployment Verification
Before deploying, execute the local production readiness harness:

```bash
node scripts/verify-production.mjs
```

### 5.2 Post-Deployment Smoke Test
After deploying to Render or staging, execute non-destructive smoke tests:

```bash
BASE_URL=https://skillbridge-api.onrender.com node scripts/smoke-test.mjs
```

This verifies:
- `GET /health` process liveness
- `GET /ready` database connectivity
- `GET /api/v1/health` and `/api/v1/ready`
- `GET /api/v1/tasks?limit=3` public opportunity discovery
- `POST /api/v1/tasks/match` non-destructive AI recommendation query
