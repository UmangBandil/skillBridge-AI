import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchExplanation } from '../components/MatchExplanation/MatchExplanation';
import { Task } from '../services/api';

describe('MatchExplanation Component', () => {
  const sampleTask: Task = {
    id: 'task_abc',
    title: 'Full Stack Engineer Intern',
    description: 'React and Node role',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    budget: 4000,
    createdAt: new Date().toISOString(),
    matchScore: 0.84,
    breakdown: {
      semantic: 0.89,
      skills: 0.82,
      keywords: 0.77,
      experience: 0.73,
    },
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: ['PostgreSQL'],
    isDegraded: false,
  };

  it('renders overall match signal percentage', () => {
    const { container } = render(<MatchExplanation task={sampleTask} />);
    expect(container.textContent).toContain('84%');
    expect(container.textContent).toContain('Opportunity Match Signal');
  });

  it('displays matched skills and missing skills tags', () => {
    const { container } = render(<MatchExplanation task={sampleTask} />);
    expect(container.textContent).toContain('+ React');
    expect(container.textContent).toContain('+ TypeScript');
    expect(container.textContent).toContain('+ Node.js');
    expect(container.textContent).toContain('- PostgreSQL');
  });

  it('displays sub-dimension percentages for semantic, skill, keywords, and experience', () => {
    const { container } = render(<MatchExplanation task={sampleTask} />);
    expect(container.textContent).toContain('89%');
    expect(container.textContent).toContain('82%');
    expect(container.textContent).toContain('77%');
    expect(container.textContent).toContain('73%');
  });

  it('toggles calculation formula explanation modal / details', () => {
    const { container } = render(<MatchExplanation task={sampleTask} />);
    expect(container.textContent).not.toContain('Transparent Hybrid Matching Formula');

    const toggleButton = container.querySelector('button');
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);

    expect(container.textContent).toContain('Transparent Hybrid Matching Formula');
    expect(container.textContent).toContain('Semantic (55%)');
    expect(container.textContent).toContain('Skill Coverage (25%)');
  });
});
