import { NavLink } from "react-router-dom";

export const NavBar = () => (
  <header className="bg-sky-600 dark:bg-sky-800 text-white p-4 shadow">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <h1 className="text-2xl font-bold">SkillBridge AI</h1>
      <nav className="flex gap-4">
        <NavLink to="/" className={({ isActive }) => isActive ? "underline" : ""}>Home</NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? "underline" : ""}>Tasks</NavLink>
        <NavLink to="/match" className={({ isActive }) => isActive ? "underline" : ""}>Match</NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => isActive ? "underline" : ""}>Portfolio</NavLink>
      </nav>
    </div>
  </header>
);