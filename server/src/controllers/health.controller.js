import prisma from '../repositories/prisma.js';

export const healthController = {
  // Liveness probe: responds fast to verify Node process is running
  getHealth: (req, res) => {
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'skillbridge-api'
    });
  },

  // Readiness probe: verifies DB connectivity and essential subsystems
  getReady: async (req, res) => {
    const checks = {
      database: 'UNKNOWN',
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Check PostgreSQL via raw query
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'UP';

      return res.json({
        status: 'READY',
        checks
      });
    } catch (dbError) {
      checks.database = 'DOWN';
      return res.status(503).json({
        status: 'NOT_READY',
        checks,
        error: dbError.message
      });
    }
  }
};

export default healthController;
