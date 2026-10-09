import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button/Button";

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = "Connection Error",
  message,
  onRetry,
  retrying = false,
}) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
            {title}
          </h4>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300/90 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="mt-3.5">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                loading={retrying}
                startIcon={<RefreshCw className="h-3.5 w-3.5" />}
                className="border-rose-300 bg-white hover:bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800"
              >
                Retry Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
