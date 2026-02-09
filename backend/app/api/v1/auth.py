"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.auth import AuthService
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    ChangePasswordRequest,
    UserInfo
)
from app.schemas.base import APIResponse, ResponseMeta
from app.models.user import User
from app.core.config import settings


router = APIRouter()


@router.post("/login", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login endpoint.
    Authenticate user and return JWT tokens.
    """
    auth_service = AuthService(db)
    result = auth_service.login(credentials.email, credentials.password)

    return APIResponse(
        success=True,
        action="auth.login",
        message="Login successful",
        data=result,
        meta=ResponseMeta(
            timestamp=datetime.utcnow(),
            version=settings.VERSION
        )
    )


@router.post("/login/form", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint for OAuth2 password flow (for Swagger UI).
    """
    auth_service = AuthService(db)
    result = auth_service.login(form_data.username, form_data.password)

    return APIResponse(
        success=True,
        action="auth.login",
        message="Login successful",
        data=result,
        meta=ResponseMeta(
            timestamp=datetime.utcnow(),
            version=settings.VERSION
        )
    )


@router.get("/me", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.
    """
    auth_service = AuthService(db)
    user_info = auth_service.get_user_info(current_user)

    return APIResponse(
        success=True,
        action="auth.get_user",
        message="User information retrieved",
        data=user_info,
        meta=ResponseMeta(
            timestamp=datetime.utcnow(),
            version=settings.VERSION
        )
    )


@router.post("/change-password", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user password.
    """
    auth_service = AuthService(db)
    auth_service.change_password(
        current_user,
        password_data.old_password,
        password_data.new_password
    )

    return APIResponse(
        success=True,
        action="auth.change_password",
        message="Password changed successfully",
        data=None,
        meta=ResponseMeta(
            timestamp=datetime.utcnow(),
            version=settings.VERSION
        )
    )


@router.post("/logout", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout endpoint.
    Note: JWT tokens are stateless, so this is mainly for client-side cleanup.
    In production, consider implementing token blacklisting.
    """
    return APIResponse(
        success=True,
        action="auth.logout",
        message="Logout successful",
        data=None,
        meta=ResponseMeta(
            timestamp=datetime.utcnow(),
            version=settings.VERSION
        )
    )
