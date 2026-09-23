# SkillBridge AI — API Reference Documentation

**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT token in header: `Authorization: Bearer <token>`  
**Standard Success Envelope**:
```json
{
  "success": true,
  "data": { ... }
}
```
**Standard Error Envelope**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

---

## 1. System Health & Probes

### GET `/api/v1/health`
Liveness probe for container orchestrators (Render, Kubernetes, Docker).
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-23T06:00:00.000Z",
  "uptime": 234.8,
  "version": "1.0.0"
}
```

### GET `/api/v1/ready`
Readiness probe verifying database connection and embedding pipeline readiness.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ready",
  "database": "connected",
  "embeddingService": "ready",
  "timestamp": "2026-09-23T06:00:00.000Z"
}
```

---

## 2. Authentication

### POST `/api/v1/auth/signup`
Register a new student or recruiter account.
- **Rate Limit**: 50 req / 15 min
- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "StrongPassword123!",
  "name": "Jane Doe",
  "role": "student"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmu123...",
      "email": "candidate@example.com",
      "name": "Jane Doe",
      "role": "student"
    },
    "token": "eyJhbGciOi...",
    "refreshToken": "4a7b..."
  }
}
```

### POST `/api/v1/auth/signin`
Authenticate credentials and obtain access token plus refresh token.
- **Rate Limit**: 50 req / 15 min
- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "StrongPassword123!"
}
```
- **Response `200 OK`**: Returns user profile, access token, and refresh token.

### POST `/api/v1/auth/refresh`
Exchange a valid refresh token for a newly rotated access token and refresh token.
- **Request Body**:
```json
{
  "refreshToken": "4a7b..."
}
```
- **Response `200 OK`**: Returns new `token` and new `refreshToken`.
- **Error `401 Unauthorized`**: If token was revoked or reused (`REFRESH_TOKEN_REUSE`).

### POST `/api/v1/auth/logout`
Revoke active refresh token.
- **Request Body**:
```json
{
  "refreshToken": "4a7b..."
}
```
- **Response `200 OK`**: `{ "success": true, "data": { "message": "Logged out successfully" } }`

### GET `/api/v1/auth/me`
Retrieve currently authenticated user profile.
- **Auth**: Bearer token
- **Response `200 OK`**: User profile object.

---

## 3. Tasks & Micro-Internships

### GET `/api/v1/tasks`
Search and filter micro-internship opportunities with pagination.
- **Auth**: Optional
- **Query Parameters**:
  - `q` *(string)*: Search text in title or description.
  - `skill` *(string)*: Filter by exact skill name.
  - `status` *(string)*: `open` | `in-progress` | `closed`
  - `minBudget` / `maxBudget` *(number)*: Budget filter range.
  - `sort` *(string)*: `newest` | `oldest` | `budget_high` | `budget_low`
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10, max: 50)*
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cmu101...",
        "title": "Full Stack Engineering Micro-Internship",
        "description": "Build interactive web apps...",
        "skills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
        "budget": 4500,
        "status": "open",
        "author": { "name": "Acme Talent", "email": "recruiter@acme.com" },
        "createdAt": "2026-09-23T04:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST `/api/v1/tasks`
Create a new micro-internship opportunity with automated embedding calculation.
- **Auth**: Bearer token (Recruiter role required)
- **Request Body**:
```json
{
  "title": "Data Pipeline Automation",
  "description": "Construct ETL pipelines with Python and PostgreSQL",
  "skills": ["Python", "SQL", "PostgreSQL"],
  "budget": 4000
}
```
- **Response `201 Created`**: Returns created task object.

### GET `/api/v1/tasks/:id`
Retrieve full details for a single micro-internship opportunity.
- **Auth**: Optional
- **Response `200 OK`**: Task object with author details.

### POST `/api/v1/tasks/match`
Evaluate candidate resume against all open tasks using hybrid semantic AI.
- **Auth**: Optional
- **Rate Limit**: 30 req / 15 min
- **Request Body**:
```json
{
  "resumeText": "Full stack engineer experienced in React, TypeScript, and Node.js..."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "cmu101...",
        "title": "Full Stack Engineering Micro-Internship",
        "matchScore": 0.93,
        "breakdown": {
          "semantic": 1.0,
          "skills": 1.0,
          "keywords": 0.63,
          "experience": 0.65
        },
        "matchedSkills": ["React", "TypeScript", "Node.js"],
        "missingSkills": ["PostgreSQL"],
        "isDegraded": false
      }
    ]
  }
}
```

---

## 4. Applications Lifecycle

### POST `/api/v1/applications`
Submit an application to an open micro-internship opportunity.
- **Auth**: Bearer token (Student role required)
- **Request Body**:
```json
{
  "taskId": "cmu101...",
  "coverLetter": "Excited to apply for this engineering role."
}
```
- **Response `201 Created`**: Application record.
- **Error `409 Conflict`**: Returned if the user has already applied.
- **Error `403 Forbidden`**: Returned if the task author attempts to apply to their own task.

### GET `/api/v1/applications/my`
Fetch all applications submitted by the authenticated student.
- **Auth**: Bearer token (Student role required)
- **Response `200 OK`**: List of application records with nested task data.

### GET `/api/v1/applications/recruiter`
Fetch all applications submitted to tasks authored by the authenticated recruiter.
- **Auth**: Bearer token (Recruiter role required)
- **Response `200 OK`**: List of application records with candidate profiles and resume snippets.

### GET `/api/v1/applications/task/:taskId`
Fetch all applications for a specific task authored by the authenticated recruiter.
- **Auth**: Bearer token (Recruiter role required)
- **Response `200 OK`**: List of applications for the specified task.

### PATCH `/api/v1/applications/:id/status`
Update an applicant's lifecycle status in the pipeline.
- **Auth**: Bearer token (Task author recruiter required)
- **Request Body**:
```json
{
  "status": "SHORTLISTED"
}
```
- **Valid Values**: `APPLIED` | `REVIEWING` | `SHORTLISTED` | `ACCEPTED` | `REJECTED`
- **Response `200 OK`**: Updated application record.

### DELETE `/api/v1/applications/:id`
Withdraw an active application.
- **Auth**: Bearer token (Application owner required)
- **Response `200 OK`**: Status changed to `WITHDRAWN`.

---

## 5. Resumes & Multi-Format Parsing

### POST `/api/v1/resumes/upload`
Upload and extract structured data from PDF, DOCX, or TXT resume files.
- **Auth**: Bearer token (Student role required)
- **Content-Type**: `multipart/form-data`
- **Form Field**: `resume` (Max 10MB)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "resumeId": "cmu_res_...",
    "filename": "candidate_resume.pdf",
    "extractedText": "...",
    "skills": ["react", "typescript", "node.js"],
    "data": {
      "skills": ["react", "typescript", "node.js"],
      "education": ["B.S. Computer Science"],
      "experience": ["Intern at Tech Co"]
    }
  }
}
```

### GET `/api/v1/resumes/my`
Fetch the authenticated student's uploaded resumes.
- **Auth**: Bearer token (Student role required)
- **Response `200 OK`**: List of uploaded resume records with parsed skills.
