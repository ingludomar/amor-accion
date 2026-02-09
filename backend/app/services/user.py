"""
User service for business logic.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.user import UserRepository, RoleRepository, TeacherRepository
from app.core.security import get_password_hash
from app.models.user import User, Teacher


class UserService:
    """Service for User business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.teacher_repo = TeacherRepository(db)

    def get_users(
        self, skip: int = 0, limit: int = 50, filters: Optional[Dict[str, Any]] = None
    ) -> tuple[List[User], int]:
        """Get list of users with filters."""
        users = self.user_repo.get_multi_with_details(skip=skip, limit=limit, filters=filters)

        # Count total (simplified - in production would need a separate count query)
        total = len(self.user_repo.get_all())

        return users, total

    def get_user(self, user_id: UUID) -> Optional[User]:
        """Get user by ID with details."""
        return self.user_repo.get_with_details(user_id)

    def create_user(
        self,
        email: str,
        username: str,
        password: str,
        full_name: str,
        role_ids: List[UUID],
        campus_ids: List[UUID],
        document_type: Optional[str] = None,
        document_number: Optional[str] = None,
        phone: Optional[str] = None,
        is_teacher: bool = False,
        teacher_code: Optional[str] = None,
    ) -> User:
        """Create a new user."""
        # Check if email or username already exists
        if self.user_repo.get_by_email(email):
            raise ValueError("Email already registered")

        if self.user_repo.get_by_username(username):
            raise ValueError("Username already taken")

        # Validate roles exist
        for role_id in role_ids:
            if not self.role_repo.get(role_id):
                raise ValueError(f"Role {role_id} not found")

        # Create user data
        user_data = {
            "email": email,
            "username": username,
            "hashed_password": get_password_hash(password),
            "full_name": full_name,
            "document_type": document_type,
            "document_number": document_number,
            "phone": phone,
            "is_active": True,
            "is_superuser": False,
        }

        # Create user with roles and campuses
        user = self.user_repo.create_with_roles_and_campuses(
            user_data=user_data,
            role_ids=role_ids,
            campus_ids=campus_ids,
        )

        # Create teacher profile if needed
        if is_teacher and teacher_code:
            # Check if teacher code already exists
            if self.teacher_repo.get_by_teacher_code(teacher_code):
                raise ValueError("Teacher code already exists")

            teacher = Teacher(
                user_id=user.id,
                teacher_code=teacher_code,
            )
            self.db.add(teacher)
            self.db.commit()

        return self.user_repo.get_with_details(user.id)

    def update_user(
        self,
        user_id: UUID,
        full_name: Optional[str] = None,
        document_type: Optional[str] = None,
        document_number: Optional[str] = None,
        phone: Optional[str] = None,
        is_active: Optional[bool] = None,
        role_ids: Optional[List[UUID]] = None,
        campus_ids: Optional[List[UUID]] = None,
    ) -> Optional[User]:
        """Update user information."""
        user = self.user_repo.get(user_id)
        if not user:
            return None

        # Update basic fields
        update_data = {}
        if full_name is not None:
            update_data["full_name"] = full_name
        if document_type is not None:
            update_data["document_type"] = document_type
        if document_number is not None:
            update_data["document_number"] = document_number
        if phone is not None:
            update_data["phone"] = phone
        if is_active is not None:
            update_data["is_active"] = is_active

        if update_data:
            self.user_repo.update(user_id, update_data)

        # Update roles if provided
        if role_ids is not None:
            self.user_repo.update_roles(user_id, role_ids)

        # Update campuses if provided
        if campus_ids is not None:
            self.user_repo.update_campuses(user_id, campus_ids)

        return self.user_repo.get_with_details(user_id)

    def delete_user(self, user_id: UUID) -> bool:
        """Soft delete user (set inactive)."""
        user = self.user_repo.get(user_id)
        if not user:
            return False

        self.user_repo.update(user_id, {"is_active": False})
        return True

    def get_all_roles(self) -> List[Dict[str, Any]]:
        """Get all available roles."""
        roles = self.role_repo.get_all()
        return [
            {
                "id": str(role.id),
                "name": role.name,
                "description": role.description,
            }
            for role in roles
        ]
