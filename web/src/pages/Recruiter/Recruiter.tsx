import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Task } from "../../services/api";

export const Recruiter = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "view">("create");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/tasks", {
        headers: getAuthHeaders() as HeadersInit,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setErrorMessage("Failed to load tasks. Please try again.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchTasks();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    if (!title || !description || !skills || !budget) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setErrorMessage("Budget must be a valid positive number.");
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

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders() as HeadersInit,
        body: JSON.stringify({
          title,
          description,
          skills: skillsArray,
          budget: budgetNum,
        }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setSkills("");
        setBudget("");
        setSuccessMessage("Task created successfully! ✓");
        
        // Switch to view tab and refresh tasks
        setActiveTab("view");
        await fetchTasks();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create task" }));
        setErrorMessage(errorData.error || "Failed to create task. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      setErrorMessage(
        error?.message || "An error occurred while creating the task."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-effect z-30 flex justify-center items-center px-8 shadow-sm">
        <div className="flex items-center gap-8 w-full max-w-7xl">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recruiter Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-8 pb-12 max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline mr-2">add</span>
            Create Task
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "view"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined inline mr-2">list</span>
            My Tasks ({tasks.length})
          </button>
        </div>

        {/* Create Task Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 ghost-border">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Create a New Task
              </h2>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      error
                    </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      check_circle
                    </span>
                    {successMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-slate-900 dark:text-white mb-2"
                  >
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Build a React Dashboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-slate-900 dark:text-white mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={5}
                    placeholder="Describe the task requirements, deliverables, and any important details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-semibold text-slate-900 dark:text-white mb-2"
                  >
                    Required Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    id="skills"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., React, TypeScript, Node.js, PostgreSQL"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Separate skills with commas for better matching
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-semibold text-slate-900 dark:text-white mb-2"
                  >
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    disabled={isLoading}
                    min="0"
                    step="0.01"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        hourglass_empty
                      </span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add</span>
                      Create Task
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View Tasks Tab */}
        {activeTab === "view" && (
          <div>
            {isLoadingTasks ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-2">
                    hourglass_empty
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Loading your tasks...
                  </p>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center ghost-border">
                <div className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">
                  task_alt
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No tasks yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first task to find talented professionals
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Task
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow ghost-border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {task.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${task.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            calendar_today
                          </span>
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            {task.status === "open"
                              ? "check_circle"
                              : "schedule"}
                          </span>
                          {task.status || "open"}
                        </span>
                      </div>
                      <button className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
