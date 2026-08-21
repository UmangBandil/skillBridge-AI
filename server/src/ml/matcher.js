import pkg from 'ml-distance';
const cosine = pkg.similarity.cosine;
import { embed } from '../embed.js';

/**
 * Rank and match tasks based on resume skills
 * @param {object} parsedResume - Parsed resume object with skills array
 * @param {array} tasks - Array of task objects
 * @returns {Promise<array>} - Ranked tasks with scores
 */
export async function rankTasks(parsedResume, tasks) {
  // Validate input
  if (!parsedResume || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  
  // Extract skills - handle both old and new parser format
  let skills = [];
  if (Array.isArray(parsedResume.skills)) {
    skills = parsedResume.skills;
  } else if (typeof parsedResume.skills === 'string') {
    skills = parsedResume.skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // If no skills found, return first 10 tasks
  if (!skills || skills.length === 0) {
    return tasks.slice(0, 10);
  }
  
  const skillsText = skills.join(" ").trim();
  if (!skillsText) {
    return tasks.slice(0, 10);
  }
  
  try {
    const resumeVec = await embed(skillsText);
    
    return tasks
      .map((t) => {
        // Handle both array and string task skills
        const taskSkills = Array.isArray(t.skills) 
          ? t.skills 
          : (typeof t.skills === 'string' ? t.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
        
        return {
          ...t,
          // Only compute cosine for real array embeddings. Old rows (or a
          // Float32Array stored via Prisma) may be strings/base64 — treat
          // those as unscored rather than producing NaN.
          score: Array.isArray(t.embedding) && t.embedding.length > 0
            ? cosine(Array.from(resumeVec), t.embedding)
            : 0,
          matchedSkills: taskSkills.filter(skill => 
            skills.some(resumeSkill => 
              resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
              skill.toLowerCase().includes(resumeSkill.toLowerCase())
            )
          ),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    console.error('Error in rankTasks:', error);
    // Fallback: return first 10 tasks without scores
    return tasks.slice(0, 10);
  }
}

export { embed };