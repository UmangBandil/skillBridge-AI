import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import userRepository from '../repositories/user.repository.js';

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

    // Refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await userRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
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
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      role: user.role,
      token,
      refreshToken
    };
  },

  refreshToken: async (tokenStr) => {
    const record = await userRepository.findRefreshToken(tokenStr);
    if (!record || record.revoked || new Date() > record.expiresAt) {
      const err = new Error('Invalid or expired refresh token');
      err.status = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    // Rotate refresh token
    await userRepository.revokeRefreshToken(tokenStr);

    const user = record.user;
    const newToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userRepository.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: newExpiresAt
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
};

export default authService;
