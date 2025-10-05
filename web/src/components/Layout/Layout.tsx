import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export const Layout = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
    <NavBar />
    <main className="max-w-6xl mx-auto p-4">
      <Outlet />
    </main>
    <ThemeToggle />
  </div>
);