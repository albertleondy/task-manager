export interface ErrorPopupData {
  code: string;
  message: string;
}

export const showErrorPopup = (code: string, message: string) => {
  const event = new CustomEvent<ErrorPopupData>("app-error-popup", {
    detail: { code, message },
  });
  window.dispatchEvent(event);
};
