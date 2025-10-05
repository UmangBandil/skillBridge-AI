import { Task } from "../../services/api";

export const TaskCard = ({ task }: { task: Task }) => (
  <div className="border rounded p-4 shadow hover:shadow-lg transition dark:border-slate-700">
    <h3 className="font-semibold text-lg">{task.title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{task.description}</p>
    <div className="mt-2 flex flex-wrap gap-1">
      {task.skills.map((s: string) => (
        <span key={s} className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2 py-1 rounded">
          {s}
        </span>
      ))}
    </div>
    <p className="text-sm font-medium mt-2">₹{task.budget}</p>
  </div>
);
