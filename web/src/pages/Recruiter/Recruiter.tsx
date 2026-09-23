import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Task,
  Application,
  ApplicationStatus,
  createTask as apiCreateTask,
  listTasks,
  getRecruiterApplications,
  updateApplicationStatus
} from "../../services/api";

const STATUS_OPTIONS: ApplicationStatus[] = [
  'APPLIED',
  'REVIEWING',
  'SHORTLISTED',
  'ACCEPTED',
  'REJECTED'
];

export const Recruiter = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "view" | "applications">("view");
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setErrorMessage("");
    try {
      const response = await listTasks({ status: 'all', limit: 100 });
      // Filter to current recruiter's tasks if authorId available, or all tasks
      const myTasks = response.items.filter(t => !user?.id || !t.authorId || t.authorId === user.id);
      setTasks(myTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setErrorMessage("Failed to load tasks. Please try again.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const apps = await getRecruiterApplications();
      setApplications(apps);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchTasks();
    } else if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title || !description || !skills || !budget) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMessage("Budget must be a positive number.");
      return;
    }

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      if (skillsArray.length === 0) {
        setErrorMessage("Please provide at least one skill.");
        return;
      }

      setIsLoading(true);

      await apiCreateTask({
        title,
        description,
        skills: skillsArray,
        budget: budgetNum,
      });

      setTitle("");
      setDescription("");
      setSkills("");
      setBudget("");
      setSuccessMessage("Internship created successfully with semantic vector! ✓");
      
      setActiveTab("view");
      await fetchTasks();

      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error: any) {
      console.error("Error creating task:", error);
      setErrorMessage(error?.message || "An error occurred while creating the task.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingAppId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      await fetchApplications();
    } catch (err: any) {
      alert(err?.message || 'Failed to update candidate status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="md:ml-20 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 md:left-20 h-16 glass-effect z-30 flex items-center px-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">business_center</span>
          Recruiter Management Portal
        </h1>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-8 pb-16 max-w-6xl mx-auto">
        {/* Real Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase font-semibold text-slate-500 block mb-1">
              Active Opportunities
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasks.filter(t => t.status === 'open').length}
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase font-semibold text-blue-600 block mb-1">
              Total Applicants
            </span>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {applications.length}
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase font-semibold text-purple-600 block mb-1">
              Candidates Shortlisted
            </span>
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {applications.filter(a => a.status === 'SHORTLISTED').length}
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase font-semibold text-emerald-600 block mb-1">
              Offers Accepted
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {applications.filter(a => a.status === 'ACCEPTED').length}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "view"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline text-sm mr-1.5">list_alt</span>
            My Internships ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "applications"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline text-sm mr-1.5">group</span>
            Candidate Applications ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline text-sm mr-1.5">add_circle</span>
            Post New Opportunity
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {successMessage}
          </div>
        )}

        {/* TAB 1: VIEW TASKS */}
        {activeTab === "view" && (
          <div>
            {isLoadingTasks ? (
              <div className="py-20 text-center">
                <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">
                  hourglass_empty
                </div>
                <p className="text-sm text-slate-500">Loading your micro-internships...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Internships Posted Yet
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Create your first internship posting to match with vetted talent.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Post Opportunity
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            {task.status || "open"}
                          </span>
                          <span className="text-xs text-slate-500">
                            Posted {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {task.title}
                        </h3>
                      </div>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${task.budget?.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {task.skills && task.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-900/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">
                        {task._count?.applications ?? 0} candidate(s) applied
                      </span>
                      <button
                        onClick={() => setActiveTab("applications")}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Review Applicants →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS MANAGEMENT */}
        {activeTab === "applications" && (
          <div>
            {isLoadingApps ? (
              <div className="py-20 text-center">
                <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">
                  hourglass_empty
                </div>
                <p className="text-sm text-slate-500">Loading candidate submissions...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Applications Received Yet
                </h3>
                <p className="text-sm text-slate-500">
                  When students apply to your open micro-internships, their profiles and notes will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">
                            Opportunity:
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {app.task?.title}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {app.user?.name || "Candidate"}
                        </h3>
                        <p className="text-xs text-slate-500">{app.user?.email}</p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Status:</span>
                        <select
                          value={app.status}
                          disabled={updatingAppId === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cover Note */}
                    {app.coverLetter && (
                      <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          Applicant Cover Note:
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{app.coverLetter}"
                        </p>
                      </div>
                    )}

                    {/* Candidate Resume Info */}
                    {app.user?.resumes && app.user.resumes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">
                          Extracted Candidate Skills:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.user.resumes[0].skills?.map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Applied: {new Date(app.appliedAt).toLocaleString()}</span>
                      <span>Last Updated: {new Date(app.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE TASK */}
        {activeTab === "create" && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Post an Internship Opportunity
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Internship Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Full-Stack React & Node.js Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Role Description & Deliverables *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the project scope, technical requirements, and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., React, TypeScript, Node.js, PostgreSQL, Docker"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  These skills are tokenized and embedded for semantic candidate matching.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Compensation / Stipend ($) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  placeholder="e.g., 3500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                    Generating Embeddings & Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">publish</span>
                    Publish Opportunity
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recruiter;
