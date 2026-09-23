import React, { useState } from 'react';
import { Task } from '../../services/api';

interface MatchExplanationProps {
  task: Task;
}

export const MatchExplanation: React.FC<MatchExplanationProps> = ({ task }) => {
  const [showFormula, setShowFormula] = useState(false);

  const scorePct = Math.round((task.matchScore ?? task.score ?? 0) * 100);
  const semanticPct = task.breakdown?.semantic != null ? Math.round(task.breakdown.semantic * 100) : null;
  const skillsPct = task.breakdown?.skills != null ? Math.round(task.breakdown.skills * 100) : null;
  const keywordsPct = task.breakdown?.keywords != null ? Math.round(task.breakdown.keywords * 100) : null;
  const experiencePct = task.breakdown?.experience != null ? Math.round(task.breakdown.experience * 100) : null;

  const matched = task.matchedSkills || [];
  const missing = task.missingSkills || [];

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700/80 my-4 text-left">
      {/* Header & Overall Match Indicator */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {scorePct}%
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Opportunity Match Signal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated recommendation signal (not an employment decision)
            </p>
          </div>
        </div>

        {task.isDegraded && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="material-symbols-outlined text-xs">speed</span>
            Lexical Mode
          </span>
        )}
      </div>

      {/* Why This Matches (Matched Skills) */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Why this matches ({matched.length})
        </p>
        {matched.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matched.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
              >
                + {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No direct skill overlaps identified.</p>
        )}
      </div>

      {/* Missing Skills */}
      {missing.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">tune</span>
            Unmatched requirements ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
              >
                - {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Semantic Relevance & Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Semantic Match
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {semanticPct !== null ? `${semanticPct}%` : 'N/A'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Skill Coverage
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {skillsPct !== null ? `${skillsPct}%` : 'N/A'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Keywords
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {keywordsPct !== null ? `${keywordsPct}%` : 'N/A'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Experience
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {experiencePct !== null ? `${experiencePct}%` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Expandable Breakdown Modal / Section */}
      <div className="mt-3 pt-2">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          <span className="material-symbols-outlined text-sm">
            {showFormula ? 'expand_less' : 'help_outline'}
          </span>
          {showFormula ? 'Hide calculation details' : 'How was this match calculated?'}
        </button>

        {showFormula && (
          <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Transparent Hybrid Matching Formula
            </p>
            <p>
              SkillBridge AI evaluates candidate relevance using a multi-dimensional weighted formula:
            </p>
            <code className="block p-2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-300">
              MatchScore = (Semantic × 0.55) + (Skills × 0.25) + (Keywords × 0.10) + (Experience × 0.10)
            </code>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li><strong>Semantic (55%)</strong>: Cosine similarity of 384-dimensional dense vectors generated by MiniLM-L6-v2.</li>
              <li><strong>Skill Coverage (25%)</strong>: Percentage of task requirements present in candidate's extracted profile.</li>
              <li><strong>Keywords (10%)</strong>: Lexical term overlap between role specifications and candidate summary.</li>
              <li><strong>Experience (10%)</strong>: Depth and relevance of candidate background history.</li>
            </ul>
            {task.isDegraded && (
              <p className="text-amber-700 dark:text-amber-400 text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded">
                <strong>Degraded Mode Active:</strong> Dense vector embeddings were unavailable or timed out. Score was computed using deterministic lexical and skill overlap heuristics.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchExplanation;
