import { z } from 'zod';

export const createApplicationSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  coverLetter: z.string().max(2000, 'Cover letter cannot exceed 2000 characters').optional().default(''),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN']),
});
