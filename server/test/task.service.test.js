import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import taskService from '../src/services/task.service.js';
import authService from '../src/services/auth.service.js';
import prisma from '../src/repositories/prisma.js';

describe('Task Service & Server-Side Filtering', () => {
  let author;
  let createdTaskIds = [];

  beforeAll(async () => {
    const res = await authService.signup({
      email: `task_test_author_${Date.now()}@task-test.skillbridge.dev`,
      password: 'AuthorPassword123!',
      name: 'Task Author',
      role: 'recruiter'
    });
    author = res.user;

    // Create 3 distinct tasks for filtering tests
    const t1 = await taskService.createTask({
      title: 'Senior React Developer Internship',
      description: 'Building modern interfaces with TypeScript and Tailwind CSS',
      skills: ['React', 'TypeScript', 'Tailwind'],
      budget: 5000,
      authorId: author.id
    });
    createdTaskIds.push(t1.id);

    const t2 = await taskService.createTask({
      title: 'Python Data Science Research',
      description: 'Analyze survey data and statistical insights with Pandas',
      skills: ['Python', 'Pandas', 'SQL'],
      budget: 3500,
      authorId: author.id
    });
    createdTaskIds.push(t2.id);

    const t3 = await taskService.createTask({
      title: 'DevOps & Docker Pipeline Specialist',
      description: 'Automate CI/CD pipelines with GitHub Actions and Docker',
      skills: ['Docker', 'Kubernetes', 'CI/CD'],
      budget: 6000,
      authorId: author.id
    });
    createdTaskIds.push(t3.id);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'task_test_' } }
    });
  });

  it('should search tasks by query keyword', async () => {
    const result = await taskService.getTasks({ q: 'React' });
    expect(result.items.some(t => t.title.includes('React'))).toBe(true);
    expect(result.items.every(t => t.title.includes('Python'))).toBe(false);
  });

  it('should filter tasks by specific skill', async () => {
    const result = await taskService.getTasks({ skill: 'Pandas' });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[0].skills).toContain('Pandas');
  });

  it('should filter tasks by budget bounds', async () => {
    const result = await taskService.getTasks({ minBudget: 4000, maxBudget: 5500 });
    for (const t of result.items) {
      expect(t.budget).toBeGreaterThanOrEqual(4000);
      expect(t.budget).toBeLessThanOrEqual(5500);
    }
  });

  it('should support pagination metadata (page, limit, total, totalPages)', async () => {
    const result = await taskService.getTasks({ page: 1, limit: 2 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.items.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });
});
