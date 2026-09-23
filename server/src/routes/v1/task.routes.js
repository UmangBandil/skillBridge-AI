import { Router } from 'express';
import taskController from '../../controllers/task.controller.js';
import resumeController from '../../controllers/resume.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../../validators/task.validator.js';
import { matchLimiter, uploadLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Public / Protected browsing
router.get('/', validate(taskQuerySchema, 'query'), taskController.getTasks);
router.get('/:id', taskController.getTaskById);

// Recruiter creation and management
router.post('/', protect, authorize('recruiter', 'admin'), validate(createTaskSchema), taskController.createTask);
router.put('/:id', protect, authorize('recruiter', 'admin'), validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', protect, authorize('recruiter', 'admin'), taskController.deleteTask);

// Matching & parsing
router.post('/match', protect, matchLimiter, taskController.matchTasks);
router.post('/parse', protect, resumeController.parseText);

// Multer upload endpoint (legacy and v1 support)
router.post('/upload', protect, uploadLimiter, (req, res, next) => {
  const upload = req.app.locals.upload;
  if (!upload) {
    return res.status(500).json({ error: 'Upload service not configured' });
  }
  upload.single('resume')(req, res, (err) => {
    if (err) return next(err);
    resumeController.uploadResume(req, res, next);
  });
});

export default router;
