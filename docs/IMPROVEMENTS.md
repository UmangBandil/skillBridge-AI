# SkillBridge AI — Improvements & Evolution Plan

This document catalogs the technical debt identified in the baseline codebase, the systematic architectural improvements being enacted, and the verification metrics applied to each component.

---

## 1. Technical Debt & Deficiencies Addressed

| Area | Initial State (Baseline) | Target Production State |
| :--- | :--- | :--- |
| **Backend Layering** | Logic coupled directly inside Express route handlers | Clean 4-tier separation: `routes -> controllers -> services -> repositories` |
| **Database Schema** | Only `User` and `Task` models; unconstrained strings | Proper entities: `Application`, `Resume`, `Skill`, `TaskSkill`, `UserSkill`, `MatchResult`, `RefreshToken` + Enums |
| **AI Matching** | Raw cosine similarity on skills string | Transparent 4-factor hybrid scoring with weighted formula + degraded mode fallback |
| **Resume Extraction**| PDF and TXT only; heuristic section parser | Added DOCX support, structured extraction schema, mime/magic-byte validation, database persistence |
| **Marketplace Flow** | Student browse only; no applications | Complete student apply/withdraw flow + Recruiter review, shortlist, accept/reject lifecycle |
| **Search & Filters** | Client-side filtering or full table dumps | Server-side Postgres filtering (`q`, `skill`, `status`, `minBudget`, `maxBudget`) with paginated metadata |
| **API Architecture** | Unversioned `/api/tasks`, `/api/auth` with inconsistent error shapes | Versioned `/api/v1/*` with standardized `{ success, data }` and `{ success: false, error }` contracts |
| **Security & Auth** | Single JWT in local storage; no rate limiting; permissive headers | Helmet headers, strict CORS, rate limiters on auth/upload/match, refresh token support |
| **Testing** | 0 test files across entire repository | Full Vitest unit, service, integration, and E2E workflow tests for backend and frontend |
| **Observability** | Ad-hoc `console.log` | Structured JSON logging with request IDs, response times, status codes, redacting PII |
| **Docker & Deploy** | Incomplete single-stage build; postgres-only compose | Multi-stage Dockerfile, complete docker-compose (API + DB), Render deployment specs |

---

## 2. Phased Architectural Progression

### Phase 1: Backend Layering
- Establish `server/src/config/index.js` with Zod environment validation.
- Decouple routes into controllers and services.
- Establish repository abstractions for database queries.

### Phase 2: Schema Evolution
- Add `Application` with states: `APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`, `WITHDRAWN`.
- Add `Resume` model to store parsed resume sections and embeddings securely in PostgreSQL.
- Add indexes on `[status]`, `[authorId]`, `[userId]`, `[taskId]` and unique constraint on `(userId, taskId)`.

### Phase 3: Hybrid Scoring Formula
- Transparent scoring breakdown:
  $$\text{Score} = 0.55 \cdot \text{Semantic} + 0.25 \cdot \text{Skill} + 0.10 \cdot \text{Keyword} + 0.10 \cdot \text{Experience}$$
- Degraded mode fallback: When transformers or embeddings are unavailable, execute deterministic lexical ranking and explicitly notify the caller.

### Phase 4: Resume Parsing Robustness
- Support `.docx` alongside `.pdf` and `.txt`.
- Enhanced sanitization and input validation.

### Phase 5 & 6: Marketplace Workflow & Search
- Implement end-to-end recruitment lifecycle with service-level authorization enforcement.
- Paginated search API with query parameters.

### Phase 7 & 8: API Consistency & Security
- Standardized response formatting.
- Helmet security headers and CORS protection.
- Centralized error-handling middleware.

### Phase 9 - 13: UI Redesign & Match Explanation
- Match explanation card highlighting matching skills, missing skills, semantic relevance gauge, and formula modal.
- Application status tracker for students and candidate pipeline for recruiters.

### Phase 14+: Testing, Observability, Containerization
- Unit and integration tests.
- Health (`/api/v1/health`) and readiness (`/api/v1/ready`) probes.
- Multi-stage Docker builds and automated CI pipelines.
