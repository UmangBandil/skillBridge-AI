import React, { useState } from 'react';
import { Task, applyToTask } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { MatchExplanation } from '../MatchExplanation/MatchExplanation';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onApplied?: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onApplied }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCoverLetterInput, setShowCoverLetterInput] = useState(false);

  const isRecruiter = user?.role === 'recruiter';
  const isAuthor = task.authorId === user?.id;

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);
    try {
      await applyToTask(task.id, coverLetter);
      setSuccess(true);
      if (onApplied) onApplied();
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {task.status || 'open'}
              </span>
              {task.author?.name && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Posted by {task.author.name}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Match Explanation if matching data is present */}
          {(task.matchScore != null || task.score != null || task.breakdown != null) && (
            <MatchExplanation task={task} />
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Internship Overview
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Key Skill Requirements
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {task.skills && task.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-full text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Compensation */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Stipend / Budget
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${task.budget?.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Date Posted
              </p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </div>

          {/* Application Form for Students */}
          {!isRecruiter && !isAuthor && (
            <div className="pt-2">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {success ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm text-center font-medium">
                  ✓ Application submitted successfully! You can track its status in the Application Tracker.
                </div>
              ) : (
                <div className="space-y-3">
                  {!showCoverLetterInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCoverLetterInput(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span className="material-symbols-outlined text-sm">note_add</span>
                      Add an optional cover letter / note
                    </button>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Note to Recruiter (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Briefly explain why your background matches this micro-internship..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                        maxLength={1000}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isAuthor && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
              You authored this opportunity. View applicant submissions in your Recruiter Dashboard.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {!isRecruiter && !isAuthor && !success && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Apply for Internship
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
