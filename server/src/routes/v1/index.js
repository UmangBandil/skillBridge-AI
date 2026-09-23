import { Router } from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';
import applicationRoutes from './application.routes.js';
import resumeRoutes from './resume.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/applications', applicationRoutes);
router.use('/resumes', resumeRoutes);
router.use('/portfolio', portfolioRoutes);

export default router;
