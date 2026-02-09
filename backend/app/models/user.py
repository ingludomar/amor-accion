"""
User, Role, and Teacher models.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class User(Base):
    """
    User model for authentication and authorization.
    Can have multiple roles and belong to multiple campuses.
    """
    __tablename__ = "user"

    email = Column(String(100), nullable=False, unique=True, index=True)
    username = Column(String(50), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    document_type = Column(String(20))  # CC, TI, CE, etc.
    document_number = Column(String(50))
    phone = Column(String(20))
    photo_url = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # Relationships
    campuses = relationship("UserCampus", back_populates="user")
    roles = relationship("UserRole", back_populates="user")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    class_sessions = relationship("ClassSession", foreign_keys="ClassSession.teacher_id", back_populates="teacher")

    def __repr__(self):
        return f"<User(email={self.email}, full_name={self.full_name})>"


class Role(Base):
    """
    Role model for role-based access control (RBAC).
    """
    __tablename__ = "role"

    name = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text)
    permissions = Column(JSONB, default=list)  # Array of permission strings

    # Relationships
    users = relationship("UserRole", back_populates="role")

    def __repr__(self):
        return f"<Role(name={self.name})>"


class UserRole(Base):
    """
    Association table for User-Role many-to-many relationship.
    """
    __tablename__ = "user_role"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("role.id"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="users")

    def __repr__(self):
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id})>"


class Teacher(Base):
    """
    Teacher profile extending User model.
    Optional profile for users with Profesor role.
    """
    __tablename__ = "teacher"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, unique=True, index=True)
    teacher_code = Column(String(50), nullable=False, unique=True, index=True)
    specialization = Column(String(100))
    hire_date = Column(Date)

    # Relationships
    user = relationship("User", back_populates="teacher_profile")
    assignments = relationship("TeacherAssignment", back_populates="teacher")

    def __repr__(self):
        return f"<Teacher(code={self.teacher_code}, user_id={self.user_id})>"
