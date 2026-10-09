/**
 * Standardized API envelope and error response types
 */

export interface ErrorDetail {
  code: string;
  message: string;
}

export interface ApiResponse<T = any> {
  data: T;
  error: ErrorDetail | null;
}

export interface ApiErrorResponse {
  data: null;
  error: ErrorDetail;
}
