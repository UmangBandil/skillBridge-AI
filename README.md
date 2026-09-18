# SkillBridge AI

SkillBridge AI is a full-stack platform for discovering and matching students with short, skills-based internship tasks. Students upload a resume and receive ranked opportunities; recruiters create and manage tasks; users can maintain a structured portfolio.

## Current MVP

- JWT authentication with student and recruiter roles
- Recruiter task creation and task ownership checks
- Task browsing with status updates
- PDF/TXT resume upload and text extraction
- Heuristic skill extraction, optional OpenAI parsing, and local SBERT embeddings
- Resume-to-task matching with matched-skill explanations
- Authenticated portfolio storage

Payments, applications, mentor feedback, badges, and AWS Cognito are not part of the current implementation. They should not be treated as supported product features yet.

## Stack

| Layer | Technology |
| --- | --- |
| Web | React 18, TypeScript, React Router, Tailwind CSS, Vite |
| API | Node.js, Express, Prisma |
| Database | PostgreSQL |
| Matching | `@xenova/transformers`, `all-MiniLM-L6-v2`, cosine similarity |
| Optional parsing | OpenAI API |
| Deployment | Docker and Render |

## Local development

### Prerequisites

- Node.js 20+
- Docker Desktop
- A PostgreSQL database, local or hosted

### Setup

```bash
npm install
docker compose up -d
copy server\.env.example server\.env
npm run --workspace server db:generate
npm run --workspace server db:migrate
npm run dev
```

The web app runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

Set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL` in `server/.env`. `OPENAI_API_KEY` is optional; without it, resume parsing uses the local fallback parser.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/signup` | Create a student or recruiter account |
| POST | `/auth/signin` | Sign in and receive a JWT |
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create a recruiter task |
| PUT | `/tasks/:id` | Update the owner's task status |
| DELETE | `/tasks/:id` | Delete the owner's task |
| POST | `/tasks/upload` | Parse a PDF or TXT resume |
| POST | `/tasks/match` | Rank open tasks against resume text |
| GET/PUT | `/portfolio` | Read or save the signed-in user's portfolio |
| GET | `/health` | Liveness check |
| GET | `/ready` | Database readiness check |

The Vite development proxy exposes these routes through `/api`.

## Matching flow

```text
PDF/TXT resume
      |
      v
text extraction -> skill parsing -> SBERT embedding
                                      |
task title/description/skills --------+
                                      v
                         cosine similarity ranking
```

Matching is a recommendation aid, not a hiring decision. Results can fall back to the newest open tasks when a resume has no recognized skills or the embedding model is unavailable.

## Project structure

```text
server/
  prisma/              schema and migrations
  src/routes/          auth, task, and portfolio endpoints
  src/ml/              resume parsing and matching
  src/middleware/      JWT and authorization middleware
web/
  src/pages/           route-level screens
  src/components/      reusable UI
  src/services/        API client
```

## Quality and deployment

The production image generates Prisma client code, builds the web app, applies migrations, and starts the API. Before deploying, configure the environment variables in `render.yaml` and verify both `/health` and `/ready`.

Run the current automated checks locally:

```bash
npm run build
npm run test
```

CI runs the frontend build plus backend parser tests and frontend service tests on every push to `main` and every pull request.

The next engineering priorities are API integration tests, an end-to-end user flow, accessible error/loading states, task search/filtering, and a focused application workflow.
