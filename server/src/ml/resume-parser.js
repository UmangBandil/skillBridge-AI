import OpenAI from 'openai';
import { extractSkills } from './skill-extractor.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const SECTION_HEADERS = {
  education: ['education', 'academic background', 'academic history', 'qualifications', 'degrees'],
  experience: ['experience', 'work experience', 'employment history', 'professional experience', 'work history', 'internships'],
  projects: ['projects', 'personal projects', 'key projects', 'academic projects'],
  certifications: ['certifications', 'licenses', 'certificates', 'accreditations'],
  summary: ['summary', 'professional summary', 'executive summary', 'about me', 'profile', 'objective']
};

/**
 * Checks if a line resembles a section header
 */
function matchSectionHeader(line) {
  const trimmed = line.trim().toLowerCase().replace(/[:#]/g, '');
  if (!trimmed || trimmed.split(/\s+/).length > 4) return null;

  for (const [section, triggers] of Object.entries(SECTION_HEADERS)) {
    if (triggers.some(trigger => trimmed === trigger || trimmed.startsWith(`${trigger}:`))) {
      return section;
    }
  }
  return null;
}

/**
 * Deterministic fallback parser that extracts all structured fields using pattern matching
 */
export function parseResumeDeterministic(text) {
  if (!text || typeof text !== 'string') {
    return {
      personal: {},
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      links: {},
      summary: ''
    };
  }

  const lines = text.split('\n').map(l => l.trim());
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]+\.(?:io|me|dev|app|com)(?:\/[^\s]*)?/i);

  // Extract candidate name from top lines (first non-empty line that isn't email/phone/url)
  let detectedName = null;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const l = lines[i];
    if (l && !l.includes('@') && !l.includes('http') && !l.includes('github') && l.length > 2 && l.length < 50) {
      detectedName = l;
      break;
    }
  }

  const sections = {
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    summary: []
  };

  let currentSection = null;

  for (const line of lines) {
    if (!line) continue;

    const detectedHeader = matchSectionHeader(line);
    if (detectedHeader) {
      currentSection = detectedHeader;
      continue;
    }

    if (currentSection && sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  const skills = extractSkills(text);

  return {
    personal: {
      name: detectedName,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    },
    skills,
    education: sections.education,
    experience: sections.experience,
    projects: sections.projects,
    certifications: sections.certifications,
    links: {
      linkedin: linkedinMatch ? linkedinMatch[0] : null,
      github: githubMatch ? githubMatch[0] : null,
      portfolio: portfolioMatch ? portfolioMatch[0] : null
    },
    summary: sections.summary.join(' ').trim()
  };
}

/**
 * Parses resume text using deterministic heuristics first, optionally falling back to OpenAI if configured
 */
export async function parseResume(text) {
  const fallback = parseResumeDeterministic(text);

  // If no OpenAI key configured, return high-fidelity deterministic parsing
  if (!config.OPENAI_API_KEY) {
    logger.info('Parsing resume with deterministic engine (no OPENAI_API_KEY configured)');
    return fallback;
  }

  try {
    logger.info('Attempting GenAI parsing enhancement with OpenAI...');
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert resume parsing engine. Parse the given resume into this exact JSON schema:
{
  "personal": { "name": string|null, "email": string|null, "phone": string|null },
  "skills": string[],
  "education": string[],
  "experience": string[],
  "projects": string[],
  "certifications": string[],
  "links": { "linkedin": string|null, "github": string|null, "portfolio": string|null },
  "summary": string
}`
        },
        { role: 'user', content: text.substring(0, 8000) }
      ],
      timeout: 10000
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return {
      personal: { ...fallback.personal, ...(parsed.personal || {}) },
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 
        ? Array.from(new Set([...fallback.skills, ...parsed.skills.map((s) => String(s).toLowerCase().trim())]))
        : fallback.skills,
      education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : fallback.education,
      experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : fallback.experience,
      projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : fallback.projects,
      certifications: Array.isArray(parsed.certifications) && parsed.certifications.length > 0 ? parsed.certifications : fallback.certifications,
      links: { ...fallback.links, ...(parsed.links || {}) },
      summary: parsed.summary || fallback.summary
    };
  } catch (err) {
    logger.warn('OpenAI parsing failed or timed out; falling back to deterministic extraction', { error: err.message });
    return fallback;
  }
}

export default { parseResume, parseResumeDeterministic };
