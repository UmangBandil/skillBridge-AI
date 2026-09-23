import prisma from './prisma.js';

export const taskRepository = {
  findById: async (id) => {
    return prisma.task.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true }
        },
        applications: {
          select: { id: true, userId: true, status: true }
        }
      }
    });
  },

  findManyPaginated: async ({
    q,
    skill,
    status,
    minBudget,
    maxBudget,
    authorId,
    sort = 'newest',
    page = 1,
    limit = 20
  }) => {
    const where = {};

    // Filter by status if provided (defaulting to open if not specified, or allow all if status='all')
    if (status && status !== 'all') {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (minBudget != null || maxBudget != null) {
      where.budget = {};
      if (minBudget != null) where.budget.gte = Number(minBudget);
      if (maxBudget != null) where.budget.lte = Number(maxBudget);
    }

    // Search query on title, description
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { skills: { contains: term, mode: 'insensitive' } }
      ];
    }

    // Filter by specific skill
    if (skill && skill.trim()) {
      where.skills = { contains: skill.trim(), mode: 'insensitive' };
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'budget_high') orderBy = { budget: 'desc' };
    if (sort === 'budget_low') orderBy = { budget: 'asc' };

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { applications: true }
          }
        }
      })
    ]);

    return {
      items: tasks,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    };
  },

  create: async ({ title, description, skills, budget, authorId, embedding = null }) => {
    return prisma.task.create({
      data: {
        title,
        description,
        skills,
        budget,
        authorId,
        embedding,
        status: 'open'
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  update: async (id, data) => {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  delete: async (id) => {
    return prisma.task.delete({
      where: { id }
    });
  }
};

export default taskRepository;
