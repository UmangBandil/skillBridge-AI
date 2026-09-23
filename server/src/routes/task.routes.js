import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import resumeController from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { matchLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Middleware to mark legacy route calls
router.use((req, res, next) => {
  req.isLegacyRoute = true;
  next();
});

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', protect, taskController.createTask);
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
router.post('/match', protect, matchLimiter, taskController.matchTasks);
router.post('/parse', protect, resumeController.parseText);

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