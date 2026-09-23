import { useState, useEffect } from 'react';
import { Application, getMyApplications, withdrawApplication } from '../../services/api';
import { Link } from 'react-router-dom';

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: string }> = {
  APPLIED: {
    bg: 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'send'
  },
  REVIEWING: {
    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'visibility'
  },
  SHORTLISTED: {
    bg: 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'star'
  },
  ACCEPTED: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'check_circle'
  },
  REJECTED: {
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    icon: 'cancel'
  },
  WITHDRAWN: {
    bg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    icon: 'undo'
  }
};

export const ApplicationTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    setActionInProgress(applicationId);
    try {
      await withdrawApplication(applicationId);
      await fetchApplications();
    } catch (err: any) {
      alert(err?.message || 'Failed to withdraw application');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="md:ml-20 min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="fixed top-0 left-0 right-0 md:left-20 h-16 glass-effect z-30 flex items-center px-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
          Application Tracker
        </h1>
      </header>

      <div className="pt-24 pb-16 px-8 max-w-6xl mx-auto">
        {/* Metric Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              Total Applications
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {applications.length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-amber-600 font-semibold block mb-1">
              Active Reviews
            </span>
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {applications.filter(a => a.status === 'APPLIED' || a.status === 'REVIEWING').length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-purple-600 font-semibold block mb-1">
              Shortlisted
            </span>
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {applications.filter(a => a.status === 'SHORTLISTED').length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold block mb-1">
              Accepted
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {applications.filter(a => a.status === 'ACCEPTED').length}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
            <button onClick={fetchApplications} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">
              hourglass_empty
            </div>
            <p className="text-sm text-slate-500">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center text-3xl mb-4">
              <span className="material-symbols-outlined">post_add</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Applications Submitted Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Explore open micro-internships tailored to your skills and submit your first application.
            </p>
            <Link
              to="/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const badge = STATUS_BADGES[app.status] || STATUS_BADGES.APPLIED;
              const canWithdraw = app.status === 'APPLIED' || app.status === 'REVIEWING';

              return (
                <div
                  key={app.id}
                  className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}
                        >
                          <span className="material-symbols-outlined text-xs">{badge.icon}</span>
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {app.task?.title || 'Internship Opportunity'}
                      </h3>
                    </div>

                    <div className="text-right sm:self-start">
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${app.task?.budget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-0.5">Your Note:</p>
                      <p className="italic">"{app.coverLetter}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500">
                      Last updated {new Date(app.updatedAt).toLocaleDateString()}
                    </span>

                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={actionInProgress === app.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium text-xs disabled:opacity-50"
                      >
                        {actionInProgress === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;
