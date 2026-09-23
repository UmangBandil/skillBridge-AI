import { matchAndRankTasks } from './matcher.service.js';
import { embed } from './embedding.service.js';

/**
 * Backward compatibility wrapper for rankTasks
 */
export async function rankTasks(parsedResume, tasks) {
  return await matchAndRankTasks(parsedResume, tasks);
}

export { embed, matchAndRankTasks };
export default { rankTasks, matchAndRankTasks, embed };