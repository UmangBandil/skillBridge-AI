import pkg from 'ml-distance';
const { cosine } = pkg;
import { embed } from './sbert.js';

export async function rankTasks(parsedResume, tasks) {
  const skillsText = parsedResume.skills.join(" ");
  const resumeVec = await embed(skillsText);
  return tasks
    .map((t) => ({ ...t, score: cosine(resumeVec, t.embedding || Array(768).fill(0)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export { embed };