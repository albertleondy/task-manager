import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastType } from "./showToast";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
  };

  const styleMap = {
    success: "border-emerald-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    error: "border-rose-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    warning: "border-amber-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    info: "border-sky-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-full sm:max-w-md p-4 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-200",
        styleMap[type]
      )}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium leading-relaxed pr-1">{message}</div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
