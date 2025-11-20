import pkg from 'ml-distance';
const { cosine } = pkg;
import { embed } from '../embed.js';

export async function rankTasks(parsedResume, tasks) {
  // Ensure we have skills to work with
  if (!parsedResume || !parsedResume.skills || parsedResume.skills.length === 0) {
    // If no skills found, return tasks without scores
    return tasks.slice(0, 10);
  }
  
  const skillsText = parsedResume.skills.join(" ").trim();
  if (!skillsText) {
    // If skills text is empty, return tasks without scores
    return tasks.slice(0, 10);
  }
  
  const resumeVec = await embed(skillsText);
  return tasks
    .map((t) => ({ ...t, score: cosine(resumeVec, t.embedding || Array(768).fill(0)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export { embed };