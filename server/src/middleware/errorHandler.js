import multer from 'multer';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled application error', err, {
    requestId: req.id,
    path: req.originalUrl,
    method: req.method
  });

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Uploaded file exceeds the maximum allowed size.'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: err.message
      }
    });
  }

  // Custom application errors with status
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'BAD_REQUEST',
        message: err.message
      }
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A resource with this identifier already exists.'
      }
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.'
      }
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected internal error occurred.'
    }
  });
}

export default errorHandler;
