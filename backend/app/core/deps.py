"""
Dependency injection functions for FastAPI.
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.core.exceptions import UnauthorizedException, ForbiddenException


# OAuth2 scheme for JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        token: JWT token from Authorization header
        db: Database session

    Returns:
        Current user object

    Raises:
        UnauthorizedException: If token is invalid or user not found
    """
    payload = decode_token(token)

    if payload is None:
        raise UnauthorizedException("Invalid or expired token")

    user_id: str = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException("Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthorizedException("User not found")

    if not user.is_active:
        raise UnauthorizedException("Inactive user")

    return user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user and verify they are a superuser.

    Args:
        current_user: Current authenticated user

    Returns:
        Current user if they are superuser

    Raises:
        ForbiddenException: If user is not superuser
    """
    if not current_user.is_superuser:
        raise ForbiddenException("Superuser access required")
    return current_user


def require_role(required_role: str):
    """
    Dependency factory to require a specific role.

    Args:
        required_role: Name of the required role

    Returns:
        Dependency function
    """
    async def role_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        """Check if user has required role."""
        # Superuser bypasses role checks
        if current_user.is_superuser:
            return current_user

        # Check if user has the required role
        user_roles = db.query(User).join(User.roles).filter(
            User.id == current_user.id
        ).all()

        role_names = [ur.role.name for ur in current_user.roles]

        if required_role not in role_names:
            raise ForbiddenException(f"Role '{required_role}' required")

        return current_user

    return role_checker


def require_permission(required_permission: str):
    """
    Dependency factory to require a specific permission.

    Args:
        required_permission: Required permission string (e.g., "students:write")

    Returns:
        Dependency function
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        """Check if user has required permission."""
        # Superuser bypasses permission checks
        if current_user.is_superuser:
            return current_user

        # Collect all permissions from user's roles
        user_permissions = set()
        for user_role in current_user.roles:
            if user_role.role.permissions:
                user_permissions.update(user_role.role.permissions)

        if required_permission not in user_permissions:
            raise ForbiddenException(f"Permission '{required_permission}' required")

        return current_user

    return permission_checker
