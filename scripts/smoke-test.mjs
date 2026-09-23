#!/usr/bin/env node
/**
 * SkillBridge AI — Production Smoke Test Script
 * Executes safe, non-destructive health checks, readiness probes, and public read APIs
 * against any target deployed environment (e.g. Render, Docker, Staging).
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://skillbridge-api.onrender.com node scripts/smoke-test.mjs
 */

const BASE_URL = (process.env.BASE_URL || process.argv[2] || 'http://localhost:4000').replace(/\/$/, '');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function pass(msg) {
  console.log(`${colors.green}✓ [PASS]${colors.reset} ${msg}`);
}

function fail(msg, detail) {
  console.error(`${colors.red}✗ [FAIL]${colors.reset} ${msg}`);
  if (detail) console.error(`       ${colors.red}${detail}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.cyan}ℹ [INFO]${colors.reset} ${msg}`);
}

async function fetchJson(url, options = {}) {
  const timeoutMs = options.timeoutMs || 8000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(id);
  }
}

async function runSmokeTests() {
  console.log(`\n${colors.bold}=== SkillBridge AI Production Smoke Test ===${colors.reset}`);
  info(`Target Base URL: ${BASE_URL}\n`);

  let totalTests = 0;
  let passedTests = 0;

  async function check(name, testFn) {
    totalTests++;
    try {
      await testFn();
      pass(name);
      passedTests++;
    } catch (err) {
      fail(name, err.message);
    }
  }

  // 1. Root Liveness Probe
  await check('GET /health (Root Liveness Probe)', async () => {
    const res = await fetchJson(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (res.data?.status !== 'ok') throw new Error(`Unexpected status payload: ${JSON.stringify(res.data)}`);
  });

  // 2. Root Readiness Probe
  await check('GET /ready (Root Readiness Probe)', async () => {
    const res = await fetchJson(`${BASE_URL}/ready`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (res.data?.database !== 'connected') throw new Error(`Database not reported as connected`);
  });

  // 3. API v1 Liveness Probe
  await check('GET /api/v1/health (API v1 Liveness Probe)', async () => {
    const res = await fetchJson(`${BASE_URL}/api/v1/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (res.data?.status !== 'ok') throw new Error(`Unexpected v1 health payload`);
  });

  // 4. API v1 Readiness Probe
  await check('GET /api/v1/ready (API v1 Readiness Probe)', async () => {
    const res = await fetchJson(`${BASE_URL}/api/v1/ready`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (res.data?.database !== 'connected') throw new Error(`Database connection failed in v1 probe`);
  });

  // 5. Public Task Browsing & Pagination
  await check('GET /api/v1/tasks?limit=3 (Public Opportunity Discovery)', async () => {
    const res = await fetchJson(`${BASE_URL}/api/v1/tasks?limit=3`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (!res.data?.success || !Array.isArray(res.data?.data?.items)) {
      throw new Error(`Invalid tasks payload structure`);
    }
  });

  // 6. Safe AI Matching Recommendation Query
  await check('POST /api/v1/tasks/match (Safe Recommendation Query)', async () => {
    const res = await fetchJson(`${BASE_URL}/api/v1/tasks/match`, {
      method: 'POST',
      body: JSON.stringify({
        resumeText: 'Full stack software developer experienced with React, TypeScript, and Node.js APIs.'
      }),
      timeoutMs: 15000,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Expected 200 OK`);
    if (!res.data?.success || !Array.isArray(res.data?.data?.matches)) {
      throw new Error(`Invalid match response payload`);
    }
  });

  console.log(`\n${colors.bold}=== Smoke Test Summary ===${colors.reset}`);
  console.log(`Passed: ${passedTests}/${totalTests} tests`);

  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bold}Smoke test PASSED! Production endpoint is responsive and healthy.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${colors.red}${colors.bold}Smoke test FAILED. Review errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('Fatal smoke test runner error:', err);
  process.exit(1);
});
