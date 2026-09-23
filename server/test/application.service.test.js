import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import applicationService from '../src/services/application.service.js';
import taskService from '../src/services/task.service.js';
import authService from '../src/services/auth.service.js';
import prisma from '../src/repositories/prisma.js';

describe('Marketplace Application Service', () => {
  let studentUser;
  let recruiterUser;
  let otherRecruiterUser;
  let testTask;
  let testTask2;

  beforeAll(async () => {
    // Clean any previous test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'app_test_' } }
    });

    // 1. Create a student
    const studentRes = await authService.signup({
      email: `app_test_student_${Date.now()}@app-test.skillbridge.dev`,
      password: 'Password123!',
      name: 'Applicant Student',
      role: 'student'
    });
    studentUser = studentRes.user;

    // 2. Create a recruiter
    const recruiterRes = await authService.signup({
      email: `app_test_recruiter_${Date.now()}@app-test.skillbridge.dev`,
      password: 'Password123!',
      name: 'Hiring Recruiter',
      role: 'recruiter'
    });
    recruiterUser = recruiterRes.user;

    // 3. Create another recruiter for tenant isolation test
    const otherRecruiterRes = await authService.signup({
      email: `app_test_other_${Date.now()}@app-test.skillbridge.dev`,
      password: 'Password123!',
      name: 'Other Recruiter',
      role: 'recruiter'
    });
    otherRecruiterUser = otherRecruiterRes.user;

    // 4. Create tasks by recruiter
    testTask = await taskService.createTask({
      title: 'Full Stack Engineering Intern',
      description: 'Hands on project with React and Node.js microservices',
      skills: ['React', 'Node.js', 'PostgreSQL'],
      budget: 4500,
      authorId: recruiterUser.id
    });

    testTask2 = await taskService.createTask({
      title: 'Backend Engineering Intern',
      description: 'Building robust Node.js and PostgreSQL APIs',
      skills: ['Node.js', 'PostgreSQL'],
      budget: 4000,
      authorId: recruiterUser.id
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'app_test_' } }
    });
  });

  it('should allow student to submit an application with an optional cover letter', async () => {
    const app = await applicationService.apply({
      userId: studentUser.id,
      taskId: testTask.id,
      coverLetter: 'I have built multiple React and Node applications and would love to contribute.'
    });

    expect(app.id).toBeDefined();
    expect(app.status).toBe('APPLIED');
    expect(app.userId).toBe(studentUser.id);
    expect(app.taskId).toBe(testTask.id);
  });

  it('should prevent the student from applying to the same task twice', async () => {
    await expect(
      applicationService.apply({
        userId: studentUser.id,
        taskId: testTask.id,
        coverLetter: 'Duplicate attempt'
      })
    ).rejects.toThrow('You have already applied to this opportunity');
  });

  it('should prevent a recruiter from applying to their own posted task', async () => {
    await expect(
      applicationService.apply({
        userId: recruiterUser.id,
        taskId: testTask.id,
        coverLetter: 'Self application attempt'
      })
    ).rejects.toThrow('You cannot apply to your own internship opportunity');
  });

  it('should allow recruiter to retrieve and review applications for their task', async () => {
    const apps = await applicationService.getTaskApplications(testTask.id, recruiterUser.id);
    expect(apps.length).toBe(1);
    expect(apps[0].userId).toBe(studentUser.id);
  });

  it('should prevent another recruiter from accessing applications for this task', async () => {
    await expect(
      applicationService.getTaskApplications(testTask.id, otherRecruiterUser.id)
    ).rejects.toThrow('You are not authorized to view applications for this task');
  });

  it('should allow the author recruiter to update applicant status to SHORTLISTED and ACCEPTED', async () => {
    const apps = await applicationService.getTaskApplications(testTask.id, recruiterUser.id);
    const appId = apps[0].id;

    // Shortlist
    const shortlisted = await applicationService.updateStatus({
      applicationId: appId,
      status: 'SHORTLISTED',
      recruiterId: recruiterUser.id
    });
    expect(shortlisted.status).toBe('SHORTLISTED');

    // Accept
    const accepted = await applicationService.updateStatus({
      applicationId: appId,
      status: 'ACCEPTED',
      recruiterId: recruiterUser.id
    });
    expect(accepted.status).toBe('ACCEPTED');
  });

  it('should allow student to withdraw their active application', async () => {
    const app2 = await applicationService.apply({
      userId: studentUser.id,
      taskId: testTask2.id,
      coverLetter: 'Interested in backend API work.'
    });

    const withdrawn = await applicationService.withdraw(app2.id, studentUser.id);
    expect(withdrawn.status).toBe('WITHDRAWN');
  });

  it('should prevent student from withdrawing an already accepted application', async () => {
    const apps = await applicationService.getStudentApplications(studentUser.id);
    const acceptedApp = apps.find(a => a.status === 'ACCEPTED');
    expect(acceptedApp).toBeDefined();

    await expect(
      applicationService.withdraw(acceptedApp.id, studentUser.id)
    ).rejects.toThrow('Cannot withdraw an application that has already been accepted');
  });
});
