import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTasks, Task } from "../../services/api";

interface MatchResult extends Task {
  score?: number;
  matchedSkills?: string[];
}

interface PortfolioData {
  name?: string;
  bio?: string;
  skills?: string[];
  [key: string]: unknown;
}

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract first name from display name or email
  const displayName = user?.name || user?.displayName || "there";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [taskData, portfolioRes] = await Promise.all([
          listTasks(),
          fetch("/api/portfolio", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).catch(() => null),
        ]);

        if (cancelled) return;

        if (Array.isArray(taskData)) setTasks(taskData);

        if (portfolioRes && portfolioRes.ok) {
          const data = await portfolioRes.json();
          if (data?.portfolio) setPortfolio(data.portfolio);
        }
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Matches are produced by the Portfolio page and persisted there
    try {
      const stored = localStorage.getItem("matchedTasks");
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data)) {
          setMatches(
            data
              .map((t: any) => ({
                ...t,
                skills: Array.isArray(t.skills)
                  ? t.skills
                  : (t.skills || "")
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
              }))
              .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
          );
        }
      }
    } catch (err) {
      console.error("Failed to load stored matches:", err);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const handleResumeUpload = () => navigate("/portfolio");
  const handleViewAll = () => navigate("/match");
  const handleMatchClick = () => navigate("/match?tab=my-matches");

  // Real skills: matched skills from the resume match, falling back to the
  // user's saved portfolio skills. Dedupe case-insensitively (the parser
  // stores lowercase, task skills are title-cased) and collapse redundant
  // shorter skills that are whole words inside a longer chip (e.g. "tailwind"
  // inside "Tailwind CSS"), preferring the more specific spelling.
  const skillSet = (() => {
    const skills = [
      ...matches.flatMap((m) => m.matchedSkills || []),
      ...(Array.isArray(portfolio?.skills) ? (portfolio.skills as string[]) : []),
    ];
    const result: string[] = [];
    for (const skill of skills) {
      const lower = skill.toLowerCase().trim();
      if (!lower) continue;
      const words = lower.split(/\s+/);
      // Case-insensitive exact duplicate
      if (result.some((r) => r.toLowerCase() === lower)) continue;
      // Fully contained (as a whole word) in an existing, longer chip
      if (result.some((r) => r.toLowerCase().split(/\s+/).includes(lower))) continue;
      // This chip contains an existing shorter one — replace it
      const survivors = result.filter((r) => !words.includes(r.toLowerCase()));
      if (survivors.length !== result.length) {
        result.length = 0;
        result.push(...survivors);
      }
      result.push(skill);
    }
    return result.slice(0, 10);
  })();

  const topMatches = matches.slice(0, 2);
  const fallbackTasks = tasks.slice(0, 2);
  const openTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const resumeUploaded = Boolean(localStorage.getItem("lastResume")) || matches.length > 0;

  const matchPercent = (score?: number) => Math.max(0, Math.round((score || 0) * 100));

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-effect z-30 flex justify-center items-center px-8 shadow-sm">
        <div className="flex items-center gap-8 w-full max-w-7xl">
          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg max-w-md">
            <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white placeholder-slate-500 dark:placeholder-slate-400" 
              placeholder="Search internships, skills, or companies..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/match`)}
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
            <button 
              onClick={handleResumeUpload}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 hover:scale-95 transition-all"
              title="Upload or manage your resume"
            >
              <span className="material-symbols-outlined">upload</span>
              Resume
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="md:ml-20 pt-24 px-10 pb-12 max-w-7xl mx-auto">
        {/* Hero Greeting */}
        <section className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-headline">
            Welcome back, {firstName}.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base font-body">
            {loading ? (
              "Loading your opportunities..."
            ) : matches.length > 0 ? (
              <>
                Your AI curator found{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {matches.length} high-match
                </span>{" "}
                internship opportunities for your resume.
              </>
            ) : (
              <>
                There{" "}
                {tasks.length === 1 ? "is" : "are"}{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {tasks.length} open
                </span>{" "}
                micro-internship {tasks.length === 1 ? "opportunity" : "opportunities"} waiting for you.
              </>
            )}
          </p>
        </section>

        {/* Bento Grid Dashboard */}
        <div className="grid grid-cols-12 gap-6">
          {/* Skill Profile Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ghost-border relative overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">psychology</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-headline">Skill Profile</h3>
              </div>
              {skillSet.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {skillSet.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Skills Detected</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{skillSet.length}</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, skillSet.length * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    No skills yet. Upload your resume to build your skill profile and get matched.
                  </p>
                  <button
                    onClick={handleResumeUpload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Upload Resume
                  </button>
                </div>
              )}
            </div>
            {/* Decorative Element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Top Matches Grid */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {topMatches.length > 0 ? (
              topMatches.map((task, i) => (
                <div
                  key={task.id}
                  onClick={handleMatchClick}
                  className={`${
                    i === 0
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-white dark:bg-slate-800 ghost-border text-slate-900 dark:text-white"
                  } p-6 rounded-2xl shadow-lg flex flex-col justify-between group cursor-pointer transition-all hover:shadow-2xl ${
                    i === 0 ? "hover:shadow-blue-600/30" : "hover:shadow-xl"
                  } transform hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${i === 0 ? "bg-white/10 backdrop-blur-md" : "bg-slate-100 dark:bg-slate-700"}`}>
                        <span className={`material-symbols-outlined ${i === 0 ? "" : "text-blue-600 dark:text-blue-400"}`}>rocket_launch</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          i === 0
                            ? "bg-emerald-400 text-slate-900"
                            : "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {matchPercent(task.score)}% Match
                      </span>
                    </div>
                    <h4 className="text-lg font-bold font-headline mb-1">{task.title}</h4>
                    <p className={`text-sm mb-4 line-clamp-2 ${i === 0 ? "text-white/70" : "text-slate-600 dark:text-slate-400"}`}>
                      {task.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${i === 0 ? "" : "text-slate-500 dark:text-slate-400"}`}>
                      ${task.budget.toLocaleString()} budget
                    </span>
                    <span className={`material-symbols-outlined group-hover:translate-x-2 transition-transform ${i === 0 ? "" : "text-blue-600 dark:text-blue-400"}`}>arrow_forward</span>
                  </div>
                </div>
              ))
            ) : fallbackTasks.length > 0 ? (
              fallbackTasks.map((task, i) => (
                <div
                  key={task.id}
                  onClick={() => navigate("/match")}
                  className={`${
                    i === 0
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-white dark:bg-slate-800 ghost-border text-slate-900 dark:text-white"
                  } p-6 rounded-2xl shadow-lg flex flex-col justify-between group cursor-pointer transition-all hover:shadow-2xl transform hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${i === 0 ? "bg-white/10 backdrop-blur-md" : "bg-slate-100 dark:bg-slate-700"}`}>
                        <span className={`material-symbols-outlined ${i === 0 ? "" : "text-blue-600 dark:text-blue-400"}`}>work</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          i === 0
                            ? "bg-emerald-400 text-slate-900"
                            : "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        Open
                      </span>
                    </div>
                    <h4 className="text-lg font-bold font-headline mb-1">{task.title}</h4>
                    <p className={`text-sm mb-4 line-clamp-2 ${i === 0 ? "text-white/70" : "text-slate-600 dark:text-slate-400"}`}>
                      {task.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${i === 0 ? "" : "text-slate-500 dark:text-slate-400"}`}>
                      ${task.budget.toLocaleString()} budget
                    </span>
                    <span className={`material-symbols-outlined group-hover:translate-x-2 transition-transform ${i === 0 ? "" : "text-blue-600 dark:text-blue-400"}`}>arrow_forward</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ghost-border flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">work</span>
                <h4 className="text-lg font-bold font-headline text-slate-900 dark:text-white mb-2">No opportunities yet</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Recruiters haven't posted any tasks yet. Check back soon!
                </p>
                {user?.role === "recruiter" && (
                  <button
                    onClick={() => navigate("/recruiter")}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post a Task
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Latest Opportunities Table */}
          <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ghost-border">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-white">Latest Opportunities</h3>
              <button 
                onClick={handleViewAll}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 transition-colors"
              >
                View All
              </button>
            </div>
            {openTasks.length > 0 ? (
              <div className="space-y-4">
                {openTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => navigate("/match")}
                    className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-lg flex items-center justify-between transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                        {task.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{task.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.skills?.length || 0} skills required
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-tighter text-slate-500 dark:text-slate-400 mb-1">Budget</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">${task.budget.toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                        task.status === "open"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                      }`}>
                        {task.status || "open"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                No opportunities posted yet.
              </p>
            )}
          </div>

          {/* Right Column: Resume Status & Quick Actions */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Resume Status Section */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg ghost-border">
              <h4 className="text-sm font-bold font-headline text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                Resume Status
              </h4>
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg backdrop-blur-sm ghost-border">
                {resumeUploaded ? (
                  <>
                    <p className="text-xs italic text-slate-600 dark:text-slate-400 mb-3">
                      Your resume has been analyzed. {matches.length > 0 ? `${matches.length} matched opportunities are ready for you.` : "Upload it again to refresh your matches."}
                    </p>
                    <button
                      onClick={handleMatchClick}
                      className="w-full text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:underline underline-offset-4"
                    >
                      View My Matches
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs italic text-slate-600 dark:text-slate-400 mb-3">
                      No resume uploaded yet. Upload your resume to unlock AI-powered matching.
                    </p>
                    <button
                      onClick={handleResumeUpload}
                      className="w-full text-center text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline underline-offset-4"
                    >
                      Upload Resume
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg ghost-border">
              <h4 className="text-sm font-bold font-headline text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">bolt</span>
                Quick Actions
              </h4>
              <div className="space-y-3">
                <button
                  onClick={handleResumeUpload}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">upload</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Resume</span>
                </button>
                <button
                  onClick={handleMatchClick}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">recommend</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Matches</span>
                </button>
                <button
                  onClick={handleViewAll}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">work</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Browse Tasks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-8 mt-auto bg-white dark:bg-slate-900 border-t ghost-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-headline">SkillBridge AI</span>
            <span className="text-slate-300">|</span>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">© 2024 SkillBridge AI</p>
          </div>
          <div className="flex gap-8">
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Terms</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Privacy</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Support</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
