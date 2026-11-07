"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <header className="h-12 border-b border-cyber-border bg-cyber-panel flex items-center justify-end px-5 flex-shrink-0">
      <button
        onClick={toggle}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyber-border bg-cyber-surface hover:border-cyber-accent/60 hover:bg-cyber-surface transition-all group"
      >
        {theme === "dark" ? (
          <Sun size={15} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
        ) : (
          <Moon size={15} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
        )}
      </button>
    </header>
  );
}
