import crypto from 'crypto';
import logger from '../utils/logger.js';

export function requestLogger(req, res, next) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId: reqId,
      method: req.method,
      route: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || null
    });
  });

  next();
}

export default requestLogger;
