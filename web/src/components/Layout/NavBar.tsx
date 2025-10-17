import { NavLink } from "react-router-dom";

export const NavBar = () => (
  <nav className="sticky top-4 z-50 max-w-5xl mx-auto glass p-4 rounded-2xl shadow-lg">
    <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="logo" className="w-8 h-8" />
                <span className="text-xl font-bold gradient-text">SkillBridge AI</span>
            </NavLink>
        </div>
      <div className="hidden md:flex items-center gap-6">
        <NavLink to="/" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-foreground/60 hover:text-foreground transition")}>Home</NavLink>
        <NavLink to="/tasks" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-foreground/60 hover:text-foreground transition")}>Tasks</NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-foreground/60 hover:text-foreground transition")}>Portfolio</NavLink>
        <NavLink to="/match" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-foreground/60 hover:text-foreground transition")}>Match</NavLink>
        <NavLink to="/recruiter" className={({ isActive }) => (isActive ? "gradient-text font-bold" : "text-foreground/60 hover:text-foreground transition")}>Recruiter</NavLink>
      </div>
      <div className="flex items-center gap-4">
        <NavLink to="/signin" className={"text-foreground/60 hover:text-foreground transition"}>Sign In</NavLink>
        <NavLink to="/signup" className={"glow-btn"}>Sign Up</NavLink>
      </div>
    </div>
  </nav>
);