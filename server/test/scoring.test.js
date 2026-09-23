import { describe, it, expect } from 'vitest';
import {
  calculateCosineSimilarity,
  calculateSkillOverlap,
  calculateKeywordScore,
  calculateExperienceScore,
  computeMatchScore
} from '../src/ml/scoring.js';

describe('AI Matching Scoring Engine', () => {
  describe('calculateCosineSimilarity', () => {
    it('should return 1.0 for identical vectors', () => {
      const vec = [0.2, 0.5, 0.8];
      const sim = calculateCosineSimilarity(vec, vec);
      expect(sim).toBeCloseTo(1.0, 2);
    });

    it('should return 0 for orthogonal or empty vectors', () => {
      expect(calculateCosineSimilarity([], [])).toBe(0);
      expect(calculateCosineSimilarity(null, [1, 2])).toBe(0);
      expect(calculateCosineSimilarity([1, 0], [0, 1])).toBe(0);
    });
  });

  describe('calculateSkillOverlap', () => {
    it('should accurately calculate skill match ratio, matched skills, and missing skills', () => {
      const taskSkills = ['React', 'TypeScript', 'Node.js', 'Docker'];
      const resumeSkills = ['react', 'typescript', 'python'];

      const result = calculateSkillOverlap(resumeSkills, taskSkills);

      expect(result.skillScore).toBe(0.5); // 2 out of 4
      expect(result.matchedSkills).toEqual(['React', 'TypeScript']);
      expect(result.missingSkills).toEqual(['Node.js', 'Docker']);
    });

    it('should return 1.0 when all task skills are matched', () => {
      const taskSkills = ['Python', 'SQL'];
      const resumeSkills = ['python', 'sql', 'docker', 'react'];
      const result = calculateSkillOverlap(resumeSkills, taskSkills);

      expect(result.skillScore).toBe(1.0);
      expect(result.missingSkills).toEqual([]);
    });
  });

  describe('calculateKeywordScore', () => {
    it('should compute lexical overlap score between task description and resume', () => {
      const taskText = 'Building scalable frontend architectures with high performance';
      const resumeText = 'Frontend engineer specializing in building high performance web architectures';
      const score = calculateKeywordScore(taskText, resumeText, ['frontend']);

      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThanOrEqual(1.0);
    });
  });

  describe('computeMatchScore (Hybrid Scoring)', () => {
    it('should compute weighted hybrid score with transparent breakdown', () => {
      const task = {
        title: 'React & Node Intern',
        description: 'Build microservices with Node.js and Express',
        skills: ['React', 'Node.js', 'PostgreSQL'],
        embedding: [0.1, 0.3, 0.5]
      };

      const parsedResume = {
        summary: 'Experienced with React and Node.js microservices',
        skills: ['react', 'node.js', 'javascript'],
        experience: ['Software Developer at Startup', 'Intern at Lab']
      };

      const resumeEmbedding = [0.1, 0.3, 0.5]; // identical for test

      const result = computeMatchScore({
        task,
        parsedResume,
        resumeEmbedding
      });

      expect(result.isDegraded).toBe(false);
      expect(result.matchScore).toBeGreaterThan(0.7);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.semantic).toBe(1.0);
      expect(result.breakdown.skills).toBeCloseTo(0.67, 1);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('Node.js');
      expect(result.missingSkills).toContain('PostgreSQL');
    });

    it('should switch to degraded mode and flag isDegraded when embedding is missing', () => {
      const task = {
        title: 'Backend Engineer',
        skills: ['Java', 'Spring'],
        embedding: null // missing vector
      };

      const parsedResume = {
        skills: ['java', 'spring'],
        experience: []
      };

      const result = computeMatchScore({
        task,
        parsedResume,
        resumeEmbedding: null
      });

      expect(result.isDegraded).toBe(true);
      expect(result.breakdown.semantic).toBeNull();
      expect(result.matchScore).toBeGreaterThan(0.5);
    });
  });
});
