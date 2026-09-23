import { describe, it, expect } from 'vitest';
import { extractSkills } from '../src/ml/skill-extractor.js';
import { parseResumeDeterministic } from '../src/ml/resume-parser.js';
import { validateUploadFile, sanitizeFilename } from '../src/utils/fileValidator.js';

describe('Resume Parsing & File Validation', () => {
  describe('extractSkills', () => {
    it('should extract canonical skills with case insensitivity and word boundaries', () => {
      const text = 'Full-stack software developer with expertise in React, TypeScript, Node.js, and PostgreSQL. Familiar with Docker and AWS.';
      const skills = extractSkills(text);

      expect(skills).toContain('react');
      expect(skills).toContain('typescript');
      expect(skills).toContain('node.js');
      expect(skills).toContain('postgresql');
      expect(skills).toContain('docker');
      expect(skills).toContain('aws');
      expect(skills).not.toContain('go'); // ensure 'go' from 'good' or word fragments is not falsely extracted
    });

    it('should handle empty or null text safely', () => {
      expect(extractSkills('')).toEqual([]);
      expect(extractSkills(null)).toEqual([]);
    });
  });

  describe('parseResumeDeterministic', () => {
    it('should extract structured sections, contact information, and skills from raw text', () => {
      const sample = `
Alex Mercer
alex.mercer@example.com | (555) 987-6543
https://linkedin.com/in/alexmercer | https://github.com/alexmercer

Summary
Motivated computer science student eager to build scalable web applications.

Education
B.S. in Computer Science, State University, 2024
GPA: 3.8

Experience
Software Engineering Intern - Cloud Corp (Summer 2023)
- Built REST APIs in Node.js and Express
- Wrote automated tests using Vitest

Skills
JavaScript, TypeScript, React, PostgreSQL, Docker, Git
      `;

      const parsed = parseResumeDeterministic(sample);

      expect(parsed.personal.email).toBe('alex.mercer@example.com');
      expect(parsed.personal.phone).toBe('(555) 987-6543');
      expect(parsed.links.linkedin).toContain('alexmercer');
      expect(parsed.links.github).toContain('alexmercer');
      expect(parsed.education.length).toBeGreaterThan(0);
      expect(parsed.experience.length).toBeGreaterThan(0);
      expect(parsed.skills).toContain('react');
      expect(parsed.skills).toContain('typescript');
      expect(parsed.skills).toContain('node.js');
      expect(parsed.skills).toContain('postgresql');
      expect(parsed.skills).toContain('docker');
    });
  });

  describe('fileValidator', () => {
    it('should sanitize dangerous filenames to prevent path traversal', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
      expect(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe')).toBe('cmd.exe');
      expect(sanitizeFilename('normal_resume.pdf')).toBe('normal_resume.pdf');
    });

    it('should validate PDF magic bytes correctly', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');
      const invalidPdfBuffer = Buffer.from('NOT A PDF content');

      expect(validateUploadFile({ buffer: validPdfBuffer, originalname: 'resume.pdf' }).valid).toBe(true);
      expect(validateUploadFile({ buffer: invalidPdfBuffer, originalname: 'resume.pdf' }).valid).toBe(false);
    });

    it('should reject executable or unsupported file extensions', () => {
      const buffer = Buffer.from('malicious payload');
      expect(validateUploadFile({ buffer, originalname: 'script.exe' }).valid).toBe(false);
      expect(validateUploadFile({ buffer, originalname: 'script.sh' }).valid).toBe(false);
    });
  });
});
