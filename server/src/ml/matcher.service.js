import { embed } from './embedding.service.js';
import { computeMatchScore } from './scoring.js';
import logger from '../utils/logger.js';

/**
 * Matches and ranks opportunities for a candidate's resume
 * @param {object} parsedResume - Structured resume object
 * @param {Array} tasks - Array of task entities
 * @param {object} [options]
 * @returns {Promise<Array>} Ranked tasks with scoring breakdown
 */
export async function matchAndRankTasks(parsedResume, tasks = [], options = {}) {
  if (!parsedResume || !Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }

  // 1. Prepare candidate representation text for embedding
  const skillsList = Array.isArray(parsedResume.skills) ? parsedResume.skills : [];
  const candidateText = [
    parsedResume.summary || '',
    skillsList.join(' '),
    (parsedResume.experience || []).slice(0, 3).join(' ')
  ].join(' ').trim();

  let resumeEmbedding = null;
  let embeddingError = null;

  if (candidateText) {
    try {
      resumeEmbedding = await embed(candidateText);
    } catch (err) {
      embeddingError = err.message;
      logger.warn('Failed to generate resume embedding; operating in degraded deterministic mode', { error: err.message });
    }
  }

  // 2. Compute hybrid score for each task
  const scoredTasks = tasks.map(task => {
    const scoreResult = computeMatchScore({
      task,
      parsedResume,
      resumeEmbedding,
      weights: options.weights
    });

    const normalizedTaskSkills = Array.isArray(task.skills)
      ? task.skills
      : (typeof task.skills === 'string' ? task.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      budget: task.budget,
      status: task.status,
      createdAt: task.createdAt,
      authorId: task.authorId,
      author: task.author ? { id: task.author.id, name: task.author.name, email: task.author.email } : undefined,
      skills: normalizedTaskSkills,
      score: scoreResult.matchScore,
      matchScore: scoreResult.matchScore,
      breakdown: scoreResult.breakdown,
      matchedSkills: scoreResult.matchedSkills,
      missingSkills: scoreResult.missingSkills,
      isDegraded: scoreResult.isDegraded,
      degradedReason: scoreResult.isDegraded ? (embeddingError || 'Task or resume vector missing') : undefined,
    };
  });

  // 3. Sort by overall matchScore descending
  scoredTasks.sort((a, b) => b.matchScore - a.matchScore);

  const limit = options.limit || 20;
  return scoredTasks.slice(0, limit);
}

export default { matchAndRankTasks };
