"""
Authentication service.
"""
from datetime import timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.models.user import User, Role, UserRole
from app.models.campus import UserCampus
from app.core.security import verify_password, create_access_token, create_refresh_token, get_password_hash
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, NotFoundException
from app.schemas.auth import UserInfo, CampusBasic


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user by email and password.

        Args:
            email: User email
            password: Plain password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    def create_tokens(self, user: User) -> Dict[str, Any]:
        """
        Create access and refresh tokens for user.

        Args:
            user: User object

        Returns:
            Dictionary with tokens and user info
        """
        # Create token payload
        token_data = {
            "sub": str(user.id),
            "email": user.email,
        }

        # Generate tokens
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": self.get_user_info(user)
        }

    def get_user_info(self, user: User) -> UserInfo:
        """
        Get user information for response.

        Args:
            user: User object

        Returns:
            UserInfo object
        """
        # Eagerly load relationships
        user = self.db.query(User).options(
            joinedload(User.roles).joinedload(UserRole.role),
            joinedload(User.campuses).joinedload(UserCampus.campus)
        ).filter(User.id == user.id).first()

        # Extract role names
        role_names = [ur.role.name for ur in user.roles]

        # Extract permissions from roles
        permissions = set()
        for user_role in user.roles:
            if user_role.role.permissions:
                permissions.update(user_role.role.permissions)

        # Extract campuses
        campuses = [
            CampusBasic(
                id=uc.campus.id,
                name=uc.campus.name,
                code=uc.campus.code,
                is_primary=uc.is_primary
            )
            for uc in user.campuses
        ]

        return UserInfo(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            roles=role_names,
            campuses=campuses,
            permissions=list(permissions)
        )

    def change_password(self, user: User, old_password: str, new_password: str) -> bool:
        """
        Change user password.

        Args:
            user: User object
            old_password: Current password
            new_password: New password

        Returns:
            True if successful

        Raises:
            UnauthorizedException: If old password is incorrect
        """
        if not verify_password(old_password, user.hashed_password):
            raise UnauthorizedException("Incorrect password")

        user.hashed_password = get_password_hash(new_password)
        self.db.commit()
        return True

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login user.

        Args:
            email: User email
            password: Plain password

        Returns:
            Dictionary with tokens and user info

        Raises:
            UnauthorizedException: If authentication fails
        """
        user = self.authenticate_user(email, password)

        if not user:
            raise UnauthorizedException("Incorrect email or password")

        return self.create_tokens(user)
