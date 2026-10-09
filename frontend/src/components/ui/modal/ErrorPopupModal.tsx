import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "./index";
import Button from "../button/Button";
import Badge from "../badge/Badge";
import type { ErrorPopupData } from "./showErrorPopup";

export const ErrorPopupModal: React.FC = () => {
  const [errorData, setErrorData] = useState<ErrorPopupData | null>(null);

  useEffect(() => {
    const handlePopup = (e: Event) => {
      const customEvent = e as CustomEvent<ErrorPopupData>;
      setErrorData(customEvent.detail);
    };

    window.addEventListener("app-error-popup", handlePopup);
    return () => {
      window.removeEventListener("app-error-popup", handlePopup);
    };
  }, []);

  const handleClose = () => {
    setErrorData(null);
  };

  if (!errorData) return null;

  return (
    <Modal
      isOpen={Boolean(errorData)}
      onClose={handleClose}
      className="max-w-md border-rose-200 dark:border-rose-900/60"
      showCloseButton={true}
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Request Error
            </h3>
            <div className="mt-1">
              <Badge variant="destructive" className="font-mono text-[11px] px-2 py-0.5">
                {errorData.code}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-rose-50/60 dark:bg-rose-950/20 p-3.5 border border-rose-100 dark:border-rose-900/40">
          <p className="text-sm font-medium text-rose-900 dark:text-rose-200 leading-relaxed">
            {errorData.message}
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="default" onClick={handleClose} className="w-full sm:w-auto">
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorPopupModal;
