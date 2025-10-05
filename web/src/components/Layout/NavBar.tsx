import { NavLink } from "react-router-dom";

export const NavBar = () => (
  <nav className="float-nav">
    <div className="flex items-center gap-6">
      <NavLink to="/" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-slate-700 dark:text-slate-200 hover:text-sky-500 transition")}>Home</NavLink>
      <NavLink to="/tasks" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-slate-700 dark:text-slate-200 hover:text-sky-500 transition")}>Tasks</NavLink>
      <NavLink to="/match" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-slate-700 dark:text-slate-200 hover:text-sky-500 transition")}>Match</NavLink>
      <NavLink to="/portfolio" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-slate-700 dark:text-slate-200 hover:text-sky-500 transition")}>Portfolio</NavLink>
    </div>
  </nav>
);