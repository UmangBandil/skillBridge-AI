import { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { Task } from "../../services/api";
import { TaskDetailsModal } from "../../components/TaskDetailsModal/TaskDetailsModal";

export const TaskList = () => {
  const { tasks, loading, start, complete, del } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleAcceptTask = () => {
    if (selectedTask) {
      start(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleDenyTask = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="md:ml-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-body">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-20 min-h-screen">
      <div className="pt-24 pb-20 md:pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold font-headline text-slate-900 dark:text-white tracking-tight mb-2">
              Available Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base font-body">
              {tasks.length} micro-internship {tasks.length === 1 ? "opportunity" : "opportunities"} available for you to explore and apply for.
            </p>
          </div>

          {tasks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white leading-tight">
                        {task.title}
                      </h3>
                      {task.status === "available" && (
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                          Available
                        </span>
                      )}
                      {task.status === "in progress" && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase">
                          Active
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
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {task.skills && task.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                        +{task.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {task.estimatedHours || "TBD"} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">
                        Budget
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        ${task.budget || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {task.status === "in progress" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          complete(task.id);
                        }}
                        className="flex-1 px-3 py-2 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        del(task.id);
                      }}
                      className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No tasks available right now. Check back soon for new opportunities!
              </p>
            </div>
          )}

          {selectedTask && (
            <TaskDetailsModal
              task={selectedTask}
              onClose={handleCloseModal}
              onAccept={handleAcceptTask}
              onDeny={handleDenyTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};
