"""
Attendance models: ClassSession, AttendanceRecord, AttendanceChangeLog.
"""
from sqlalchemy import Column, String, ForeignKey, Date, Time, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base


class SessionStatus(str, enum.Enum):
    """Class session status enum."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class AttendanceStatus(str, enum.Enum):
    """Attendance status enum."""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class ClassSession(Base):
    """
    Class session model.
    Represents a single class/lesson instance.
    """
    __tablename__ = "classsession"

    course_group_id = Column(UUID(as_uuid=True), ForeignKey("coursegroup.id"), nullable=False, index=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subject.id"), nullable=False, index=True)
    teacher_assignment_id = Column(UUID(as_uuid=True), ForeignKey("teacherassignment.id"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)
    period_id = Column(UUID(as_uuid=True), ForeignKey("period.id"), index=True)
    session_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.SCHEDULED, nullable=False, index=True)
    topic = Column(String(255))
    notes = Column(Text)
    closed_at = Column(DateTime)
    closed_by = Column(UUID(as_uuid=True), ForeignKey("user.id"))

    # Relationships
    course_group = relationship("CourseGroup", back_populates="class_sessions")
    subject = relationship("Subject", back_populates="class_sessions")
    teacher_assignment = relationship("TeacherAssignment", back_populates="class_sessions")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="class_sessions")
    closer = relationship("User", foreign_keys=[closed_by])
    period = relationship("Period", back_populates="class_sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="class_session")

    def __repr__(self):
        return f"<ClassSession(date={self.session_date}, course_group_id={self.course_group_id}, status={self.status})>"


class AttendanceRecord(Base):
    """
    Attendance record for a student in a class session.
    """
    __tablename__ = "attendancerecord"

    class_session_id = Column(UUID(as_uuid=True), ForeignKey("classsession.id"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student.id"), nullable=False, index=True)
    status = Column(SQLEnum(AttendanceStatus), nullable=False, index=True)
    arrival_time = Column(Time)
    notes = Column(Text)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    recorded_at = Column(DateTime, nullable=False)

    # Relationships
    class_session = relationship("ClassSession", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance_records")
    recorder = relationship("User")
    change_logs = relationship("AttendanceChangeLog", back_populates="attendance_record")

    def __repr__(self):
        return f"<AttendanceRecord(session_id={self.class_session_id}, student_id={self.student_id}, status={self.status})>"


class AttendanceChangeLog(Base):
    """
    Audit log for attendance record changes.
    Tracks all modifications to attendance records.
    """
    __tablename__ = "attendancechangelog"

    attendance_record_id = Column(UUID(as_uuid=True), ForeignKey("attendancerecord.id"), nullable=False, index=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    changed_at = Column(DateTime, nullable=False)
    old_status = Column(SQLEnum(AttendanceStatus))
    new_status = Column(SQLEnum(AttendanceStatus))
    old_notes = Column(Text)
    new_notes = Column(Text)
    reason = Column(Text)

    # Relationships
    attendance_record = relationship("AttendanceRecord", back_populates="change_logs")
    changer = relationship("User")

    def __repr__(self):
        return f"<AttendanceChangeLog(record_id={self.attendance_record_id}, changed_at={self.changed_at})>"
