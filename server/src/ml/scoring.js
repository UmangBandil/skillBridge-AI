import mlDistance from 'ml-distance';
import config from '../config/index.js';

const cosineSimilarity = mlDistance.similarity.cosine;

/**
 * Calculates cosine similarity between two float vectors.
 * Clamps result to [0, 1].
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  if (vecA.length !== vecB.length) {
    return 0;
  }
  try {
    const raw = cosineSimilarity(vecA, vecB);
    if (isNaN(raw) || !isFinite(raw)) return 0;
    // Cosine similarity for normalized vectors is typically between -1 and 1.
    // For text embeddings, values generally fall between 0 and 1.
    return Math.max(0, Math.min(1, Math.round(raw * 1000) / 1000));
  } catch {
    return 0;
  }
}

/**
 * Calculates skill overlap score and details
 * @param {string[]} resumeSkills 
 * @param {string[]} taskSkills 
 */
export function calculateSkillOverlap(resumeSkills = [], taskSkills = []) {
  if (!Array.isArray(taskSkills) || taskSkills.length === 0) {
    return { skillScore: 1.0, matchedSkills: [], missingSkills: [] };
  }

  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());
  const matchedSkills = [];
  const missingSkills = [];

  for (const tSkill of taskSkills) {
    const tLower = tSkill.toLowerCase().trim();
    const hasSkill = normalizedResumeSkills.some(rSkill => 
      rSkill === tLower || 
      rSkill.includes(tLower) || 
      tLower.includes(rSkill)
    );

    if (hasSkill) {
      matchedSkills.push(tSkill);
    } else {
      missingSkills.push(tSkill);
    }
  }

  const skillScore = Math.round((matchedSkills.length / taskSkills.length) * 1000) / 1000;
  return { skillScore, matchedSkills, missingSkills };
}

/**
 * Calculates exact keyword overlap between task title/description and resume text/skills
 */
export function calculateKeywordScore(taskText = '', resumeText = '', resumeSkills = []) {
  if (!taskText) return 0;
  
  const tokenize = (str) => {
    return new Set(
      str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3)
    );
  };

  const taskTokens = tokenize(taskText);
  if (taskTokens.size === 0) return 0;

  const resumeTokens = tokenize(`${resumeText} ${resumeSkills.join(' ')}`);
  let intersectionCount = 0;

  for (const token of taskTokens) {
    if (resumeTokens.has(token)) {
      intersectionCount++;
    }
  }

  return Math.min(1, Math.round((intersectionCount / Math.min(taskTokens.size, 15)) * 1000) / 1000);
}

/**
 * Evaluates experience relevance
 */
export function calculateExperienceScore(experienceEntries = []) {
  if (!Array.isArray(experienceEntries) || experienceEntries.length === 0) {
    return 0.2; // Base baseline for students without listed experience
  }
  // Count meaningful experience lines
  const count = experienceEntries.length;
  if (count >= 5) return 1.0;
  if (count >= 3) return 0.85;
  if (count >= 1) return 0.65;
  return 0.3;
}

/**
 * Hybrid matching score calculator with transparent breakdown
 */
export function computeMatchScore({
  task,
  parsedResume,
  resumeEmbedding = null,
  weights = {
    semantic: config.WEIGHT_SEMANTIC,
    skill: config.WEIGHT_SKILL,
    keyword: config.WEIGHT_KEYWORD,
    experience: config.WEIGHT_EXPERIENCE,
  }
}) {
  const taskSkills = Array.isArray(task.skills) 
    ? task.skills 
    : (typeof task.skills === 'string' ? task.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
  
  const resumeSkills = parsedResume.skills || [];
  const { skillScore, matchedSkills, missingSkills } = calculateSkillOverlap(resumeSkills, taskSkills);
  
  const taskText = `${task.title || ''} ${task.description || ''}`;
  const resumeText = parsedResume.summary || parsedResume.rawText || '';
  const keywordScore = calculateKeywordScore(taskText, resumeText, resumeSkills);
  const experienceScore = calculateExperienceScore(parsedResume.experience);

  // Check if semantic matching is possible
  const hasTaskEmbedding = Array.isArray(task.embedding) && task.embedding.length > 0;
  const hasResumeEmbedding = Array.isArray(resumeEmbedding) && resumeEmbedding.length > 0;
  const isDegraded = !hasTaskEmbedding || !hasResumeEmbedding;

  let semanticScore = 0;
  let combinedScore = 0;

  if (!isDegraded) {
    semanticScore = calculateCosineSimilarity(resumeEmbedding, task.embedding);
    combinedScore = (
      semanticScore * weights.semantic +
      skillScore * weights.skill +
      keywordScore * weights.keyword +
      experienceScore * weights.experience
    );
  } else {
    // In degraded mode, redistribute the semantic weight across deterministic factors
    // skill (60%), keyword (25%), experience (15%)
    combinedScore = (
      skillScore * 0.60 +
      keywordScore * 0.25 +
      experienceScore * 0.15
    );
  }

  const finalScore = Math.max(0, Math.min(1, Math.round(combinedScore * 100) / 100));

  return {
    matchScore: finalScore,
    breakdown: {
      semantic: isDegraded ? null : Math.round(semanticScore * 100) / 100,
      skills: Math.round(skillScore * 100) / 100,
      keywords: Math.round(keywordScore * 100) / 100,
      experience: Math.round(experienceScore * 100) / 100,
    },
    matchedSkills,
    missingSkills,
    isDegraded,
    weights: isDegraded 
      ? { skills: 0.60, keywords: 0.25, experience: 0.15, semantic: 0 } 
      : weights,
  };
}

export default {
  calculateCosineSimilarity,
  calculateSkillOverlap,
  calculateKeywordScore,
  calculateExperienceScore,
  computeMatchScore
};
