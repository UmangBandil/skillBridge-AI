import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    if (saved) document.documentElement.classList.add("dark");
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <button 
      onClick={toggle} 
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="text-xl">{dark ? "☀️" : "🌙"}</span>
    </button>
  );
};