# SkillBridge AI — System Architecture (Pre-Upgrade Baseline)

This document describes the initial architecture, component layout, and runtime characteristics of SkillBridge AI prior to the production-grade upgrade.

---

## 1. High-Level Overview

SkillBridge AI was initially prototyped as a micro-internship matching platform designed to connect students with short-term project tasks posted by recruiters.

```mermaid
graph TD
    Client[React + Vite Frontend (Port 5173 / SPA)]
    Express[Express.js Backend (Port 4000)]
    Postgres[(PostgreSQL Database)]
    HF[Local Xenova MiniLM-L6-v2 Embedder]
    OpenAI[OpenAI API (Optional Fallback)]

    Client -->|REST API /api/*| Express
    Express -->|Prisma Client| Postgres
    Express -->|In-Process Tokenizer| HF
    Express -.->|Optional GenAI| OpenAI
```

---

## 2. Component Architecture

### 2.1 Backend (`server/`)
- **Runtime**: Node.js v20 (ES Modules).
- **Web Framework**: Express v4.21.
- **ORM / Database**: Prisma v6 with PostgreSQL (`User` and `Task` models).
- **State & Storage**:
  - `User.portfolio`: Arbitrary JSONB storing parsed resume data and profile metadata.
  - `Task.embedding`: JSONB storing raw 384-dimensional float arrays from Xenova transformer models.
  - File uploads: Stored in Node.js memory buffer via Multer.
- **AI / ML Layer**:
  - `embed.js`: Dynamically loads `@xenova/transformers` with pipeline `all-MiniLM-L6-v2`. Computes mean-pooled, normalized 384-dimensional sentence vectors.
  - `ml/parser.js`: Hybrid resume parser. Checks for `OPENAI_API_KEY`; if absent, uses regex keyword scanning against 100+ technical skills and heuristic section boundary detection.
  - `ml/matcher.js`: Computes cosine similarity between resume skill vector and task embeddings via `ml-distance`.

### 2.2 Frontend (`web/`)
- **Framework**: React 18 with TypeScript and Vite 6.
- **Styling**: Tailwind CSS with custom utility classes.
- **Routing**: React Router DOM v6 with client-side code splitting (`React.lazy` and `Suspense`).
- **State Management**: React Context (`AuthContext`) backed by `localStorage` persistence for tokens and user profiles.

---

## 3. Data Model (Initial)

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  password        String
  role            String   @default("student")
  stripeAccountId String?
  portfolio       Json?
  tasks           Task[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Task {
  id                    String   @id @default(cuid())
  title                 String
  description           String
  skills                String   // Comma-separated list
  budget                Int      // In USD or cents
  status                String   @default("open")
  embedding             Json?
  stripePaymentIntentId String?
  author                User     @relation(fields: [authorId], references: [id])
  authorId              String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## 4. Key Limitations of the Baseline

1. **Missing Core Marketplace Entities**: No `Application` entity existed. A student could view tasks and matched scores, but could not submit an application, track status, or receive acceptance/rejection from recruiters.
2. **Monolithic Route Handlers**: Business logic, database queries, and ML calls were tightly coupled directly inside route callback functions (`task.routes.js`, `auth.routes.js`).
3. **No Test Suite**: Test runners were installed in `package.json`, but zero test files existed.
4. **Opaque Scoring**: Matching returned an uncontextualized cosine similarity number without transparent breakdown (semantic, skill overlap, keyword match, experience relevance).
5. **No DOCX Support**: Only basic PDF and TXT parsing was supported.
6. **No Rate Limiting or Request Validation**: Endpoints were vulnerable to denial-of-service, large payload crashes, and malformed inputs.
7. **Production Deployment Gaps**: `docker-compose.yml` only spun up PostgreSQL, omitting the web/API container, and `render.yaml` lacked explicit health checks and environment validation.
