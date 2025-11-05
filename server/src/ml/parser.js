export const parseResume = (text) => {
  const sections = {
    skills: [],
    education: [],
    experience: [],
    hobbies: [],
  };

  const lines = text.split("\n");
  let currentSection = null;

  const sectionKeywords = {
    skills: ["skills", "abilities"],
    education: ["education", "academic"],
    experience: ["experience", "work", "professional"],
    hobbies: ["hobbies", "interests"],
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    const lowerLine = trimmedLine.toLowerCase();
    let matchedSection = null;

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        matchedSection = section;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else if (currentSection) {
      sections[currentSection].push(trimmedLine);
    }
  }

  return sections;
};