// Comprehensive list of common technical and professional skills
const SKILL_KEYWORDS = {
  // Programming Languages
  languages: [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 
    'css', 'perl', 'groovy', 'lua', 'dart', 'clojure', 'haskell', 'erlang',
    'vb.net', 'objective-c', 'assembly', 'bash', 'shell'
  ],
  
  // Front-end Technologies
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby', 'vite',
    'webpack', 'tailwind', 'bootstrap', 'material', 'jquery', 'backbone.js',
    'ember.js', 'preact', 'stimulus', 'solid.js', 'astro', 'qwik', 'htmx',
    'alpine.js', 'hotwire', 'pug', 'ejs', 'handlebars', 'enzyme', 'cypress',
    'playwright', 'puppeteer', 'testing library', 'enzyme', 'mocha', 'jest'
  ],
  
  // Back-end & Databases
  backend: [
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'asp.net', '.net core', 'rails', 'sinatra', 'laravel', 'symfony', 'gin',
    'echo', 'fiber', 'actix', 'rocket', 'phoenix', 'elixir', 'ecto',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'firebase', 'cassandra', 'cockroachdb', 'oracle', 'mssql', 'sqlite',
    'mariadb', 'neo4j', 'influxdb', 'couchdb', 'arangodb', 'membrane'
  ],
  
  // DevOps & Cloud
  devops: [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'heroku',
    'jenkins', 'travis ci', 'github actions', 'gitlab ci', 'circleci',
    'terraform', 'ansible', 'vagrant', 'cloudformation', 'sam', 'pulumi',
    'nginx', 'apache', 'caddy', 'haproxy', 'load balancing', 'monitoring',
    'prometheus', 'grafana', 'elk stack', 'datadog', 'new relic', 's3'
  ],
  
  // Data & AI/ML
  data: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly',
    'spark', 'hadoop', 'hive', 'pig', 'mlflow', 'airflow', 'dbt',
    'nltk', 'spacy', 'gensim', 'computer vision', 'opencv', 'yolo',
    'hugging face', 'langchain', 'bert', 'gpt', 'llm', 'rag'
  ],
  
  // Other Tools & Frameworks
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'graphql', 'rest', 'soap',
    'grpc', 'websockets', 'mqtt', 'kafka', 'rabbitmq', 'amazon sqs',
    'stripe', 'paypal', 'twilio', 'sendgrid', 'slack', 'jira', 'confluence',
    'figma', 'adobe', 'sketch', 'vim', 'vscode', 'intellij', 'eclipse',
    'postman', 'insomnia', 'swagger', 'openapi', 'api gateway'
  ],
  
  // Soft Skills & Methodologies
  soft_skills: [
    'agile', 'scrum', 'kanban', 'lean', 'waterfall', 'devops practices',
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'project management', 'stakeholder management', 'mentoring', 'coaching'
  ]
};

/**
 * Extract skills from resume text using a comprehensive keyword database
 * @param {string} text - The resume text
 * @returns {string[]} - Array of extracted skills (unique, lowercase)
 */
function extractSkillsFromText(text) {
  const skills = new Set();
  const lowerText = text.toLowerCase();
  
  // Flatten all skill keywords
  const allKeywords = Object.values(SKILL_KEYWORDS).flat();
  
  // Search for each keyword in the text
  for (const keyword of allKeywords) {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      skills.add(keyword.toLowerCase());
    }
  }
  
  return Array.from(skills);
}

/**
 * Extract contact information (email, phone)
 * @param {string} text - The resume text
 * @returns {object} - Contact information
 */
function extractContact(text) {
  const contact = {
    email: null,
    phone: null,
    linkedin: null,
    github: null,
  };
  
  // Email regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) contact.email = emailMatch[0];
  
  // Phone regex (various formats)
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  if (phoneMatch) contact.phone = phoneMatch[0];
  
  // LinkedIn URL
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];
  
  // GitHub URL
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) contact.github = githubMatch[0];
  
  return contact;
}

const SECTION_HEADERS = [
  'summary', 'objective', 'profile', 'about',
  'experience', 'employment', 'work history', 'professional', 'career',
  'education', 'academic', 'degree', 'certification', 'qualifications',
  'skills', 'technologies', 'expertise', 'competencies',
  'projects', 'portfolio',
  'languages', 'interests', 'hobbies', 'awards', 'honors', 'publications'
];

/**
 * Determine if a line is likely a section header
 */
function isSectionHeader(line) {
  const trimmed = line.trim();
  // Too long or empty means not a header
  if (trimmed.length === 0 || trimmed.split(' ').length > 5) return false;
  
  // Header if all caps (allow spaces and ampersands)
  if (/^[A-Z][A-Z\s&]+$/.test(trimmed)) return true;
  
  // Header if it ends with colon
  if (trimmed.endsWith(':')) return true;
  
  // Header if exactly matches known sections
  if (SECTION_HEADERS.includes(trimmed.toLowerCase())) return true;
  
  return false;
}

/**
 * Extract education information
 * @param {string} text - The resume text
 * @returns {string[]} - Education entries
 */
function extractEducation(text) {
  const education = [];
  const lines = text.split('\n');
  const educationKeywords = ['education', 'academic', 'certification', 'qualifications'];
  
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Detect header boundary
    if (isSectionHeader(line)) {
      if (educationKeywords.some(k => line.toLowerCase().includes(k))) {
        inEducationSection = true;
      } else {
        inEducationSection = false; // Prevents "bleeding" into other sections
      }
      continue;
    }
    
    if (inEducationSection) {
      education.push(line);
    }
  }
  
  return education;
}

/**
 * Extract work experience/employment history
 * @param {string} text - The resume text
 * @returns {string[]} - Experience entries
 */
function extractExperience(text) {
  const experience = [];
  const lines = text.split('\n');
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional', 'career'];
  
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Detect header boundary
    if (isSectionHeader(line)) {
      if (experienceKeywords.some(k => line.toLowerCase().includes(k))) {
        inExperienceSection = true;
      } else {
        inExperienceSection = false; // Prevents "bleeding"
      }
      continue;
    }
    
    if (inExperienceSection) {
      experience.push(line);
    }
  }
  
  return experience;
}

/**
 * Parse resume text and extract structured information
 * @param {string} text - The raw resume text
 * @returns {object} - Parsed resume data with sections
 */
export const parseResume = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      skills: [],
      education: [],
      experience: [],
      contact: {},
      rawtext: '',
    };
  }
  
  const skills = extractSkillsFromText(text);
  const education = extractEducation(text);
  const experience = extractExperience(text);
  const contact = extractContact(text);
  
  return {
    skills,
    education,
    experience,
    contact,
    rawtext: text.substring(0, 2000), // Store first 2000 chars for reference
    skillCount: skills.length,
    hasExperience: experience.length > 0,
    hasEducation: education.length > 0,
  };
};
