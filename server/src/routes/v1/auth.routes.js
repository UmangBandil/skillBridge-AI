import { Router } from 'express';
import authController from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { signupSchema, signinSchema, refreshTokenSchema } from '../../validators/auth.validator.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/signin', authLimiter, validate(signinSchema), authController.signin);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', protect, authController.me);

export default router;
