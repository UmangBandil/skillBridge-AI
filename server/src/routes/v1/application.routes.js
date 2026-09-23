import { Router } from 'express';
import applicationController from '../../controllers/application.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.js';
import { createApplicationSchema, updateApplicationStatusSchema } from '../../validators/application.validator.js';

const router = Router();

// Student routes
router.post('/', protect, authorize('student'), validate(createApplicationSchema), applicationController.apply);
router.get('/my', protect, authorize('student'), applicationController.getMyApplications);
router.delete('/:id', protect, authorize('student'), applicationController.withdraw);

// Recruiter routes
router.get('/recruiter', protect, authorize('recruiter', 'admin'), applicationController.getRecruiterApplications);
router.get('/task/:taskId', protect, authorize('recruiter', 'admin'), applicationController.getTaskApplications);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), validate(updateApplicationStatusSchema), applicationController.updateStatus);

export default router;
