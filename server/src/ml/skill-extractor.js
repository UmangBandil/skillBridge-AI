// Comprehensive taxonomy of technical, domain, and soft skills
export const SKILL_KEYWORDS = {
  languages: [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html',
    'css', 'perl', 'groovy', 'lua', 'dart', 'clojure', 'haskell', 'erlang',
    'bash', 'shell', 'solidity'
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby', 'vite',
    'webpack', 'tailwind', 'bootstrap', 'material-ui', 'jquery', 'redux', 'mobx',
    'zustand', 'html5', 'css3', 'sass', 'less', 'cypress', 'playwright', 'jest'
  ],
  backend: [
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'asp.net', '.net', 'rails', 'laravel', 'nest.js', 'postgresql', 'mysql',
    'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'sqlite',
    'graphql', 'rest', 'restful api', 'grpc', 'prisma', 'typeorm'
  ],
  devops_cloud: [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'terraform',
    'ansible', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'linux',
    'nginx', 'apache', 'prometheus', 'grafana', 'datadog', 'cloudformation'
  ],
  data_ai: [
    'machine learning', 'deep learning', 'nlp', 'natural language processing',
    'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
    'langchain', 'llm', 'rag', 'openai', 'hugging face', 'transformers', 'spark',
    'data analysis', 'data science'
  ],
  tools_practices: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma',
    'postman', 'agile', 'scrum', 'kanban', 'unit testing', 'system design',
    'microservices', 'stripe', 'websockets', 'kafka', 'rabbitmq'
  ],
  soft_skills: [
    'communication', 'teamwork', 'leadership', 'problem solving', 'adaptability',
    'time management', 'critical thinking', 'project management', 'mentoring'
  ]
};

const ALL_SKILLS_FLAT = Object.values(SKILL_KEYWORDS).flat();

/**
 * Extracts a normalized, deduplicated list of skills from text using boundary matching
 * @param {string} text - The input text
 * @returns {string[]} Array of matched skill strings (lowercase)
 */
export function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const matched = new Set();

  for (const skill of ALL_SKILLS_FLAT) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (regex.test(lower)) {
      matched.add(skill.toLowerCase());
    }
  }

  return Array.from(matched);
}
