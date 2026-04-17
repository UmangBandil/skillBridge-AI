import { Task } from "../../services/api";

export const TaskCard = ({
  task,
  onComplete,
  onDelete,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{task.title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
    
    <div className="mb-4">
      <div className="flex flex-wrap gap-1">
        {task.skills && task.skills.slice(0, 3).map((s) => (
          <span key={s} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
            {s}
          </span>
        ))}
        {task.skills && task.skills.length > 3 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
            +{task.skills.length - 3}
          </span>
        )}
      </div>
    </div>

    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Budget</p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${task.budget}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-1">Posted</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(task.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);