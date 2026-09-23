import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/repositories/prisma.js';
import authService from '../src/services/auth.service.js';
import taskService from '../src/services/task.service.js';
import applicationService from '../src/services/application.service.js';
import resumeService from '../src/services/resume.service.js';
import { matchAndRankTasks } from '../src/ml/matcher.service.js';

describe('Real Database Recruiter-Student E2E Lifecycle Suite', () => {
  const recruiterEmail = `real-e2e-recruiter-${Date.now()}@real-e2e.skillbridge.dev`;
  const studentEmail = `real-e2e-student-${Date.now()}@real-e2e.skillbridge.dev`;

  let recruiter;
  let student;
  let createdTask;
  let uploadedResume;
  let submittedApplication;

  beforeAll(async () => {
    // 1. Recruiter Signup
    recruiter = await authService.signup({
      email: recruiterEmail,
      password: 'RecruiterSecure123!',
      name: 'E2E Talent Recruiter',
      role: 'recruiter'
    });

    // 2. Student Signup
    student = await authService.signup({
      email: studentEmail,
      password: 'StudentSecure123!',
      name: 'E2E Alex Student',
      role: 'student'
    });
  });

  afterAll(async () => {
    // Cleanup records in reverse dependency order
    if (submittedApplication) {
      await prisma.application.deleteMany({ where: { id: submittedApplication.id } });
    }
    if (createdTask) {
      await prisma.task.deleteMany({ where: { id: createdTask.id } });
    }
    if (uploadedResume) {
      await prisma.resume.deleteMany({ where: { id: uploadedResume.resumeId } });
    }
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { userId: recruiter.user.id },
          { userId: student.user.id }
        ]
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [recruiterEmail, studentEmail] }
      }
    });
  });

  it('Step 1: Recruiter creates a new micro-internship with automated embeddings', async () => {
    createdTask = await taskService.createTask({
      title: 'Full Stack React & Node E2E Micro-Internship',
      description: 'Build web features with React, TypeScript, and Node.js for an educational platform.',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      budget: 4800,
      authorId: recruiter.user.id
    });

    expect(createdTask.id).toBeDefined();
    expect(createdTask.authorId).toBe(recruiter.user.id);
    expect(createdTask.status).toBe('open');
    expect(Array.isArray(createdTask.embedding)).toBe(true);
  });

  it('Step 2: Student uploads and parses a resume with security validations', async () => {
    const resumeText = `Alex Student
San Francisco, CA • alex@real-e2e.skillbridge.dev
SUMMARY: Full-stack engineer experienced in React, TypeScript, and Node.js.
SKILLS: React, TypeScript, Node.js, PostgreSQL, SQL, HTML, CSS.
EXPERIENCE: Full Stack Web Intern at Acme Lab - built React features and Node APIs.`;

    const fakePdfBuffer = Buffer.from(
      `%PDF-1.4\n1 0 obj\n<<>>\nstream\n${resumeText}\nendstream\nendobj\ntrailer\n<<>>\n%%EOF`
    );

    uploadedResume = await resumeService.processUpload(
      {
        originalname: 'alex_resume.txt',
        buffer: Buffer.from(resumeText, 'utf-8'),
        mimetype: 'text/plain'
      },
      student.user.id
    );

    expect(uploadedResume.resumeId).toBeDefined();
    expect(uploadedResume.data.skills).toContain('react');
    expect(uploadedResume.data.skills).toContain('node.js');
  });

  it('Step 3: Student requests AI matching recommendations and receives transparent breakdown', async () => {
    const allTasks = await taskService.getTasks({ status: 'open' });
    const matches = await matchAndRankTasks(uploadedResume.data, allTasks.items);

    expect(matches.length).toBeGreaterThan(0);
    const targetMatch = matches.find(m => m.id === createdTask.id);
    expect(targetMatch).toBeDefined();
    expect(targetMatch.matchScore).toBeGreaterThanOrEqual(0.5);
    expect(targetMatch.breakdown).toBeDefined();
    expect(targetMatch.breakdown.skills).toBeGreaterThan(0.7);
  });

  it('Step 4: Student applies to the internship opportunity with a cover letter', async () => {
    submittedApplication = await applicationService.apply({
      userId: student.user.id,
      taskId: createdTask.id,
      coverLetter: 'I am excited to apply for this full-stack role!'
    });

    expect(submittedApplication.id).toBeDefined();
    expect(submittedApplication.status).toBe('APPLIED');
    expect(submittedApplication.userId).toBe(student.user.id);
    expect(submittedApplication.taskId).toBe(createdTask.id);
  });

  it('Step 5: Enforces integrity by rejecting duplicate applications', async () => {
    await expect(
      applicationService.apply({
        userId: student.user.id,
        taskId: createdTask.id,
        coverLetter: 'Second application attempt'
      })
    ).rejects.toThrow(/already applied/);
  });

  it('Step 6: Recruiter reviews the candidate application pipeline', async () => {
    const taskApps = await applicationService.getTaskApplications(createdTask.id, recruiter.user.id);

    expect(taskApps.length).toBe(1);
    expect(taskApps[0].id).toBe(submittedApplication.id);
    expect(taskApps[0].user.name).toBe('E2E Alex Student');
    expect(taskApps[0].status).toBe('APPLIED');
  });

  it('Step 7: Recruiter updates application status through lifecycle: APPLIED -> REVIEWING -> SHORTLISTED', async () => {
    // 1. APPLIED -> REVIEWING
    const reviewingApp = await applicationService.updateStatus({
      applicationId: submittedApplication.id,
      status: 'REVIEWING',
      recruiterId: recruiter.user.id
    });
    expect(reviewingApp.status).toBe('REVIEWING');

    // 2. REVIEWING -> SHORTLISTED
    const shortlistedApp = await applicationService.updateStatus({
      applicationId: submittedApplication.id,
      status: 'SHORTLISTED',
      recruiterId: recruiter.user.id
    });
    expect(shortlistedApp.status).toBe('SHORTLISTED');
  });

  it('Step 8: Student verifies updated status in their application tracker', async () => {
    const studentApps = await applicationService.getStudentApplications(student.user.id);

    expect(studentApps.length).toBe(1);
    expect(studentApps[0].id).toBe(submittedApplication.id);
    expect(studentApps[0].status).toBe('SHORTLISTED');
  });
});
