import prisma from './prisma.js';

export const userRepository = {
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        portfolio: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  },

  create: async ({ email, password, name, role }) => {
    return prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        role: role || 'student',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
  },

  updatePortfolio: async (userId, portfolioData) => {
    return prisma.user.update({
      where: { id: userId },
      data: { portfolio: portfolioData },
      select: { id: true, portfolio: true, name: true }
    });
  },

  // Refresh tokens
  createRefreshToken: async ({ userId, token, expiresAt }) => {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt }
    });
  },

  findRefreshToken: async (token) => {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
  },

  revokeRefreshToken: async (token) => {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true }
    });
  },

  revokeAllUserRefreshTokens: async (userId) => {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true }
    });
  }
};

export default userRepository;
