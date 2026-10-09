import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 text-slate-500 dark:text-slate-400", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400",
          sizeMap[size]
        )}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
