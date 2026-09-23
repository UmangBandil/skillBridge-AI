import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styleMap = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-200',
    info: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950/90 dark:border-blue-800 dark:text-blue-200',
  };

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all ${styleMap[type]}`}
    >
      <span className="material-symbols-outlined text-base">{iconMap[type]}</span>
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

export default Toast;
