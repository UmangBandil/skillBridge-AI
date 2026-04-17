import { useEffect, useState } from "react";

interface ParsedResume {
  skills: string[];
  skillCount: number;
  education: string[];
  hasEducation: boolean;
  experience: string[];
  hasExperience: boolean;
  contact: {
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
  };
}

interface PortfolioDisplayProps {
  resumeText?: string;
  parsedData?: ParsedResume;
}

export const PortfolioDisplay = ({ resumeText, parsedData }: PortfolioDisplayProps) => {
  const [displayData, setDisplayData] = useState<ParsedResume | null>(null);

  useEffect(() => {
    if (parsedData) {
      setDisplayData(parsedData);
    }
  }, [parsedData]);

  // Show parsed structured data if available
  if (displayData) {
    return (
      <div className="mt-12">
        <h3 className="text-3xl font-semibold mb-8 gradient-text">Resume Data</h3>
        
        {/* Contact Info */}
        {displayData.contact && (
          <div className="mb-8 p-6 border border-slate-700 rounded-lg bg-slate-800/50">
            <h4 className="text-xl font-semibold mb-4 text-blue-400">Contact Information</h4>
            <div className="grid gap-3">
              {displayData.contact.email && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📧</span>
                  <a href={`mailto:${displayData.contact.email}`} className="hover:text-blue-400">
                    {displayData.contact.email}
                  </a>
                </p>
              )}
              {displayData.contact.phone && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📱</span>
                  <a href={`tel:${displayData.contact.phone}`} className="hover:text-blue-400">
                    {displayData.contact.phone}
                  </a>
                </p>
              )}
              {displayData.contact.linkedin && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">💼</span>
                  <a href={displayData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                    LinkedIn Profile
                  </a>
                </p>
              )}
              {displayData.contact.github && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">🔗</span>
                  <a href={displayData.contact.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                    GitHub Profile
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {displayData.skills && displayData.skills.length > 0 && (
          <div className="mb-8 p-6 border border-slate-700 rounded-lg bg-slate-800/50">
            <h4 className="text-xl font-semibold mb-4 text-blue-400">Skills ({displayData.skillCount})</h4>
            <div className="flex flex-wrap gap-2">
              {displayData.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/50 text-sm font-medium hover:bg-blue-500/30 transition"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {displayData.hasEducation && displayData.education && displayData.education.length > 0 && (
          <div className="mb-8 p-6 border border-slate-700 rounded-lg bg-slate-800/50">
            <h4 className="text-xl font-semibold mb-4 text-green-400">Education</h4>
            <ul className="space-y-2">
              {displayData.education.map((edu, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-slate-200">{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experience */}
        {displayData.hasExperience && displayData.experience && displayData.experience.length > 0 && (
          <div className="mb-8 p-6 border border-slate-700 rounded-lg bg-slate-800/50">
            <h4 className="text-xl font-semibold mb-4 text-purple-400">Experience</h4>
            <ul className="space-y-2">
              {displayData.experience.map((exp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">→</span>
                  <span className="text-slate-200">{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback to showing raw resume text
  if (resumeText) {
    return (
      <div className="mt-12">
        <h3 className="text-3xl font-semibold mb-6 gradient-text">Resume Data</h3>
        <div className="p-6 border border-slate-700 rounded-lg bg-slate-800/50">
          <pre className="whitespace-pre-wrap text-slate-300 text-sm font-mono">{resumeText}</pre>
        </div>
      </div>
    );
  }

  return null;
};
