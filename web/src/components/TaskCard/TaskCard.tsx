import { Task } from "../../services/api";

export const TaskCard = ({ task }: { task: Task }) => (
  <div className="glass p-5 hover:scale-[1.02] transition-transform cursor-pointer">
    <h3 className="text-xl font-semibold text-sky-700 dark:text-sky-300">{task.title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{task.description}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {task.skills.map((s) => (
        <span key={s} className="text-xs bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-full">
          {s}
        </span>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{task.budget}</span>
      <span className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
);