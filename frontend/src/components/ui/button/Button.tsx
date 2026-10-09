import React, { FC, ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "default",
  startIcon,
  endIcon,
  className = "",
  disabled = false,
  type = "button",
  loading = false,
  onClick,
  ...props
}) => {
  const lastClickRef = useRef<number>(0);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const now = Date.now();
    if (now - lastClickRef.current < 300) {
      e.preventDefault();
      return;
    }
    lastClickRef.current = now;
    if (onClick) {
      onClick(e);
    }
  };

  const sizeClasses: Record<ButtonSize, string> = {
    xs: "px-2.5 py-1 text-xs h-7",
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-2.5 text-base h-11",
    icon: "h-9 w-9 p-0 flex items-center justify-center",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    default:
      "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    destructive:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 dark:bg-red-600 dark:hover:bg-red-700",
    outline:
      "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
    link:
      "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400 p-0 h-auto",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      type={type}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {startIcon && <span className="mr-2 inline-flex items-center">{startIcon}</span>}
          {children}
          {endIcon && <span className="ml-2 inline-flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
