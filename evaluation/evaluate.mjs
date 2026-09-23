#!/usr/bin/env node
/**
 * SkillBridge AI — Empirical AI Matching Evaluation Benchmark
 * Compares Semantic-Only, Skill-Only, Keyword-Only, and Multi-Factor Hybrid Matching
 * over a curated 20-candidate synthetic evaluation benchmark.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { embed } from '../server/src/ml/embedding.service.js';
import { computeMatchScore } from '../server/src/ml/scoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runEvaluation() {
  console.log('=== SkillBridge AI Matching Benchmark Starting ===\n');

  const datasetPath = path.resolve(__dirname, 'dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const { tasks, candidates } = dataset;
  console.log(`Loaded dataset: ${tasks.length} tasks, ${candidates.length} candidates.\n`);

  // 1. Precompute Task Embeddings
  console.log('Generating task vector embeddings...');
  const embeddedTasks = [];
  for (const t of tasks) {
    const text = `${t.title} ${t.description} ${t.skills.join(' ')}`;
    const vec = await embed(text);
    embeddedTasks.push({ ...t, embedding: vec });
  }
  console.log(`Generated ${embeddedTasks.length} task embeddings.\n`);

  // 2. Models to evaluate
  const models = {
    'semantic_only': { semantic: 1.0, skill: 0.0, keyword: 0.0, experience: 0.0 },
    'skill_only':    { semantic: 0.0, skill: 1.0, keyword: 0.0, experience: 0.0 },
    'keyword_only':  { semantic: 0.0, skill: 0.0, keyword: 1.0, experience: 0.0 },
    'hybrid_engine': { semantic: 0.55, skill: 0.25, keyword: 0.10, experience: 0.10 }
  };

  const results = {};
  for (const modelKey of Object.keys(models)) {
    results[modelKey] = {
      ranks: [],
      top1Count: 0,
      top3Count: 0,
      top5Count: 0,
      reciprocalRanks: []
    };
  }

  // 3. Evaluate each candidate
  console.log('Evaluating candidates across all 4 scoring models...');
  for (const cand of candidates) {
    const resumeText = `${cand.summary} Skills: ${cand.skills.join(', ')}`;
    const resumeEmbedding = await embed(resumeText);
    const parsedResume = {
      skills: cand.skills,
      rawText: resumeText,
      experience: cand.experience
    };

    for (const [modelKey, weights] of Object.entries(models)) {
      const scoredTasks = embeddedTasks.map((t) => {
        const score = computeMatchScore({
          task: t,
          parsedResume,
          resumeEmbedding,
          weights
        });
        return {
          id: t.id,
          score: score.matchScore
        };
      });

      // Sort descending by score
      scoredTasks.sort((a, b) => b.score - a.score);

      // Find rank of expectedTaskId (1-indexed)
      const rank = scoredTasks.findIndex((t) => t.id === cand.expectedTaskId) + 1;
      const modelRes = results[modelKey];

      modelRes.ranks.push({ candidateId: cand.id, rank });
      if (rank === 1) modelRes.top1Count++;
      if (rank <= 3) modelRes.top3Count++;
      if (rank <= 5) modelRes.top5Count++;
      modelRes.reciprocalRanks.push(1 / rank);
    }
  }

  // 4. Compute aggregate metrics
  const total = candidates.length;
  const summary = {};

  for (const [modelKey, data] of Object.entries(results)) {
    const top1Acc = data.top1Count / total;
    const top3Recall = data.top3Count / total;
    const top5Recall = data.top5Count / total;
    const mrr = data.reciprocalRanks.reduce((acc, r) => acc + r, 0) / total;

    summary[modelKey] = {
      top1Accuracy: Math.round(top1Acc * 1000) / 1000,
      top3Recall: Math.round(top3Recall * 1000) / 1000,
      top5Recall: Math.round(top5Recall * 1000) / 1000,
      meanReciprocalRank: Math.round(mrr * 1000) / 1000
    };
  }

  // 5. Output and save results
  const outputPayload = {
    benchmarkTimestamp: new Date().toISOString(),
    candidateCount: total,
    taskCount: tasks.length,
    weights: {
      hybrid: models['hybrid_engine']
    },
    metrics: summary
  };

  const resultsPath = path.resolve(__dirname, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(outputPayload, null, 2));

  console.log('\n=== EMPIRICAL EVALUATION RESULTS ===\n');
  console.table(summary);
  console.log(`\nResults saved to: ${resultsPath}`);
}

runEvaluation().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
