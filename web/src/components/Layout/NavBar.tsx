import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export const NavBar = () => {
  const { user, logout, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/match", label: "Opportunities", icon: "work_outline", roles: ["student"] },
    { path: "/applications", label: "Applications", icon: "assignment_turned_in", roles: ["student"] },
    { path: "/portfolio", label: "Portfolio", icon: "badge", roles: ["student"] },
    { path: "/recruiter", label: "Recruiter", icon: "business", roles: ["recruiter"] },
  ];

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(role || "student"));

  return (
    <>
      {/* Desktop Sidebar - Collapsible */}
      <aside 
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 gap-2 z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarExpanded ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className={`mb-8 transition-all duration-300 ${sidebarExpanded ? "opacity-100" : "opacity-0 h-0 mb-0"}`}>
          <h1 className="text-lg font-black font-headline bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
            SkillBridge AI
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Intelligent Curator</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 dark:bg-blue-700 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
              title={item.label}
            >
              <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
              <span className={`text-sm font-medium transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
              }`}>{item.label}</span>
            </NavLink>
          ))}
          {!user && (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
                title="Sign In"
              >
                <span className="material-symbols-outlined flex-shrink-0">login</span>
                <span className={`text-sm font-medium transition-all duration-300 ${
                  sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                }`}>Sign In</span>
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
                title="Sign Up"
              >
                <span className="material-symbols-outlined flex-shrink-0">person_add</span>
                <span className={`text-sm font-medium transition-all duration-300 ${
                  sidebarExpanded ? "opacity-100" : "opacity-0 w-0"
                }`}>Sign Up</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Profile Card */}
        {user && (
          <div className={`mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${
            sidebarExpanded ? "opacity-100" : "opacity-0"
          }`}>
            <div className={`p-4 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center gap-3 transition-all duration-300 ${
              sidebarExpanded ? "" : "justify-center p-2"
            }`}>
              <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              {sidebarExpanded && (
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold font-headline text-slate-900 dark:text-white truncate">
                    {user.displayName || user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{role || "Student"}</p>
                </div>
              )}
            </div>
            {sidebarExpanded && (
              <button
                onClick={logout}
                className="w-full mt-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-effect border-b ghost-border z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <h1 className="font-bold font-headline text-blue-600 dark:text-blue-400">SkillBridge AI</h1>
          <div className="flex items-center gap-2">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user.displayName || user.name || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileOpen && (
        <nav className="md:hidden fixed top-16 left-0 right-0 bg-white dark:bg-slate-900 ghost-border p-4 z-20">
          <div className="flex flex-col gap-2">
            {visibleItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
            {!user && (
              <>
                <NavLink
                  to="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">login</span>
                  <span className="text-sm font-medium">Sign In</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  <span className="text-sm font-medium">Sign Up</span>
                </NavLink>
              </>
            )}
            {user && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 ghost-border z-30">
        <div className="h-full flex justify-around items-center px-4">
          {visibleItems.slice(0, 4).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 transition-all ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-[10px] font-bold font-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
