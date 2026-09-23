import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import userRepository from '../repositories/user.repository.js';
import logger from '../utils/logger.js';

/**
 * Computes a SHA-256 hash of a refresh token string for secure persistence
 */
const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const authService = {
  signup: async ({ email, password, name, role }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('User with this email already exists');
      err.status = 400;
      err.code = 'USER_ALREADY_EXISTS';
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Generate random refresh token, store SHA-256 hash in DB, return plaintext to user
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = hashRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await userRepository.createRefreshToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: refreshExpiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  },

  signin: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = hashRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: refreshExpiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      role: user.role,
      token,
      refreshToken,
    };
  },

  refreshToken: async (tokenStr) => {
    if (!tokenStr || typeof tokenStr !== 'string') {
      const err = new Error('Refresh token is required');
      err.status = 400;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const hashed = hashRefreshToken(tokenStr);
    const record = await userRepository.findRefreshToken(hashed);

    // Reuse detection: If token exists but was already revoked, someone may have compromised it.
    // Invalidate all active sessions for the user as a safety precaution.
    if (record && record.revoked) {
      logger.warn('Revoked refresh token presented. Invalidate all user sessions for safety.', {
        userId: record.userId,
      });
      await userRepository.revokeAllUserRefreshTokens(record.userId);
      const err = new Error('Refresh token has been revoked or reused. All sessions terminated.');
      err.status = 401;
      err.code = 'REFRESH_TOKEN_REUSE';
      throw err;
    }

    if (!record || new Date() > record.expiresAt) {
      const err = new Error('Invalid or expired refresh token');
      err.status = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    // Rotate: Revoke the used refresh token immediately
    await userRepository.revokeRefreshToken(hashed);

    const user = record.user;
    const newToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Issue a new refresh token and persist its hash
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newHashedToken = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken({
      userId: user.id,
      token: newHashedToken,
      expiresAt: newExpiresAt,
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  logout: async (tokenStr) => {
    if (tokenStr && typeof tokenStr === 'string') {
      const hashed = hashRefreshToken(tokenStr);
      try {
        await userRepository.revokeRefreshToken(hashed);
      } catch (err) {
        // Safe to ignore if token wasn't found or already revoked
        logger.debug('Refresh token not found during logout revoke', { error: err.message });
      }
    }
    return { message: 'Logged out successfully' };
  },
};

export default authService;
