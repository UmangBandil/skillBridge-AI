import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, signinSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/signin', authLimiter, validate(signinSchema), authController.signin);

export default router;