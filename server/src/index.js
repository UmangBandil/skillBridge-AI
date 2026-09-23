import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import config from './config/index.js';
import logger from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';

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

// CORS Configuration
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development allow all
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// Body parsing with safe size bounds
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Structured request logging
app.use(requestLogger);

// Configure multer for memory file buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const original = file.originalname.toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || original.endsWith('.pdf');
    const isTxt = file.mimetype === 'text/plain' || original.endsWith('.txt');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.mimetype === 'application/msword' || 
                   original.endsWith('.docx');

    if (isPdf || isTxt || isDocx) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOCX resume files are permitted'), false);
    }
  }
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

// Serve frontend static assets in production
const frontendDist = join(__dirname, '..', '..', 'web', 'dist');
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

// Centralized error handling
app.use(errorHandler);

// Server startup
const PORT = config.PORT;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`SkillBridge API server running on port ${PORT} [${config.NODE_ENV}]`);
  });
}

export default app;
