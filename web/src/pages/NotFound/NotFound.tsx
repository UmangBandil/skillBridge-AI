import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2">404</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-2 font-semibold">Page Not Found</p>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
