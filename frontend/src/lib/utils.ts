import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiErrorResponse, ErrorDetail } from "@/lib/services/api";

import axios, { AxiosError } from "axios";

/**
 * Merges class names using clsx and tailwind-merge (standard Shadcn cn utility)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats ISO date string into a friendly, readable format
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Extracts structured error details (code and message) from backend error response
 */
export function extractErrorDetails(err: unknown): ErrorDetail {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    if (axiosErr.response?.data?.error) {
      const errorObj = axiosErr.response.data.error;
      return {
        code: errorObj.code || (axiosErr.response.status ? `HTTP_${axiosErr.response.status}` : "ERROR"),
        message: errorObj.message || "An unexpected error occurred.",
      };
    }
    if (axiosErr.code === "ERR_NETWORK" || !axiosErr.response) {
      return {
        code: "NETWORK_ERROR",
        message: "Unable to connect to the backend server. Please verify the backend service is running.",
      };
    }
    if (axiosErr.response?.status === 404) {
      return {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      };
    }
    if (axiosErr.response?.status === 500) {
      return {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error. Please try again later.",
      };
    }
    return {
      code: `HTTP_${axiosErr.response?.status || "ERROR"}`,
      message: axiosErr.message || "An unexpected error occurred.",
    };
  }
  if (err instanceof Error) {
    return {
      code: "CLIENT_ERROR",
      message: err.message,
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
  };
}

/**
 * Extracts a human-friendly error message from any backend API or network error
 */
export function extractErrorMessage(err: unknown): string {
  return extractErrorDetails(err).message;
}
