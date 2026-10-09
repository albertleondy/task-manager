import axiosInstance, { AxiosResponse, AxiosError } from "axios";
import { extractErrorDetails } from "@/lib/utils";
import { showErrorPopup } from "@/components/ui/modal/showErrorPopup";

/**
 * Base Axios instance configured with API URL
 * Fallback to /api (using Vite dev proxy) or localhost:8000/api
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const axios = axiosInstance.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor to catch errors and trigger popup
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // If backend returns 200 with an error object inside
    if (response.data && response.data.error) {
      const err = response.data.error;
      showErrorPopup(err.code || "ERROR", err.message || "An unexpected error occurred.");
      return Promise.reject(new Error(err.message));
    }
    return response;
  },
  (error: AxiosError) => {
    const errorDetails = extractErrorDetails(error);
    showErrorPopup(errorDetails.code, errorDetails.message);
    return Promise.reject(error);
  }
);

export default axios;
