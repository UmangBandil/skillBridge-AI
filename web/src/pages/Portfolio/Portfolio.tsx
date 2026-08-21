import { useState, useEffect } from "react";
import { matchTasks, getPortfolio, savePortfolio, PortfolioPayload } from "../../services/api";
import { ResumeDrop } from "../../components/ResumeDrop/ResumeDrop";
import { PortfolioDisplay } from "../../components/PortfolioDisplay/PortfolioDisplay";
import { PortfolioInfo } from "../../components/PortfolioInfo/PortfolioInfo";

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

export const Portfolio = () => {
  const [name, setName] = useState("Your Name");
  const [address, setAddress] = useState("Your Address");
  const [skills, setSkills] = useState("Your Skills");
  const [hobbies, setHobbies] = useState("Your Hobbies");
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResume | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [extractedAddress, setExtractedAddress] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.displayName) {
          setName(userData.displayName);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Extract address from resume text
  const extractAddressFromResume = (text: string): string | null => {
    if (!text) return null;
    
    // Look for common address patterns - usually near the top with contact info
    const lines = text.split('\n');
    
    // Common address indicators
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      // Look for lines with city, state, zip pattern or lines with commas (typical address format)
      if ((line.match(/,/g) || []).length >= 1 && line.length > 10 && line.length < 100) {
        // Check if it looks like an address (not an email or URL)
        if (!line.includes('@') && !line.includes('http') && !line.includes('://')) {
          return line;
        }
      }
    }
    
    return null;
  };

  const handleResumeParsed = async (parsed: ParsedResume) => {
    setParsedResumeData(parsed);

    // Persist the parsed resume (skills, education, experience, contact) to
    // the user's portfolio so the Home page skill profile is populated even
    // before the AI match finishes.
    try {
      let existing: PortfolioPayload = {};
      try {
        const current = await getPortfolio();
        if (current?.portfolio && typeof current.portfolio === "object") {
          existing = current.portfolio as PortfolioPayload;
        }
      } catch (err) {
        console.error("Failed to load existing portfolio:", err);
      }

      await savePortfolio({
        ...existing,
        skills: parsed.skills || [],
        education: parsed.education || [],
        experience: parsed.experience || [],
        contact: parsed.contact || {},
        lastResumeUpdatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to save resume to portfolio:", err);
    }

    // Try to extract address from resume text
    if (resumeText) {
      const foundAddress = extractAddressFromResume(resumeText);
      if (foundAddress) {
        setExtractedAddress(foundAddress);
      }
    }
    
    setSuccessMessage("Resume parsed successfully! Your profile has been updated.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleMatch = async (resume: string) => {
    setResumeText(resume);
    // Run the AI match and persist the results so the Match page can show
    // them when the user follows the "Browse Opportunities" CTA.
    try {
      const matches = await matchTasks(resume);
      localStorage.setItem("matchedTasks", JSON.stringify(matches));
      localStorage.setItem("lastResume", resume);
    } catch (err) {
      console.error("Error matching tasks:", err);
    }
  };

  const handleUploadAgain = () => {
    setParsedResumeData(null);
    setResumeText(null);
    setExtractedAddress(null);
  };

  return (
    <div className="md:ml-20 min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 md:left-20 h-16 glass-effect z-30 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Portfolio</h1>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-8">
        <div className="max-w-5xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {successMessage}
            </div>
          )}

          {/* BEFORE RESUME UPLOAD - Show Profile Setup */}
          {!parsedResumeData && (
            <>
              {/* Profile Header */}
              <div className="mb-12">
                <h2 className="text-4xl font-extrabold font-headline text-slate-900 dark:text-white mb-2">
                  {name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your profile and see personalized opportunities
                </p>
              </div>

              {/* Profile Information Fields */}
              <div className="mb-12">
                <PortfolioInfo 
                  name={name} 
                  setName={setName} 
                  address={address} 
                  setAddress={setAddress} 
                  skills={skills} 
                  setSkills={setSkills} 
                  hobbies={hobbies} 
                  setHobbies={setHobbies} 
                />
              </div>

              {/* Resume Upload Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 ghost-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                      upload_file
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-white mb-2">
                      Upload Your Resume
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Upload your resume (PDF or TXT) to parse your skills, experience, and education. This helps us find better matches for you.
                    </p>
                  </div>
                </div>
                <ResumeDrop 
                  onUpload={handleMatch} 
                  onParsed={handleResumeParsed}
                />
              </div>
            </>
          )}

          {/* AFTER RESUME UPLOAD - Show Parsed Data */}
          {parsedResumeData && (
            <div>
              {/* Profile Header with Parsed Name */}
              <div className="mb-12">
                <h2 className="text-4xl font-extrabold font-headline text-slate-900 dark:text-white mb-2">
                  {name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {extractedAddress || "Your resume has been uploaded"}
                </p>
              </div>

              {/* Parsed Resume Data Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 ghost-border mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-white">
                    Resume Information
                  </h3>
                  <button
                    onClick={handleUploadAgain}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Upload New Resume
                  </button>
                </div>

                <PortfolioDisplay 
                  resumeText={resumeText || undefined} 
                  parsedData={parsedResumeData}
                />
              </div>

              {/* Call to Action Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-200 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                      search
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold font-headline text-slate-900 dark:text-white mb-2">
                      Ready to find opportunities?
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Your resume has been analyzed and saved. Visit the "Opportunities" tab to see AI-matched internships and tasks based on your skills.
                    </p>
                    <a
                      href="/match?tab=my-matches"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      <span className="material-symbols-outlined">arrow_forward</span>
                      Browse Opportunities
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - No Resume */}
          {!parsedResumeData && !resumeText && (
            <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
              <div className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">
                description
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No resume uploaded yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload your resume above to get started with finding opportunities matched to your skills
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
