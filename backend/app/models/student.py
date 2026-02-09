"""
Student and Guardian models.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base


class Gender(str, enum.Enum):
    """Gender enum."""
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class RelationshipType(str, enum.Enum):
    """Guardian relationship type enum."""
    PADRE = "padre"
    MADRE = "madre"
    ACUDIENTE = "acudiente"
    OTRO = "otro"


class Student(Base):
    """
    Student model.
    Core entity for attendance tracking.
    """
    __tablename__ = "student"

    student_code = Column(String(50), nullable=False, unique=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    document_type = Column(String(20))
    document_number = Column(String(50), index=True)
    birth_date = Column(Date, nullable=False)
    gender = Column(SQLEnum(Gender), nullable=False)
    blood_type = Column(String(10))
    allergies = Column(Text)
    photo_url = Column(String(255))
    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"), nullable=False, index=True)
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    campus = relationship("Campus", back_populates="students")
    guardians = relationship("StudentGuardian", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    transfers = relationship("Transfer", foreign_keys="Transfer.student_id", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    id_cards = relationship("IDCardIssued", foreign_keys="IDCardIssued.student_id", back_populates="student")

    @property
    def full_name(self) -> str:
        """Get full name."""
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Student(code={self.student_code}, name={self.full_name})>"


class Guardian(Base):
    """
    Guardian/Acudiente model.
    Parents or legal guardians of students.
    """
    __tablename__ = "guardian"

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    document_type = Column(String(20))
    document_number = Column(String(50), index=True)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(String(255))
    occupation = Column(String(100))

    # Relationships
    students = relationship("StudentGuardian", back_populates="guardian")

    @property
    def full_name(self) -> str:
        """Get full name."""
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Guardian(name={self.full_name}, document={self.document_number})>"


class StudentGuardian(Base):
    """
    Association table for Student-Guardian many-to-many relationship.
    Includes additional metadata about the relationship.
    """
    __tablename__ = "student_guardian"

    student_id = Column(UUID(as_uuid=True), ForeignKey("student.id"), nullable=False, index=True)
    guardian_id = Column(UUID(as_uuid=True), ForeignKey("guardian.id"), nullable=False, index=True)
    relationship_type = Column(SQLEnum(RelationshipType), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    is_authorized_pickup = Column(Boolean, default=True, nullable=False)
    lives_with = Column(Boolean, default=True, nullable=False)
    notes = Column(Text)

    # Relationships
    student = relationship("Student", back_populates="guardians")
    guardian = relationship("Guardian", back_populates="students")

    def __repr__(self):
        return f"<StudentGuardian(student_id={self.student_id}, guardian_id={self.guardian_id}, type={self.relationship_type})>"
