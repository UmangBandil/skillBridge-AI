import { Router } from 'express';
import resumeController from '../../controllers/resume.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { uploadLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

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

router.post('/parse', protect, resumeController.parseText);
router.get('/latest', protect, resumeController.getLatestResume);

export default router;
