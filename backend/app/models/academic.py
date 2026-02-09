"""
Academic models: SchoolYear, Period, CourseGroup, Subject, TeacherAssignment, Enrollment, Transfer.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base


class EnrollmentStatus(str, enum.Enum):
    """Enrollment status enum."""
    ACTIVE = "active"
    TRANSFERRED = "transferred"
    WITHDRAWN = "withdrawn"


class SchoolYear(Base):
    """
    School year model.
    Represents an academic year (e.g., 2024-2025).
    """
    __tablename__ = "schoolyear"

    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    campus = relationship("Campus", back_populates="school_years")
    periods = relationship("Period", back_populates="school_year")
    enrollments = relationship("Enrollment", back_populates="school_year")
    teacher_assignments = relationship("TeacherAssignment", back_populates="school_year")

    def __repr__(self):
        return f"<SchoolYear(name={self.name}, current={self.is_current})>"


class Period(Base):
    """
    Academic period model (bimestre, trimestre, etc.).
    """
    __tablename__ = "period"

    school_year_id = Column(UUID(as_uuid=True), ForeignKey("schoolyear.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    order = Column(Integer, nullable=False)

    # Relationships
    school_year = relationship("SchoolYear", back_populates="periods")
    class_sessions = relationship("ClassSession", back_populates="period")

    def __repr__(self):
        return f"<Period(name={self.name}, order={self.order})>"


class CourseGroup(Base):
    """
    Course/Group model (e.g., 5to A, 6to B).
    Represents a specific class group within a campus.
    """
    __tablename__ = "coursegroup"

    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    grade_level = Column(Integer, nullable=False)  # 1-11
    section = Column(String(10))  # A, B, C
    school_year_id = Column(UUID(as_uuid=True), ForeignKey("schoolyear.id"), nullable=False, index=True)
    max_students = Column(Integer, default=30)

    # Relationships
    campus = relationship("Campus", back_populates="course_groups")
    school_year = relationship("SchoolYear")
    enrollments = relationship("Enrollment", back_populates="course_group")
    teacher_assignments = relationship("TeacherAssignment", back_populates="course_group")
    class_sessions = relationship("ClassSession", back_populates="course_group")

    def __repr__(self):
        return f"<CourseGroup(name={self.name}, campus_id={self.campus_id})>"


class Subject(Base):
    """
    Subject/Materia model (e.g., Matemáticas, Español).
    """
    __tablename__ = "subject"

    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False, unique=True, index=True)
    description = Column(Text)

    # Relationships
    teacher_assignments = relationship("TeacherAssignment", back_populates="subject")
    class_sessions = relationship("ClassSession", back_populates="subject")

    def __repr__(self):
        return f"<Subject(code={self.code}, name={self.name})>"


class TeacherAssignment(Base):
    """
    Teacher assignment to course group and subject.
    Defines which teacher teaches which subject to which course.
    """
    __tablename__ = "teacherassignment"

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teacher.id"), nullable=False, index=True)
    course_group_id = Column(UUID(as_uuid=True), ForeignKey("coursegroup.id"), nullable=False, index=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subject.id"), nullable=False, index=True)
    school_year_id = Column(UUID(as_uuid=True), ForeignKey("schoolyear.id"), nullable=False, index=True)
    schedule = Column(JSONB, default=list)  # [{"day": "lunes", "start": "08:00", "end": "09:00"}]
    assigned_at = Column(Date, nullable=False)
    ended_at = Column(Date)

    # Relationships
    teacher = relationship("Teacher", back_populates="assignments")
    course_group = relationship("CourseGroup", back_populates="teacher_assignments")
    subject = relationship("Subject", back_populates="teacher_assignments")
    school_year = relationship("SchoolYear", back_populates="teacher_assignments")
    class_sessions = relationship("ClassSession", back_populates="teacher_assignment")

    def __repr__(self):
        return f"<TeacherAssignment(teacher_id={self.teacher_id}, course_group_id={self.course_group_id})>"


class Enrollment(Base):
    """
    Student enrollment in a course group.
    Tracks student's registration in a specific course for a school year.
    """
    __tablename__ = "enrollment"

    student_id = Column(UUID(as_uuid=True), ForeignKey("student.id"), nullable=False, index=True)
    course_group_id = Column(UUID(as_uuid=True), ForeignKey("coursegroup.id"), nullable=False, index=True)
    school_year_id = Column(UUID(as_uuid=True), ForeignKey("schoolyear.id"), nullable=False, index=True)
    enrollment_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(SQLEnum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False, index=True)

    # Relationships
    student = relationship("Student", back_populates="enrollments")
    course_group = relationship("CourseGroup", back_populates="enrollments")
    school_year = relationship("SchoolYear", back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment(student_id={self.student_id}, course_group_id={self.course_group_id}, status={self.status})>"


class Transfer(Base):
    """
    Student transfer between courses or campuses.
    Maintains history of student movements.
    """
    __tablename__ = "transfer"

    student_id = Column(UUID(as_uuid=True), ForeignKey("student.id"), nullable=False, index=True)
    from_enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollment.id"), nullable=False)
    to_enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollment.id"), nullable=False)
    from_campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"))
    to_campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"))
    transfer_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    notes = Column(Text)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    # Relationships
    student = relationship("Student", foreign_keys=[student_id], back_populates="transfers")
    from_enrollment = relationship("Enrollment", foreign_keys=[from_enrollment_id])
    to_enrollment = relationship("Enrollment", foreign_keys=[to_enrollment_id])
    from_campus = relationship("Campus", foreign_keys=[from_campus_id])
    to_campus = relationship("Campus", foreign_keys=[to_campus_id])
    approver = relationship("User")

    def __repr__(self):
        return f"<Transfer(student_id={self.student_id}, date={self.transfer_date})>"
