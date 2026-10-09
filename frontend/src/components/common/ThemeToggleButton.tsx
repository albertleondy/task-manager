import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { ButtonIcon } from "@/components/ui/button/ButtonIcon";

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <ButtonIcon
      icon={theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      tooltipText={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle Theme"
      className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
    />
  );
};

export default ThemeToggleButton;
