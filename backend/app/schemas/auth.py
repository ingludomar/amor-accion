"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID
from app.schemas.base import BaseSchema


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str  # user_id
    email: str
    exp: int
    iat: int
    type: str  # "access" or "refresh"


class LoginRequest(BaseModel):
    """Login request."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class CampusBasic(BaseSchema):
    """Basic campus information for user response."""
    id: UUID
    name: str
    code: str
    is_primary: bool = False


class RoleBasic(BaseSchema):
    """Basic role information."""
    id: UUID
    name: str


class UserInfo(BaseSchema):
    """User information for auth responses."""
    id: UUID
    email: str
    username: str
    full_name: str
    is_active: bool
    is_superuser: bool
    roles: List[str] = []
    campuses: List[CampusBasic] = []
    permissions: List[str] = []


class LoginResponse(BaseModel):
    """Login response with token and user info."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo


class ChangePasswordRequest(BaseModel):
    """Change password request."""
    old_password: str
    new_password: str = Field(..., min_length=8)


class ResetPasswordRequest(BaseModel):
    """Reset password request."""
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    """Reset password confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)
