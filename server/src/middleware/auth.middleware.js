import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import userRepository from '../repositories/user.repository.js';

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization header provided'
      }
    });
  }

  const parts = bearer.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Malformed authorization header (Bearer token required)'
      }
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload'
        }
      });
    }

    // Account existence check
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists'
        }
      });
    }

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired'
        }
      });
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }
};

/**
 * Restricts access to specific user roles
 * @param  {...string} roles - e.g. 'recruiter', 'student', 'admin'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied: requires ${roles.join(' or ')} role`
        }
      });
    }
    next();
  };
};

export default { protect, authorize };