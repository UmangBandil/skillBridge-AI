import pkg from 'ml-distance';
const { cosine } = pkg;
import { embed } from './sbert.js';

export async function rankTasks(resumeText, tasks) {
  const resumeVec = await embed(resumeText);
  return tasks
    .map((t) => ({ ...t, score: cosine(resumeVec, t.embedding || Array(768).fill(0)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}