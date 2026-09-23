import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

// Auth limiter: login/signup protection
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.AUTH_RATE_LIMIT || 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  }
});

// Upload limiter: prevent file bomb attacks
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.UPLOAD_RATE_LIMIT || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many resume uploads. Please try again after 15 minutes.'
    }
  }
});

// Matching limiter: prevent expensive embedding/transformer CPU exhaustion
export const matchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.MATCH_RATE_LIMIT || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many matching requests. Please try again after a few moments.'
    }
  }
});

export default { authLimiter, uploadLimiter, matchLimiter };
