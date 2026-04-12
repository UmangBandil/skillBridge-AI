import { parseResume } from './server/src/ml/parser.js';
import fs from 'fs';

const resumeText = fs.readFileSync('./test-resume.txt', 'utf8');
const parsed = parseResume(resumeText);

console.log('--- Parsed Resume ---');
console.log('Skills:', parsed.skills);
console.log('Skill Count:', parsed.skillCount);
console.log('Has Education:', parsed.hasEducation);
console.log('Education:', parsed.education);
console.log('Has Experience:', parsed.hasExperience);
console.log('Experience:', parsed.experience);
console.log('Contact:', parsed.contact);
