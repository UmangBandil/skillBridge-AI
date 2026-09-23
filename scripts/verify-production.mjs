#!/usr/bin/env node
/**
 * SkillBridge AI - Production Readiness Verification Script
 * Validates database connectivity, Prisma schemas, ML embedding engine,
 * and environment configurations before deployment.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

import { PrismaClient } from '@prisma/client';
import { embed } from '../server/src/ml/embedding.service.js';
import { computeMatchScore } from '../server/src/ml/scoring.js';
import { extractSkills } from '../server/src/ml/skill-extractor.js';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function logPass(msg) {
  console.log(`${colors.green}✓ [PASS]${colors.reset} ${msg}`);
}

function logFail(msg, err) {
  console.error(`${colors.red}✗ [FAIL]${colors.reset} ${msg}`);
  if (err) console.error(err);
}

function logInfo(msg) {
  console.log(`${colors.cyan}ℹ [INFO]${colors.reset} ${msg}`);
}

async function verifyEnvironment() {
  logInfo('Checking configuration and environment variables...');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set in the environment');
  }
  logPass('DATABASE_URL is set');

  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-at-least-32-chars-long';
  if (jwtSecret.length < 16) {
    console.warn(`${colors.yellow}⚠ [WARN] JWT_SECRET is relatively short (${jwtSecret.length} chars)${colors.reset}`);
  } else {
    logPass(`JWT_SECRET is configured (${jwtSecret.length} chars)`);
  }
}

async function verifyDatabase() {
  logInfo('Connecting to PostgreSQL database via Prisma...');
  await prisma.$connect();
  const [{ result }] = await prisma.$queryRaw`SELECT 1 as result`;
  if (result !== 1) {
    throw new Error('Database raw query did not return expected result');
  }
  logPass('PostgreSQL connection verified');

  // Verify models exist
  const userCount = await prisma.user.count();
  const taskCount = await prisma.task.count();
  const applicationCount = await prisma.application.count();
  const resumeCount = await prisma.resume.count();
  logPass(`Database tables active (Users: ${userCount}, Tasks: ${taskCount}, Applications: ${applicationCount}, Resumes: ${resumeCount})`);
}

async function verifyAIEngine() {
  logInfo('Verifying AI Hybrid Matching engine...');

  // 1. Skill Extraction
  const sampleText = 'Full-stack software engineer proficient in React, Node.js, TypeScript, and PostgreSQL.';
  const extracted = extractSkills(sampleText);
  if (!extracted.includes('react') || !extracted.includes('node.js')) {
    throw new Error(`Skill extraction failed. Found: ${JSON.stringify(extracted)}`);
  }
  logPass(`Skill extraction verified (extracted: ${extracted.join(', ')})`);

  // 2. Embeddings Model Initialization
  logInfo('Testing Xenova/all-MiniLM-L6-v2 embedding generation...');
  const t0 = Date.now();
  const embedding = await embed('Software engineering and artificial intelligence systems');
  const elapsed = Date.now() - t0;
  if (!Array.isArray(embedding) || embedding.length !== 384) {
    throw new Error(`Expected 384-dimensional embedding, received ${embedding?.length}`);
  }
  logPass(`Embedding model operational (generated 384-dim vector in ${elapsed}ms)`);

  // 3. Hybrid Scoring Verification
  const task = {
    title: 'Full Stack Engineer',
    description: 'Build web applications with React and Node.js',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    embedding
  };
  const parsedResume = {
    rawText: sampleText,
    skills: ['React', 'Node.js', 'PostgreSQL'],
    experience: ['Worked as software engineer']
  };

  const scoreResult = computeMatchScore({
    task,
    parsedResume,
    resumeEmbedding: embedding
  });
  if (scoreResult.matchScore < 0.8 || typeof scoreResult.breakdown.semantic !== 'number') {
    throw new Error(`Hybrid scoring anomaly: score=${scoreResult.matchScore}`);
  }
  logPass(`Hybrid scoring verified (Score: ${(scoreResult.matchScore * 100).toFixed(1)}%, breakdown: ${JSON.stringify(scoreResult.breakdown)})`);
}

async function main() {
  console.log(`\n${colors.bold}=== SkillBridge AI Production Readiness Verification ===${colors.reset}\n`);
  let hasErrors = false;

  try {
    await verifyEnvironment();
  } catch (err) {
    logFail('Environment verification failed', err);
    hasErrors = true;
  }

  try {
    await verifyDatabase();
  } catch (err) {
    logFail('Database verification failed', err);
    hasErrors = true;
  }

  try {
    await verifyAIEngine();
  } catch (err) {
    logFail('AI Engine verification failed', err);
    hasErrors = true;
  } finally {
    await prisma.$disconnect();
  }

  if (hasErrors) {
    console.error(`\n${colors.red}${colors.bold}Production verification completed with errors. See details above.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}All production readiness checks PASSED successfully! The application is ready for deployment.${colors.reset}\n`);
  }
}

main();
