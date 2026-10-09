import React from "react";
import { X } from "lucide-react";
import { ButtonIcon } from "../button/ButtonIcon";
import { useModalAccessibility } from "./useModalAccessibility";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  showCloseButton = true,
}) => {
  const { containerRef, titleId } = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={containerRef}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-3">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <ButtonIcon
              icon={<X className="h-4 w-4" />}
              onClick={onClose}
              variant="ghost"
              size="sm"
              tooltipText="Close modal"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              aria-label="Close modal"
            />
          )}
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
