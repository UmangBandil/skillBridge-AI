import { Task } from "../../services/api";

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onAccept: () => void;
  onDeny: () => void;
  canManage?: boolean;
}

export const TaskDetailsModal = ({ task, onClose, onAccept, onDeny, canManage = true }: TaskDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Task Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{task.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {task.skills && task.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">Budget</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${task.budget}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2">Duration</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{task.estimatedHours || "TBD"} hrs</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          {canManage && (
            <>
              <button
                onClick={onDeny}
                className="px-6 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="px-6 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
              >
                Accept
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
