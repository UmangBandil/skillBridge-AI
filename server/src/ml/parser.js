export const parseResume = (resumeText) => {
  const sections = {
    skills: [],
    education: [],
    hobbies: [],
  };

  const lines = resumeText.split("\n");
  let currentSection = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    const lowerLine = trimmedLine.toLowerCase();
    if (lowerLine.startsWith("skills")) {
      currentSection = "skills";
    } else if (lowerLine.startsWith("education")) {
      currentSection = "education";
    } else if (lowerLine.startsWith("hobbies")) {
      currentSection = "hobbies";
    } else if (currentSection) {
      sections[currentSection].push(trimmedLine);
    }
  }

  return sections;
};
