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
              SkillBridge AI recommendation signal (relevance estimation only)
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

      {/* Why this opportunity matches you (Matched Skills) */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Why this opportunity matches you ({matched.length})
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

      {/* Skills you may want to develop (Missing Skills) */}
      {missing.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Skills you may want to develop ({missing.length})
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

      {/* Non-Hiring Disclaimer */}
      <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
        <span className="material-symbols-outlined text-sm text-blue-500 mt-0.5">info</span>
        <span>
          SkillBridge AI uses resume and opportunity information to generate a relevance score. It does not make hiring decisions.
        </span>
      </div>

      {/* Expandable Calculation Formula */}
      <div className="mt-3 pt-2 text-right">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>{showFormula ? 'Hide calculation details' : 'How was this calculated?'}</span>
          <span className="material-symbols-outlined text-xs">
            {showFormula ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showFormula && (
          <div className="mt-2 p-3 bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Transparent Hybrid Matching Formula
            </p>
            {task.isDegraded ? (
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                Score = Skill Coverage (60%) + Keywords (25%) + Experience (15%) [Degraded Mode: Embeddings Unavailable]
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  Score = Semantic (55%) + Skill Coverage (25%) + Keywords (10%) + Experience (10%)
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Semantic vector alignment is computed using dense cosine similarity with all-MiniLM-L6-v2 embeddings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchExplanation;
