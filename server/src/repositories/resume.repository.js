import prisma from './prisma.js';

export const resumeRepository = {
  create: async ({ userId, filename, fileSize, mimeType, rawText, parsedData, skills, embedding = null }) => {
    return prisma.resume.create({
      data: {
        userId,
        filename,
        fileSize,
        mimeType,
        rawText,
        parsedData,
        skills,
        embedding
      }
    });
  },

  findLatestByUserId: async (userId) => {
    return prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id) => {
    return prisma.resume.findUnique({
      where: { id }
    });
  }
};

export default resumeRepository;
