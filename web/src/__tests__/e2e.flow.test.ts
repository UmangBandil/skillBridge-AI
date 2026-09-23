import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadResumeFile,
  listTasks,
  matchTasks,
  applyToTask,
  getMyApplications
} from '../services/api';

describe('Student Complete Marketplace User Flow (E2E Simulation)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('executes full student lifecycle: signup/login -> upload resume -> browse -> match -> apply -> track status', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    // 1. Simulate authentication login & token storage
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2e-token';
    const fakeUser = { id: 'usr_student_e2e', name: 'Alex Rivera', role: 'student', email: 'alex@student.dev' };
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));
    localStorage.setItem('role', 'student');

    expect(localStorage.getItem('token')).toBe(fakeToken);

    // 2. Upload and Parse Resume
    const fakeResumeFile = new File(
      ['Alex Rivera\nReact, TypeScript, Node.js developer'],
      'alex_rivera_resume.pdf',
      { type: 'application/pdf' }
    );

    fetchSpy.mockImplementationOnce(async (url) => {
      expect(String(url)).toContain('/resumes/upload');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            resumeId: 'res_123',
            filename: 'alex_rivera_resume.pdf',
            extractedText: 'Alex Rivera\nReact, TypeScript, Node.js developer',
            data: {
              skills: ['react', 'typescript', 'node.js'],
              education: ['B.S. Computer Science'],
              experience: ['Intern at Tech Co']
            }
          }
        })
      } as any;
    });

    const parsedResult = await uploadResumeFile(fakeResumeFile);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(parsedResult.data.skills).toContain('react');

    // 3. Browse Open Opportunities with server-side filters
    const selectedTask = {
      id: 'task_101',
      title: 'Full Stack Engineering Micro-Internship',
      description: 'Build web applications with React and Node.js',
      skills: ['React', 'TypeScript', 'Node.js'],
      budget: 4500,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    fetchSpy.mockImplementationOnce(async (url) => {
      expect(String(url)).toContain('/api/v1/tasks');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [selectedTask],
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
          }
        })
      } as any;
    });

    const taskBrowseResult = await listTasks({ q: 'Full Stack', page: 1, limit: 10 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(taskBrowseResult.items.length).toBe(1);

    // 4. Request AI Hybrid Match Recommendations
    fetchSpy.mockImplementationOnce(async (url) => {
      expect(String(url)).toContain('/tasks/match');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            matches: [
              {
                ...selectedTask,
                matchScore: 0.92,
                breakdown: {
                  semantic: 0.94,
                  skills: 1.0,
                  keywords: 0.85,
                  experience: 0.75
                },
                matchedSkills: ['React', 'TypeScript', 'Node.js'],
                missingSkills: []
              }
            ]
          }
        })
      } as any;
    });

    const recommendations = await matchTasks(parsedResult.extractedText);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(recommendations.length).toBe(1);
    expect(recommendations[0].matchScore).toBe(0.92);
    expect(recommendations[0].matchedSkills).toEqual(['React', 'TypeScript', 'Node.js']);

    // 5. Submit Application to Top Recommended Task
    fetchSpy.mockImplementationOnce(async (url, opts) => {
      expect(String(url)).toContain('/api/v1/applications');
      expect(opts?.method).toBe('POST');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'app_999',
            taskId: selectedTask.id,
            userId: fakeUser.id,
            status: 'APPLIED',
            coverLetter: 'I am excited to apply for this opportunity.',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      } as any;
    });

    const applicationResult = await applyToTask(selectedTask.id, 'I am excited to apply for this opportunity.');
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(applicationResult.id).toBe('app_999');
    expect(applicationResult.status).toBe('APPLIED');

    // 6. Track Application in Student Tracker
    fetchSpy.mockImplementationOnce(async (url) => {
      expect(String(url)).toContain('/api/v1/applications/my');
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 'app_999',
              taskId: selectedTask.id,
              userId: fakeUser.id,
              status: 'APPLIED',
              appliedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              task: selectedTask
            }
          ]
        })
      } as any;
    });

    const myApplications = await getMyApplications();
    expect(fetchSpy).toHaveBeenCalledTimes(5);
    expect(myApplications.length).toBe(1);
    expect(myApplications[0].id).toBe('app_999');
    expect(myApplications[0].status).toBe('APPLIED');
    expect(myApplications[0].task?.title).toBe('Full Stack Engineering Micro-Internship');
  });
});
