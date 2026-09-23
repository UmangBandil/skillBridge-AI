import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/index.js';
import prisma from '../src/repositories/prisma.js';

describe('SkillBridge API End-to-End Integration Suite', () => {
  let server;
  let baseUrl;
  let studentToken;
  let recruiterToken;
  let studentId;
  let recruiterId;
  let createdTaskId;
  let createdAppId;

  beforeAll(async () => {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve(null);
      });
    });

    // Cleanup previous api test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_api_' } }
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_api_' } }
    });
  });

  describe('Health and Readiness Probes', () => {
    it('GET /api/v1/health should return UP status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('UP');
    });

    it('GET /api/v1/ready should verify database connection', async () => {
      const res = await fetch(`${baseUrl}/api/v1/ready`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('READY');
      expect(json.checks.database).toBe('UP');
    });
  });

  describe('Authentication Lifecycle', () => {
    it('POST /api/v1/auth/signup should register a student and recruiter', async () => {
      // 1. Student
      const studentRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `e2e_api_student_${Date.now()}@e2e-test.skillbridge.dev`,
          password: 'Password123!',
          name: 'E2E Student',
          role: 'student'
        })
      });
      expect(studentRes.status).toBe(201);
      const studentJson = await studentRes.json();
      expect(studentJson.success).toBe(true);
      studentToken = studentJson.data.token;
      studentId = studentJson.data.user.id;

      // 2. Recruiter
      const recruiterRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `e2e_api_recruiter_${Date.now()}@e2e-test.skillbridge.dev`,
          password: 'Password123!',
          name: 'E2E Recruiter',
          role: 'recruiter'
        })
      });
      expect(recruiterRes.status).toBe(201);
      const recruiterJson = await recruiterRes.json();
      recruiterToken = recruiterJson.data.token;
      recruiterId = recruiterJson.data.user.id;
    });
  });

  describe('Task Management & Role-Based Authorization', () => {
    it('should reject task creation if requested by a student (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          title: 'Unauthorized Task Creation',
          description: 'Students should not be allowed to post tasks',
          skills: ['React'],
          budget: 1000
        })
      });
      expect(res.status).toBe(403);
    });

    it('should allow recruiter to create a new micro-internship (201 Created)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          title: 'Full Stack AI Internship',
          description: 'Work with Node.js, React, and embeddings to build marketplace matching',
          skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
          budget: 5000
        })
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.title).toBe('Full Stack AI Internship');
      createdTaskId = json.data.id;
    });

    it('should search and filter tasks with pagination (GET /api/v1/tasks)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks?q=Full%20Stack&page=1&limit=10`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.items.length).toBeGreaterThanOrEqual(1);
      expect(json.data.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Application Lifecycle & Integrity Enforcement', () => {
    it('should allow student to apply to the internship opportunity', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          taskId: createdTaskId,
          coverLetter: 'I am thrilled to apply for this AI internship position!'
        })
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('APPLIED');
      createdAppId = json.data.id;
    });

    it('should reject duplicate application from the same student (409 Conflict)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          taskId: createdTaskId,
          coverLetter: 'Second attempt'
        })
      });
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error.code).toBe('APPLICATION_ALREADY_EXISTS');
    });

    it('should reject application from the opportunity author', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          taskId: createdTaskId,
          coverLetter: 'Self apply'
        })
      });
      // 403 Forbidden because recruiter role cannot apply, or 400
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should allow recruiter to review applicant and change status to SHORTLISTED', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications/${createdAppId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          status: 'SHORTLISTED'
        })
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.status).toBe('SHORTLISTED');
    });
  });

  describe('Hybrid AI Matching Endpoint', () => {
    it('POST /api/v1/tasks/match should return scored matches with transparent breakdown', async () => {
      const res = await fetch(`${baseUrl}/api/v1/tasks/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          resume: 'Experienced Full Stack developer proficient in React, Node.js, PostgreSQL and Docker.'
        })
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.matches.length).toBeGreaterThanOrEqual(1);

      const topMatch = json.data.matches[0];
      expect(topMatch.breakdown).toBeDefined();
      expect(topMatch.breakdown.skills).toBeDefined();
      expect(topMatch.matchedSkills).toBeDefined();
      expect(topMatch.missingSkills).toBeDefined();
    });
  });
});
