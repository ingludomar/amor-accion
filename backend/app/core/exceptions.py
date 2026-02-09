"""
Custom exception classes for the application.
"""


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found exception."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class UnauthorizedException(AppException):
    """Authentication failed exception."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class ForbiddenException(AppException):
    """Permission denied exception."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, status_code=403)


class ConflictException(AppException):
    """Resource conflict exception."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status_code=409)


class ValidationException(AppException):
    """Business logic validation exception."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=422)
