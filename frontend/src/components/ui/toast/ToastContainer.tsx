import React, { useEffect, useState, useCallback } from "react";
import Toast from "./Toast";
import type { ToastData } from "./showToast";

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      const toast = customEvent.detail;
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
    };

    window.addEventListener("app-toast", handleToast);
    return () => {
      window.removeEventListener("app-toast", handleToast);
    };
  }, [removeToast]);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
