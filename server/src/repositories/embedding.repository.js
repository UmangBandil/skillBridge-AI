import prisma from './prisma.js';

/**
 * EmbeddingRepository isolates vector persistence from the rest of the application.
 * Currently persists 384-dimensional embeddings in PostgreSQL JSONB column.
 * Can be migrated to pgvector (Vector column type) or external vector DB without changing service callers.
 */
export const embeddingRepository = {
  /**
   * Saves embedding vector for a task
   * @param {string} taskId 
   * @param {number[]} vector 
   */
  saveTaskEmbedding: async (taskId, vector) => {
    return prisma.task.update({
      where: { id: taskId },
      data: { embedding: vector }
    });
  },

  /**
   * Retrieves embedding vector for a task
   * @param {string} taskId 
   * @returns {Promise<number[] | null>}
   */
  getTaskEmbedding: async (taskId) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { embedding: true }
    });
    return task && Array.isArray(task.embedding) ? task.embedding : null;
  },

  /**
   * Retrieves all tasks with valid embeddings for vector matching
   */
  getTasksWithEmbeddings: async (filter = {}) => {
    return prisma.task.findMany({
      where: {
        status: 'open',
        ...filter,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  /**
   * Saves embedding vector for a resume
   * @param {string} resumeId 
   * @param {number[]} vector 
   */
  saveResumeEmbedding: async (resumeId, vector) => {
    return prisma.resume.update({
      where: { id: resumeId },
      data: { embedding: vector }
    });
  }
};

export default embeddingRepository;
