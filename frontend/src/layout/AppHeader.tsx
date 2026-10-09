import React from "react";
import { Link } from "react-router-dom";
import { KanbanSquare } from "lucide-react";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";

export const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              TaskFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium">
              Mini Task Manager
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          FastAPI REST
        </span>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default AppHeader;
