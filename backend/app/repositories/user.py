"""
User repository for database operations.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.user import User, Role, UserRole, Teacher
from app.models.campus import UserCampus
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User database operations."""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()

    def get_with_details(self, user_id: UUID) -> Optional[User]:
        """Get user with roles, campuses, and teacher profile."""
        return (
            self.db.query(User)
            .options(
                joinedload(User.roles).joinedload(UserRole.role),
                joinedload(User.campuses).joinedload(UserCampus.campus),
                joinedload(User.teacher_profile),
            )
            .filter(User.id == user_id)
            .first()
        )

    def get_multi_with_details(
        self, skip: int = 0, limit: int = 50, filters: Optional[Dict[str, Any]] = None
    ) -> List[User]:
        """Get multiple users with details and filters."""
        query = self.db.query(User).options(
            joinedload(User.roles).joinedload(UserRole.role),
            joinedload(User.campuses).joinedload(UserCampus.campus),
            joinedload(User.teacher_profile),
        )

        if filters:
            if filters.get("campus_id"):
                query = query.join(UserCampus).filter(
                    UserCampus.campus_id == filters["campus_id"]
                )
            if filters.get("role_id"):
                query = query.join(UserRole).filter(UserRole.role_id == filters["role_id"])
            if filters.get("is_active") is not None:
                query = query.filter(User.is_active == filters["is_active"])
            if filters.get("search"):
                search = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        User.full_name.ilike(search),
                        User.email.ilike(search),
                        User.username.ilike(search),
                    )
                )

        return query.offset(skip).limit(limit).all()

    def create_with_roles_and_campuses(
        self,
        user_data: Dict[str, Any],
        role_ids: List[UUID],
        campus_ids: List[UUID],
    ) -> User:
        """Create user with roles and campuses."""
        user = User(**user_data)
        self.db.add(user)
        self.db.flush()

        # Assign roles
        for role_id in role_ids:
            user_role = UserRole(user_id=user.id, role_id=role_id)
            self.db.add(user_role)

        # Assign campuses
        for i, campus_id in enumerate(campus_ids):
            user_campus = UserCampus(
                user_id=user.id,
                campus_id=campus_id,
                is_primary=(i == 0),  # First campus is primary
            )
            self.db.add(user_campus)

        self.db.commit()
        self.db.refresh(user)
        return user

    def update_roles(self, user_id: UUID, role_ids: List[UUID]) -> User:
        """Update user roles."""
        # Remove existing roles
        self.db.query(UserRole).filter(UserRole.user_id == user_id).delete()

        # Add new roles
        for role_id in role_ids:
            user_role = UserRole(user_id=user_id, role_id=role_id)
            self.db.add(user_role)

        self.db.commit()
        return self.get_with_details(user_id)

    def update_campuses(self, user_id: UUID, campus_ids: List[UUID]) -> User:
        """Update user campuses."""
        # Remove existing campuses
        self.db.query(UserCampus).filter(UserCampus.user_id == user_id).delete()

        # Add new campuses
        for i, campus_id in enumerate(campus_ids):
            user_campus = UserCampus(
                user_id=user_id,
                campus_id=campus_id,
                is_primary=(i == 0),
            )
            self.db.add(user_campus)

        self.db.commit()
        return self.get_with_details(user_id)


class RoleRepository(BaseRepository[Role]):
    """Repository for Role database operations."""

    def __init__(self, db: Session):
        super().__init__(Role, db)

    def get_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        return self.db.query(Role).filter(Role.name == name).first()


class TeacherRepository(BaseRepository[Teacher]):
    """Repository for Teacher database operations."""

    def __init__(self, db: Session):
        super().__init__(Teacher, db)

    def get_by_user_id(self, user_id: UUID) -> Optional[Teacher]:
        """Get teacher by user ID."""
        return self.db.query(Teacher).filter(Teacher.user_id == user_id).first()

    def get_by_teacher_code(self, teacher_code: str) -> Optional[Teacher]:
        """Get teacher by teacher code."""
        return self.db.query(Teacher).filter(Teacher.teacher_code == teacher_code).first()
