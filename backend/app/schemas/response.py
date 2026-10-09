from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Standardized error item containing error code and message."""
    code: str = Field(..., description="Error code identifier (e.g. BAD_REQUEST, VALIDATION_FAILED, NOT_FOUND)")
    message: str = Field(..., description="Human-readable explanation of the error")


class ApiResponse(BaseModel, Generic[T]):
    """Standardized top-level API response envelope with data and error."""
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None


class ErrorResponse(BaseModel):
    """Convenience error response model."""
    data: None = None
    error: ErrorDetail
