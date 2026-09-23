# SkillBridge AI — Security & Privacy Architecture

This document describes the security controls, data handling practices, and vulnerability reporting procedures implemented in SkillBridge AI.

---

## 1. Untrusted File Upload & Resume Ingestion Security

Resumes submitted by users are treated as untrusted binary streams. The application enforces multi-layered defense before text extraction or database persistence:

1. **In-Memory Buffer Processing**: Uploaded files are received into ephemeral memory buffers (`multer.memoryStorage()`) and never written to predictable filesystem locations or executed as scripts.
2. **Strict MIME & Extension Whitelist**: Only `.pdf`, `.docx`, and `.txt` files are accepted.
3. **Magic Byte Verification**:
   - PDF files must begin with `%PDF` bytes (`0x25 0x50 0x44 0x46`).
   - DOCX files must verify standard PK Zip headers (`0x50 0x4B 0x03 0x04`).
   - TXT files are scanned for binary null bytes to block disguised executables or DLLs.
4. **File Size & Content Bounds**:
   - Hard maximum file size limit of 10MB (configurable via `MAX_UPLOAD_SIZE_MB`).
   - Parsed text is bounded to 100,000 characters to prevent Regular Expression Denial of Service (ReDoS) or memory exhaustion.
5. **Path Traversal Protection**: Uploaded filenames are sanitized using `sanitizeFilename` (stripping directory traversal markers like `..`, slashes, and shell meta-characters).

---

## 2. Authentication & Credential Protection

### 2.1 Password Security
- User passwords are required to meet strong complexity requirements validated via Zod.
- Passwords are salted and hashed using `bcrypt` (10 rounds).
- Database queries explicitly omit the `password` field in repository selects (`select: { id: true, email: true, ... }`).
- Passwords are never serialized into API responses or logged in structured outputs.

### 2.2 JWT & Refresh Token Lifecycle
- **Access Tokens**: Short-lived JSON Web Tokens signed with HMAC-SHA256 (`JWT_SECRET`). Tokens contain only minimal identity claims (`userId`, `role`, `email`).
- **Hashed Refresh Token Storage**: Refresh tokens are generated as high-entropy cryptographically random strings (`crypto.randomBytes(40)`). The server stores only the **SHA-256 hash** of the token in the database. A database breach cannot compromise active refresh tokens.
- **Refresh Token Rotation**: Every refresh exchange revokes the existing token and issues a new hashed pair.
- **Reuse Detection**: If a revoked refresh token is presented, the server flags potential session hijacking, revokes all active refresh tokens for that user account, and rejects the request.
- **Explicit Logout**: Revokes the refresh token record immediately.

---

## 3. Authorization & Multi-Tenancy Isolation

- **Role-Based Access Control (RBAC)**: Enforced via `protect` and `authorize('recruiter' | 'student')` middleware.
- **Ownership Verification**:
  - Only the author recruiter can update or view candidate submissions for a task.
  - Recruiters cannot apply to their own tasks.
  - Students cannot modify or withdraw applications belonging to other users.
- **Database Constraints**: Multi-tenancy integrity is enforced at the PostgreSQL layer via compound unique keys (e.g. `@@unique([userId, taskId])`), preventing concurrent race-condition duplicates.

---

## 4. Network Security & Observability

- **HTTP Security Headers**: `helmet` sets secure headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict Referrer policies.
- **CORS Protection**: In production, wildcard CORS (`*`) is disabled. Allowed origins must match configured `CLIENT_URL` / `FRONTEND_URL` whitelists.
- **Rate Limiting**: Tiered IP rate limiting prevents brute-force credential stuffing on `/auth/*` and abusive volume on parsing/matching endpoints.
- **Sensitive Data Redaction**: The structured request logger systematically redacts authorization headers, passwords, tokens, API keys, and raw resume texts.

---

## 5. Vulnerability Reporting

If you discover a security vulnerability in SkillBridge AI, please do not disclose it in a public GitHub issue. 

Please report vulnerabilities privately by emailing:
**security@skillbridgeai.dev**

Reports are reviewed within 48 hours.
