import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import authService from '../src/services/auth.service.js';
import prisma from '../src/repositories/prisma.js';
import config from '../src/config/index.js';

describe('Authentication & Authorization Hardening Suite', () => {
  const testStudentEmail = `harden-student-${Date.now()}@auth-hard.skillbridge.dev`;
  const testRecruiterEmail = `harden-recruiter-${Date.now()}@auth-hard.skillbridge.dev`;
  let studentUser;
  let recruiterUser;

  beforeAll(async () => {
    studentUser = await authService.signup({
      email: testStudentEmail,
      password: 'StrongPassword123!',
      name: 'Hardened Student',
      role: 'student'
    });

    recruiterUser = await authService.signup({
      email: testRecruiterEmail,
      password: 'StrongPassword123!',
      name: 'Hardened Recruiter',
      role: 'recruiter'
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { userId: studentUser.user.id },
          { userId: recruiterUser.user.id }
        ]
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [testStudentEmail, testRecruiterEmail] }
      }
    });
  });

  it('never returns password hashes in user signup or signin responses', async () => {
    expect(studentUser.user).not.toHaveProperty('password');
    const signinResult = await authService.signin({
      email: testStudentEmail,
      password: 'StrongPassword123!'
    });
    expect(signinResult.user).not.toHaveProperty('password');
  });

  it('hashes refresh tokens before storing in database (no plaintext in DB)', async () => {
    const signinResult = await authService.signin({
      email: testStudentEmail,
      password: 'StrongPassword123!'
    });

    const plaintextRefreshToken = signinResult.refreshToken;
    expect(plaintextRefreshToken).toBeDefined();

    // Verify plaintext token does NOT exist directly in the database
    const directSearch = await prisma.refreshToken.findFirst({
      where: { token: plaintextRefreshToken }
    });
    expect(directSearch).toBeNull();

    // Verify that a hashed entry exists for this user
    const dbRecord = await prisma.refreshToken.findFirst({
      where: { userId: studentUser.user.id, revoked: false },
      orderBy: { createdAt: 'desc' }
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.token).not.toBe(plaintextRefreshToken);
    expect(dbRecord.token.length).toBe(64); // SHA-256 hex string length
  });

  it('rotates refresh token and returns a new access + refresh pair', async () => {
    const signinResult = await authService.signin({
      email: testStudentEmail,
      password: 'StrongPassword123!'
    });

    const oldRefreshToken = signinResult.refreshToken;
    const rotated = await authService.refreshToken(oldRefreshToken);

    expect(rotated.token).toBeDefined();
    expect(rotated.refreshToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(oldRefreshToken);
  });

  it('detects refresh token reuse and revokes all active sessions for that user', async () => {
    const signinResult = await authService.signin({
      email: testStudentEmail,
      password: 'StrongPassword123!'
    });

    const tokenToReuse = signinResult.refreshToken;

    // First use: successful rotation
    await authService.refreshToken(tokenToReuse);

    // Second use of the same (now revoked) token: must trigger reuse detection
    await expect(authService.refreshToken(tokenToReuse)).rejects.toThrow(/revoked or reused/);

    // Verify all active refresh tokens for this user were revoked
    const activeTokens = await prisma.refreshToken.findMany({
      where: { userId: studentUser.user.id, revoked: false }
    });
    expect(activeTokens.length).toBe(0);
  });

  it('rejects expired access tokens', () => {
    const expiredToken = jwt.sign(
      { userId: studentUser.user.id, role: 'student', email: studentUser.user.email },
      config.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    expect(() => {
      jwt.verify(expiredToken, config.JWT_SECRET);
    }).toThrow(jwt.TokenExpiredError);
  });

  it('revokes refresh token upon logout', async () => {
    const signinResult = await authService.signin({
      email: testStudentEmail,
      password: 'StrongPassword123!'
    });

    const activeToken = signinResult.refreshToken;
    await authService.logout(activeToken);

    // Trying to refresh after logout must be rejected
    await expect(authService.refreshToken(activeToken)).rejects.toThrow();
  });
});
