export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

export const showToast = (type: ToastType, message: string) => {
  const event = new CustomEvent<ToastData>("app-toast", {
    detail: {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    },
  });
  window.dispatchEvent(event);
};
