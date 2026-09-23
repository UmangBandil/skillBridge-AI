import prisma from './prisma.js';

export const applicationRepository = {
  create: async ({ userId, taskId, coverLetter }) => {
    return prisma.application.create({
      data: {
        userId,
        taskId,
        coverLetter,
        status: 'APPLIED',
      },
      include: {
        task: {
          select: { id: true, title: true, budget: true, status: true, authorId: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  findByUserAndTask: async (userId, taskId) => {
    return prisma.application.findUnique({
      where: {
        userId_taskId: { userId, taskId }
      }
    });
  },

  findById: async (id) => {
    return prisma.application.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            author: { select: { id: true, name: true, email: true } }
          }
        },
        user: {
          select: { id: true, name: true, email: true, portfolio: true }
        }
      }
    });
  },

  findByUserId: async (userId) => {
    return prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
            budget: true,
            status: true,
            createdAt: true,
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  },

  findByTaskId: async (taskId) => {
    return prisma.application.findMany({
      where: { taskId },
      orderBy: { appliedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            portfolio: true,
            resumes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { id: true, filename: true, skills: true, parsedData: true }
            }
          }
        }
      }
    });
  },

  findByRecruiterId: async (recruiterId) => {
    return prisma.application.findMany({
      where: {
        task: { authorId: recruiterId }
      },
      orderBy: { appliedAt: 'desc' },
      include: {
        task: {
          select: { id: true, title: true, budget: true, status: true }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            portfolio: true,
            resumes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { id: true, filename: true, skills: true }
            }
          }
        }
      }
    });
  },

  updateStatus: async (id, status) => {
    return prisma.application.update({
      where: { id },
      data: { status },
      include: {
        task: {
          select: { id: true, title: true, authorId: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
};

export default applicationRepository;
