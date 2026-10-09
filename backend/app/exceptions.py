from typing import Optional


class DomainException(Exception):
    """Base exception for application business rule violations."""

    def __init__(self, error_code: str, message: str, field: Optional[str] = None):
        self.error_code = error_code
        self.message = message
        self.field = field
        super().__init__(message)


class EntityNotFoundError(DomainException):
    """Raised when a requested resource (Board or Task) is not found."""

    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(error_code="NOT_FOUND", message=message, field=field)


class DomainValidationError(DomainException):
    """Raised when business validation fails (e.g. empty string, invalid status)."""

    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(error_code="VALIDATION_FAILED", message=message, field=field)
