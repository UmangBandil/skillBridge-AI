import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to cwd .env

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('development_secret_key_change_in_production_32char'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  FRONTEND_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENAI_API_KEY: z.string().optional().default(''),
  EMBEDDING_MODEL: z.string().default('Xenova/all-MiniLM-L6-v2'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(10),
  AUTH_RATE_LIMIT: z.coerce.number().default(50), // max requests per 15 min window
  UPLOAD_RATE_LIMIT: z.coerce.number().default(20), // max uploads per 15 min window
  MATCH_RATE_LIMIT: z.coerce.number().default(30), // max matching calls per 15 min window
  // Matching weights
  WEIGHT_SEMANTIC: z.coerce.number().default(0.55),
  WEIGHT_SKILL: z.coerce.number().default(0.25),
  WEIGHT_KEYWORD: z.coerce.number().default(0.10),
  WEIGHT_EXPERIENCE: z.coerce.number().default(0.10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment configuration in production');
  }
}

export const config = parsed.success ? parsed.data : envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/skillbridge',
  JWT_SECRET: process.env.JWT_SECRET || 'development_secret_key_change_in_production_32char',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  FRONTEND_URL: process.env.FRONTEND_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') ? process.env.NODE_ENV : 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
  MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB) || 10,
  AUTH_RATE_LIMIT: 50,
  UPLOAD_RATE_LIMIT: 20,
  MATCH_RATE_LIMIT: 30,
  WEIGHT_SEMANTIC: 0.55,
  WEIGHT_SKILL: 0.25,
  WEIGHT_KEYWORD: 0.10,
  WEIGHT_EXPERIENCE: 0.10,
});

export default config;
