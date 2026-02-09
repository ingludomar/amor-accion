"""
Attendance schemas for validation and serialization.
Includes: ClassSession, AttendanceRecord, AttendanceChangeLog
"""
from pydantic import BaseModel, Field
from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class SessionStatus(str, Enum):
    """Class session status enum."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class AttendanceStatus(str, Enum):
    """Attendance status enum."""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


# ============================================================================
# ClassSession Schemas
# ============================================================================

class ClassSessionBase(BaseModel):
    """Base schema for ClassSession."""
    course_group_id: UUID = Field(..., description="ID of the course group")
    subject_id: UUID = Field(..., description="ID of the subject")
    period_id: Optional[UUID] = Field(None, description="ID of the academic period")
    session_date: date = Field(..., description="Date of the session")
    start_time: time = Field(..., description="Start time of the session")
    end_time: time = Field(..., description="End time of the session")
    topic: Optional[str] = Field(None, max_length=255, description="Topic or theme of the class")
    notes: Optional[str] = Field(None, description="Additional notes")


class ClassSessionCreate(ClassSessionBase):
    """Schema for creating a new ClassSession."""
    teacher_id: UUID = Field(..., description="ID of the teacher conducting the session")


class ClassSessionUpdate(BaseModel):
    """Schema for updating a ClassSession."""
    session_date: Optional[date] = Field(None, description="Date of the session")
    start_time: Optional[time] = Field(None, description="Start time of the session")
    end_time: Optional[time] = Field(None, description="End time of the session")
    status: Optional[SessionStatus] = Field(None, description="Status of the session")
    topic: Optional[str] = Field(None, max_length=255, description="Topic or theme of the class")
    notes: Optional[str] = Field(None, description="Additional notes")


class ClassSessionResponse(ClassSessionBase):
    """Schema for ClassSession response."""
    id: UUID
    teacher_id: UUID
    status: SessionStatus
    closed_at: Optional[datetime] = None
    closed_by: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClassSessionListItem(BaseModel):
    """Lightweight schema for ClassSession list items."""
    id: UUID
    course_group_id: UUID
    subject_id: UUID
    teacher_id: UUID
    session_date: date
    start_time: time
    end_time: time
    status: SessionStatus
    topic: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# AttendanceRecord Schemas
# ============================================================================

class AttendanceRecordBase(BaseModel):
    """Base schema for AttendanceRecord."""
    student_id: UUID = Field(..., description="ID of the student")
    status: AttendanceStatus = Field(..., description="Attendance status")
    arrival_time: Optional[time] = Field(None, description="Time of arrival")
    notes: Optional[str] = Field(None, description="Additional notes")


class AttendanceRecordCreate(AttendanceRecordBase):
    """Schema for creating a new AttendanceRecord."""
    pass


class AttendanceRecordUpdate(BaseModel):
    """Schema for updating an AttendanceRecord."""
    status: Optional[AttendanceStatus] = Field(None, description="Attendance status")
    arrival_time: Optional[time] = Field(None, description="Time of arrival")
    notes: Optional[str] = Field(None, description="Additional notes")
    reason: Optional[str] = Field(None, description="Reason for change (for audit log)")


class AttendanceRecordResponse(BaseModel):
    """Schema for AttendanceRecord response."""
    id: UUID
    class_session_id: UUID
    student_id: UUID
    student_name: Optional[str] = Field(None, description="Full name of the student")
    status: AttendanceStatus
    arrival_time: Optional[time] = None
    notes: Optional[str] = None
    recorded_by: UUID
    recorded_at: datetime

    class Config:
        from_attributes = True


class AttendanceRecordDetail(BaseModel):
    """Detailed schema for AttendanceRecord with student info."""
    id: UUID
    student_id: UUID
    student_code: str
    student_name: str
    status: AttendanceStatus
    arrival_time: Optional[time] = None
    notes: Optional[str] = None
    recorded_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Bulk Operations Schemas
# ============================================================================

class BulkAttendanceRecord(BaseModel):
    """Schema for a single record in bulk attendance operation."""
    student_id: UUID = Field(..., description="ID of the student")
    status: AttendanceStatus = Field(..., description="Attendance status")
    arrival_time: Optional[time] = Field(None, description="Time of arrival")
    notes: Optional[str] = Field(None, description="Additional notes")


class AttendanceBulkCreate(BaseModel):
    """Schema for creating multiple attendance records at once."""
    records: List[BulkAttendanceRecord] = Field(..., min_length=1, description="List of attendance records")


class AttendanceBulkResponse(BaseModel):
    """Schema for bulk attendance creation response."""
    created: int = Field(..., description="Number of records created")
    updated: int = Field(..., description="Number of records updated")
    failed: int = Field(..., description="Number of records that failed")
    errors: Optional[List[str]] = Field(None, description="List of error messages")


# ============================================================================
# Statistics Schemas
# ============================================================================

class AttendanceStats(BaseModel):
    """Schema for attendance statistics."""
    session_id: UUID
    total_students: int = Field(..., description="Total number of students")
    present: int = Field(..., description="Number of students present")
    absent: int = Field(..., description="Number of students absent")
    late: int = Field(..., description="Number of students late")
    excused: int = Field(..., description="Number of students excused")
    attendance_rate: float = Field(..., description="Attendance rate as percentage")


class StudentAttendanceStats(BaseModel):
    """Schema for student attendance statistics."""
    student_id: UUID
    student_name: str
    total_sessions: int
    present_count: int
    absent_count: int
    late_count: int
    excused_count: int
    attendance_rate: float


class CourseAttendanceStats(BaseModel):
    """Schema for course attendance statistics."""
    course_group_id: UUID
    course_name: str
    total_sessions: int
    average_attendance_rate: float
    student_stats: List[StudentAttendanceStats]


# ============================================================================
# Daily Report Schema
# ============================================================================

class DailyAttendanceReport(BaseModel):
    """Schema for daily attendance report by campus."""
    date: date
    campus_id: UUID
    total_sessions: int
    sessions_with_attendance: int
    overall_attendance_rate: float
    session_stats: List[AttendanceStats]


# ============================================================================
# AttendanceChangeLog Schemas
# ============================================================================

class AttendanceChangeLogResponse(BaseModel):
    """Schema for AttendanceChangeLog response."""
    id: UUID
    attendance_record_id: UUID
    changed_by: UUID
    changed_at: datetime
    old_status: Optional[AttendanceStatus] = None
    new_status: Optional[AttendanceStatus] = None
    old_notes: Optional[str] = None
    new_notes: Optional[str] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# Session with Attendance Schema
# ============================================================================

class ClassSessionWithAttendance(BaseModel):
    """Schema for ClassSession with all attendance records."""
    session: ClassSessionResponse
    attendance: List[AttendanceRecordDetail]
    stats: AttendanceStats
    can_edit: bool = Field(..., description="Whether the current user can edit this session")
