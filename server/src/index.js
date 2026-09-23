import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import config from './config/index.js';
import logger from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import prisma from './repositories/prisma.js';

// Route imports
import v1Routes from './routes/v1/index.js';
import taskRoutes from './routes/task.routes.js';
import authRoutes from './routes/auth.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import healthController from './controllers/health.controller.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Build dynamic CORS whitelist
const allowedOrigins = new Set();
if (config.FRONTEND_URL) allowedOrigins.add(config.FRONTEND_URL.replace(/\/$/, ''));
if (config.CLIENT_URL) allowedOrigins.add(config.CLIENT_URL.replace(/\/$/, ''));

if (config.CORS_ORIGIN) {
  const parts = config.CORS_ORIGIN.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  for (const part of parts) {
    if (config.NODE_ENV === 'production' && part === '*') {
      logger.warn('Wildcard CORS (*) is disabled in production with credentials; ignoring wildcard entry');
    } else {
      allowedOrigins.add(part);
    }
  }
}

// In non-production environments, allow local development ports
if (config.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://localhost:4000');
  allowedOrigins.add('http://localhost:5000');
  allowedOrigins.add('http://127.0.0.1:5173');
  allowedOrigins.add('http://127.0.0.1:4000');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.has(normalized)) {
      return callback(null, true);
    }
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// Body parsing with safe size bounds
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Structured request logging
app.use(requestLogger);

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const original = (file.originalname || '').toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || original.endsWith('.pdf');
    const isTxt = file.mimetype === 'text/plain' || original.endsWith('.txt');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   original.endsWith('.docx');

    if (isPdf || isTxt || isDocx) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOCX resume files are permitted'), false);
    }
  },
});

app.locals.upload = upload;

// Health & readiness probes (root and versioned)
app.get('/health', healthController.getHealth);
app.get('/ready', healthController.getReady);

// Version 1 API routes
app.use('/api/v1', v1Routes);

// Backward-compatible legacy routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Serve frontend static assets in production if dist directory exists
const frontendDist = join(__dirname, '..', '..', 'web', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA catch-all for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/ready')) {
      return next();
    }
    res.sendFile(join(frontendDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Centralized error handling
app.use(errorHandler);

// Server startup with graceful shutdown handling
const PORT = config.PORT;
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`SkillBridge API server running on port ${PORT} [${config.NODE_ENV}]`);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await prisma.$disconnect();
          logger.info('Prisma database client disconnected cleanly.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnection:', err);
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }

    setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcefully exiting.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
