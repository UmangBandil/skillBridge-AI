import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(150, 'Title too long').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters long').max(5000, 'Description too long').trim(),
  skills: z.array(z.string().trim().min(1)).min(1, 'At least one skill is required'),
  budget: z.coerce.number().positive('Budget must be a positive number'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(150).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  skills: z.array(z.string().trim().min(1)).min(1).optional(),
  budget: z.coerce.number().positive().optional(),
  status: z.enum(['open', 'closed', 'in_progress', 'completed', 'draft']).optional(),
});

export const taskQuerySchema = z.object({
  q: z.string().optional(),
  skill: z.string().optional(),
  status: z.string().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  sort: z.enum(['newest', 'oldest', 'budget_high', 'budget_low']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
