# SkillBridge AI — API Reference Documentation

**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT token in header `Authorization: Bearer <token>`  
**Standard Response Envelope**:
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
  "error": "Error description message",
  "code": "ERROR_CODE",
  "details": []
}
```

---

## 1. System Health & Probes

### GET `/api/v1/health`
Liveness probe for orchestrators (Render, Kubernetes, Docker).
- **Auth**: None
- **Rate Limit**: Excluded / High allowance
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-23T05:00:00.000Z",
  "uptime": 124.5,
  "version": "1.0.0"
}
```

### GET `/api/v1/ready`
Readiness probe testing database connection and embedding pipeline.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ready",
  "database": "connected",
  "embeddingService": "ready",
  "timestamp": "2026-09-23T05:00:00.000Z"
}
```

---

## 2. Authentication

### POST `/api/v1/auth/signup`
Register a new student or recruiter account.
- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "StrongPassword123!",
  "name": "Jane Doe",
  "role": "student" // "student" | "recruiter"
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
    "token": "eyJhbGciOi..."
  }
}
```

### POST `/api/v1/auth/login`
Authenticate user and obtain JWT session token.
- **Request Body**:
```json
{
  "email": "candidate@example.com",
  "password": "StrongPassword123!"
}
```
- **Response `200 OK`**: Same envelope as signup.

---

## 3. Tasks & Micro-Internships

### GET `/api/v1/tasks`
Search and filter micro-internship opportunities with pagination.
- **Auth**: Optional
- **Query Parameters**:
  - `q` *(string)*: Search term matching title and description.
  - `skill` *(string)*: Filter by specific skill (e.g. `React`).
  - `status` *(string)*: Filter by status (`open`, `in-progress`, `closed`).
  - `minBudget` *(number)*: Minimum budget threshold.
  - `maxBudget` *(number)*: Maximum budget threshold.
  - `page` *(number, default: 1)*: Page number.
  - `limit` *(number, default: 10, max: 50)*: Items per page.
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
Create a new micro-internship opportunity.
- **Auth**: Bearer token (Recruiter role required)
- **Request Body**:
```json
{
  "title": "Data Engineering Internship",
  "description": "Construct automated ETL pipelines with Python and SQL",
  "skills": ["Python", "SQL", "PostgreSQL"],
  "budget": 4000
}
```
- **Response `201 Created`**: Returns created task object with auto-computed embedding.

### POST `/api/v1/tasks/match`
Evaluate candidate resume against all open tasks using hybrid semantic AI.
- **Auth**: Optional
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
Submit an application to an open micro-internship.
- **Auth**: Bearer token (Student role required)
- **Request Body**:
```json
{
  "taskId": "cmu101...",
  "coverLetter": "Excited to apply for this engineering role."
}
```
- **Response `201 Created`**
- **Error `409 Conflict`**: Returned if the user has already applied to this task.
- **Error `403 Forbidden`**: Returned if the task author attempts to apply to their own task.

### GET `/api/v1/applications/my`
Fetch all applications submitted by the authenticated student.
- **Auth**: Bearer token (Student role required)
- **Response `200 OK`**: Array of application objects with nested task details.

### PATCH `/api/v1/applications/:id/status`
Update an applicant's lifecycle status in the pipeline.
- **Auth**: Bearer token (Task author recruiter required)
- **Request Body**:
```json
{
  "status": "SHORTLISTED" // "APPLIED" | "REVIEWING" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
}
```
- **Response `200 OK`**: Returns updated application record.

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
- **Form Field**: `resume` (Max 5MB)
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
