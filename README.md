# SkillBridge AI  
**AI-Driven Micro-Internship Matching & Mentorship Platform**

🔗 Live Demo (staging): https://skillbridgeai.dev  
📦 Backend API: https://api.skillbridgeai.dev/docs  
🧪 Test Coverage: ![coverage](https://img.shields.io/codecov/c/github/UmangBandil/skillBridge-AI)

---

## 1. What it does
- Upload your résumé → SkillBridge AI extracts skills and **semantically matches** you to 10-40 h paid micro-internships posted by NGOs / early-stage start-ups.
- Deliver the task → receive **AI-generated mentor feedback** (GPT-3.5) and a **verified portfolio badge**.
- Escrow payments via **Stripe Connect** – funds released only after both sides sign-off.

---

## 2. Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind + Vite |
| Backend | Node.js 20 + Express + Prisma + PostgreSQL |
| AI | SBERT `all-MiniLM-L6-v2` → ONNX runtime + GPT-3.5-turbo |
| Cloud | AWS Amplify (front), ECS Fargate (API), RDS (pg), S3, CloudFront |
| Auth | AWS Cognito JWT |
| Payments | Stripe Connect Express accounts |
| CI/CD | GitHub Actions → Docker → ECR → ECS |

---

## 3. Quick Start (local)
```bash
# 1. Clone
git clone https://github.com/UmangBandil/skillBridge-AI.git && cd skillBridge-AI

# 2. Infra
docker-compose up -d   # Postgres + Redis

# 3. API
cd server
cp .env.example .env   # add DB_URL, STRIPE_KEY, OPENAI_KEY
npm i && npm run dev   # runs on :4000

# 4. Web
cd ../web
cp .env.example .env
npm i && npm run dev   # runs on :5173
```
Visit http://localhost:5173

---

## 4. AI Pipeline
```
Résumé PDF → spaCy NER → skills JSON
                ↓
ONNX SBERT → cosine similarity → ranked tasks
                ↓
Task delivery → GPT-3.5 prompt → structured feedback JSON
```
- Model size: 300 MB INT8 quantized → **< 150 ms** on 2 vCPU.  
- Evaluation: MAP@10 ≥ 0.80 on held-out 500 résumé-task pairs.

---

## 5. API (snapshot)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/match | Returns top-10 matched tasks |
| POST | /api/v1/tasks | Create task (org only) |
| POST | /api/v1/applications | Apply & escrow payment |
| GET | /api/v1/portfolio/:user | Public portfolio JSON |

Full OpenAPI spec: `http://localhost:4000/docs`

---

## 6. Environment Variables
```bash
# server/.env
DATABASE_URL="postgres://user:pass@localhost:5432/skillbridge"
STRIPE_SECRET_KEY=sk_test_***
OPENAI_API_KEY=sk-***
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=***
JWT_SECRET=***
```

---

## 7. Testing
```bash
# unit
npm run test:unit

# e2e (needs running stack)
npm run test:e2e

# coverage
npm run test:coverage
```
Target: ≥ 80 % lines.

---

## 8. Deployment (AWS)
```bash
# push tag triggers GitHub Actions
git tag v1.0.0 && git push origin v1.0.0
```
Blue-green ECS deployment in ~5 min.

---

## 9. Roadmap
- [ ] Mobile app (React Native)  
- [ ] Multi-language résumé parsing  
- [ ] University analytics dashboard  
- [ ] Badge system (Open-Badges v3)

---

## 10. Contributing
PRs welcome! Please branch from `develop` and run `npm run lint` before push.

---

## 11. License
MIT © 2025 UmangBandil

---

## 12. Acknowledgements
Dataset donors: College Career Centre & open-source community.  
Icons: Heroicons, AWS Architecture Icons.