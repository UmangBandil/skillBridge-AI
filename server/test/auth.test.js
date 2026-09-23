import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../src/config/index.js';
import authService from '../src/services/auth.service.js';
import prisma from '../src/repositories/prisma.js';

describe('Authentication & Security', () => {
  const testStudentEmail = `test_student_${Date.now()}@auth-test.skillbridge.dev`;
  const testPassword = 'StrongPassword123!';

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'auth-test' } }
    });
  });

  describe('Password Security', () => {
    it('should hash passwords with salt rounds and verify matches', async () => {
      const hashed = await bcrypt.hash(testPassword, 10);
      expect(hashed).not.toBe(testPassword);

      const isValid = await bcrypt.compare(testPassword, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Generation & Expiry', () => {
    it('should sign and verify valid JWT payload', () => {
      const payload = { userId: 'usr_123', role: 'student', email: 'test@example.com' };
      const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, config.JWT_SECRET);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('authService', () => {
    it('should register a new student user and return sanitized object without password', async () => {
      const result = await authService.signup({
        email: testStudentEmail,
        password: testPassword,
        name: 'Test Student',
        role: 'student'
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testStudentEmail);
      expect(result.user.role).toBe('student');
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should reject signup with duplicate email', async () => {
      await expect(
        authService.signup({
          email: testStudentEmail,
          password: testPassword,
          name: 'Duplicate Attempt',
          role: 'student'
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should sign in with correct credentials and issue fresh token', async () => {
      const result = await authService.signin({
        email: testStudentEmail,
        password: testPassword
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(testStudentEmail);
    });

    it('should reject sign in with incorrect password', async () => {
      await expect(
        authService.signin({
          email: testStudentEmail,
          password: 'IncorrectPassword999'
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
