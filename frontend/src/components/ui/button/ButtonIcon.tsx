import React, { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ButtonVariant, ButtonSize } from "./Button";

export interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tooltipText?: string;
  loading?: boolean;
}

export const ButtonIcon: FC<ButtonIconProps> = ({
  icon,
  variant = "ghost",
  size = "sm",
  tooltipText,
  loading = false,
  className = "",
  disabled = false,
  title,
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    xs: "h-7 w-7 p-1 text-xs",
    sm: "h-8 w-8 p-1.5 text-sm",
    md: "h-9 w-9 p-2 text-base",
    lg: "h-11 w-11 p-2.5 text-lg",
    icon: "h-9 w-9 p-0",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    outline: "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    link: "text-indigo-600 hover:underline",
  };

  return (
    <button
      title={tooltipText || title}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
};

export default ButtonIcon;
