export const parseResume = (text) => {
  const sections = {
    skills: [],
    education: [],
    experience: [],
    hobbies: [],
  };

  const lines = text.split('\n');
  let currentSection = null;

  const sectionKeywords = {
    skills: ['skills', 'abilities'],
    education: ['education', 'academic'],
    experience: ['experience', 'work', 'professional'],
    hobbies: ['hobbies', 'interests'],
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    const lowerLine = trimmedLine.toLowerCase();
    let isSectionHeader = false;
    let newSection = null;

    for (const section in sectionKeywords) {
      for (const keyword of sectionKeywords[section]) {
        if (lowerLine.startsWith(keyword)) {
          newSection = section;
          isSectionHeader = true;
          break;
        }
      }
      if (isSectionHeader) break;
    }

    if (isSectionHeader) {
      currentSection = newSection;
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1) {
        const content = trimmedLine.substring(colonIndex + 1).trim();
        if (content) {
          sections[currentSection].push(content);
        }
      }
      // If no colon, assume the whole line is a header, and content is on next lines
    } else if (currentSection) {
      sections[currentSection].push(trimmedLine);
    }
  }

  return sections;
};
