import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isHydrated } = useAuth();

  // Wait for the initial localStorage hydration before deciding; otherwise
  // protected pages flash-redirect to /signin on a full page reload even
  // when a valid session exists.
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  return children;
};