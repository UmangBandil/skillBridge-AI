import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export const Layout = () => (
  <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
    <NavBar />
    <Outlet />
    <ThemeToggle />
  </div>
);
