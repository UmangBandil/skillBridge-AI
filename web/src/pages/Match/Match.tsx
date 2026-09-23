import { useState, useEffect } from "react";
import { Task, listTasks } from "../../services/api";
import { TaskDetailsModal } from "../../components/TaskDetailsModal/TaskDetailsModal";
import { MatchExplanation } from "../../components/MatchExplanation/MatchExplanation";

export const Match = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [matchedTasks, setMatchedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my-matches">("all");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch all available tasks with search/pagination
  const fetchTasks = async (page = 1) => {
    setLoadingTasks(true);
    setError(null);
    try {
      const response = await listTasks({
        q: searchQuery || undefined,
        skill: skillFilter || undefined,
        page,
        limit: 12
      });

      setAllTasks(response.items);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load opportunities. Please try again.');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);

    // If user arrived from portfolio with saved matches
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "my-matches") {
      const stored = localStorage.getItem("matchedTasks");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setMatchedTasks(data);
          setActiveTab("my-matches");
        } catch (e) {
          console.error("Failed to load stored matches:", e);
        }
      }
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks(1);
  };

  const filteredMatches = matchedTasks.filter(task => {
    if (filterScore === "high" && (task.matchScore ?? task.score ?? 0) < 0.6) return false;
    return true;
  });

  const topMatch = filteredMatches[0];
  const otherMatches = filteredMatches.slice(1);

  return (
    <div className="md:ml-20 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 md:left-20 h-16 glass-effect z-30 flex items-center px-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">explore</span>
          {activeTab === "all" ? "Explore Micro-Internships" : "Your AI Match Results"}
        </h1>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline text-sm mr-1.5">grid_view</span>
            All Opportunities ({totalItems || allTasks.length})
          </button>

          <button
            onClick={() => setActiveTab("my-matches")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "my-matches"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline text-sm mr-1.5">auto_awesome</span>
            My Recommendations ({matchedTasks.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* TAB 1: ALL TASKS WITH SEARCH & FILTER */}
        {activeTab === "all" && (
          <div>
            {/* Search and Filters */}
            <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by keywords, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="relative sm:w-64">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                  code
                </span>
                <input
                  type="text"
                  placeholder="Filter by skill (e.g. React)..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
              >
                Search
              </button>
            </form>

            {loadingTasks ? (
              <div className="py-20 text-center">
                <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">
                  hourglass_empty
                </div>
                <p className="text-sm text-slate-500">Loading opportunities...</p>
              </div>
            ) : allTasks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Opportunities Found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search terms or skill filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {task.title}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shrink-0">
                            {task.status || "open"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {task.skills && task.skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-900/60"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.skills && task.skills.length > 4 && (
                            <span className="px-2 py-0.5 text-xs text-slate-400">
                              +{task.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Stipend</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            ${task.budget?.toLocaleString()}
                          </span>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                          View & Apply →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => fetchTasks(currentPage - 1)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => fetchTasks(currentPage + 1)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: MY MATCHES WITH MATCH EXPLANATION */}
        {activeTab === "my-matches" && (
          <div>
            {matchedTasks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center text-3xl mb-4">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Matching Profile Generated Yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Upload your resume in PDF, TXT, or Word (DOCX) format on the Portfolio page to activate the AI semantic matching engine.
                </p>
                <a
                  href="/portfolio"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20"
                >
                  Go to Portfolio Upload
                </a>
              </div>
            ) : (
              <div>
                {/* Score filter toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setFilterScore("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterScore === "all"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    All Recommendations ({matchedTasks.length})
                  </button>
                  <button
                    onClick={() => setFilterScore("high")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterScore === "high"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Strong Matches (60%+)
                  </button>
                </div>

                {/* Top Featured Match */}
                {topMatch && (
                  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-blue-500/30 dark:border-blue-500/20 shadow-lg mb-8 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                        ⭐ Top Recommended Match
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {topMatch.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-3xl leading-relaxed">
                      {topMatch.description}
                    </p>

                    {/* Integrated Match Explanation */}
                    <MatchExplanation task={topMatch} />

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">Compensation</span>
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${topMatch.budget?.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTask(topMatch)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
                      >
                        Review & Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Other recommendations */}
                {otherMatches.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                      Other Matched Opportunities
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {otherMatches.map((task) => (
                        <div
                          key={task.id}
                          className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                              {task.title}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0">
                              {Math.round((task.matchScore ?? task.score ?? 0) * 100)}% Match
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                            {task.description}
                          </p>

                          {/* Render explanation */}
                          <MatchExplanation task={task} />

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                              ${task.budget?.toLocaleString()}
                            </span>
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              Details & Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Details & Application Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onApplied={() => {
            fetchTasks(currentPage);
          }}
        />
      )}
    </div>
  );
};

export default Match;
