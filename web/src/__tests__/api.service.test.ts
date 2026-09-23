import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listTasks,
  createTask,
  applyToTask,
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus,
} from '../services/api';

describe('Frontend API Service Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('listTasks should query /api/v1/tasks and serialize query parameters', async () => {
    const mockTasks = {
      items: [
        { id: 't1', title: 'React Intern', skills: ['React', 'TypeScript'], budget: 3000, createdAt: '' }
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks })
    } as any);

    const result = await listTasks({ q: 'React', skill: 'TypeScript', page: 1, limit: 10 });

    expect(fetchSpy).toHaveBeenCalled();
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/tasks');
    expect(calledUrl).toContain('q=React');
    expect(calledUrl).toContain('skill=TypeScript');
    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toBe('React Intern');
  });

  it('createTask should send POST request with task payload and authorization header', async () => {
    localStorage.setItem('token', 'fake_jwt_token_123');

    const createdTask = {
      id: 't2',
      title: 'Node.js Developer',
      description: 'Building microservices',
      skills: ['Node.js'],
      budget: 4000,
      createdAt: ''
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: createdTask })
    } as any);

    const result = await createTask({
      title: 'Node.js Developer',
      description: 'Building microservices',
      skills: ['Node.js'],
      budget: 4000
    });

    expect(fetchSpy).toHaveBeenCalled();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/v1/tasks');
    expect(options?.method).toBe('POST');
    expect(options?.headers).toHaveProperty('Authorization', 'Bearer fake_jwt_token_123');
    expect(result.id).toBe('t2');
  });

  it('applyToTask should submit application with optional cover note', async () => {
    const mockApp = {
      id: 'app_1',
      taskId: 't1',
      userId: 'u1',
      status: 'APPLIED',
      coverLetter: 'Hello recruiter'
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockApp })
    } as any);

    const result = await applyToTask('t1', 'Hello recruiter');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/applications',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ taskId: 't1', coverLetter: 'Hello recruiter' })
      })
    );
    expect(result.id).toBe('app_1');
    expect(result.status).toBe('APPLIED');
  });

  it('withdrawApplication should call DELETE /api/v1/applications/:id', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as any);

    await withdrawApplication('app_123');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/applications/app_123',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('updateApplicationStatus should call PATCH /api/v1/applications/:id/status', async () => {
    const mockUpdated = {
      id: 'app_123',
      status: 'ACCEPTED'
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUpdated })
    } as any);

    const result = await updateApplicationStatus('app_123', 'ACCEPTED');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/applications/app_123/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' })
      })
    );
    expect(result.status).toBe('ACCEPTED');
  });
});
