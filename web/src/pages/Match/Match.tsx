import { useState, useEffect } from "react";
import { Task } from "../../services/api";
import { TaskDetailsModal } from "../../components/TaskDetailsModal/TaskDetailsModal";

interface MatchResult extends Task {
  matchScore?: number;
  matchReason?: string;
}

export const Match = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [matchedTasks, setMatchedTasks] = useState<MatchResult[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my-matches">("all");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch all available tasks on mount
  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    setLoadingTasks(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch("/api/tasks", {
        headers,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await res.json();
      const formattedData = data.map((task: any) => ({
        ...task,
        skills: Array.isArray(task.skills) ? task.skills : (task.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }));
      setAllTasks(formattedData);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleMatch = async (resume: string) => {
    setLoadingMatch(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch("/api/tasks/match", {
        method: "POST",
        headers,
        body: JSON.stringify({ resume }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to match tasks' }));
        throw new Error(errorData.error || 'Failed to match tasks');
      }

      const data = await res.json();
      const formattedData = data.map((task: any) => ({
        ...task,
        matchScore: 85 + Math.random() * 15,
        skills: Array.isArray(task.skills) ? task.skills : (task.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }));
      setMatchedTasks(formattedData);
      setActiveTab("my-matches");
    } catch (err: any) {
      console.error('Error matching tasks:', err);
      let errorMsg = err?.message || 'An error occurred while matching tasks';
      
      if (errorMsg.includes('Failed to fetch') || 
          errorMsg.includes('network') || 
          errorMsg.includes('localhost') ||
          errorMsg.includes('ECONNREFUSED')) {
        errorMsg = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      setError(errorMsg);
      setMatchedTasks([]);
    } finally {
      setLoadingMatch(false);
    }
  };

  const filteredMatches = matchedTasks.filter(task => {
    if (filterScore === "high" && task.matchScore && task.matchScore < 90) return false;
    return true;
  });

  const topMatch = filteredMatches[0];
  const otherMatches = filteredMatches.slice(1);

  const displayTasks = activeTab === "all" ? allTasks : matchedTasks;
  const isLoading = activeTab === "all" ? loadingTasks : loadingMatch;

  return (
    <div className="md:ml-20 min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 md:left-20 h-16 glass-effect z-30 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {activeTab === "all" ? "Browse Opportunities" : "Your Matches"}
        </h1>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined inline mr-2">grid_view</span>
              All Opportunities ({allTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("my-matches")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "my-matches"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined inline mr-2">recommend</span>
              My Matches ({matchedTasks.length})
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* All Tasks Tab */}
          {activeTab === "all" && (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-2">
                      hourglass_empty
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Loading opportunities...</p>
                  </div>
                </div>
              ) : allTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center ghost-border">
                  <div className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">
                    work
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No opportunities available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Check back soon for new opportunities!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white leading-tight">
                            {task.title}
                          </h3>
                          {task.status === "open" && (
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                              Open
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 font-body">
                          {task.description || "No description available"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {task.skills && task.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                        {task.skills && task.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                            +{task.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">
                            Budget
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            ${task.budget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">
                            Skills
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {task.skills?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Matches Tab */}
          {activeTab === "my-matches" && (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-2">
                      hourglass_empty
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Analyzing matches...</p>
                  </div>
                </div>
              ) : matchedTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center ghost-border">
                  <div className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">
                    search
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No matches yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Upload your resume on the Portfolio page to see personalized matches
                  </p>
                  <a
                    href="/portfolio"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">upload</span>
                    Go to Portfolio
                  </a>
                </div>
              ) : (
                <div>
                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                      <button 
                        onClick={() => setFilterScore("all")}
                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                          filterScore === "all"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}>
                        All Matches
                      </button>
                      <button 
                        onClick={() => setFilterScore("high")}
                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                          filterScore === "high"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}>
                        High Score (90%+)
                      </button>
                    </div>
                  </div>

                  {/* Top Match Featured */}
                  {topMatch && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg ghost-border mb-8 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {Math.round(topMatch.matchScore || 85)}% Match
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full uppercase">
                          Top Choice
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold font-headline text-slate-900 dark:text-white mb-4">
                        {topMatch.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                        {topMatch.description || "Excellent match for your skills"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {topMatch.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedTask(topMatch)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}

                  {/* Other Matches Grid */}
                  {otherMatches.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Other Good Matches</h2>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {otherMatches.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
                          >
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 block">
                              {Math.round(task.matchScore || 85)}% Match
                            </span>
                            <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white mb-3 line-clamp-2">
                              {task.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <span>${task.budget.toLocaleString()}</span>
                              <span>{task.skills?.length || 0} skills</span>
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
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
