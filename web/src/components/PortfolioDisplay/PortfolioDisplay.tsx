import { useEffect, useState } from "react";

export const PortfolioDisplay = ({ resumeText }: { resumeText: string }) => {
  const [parsedResume, setParsedResume] = useState<any>(null);

  useEffect(() => {
    const parseResume = (text: string) => {
      const sections: any = {
        skills: [],
        education: [],
        hobbies: [],
      };

      const lines = text.split("\n");
      let currentSection: any = null;

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

    setParsedResume(parseResume(resumeText));
  }, [resumeText]);

  if (!parsedResume) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Your Resume</h3>
        <pre className="p-4 bg-gray-100 rounded-md dark:bg-gray-800 whitespace-pre-wrap">{resumeText}</pre>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Your Portfolio</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 border rounded-md">
          <h4 className="font-semibold text-lg mb-2">Skills</h4>
          {parsedResume.skills && parsedResume.skills.length > 0 ? (
            <ul className="list-disc list-inside">
              {parsedResume.skills.map((skill: string, i: number) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No skills found</p>
          )}
        </div>
        <div className="p-4 border rounded-md">
          <h4 className="font-semibold text-lg mb-2">Education</h4>
          {parsedResume.education && parsedResume.education.length > 0 ? (
            <ul className="list-disc list-inside">
              {parsedResume.education.map((edu: string, i: number) => (
                <li key={i}>{edu}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No education found</p>
          )}
        </div>
        <div className="p-4 border rounded-md">
          <h4 className="font-semibold text-lg mb-2">Hobbies</h4>
          {parsedResume.hobbies && parsedResume.hobbies.length > 0 ? (
            <ul className="list-disc list-inside">
              {parsedResume.hobbies.map((hobby: string, i: number) => (
                <li key={i}>{hobby}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hobbies found</p>
          )}
        </div>
      </div>
    </div>
  );
};
