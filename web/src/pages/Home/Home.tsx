import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMatches] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Extract first name from display name or email
  const displayName = user?.displayName || "there";
  const firstName = displayName.split(" ")[0];

  const handleResumeUpload = () => {
    navigate("/portfolio");
  };

  const handleViewAll = () => {
    navigate("/tasks");
  };

  const handleMatchClick = () => {
    navigate("/match");
  };

  const handleApplicationClick = () => {
    navigate("/tasks");
  };

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-effect z-30 flex justify-center items-center px-8 shadow-sm">
        <div className="flex items-center gap-8 w-full max-w-7xl">
          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg max-w-md">
            <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white placeholder-slate-500 dark:placeholder-slate-400" 
              placeholder="Search internships, skills, or companies..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/match`)}
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
            <button 
              onClick={handleResumeUpload}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 hover:scale-95 transition-all"
              title="Upload or manage your resume"
            >
              <span className="material-symbols-outlined">upload</span>
              Resume
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="md:ml-20 pt-24 px-10 pb-12 max-w-7xl mx-auto">
        {/* Hero Greeting */}
        <section className="mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-headline">
            Welcome back, {firstName}.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base font-body">
            Your AI curator has identified <span className="text-emerald-600 dark:text-emerald-400 font-bold">{newMatches} new high-match</span> internship opportunities based on your recent activity.
          </p>
        </section>

        {/* Bento Grid Dashboard */}
        <div className="grid grid-cols-12 gap-6">
          {/* Skill Profile Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ghost-border relative overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">psychology</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-headline">Skill Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">Neural Networks</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">TypeScript</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">UX Strategy</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">Python</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">Data Viz</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Technical Core</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">88%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Top Matches Grid */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Match 1 - Featured (Dark) */}
            <div 
              onClick={handleMatchClick}
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between group cursor-pointer transition-all hover:shadow-2xl hover:shadow-blue-600/30 transform hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-400 text-slate-900 px-2 py-1 rounded">98% Match</span>
                </div>
                <h4 className="text-lg font-bold font-headline mb-1">AI Research Intern</h4>
                <p className="text-white/70 text-sm mb-4">DeepMind • London (Hybrid)</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Applied by 12 others</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Match 2 - Standard */}
            <div 
              onClick={handleMatchClick}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg ghost-border flex flex-col justify-between group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">architecture</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">92% Match</span>
                </div>
                <h4 className="text-lg font-bold font-headline text-slate-900 dark:text-white mb-1">Product Designer</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Linear • Remote</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Closing in 2 days</span>
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Active Applications Table */}
          <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg ghost-border">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-headline text-slate-900 dark:text-white">Active Applications</h3>
              <button 
                onClick={handleViewAll}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Application Item 1 */}
              <div 
                onClick={handleApplicationClick}
                className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-lg flex items-center justify-between transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">STR</div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Frontend Engineer</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Stripe • Applied 4 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="hidden md:block">
                    <p className="text-[10px] uppercase tracking-tighter text-slate-500 dark:text-slate-400 mb-1">Next Step</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Technical Interview</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">In Progress</span>
                </div>
              </div>

              {/* Application Item 2 */}
              <div 
                onClick={handleApplicationClick}
                className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-lg flex items-center justify-between transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">MSF</div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Data Science Intern</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Microsoft • Applied 1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="hidden md:block">
                    <p className="text-[10px] uppercase tracking-tighter text-slate-500 dark:text-slate-400 mb-1">Next Step</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Action Required</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase">Action Needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Feedback & Badges */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Feedback Section */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg ghost-border">
              <h4 className="text-sm font-bold font-headline text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">comment</span>
                Recent Feedback
              </h4>
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg backdrop-blur-sm ghost-border">
                <p className="text-xs italic text-slate-600 dark:text-slate-400 mb-3">"Impressive portfolio projects, specifically the AI model visualization. We'd love to see more..."</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-500"></div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Sarah J. • Recruiter</span>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg ghost-border">
              <h4 className="text-sm font-bold font-headline text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">workspace_premium</span>
                Earned Badges
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer" title="Top 1% React">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
                </div>
                <div className="aspect-square rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer" title="Fast Responder">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <div className="aspect-square rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer" title="Verified Skills">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-8 mt-auto bg-white dark:bg-slate-900 border-t ghost-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-headline">SkillBridge AI</span>
            <span className="text-slate-300">|</span>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">© 2024 SkillBridge AI</p>
          </div>
          <div className="flex gap-8">
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Terms</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Privacy</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Support</a>
            <a className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
};