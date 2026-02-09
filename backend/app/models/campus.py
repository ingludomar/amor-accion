"""
Campus (Sede) models.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


class Campus(Base):
    """
    Campus/Sede model.
    Represents a physical location/branch of the institution.
    """
    __tablename__ = "campus"

    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True, index=True)
    address = Column(String(255))
    city = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100))
    logo_url = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    users = relationship("UserCampus", back_populates="campus")
    students = relationship("Student", back_populates="campus")
    course_groups = relationship("CourseGroup", back_populates="campus")
    school_years = relationship("SchoolYear", back_populates="campus")
    settings = relationship("Settings", back_populates="campus")

    def __repr__(self):
        return f"<Campus(code={self.code}, name={self.name})>"


class UserCampus(Base):
    """
    Association table for User-Campus many-to-many relationship.
    Tracks which users have access to which campuses.
    """
    __tablename__ = "user_campus"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)
    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"), nullable=False, index=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="campuses")
    campus = relationship("Campus", back_populates="users")

    def __repr__(self):
        return f"<UserCampus(user_id={self.user_id}, campus_id={self.campus_id}, primary={self.is_primary})>"
