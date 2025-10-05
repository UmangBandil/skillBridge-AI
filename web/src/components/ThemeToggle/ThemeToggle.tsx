import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <button onClick={toggle} className="fixed bottom-6 right-6 glass w-12 h-12 grid place-items-center rounded-full shadow-lg hover:scale-110 transition">
      {dark ? "🌞" : "🌙"}
    </button>
  );
};