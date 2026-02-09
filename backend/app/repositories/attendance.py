"""
Attendance repositories for database operations.
Includes: ClassSessionRepository, AttendanceRecordRepository
"""
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import date, datetime
from sqlalchemy import func, and_
from sqlalchemy.orm import Session, joinedload

from app.repositories.base import BaseRepository
from app.models.attendance import ClassSession, AttendanceRecord, AttendanceChangeLog, SessionStatus


class ClassSessionRepository(BaseRepository[ClassSession]):
    """Repository for ClassSession operations."""

    def __init__(self, db: Session):
        super().__init__(ClassSession, db)

    def get_by_course_group(self, course_group_id: UUID, session_date: Optional[date] = None) -> List[ClassSession]:
        """Get sessions by course group, optionally filtered by date."""
        query = self.db.query(self.model).filter(self.model.course_group_id == course_group_id)
        if session_date:
            query = query.filter(self.model.session_date == session_date)
        return query.order_by(self.model.start_time).all()

    def get_by_teacher(self, teacher_id: UUID, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[ClassSession]:
        """Get sessions by teacher, optionally filtered by date range."""
        query = self.db.query(self.model).filter(self.model.teacher_id == teacher_id)
        if start_date:
            query = query.filter(self.model.session_date >= start_date)
        if end_date:
            query = query.filter(self.model.session_date <= end_date)
        return query.order_by(self.model.session_date, self.model.start_time).all()

    def get_by_date(self, session_date: date, campus_id: Optional[UUID] = None) -> List[ClassSession]:
        """Get all sessions for a specific date, optionally filtered by campus."""
        query = self.db.query(self.model).filter(self.model.session_date == session_date)
        if campus_id:
            # Join with course_group to filter by campus
            from app.models.academic import CourseGroup
            query = query.join(CourseGroup).filter(CourseGroup.campus_id == campus_id)
        return query.order_by(self.model.start_time).all()

    def get_active_sessions(self) -> List[ClassSession]:
        """Get all currently active (in_progress) sessions."""
        return self.db.query(self.model).filter(
            self.model.status == SessionStatus.IN_PROGRESS
        ).all()

    def get_with_attendance(self, session_id: UUID) -> Optional[ClassSession]:
        """Get session with all attendance records loaded."""
        return self.db.query(self.model).options(
            joinedload(self.model.attendance_records).joinedload(AttendanceRecord.student)
        ).filter(self.model.id == session_id).first()

    def has_conflicting_session(self, teacher_id: UUID, session_date: date, 
                                start_time: datetime.time, end_time: datetime.time,
                                exclude_session_id: Optional[UUID] = None) -> bool:
        """Check if teacher has a conflicting session at the given time."""
        query = self.db.query(self.model).filter(
            and_(
                self.model.teacher_id == teacher_id,
                self.model.session_date == session_date,
                self.model.status != SessionStatus.CANCELLED,
                # Check for time overlap
                self.model.start_time < end_time,
                self.model.end_time > start_time
            )
        )
        if exclude_session_id:
            query = query.filter(self.model.id != exclude_session_id)
        return query.first() is not None

    def close_session(self, session_id: UUID, closed_by: UUID) -> Optional[ClassSession]:
        """Close a session and record who closed it."""
        session = self.get(session_id)
        if not session:
            return None
        
        session.status = SessionStatus.CLOSED
        session.closed_at = datetime.utcnow()
        session.closed_by = closed_by
        self.db.commit()
        self.db.refresh(session)
        return session


class AttendanceRecordRepository(BaseRepository[AttendanceRecord]):
    """Repository for AttendanceRecord operations."""

    def __init__(self, db: Session):
        super().__init__(AttendanceRecord, db)

    def get_by_session(self, class_session_id: UUID) -> List[AttendanceRecord]:
        """Get all attendance records for a specific session."""
        return self.db.query(self.model).filter(
            self.model.class_session_id == class_session_id
        ).all()

    def get_by_session_with_students(self, class_session_id: UUID) -> List[AttendanceRecord]:
        """Get all attendance records for a session with student data loaded."""
        return self.db.query(self.model).options(
            joinedload(self.model.student)
        ).filter(
            self.model.class_session_id == class_session_id
        ).all()

    def get_by_student(self, student_id: UUID, start_date: Optional[date] = None, 
                       end_date: Optional[date] = None) -> List[AttendanceRecord]:
        """Get attendance records for a student, optionally filtered by date range."""
        query = self.db.query(self.model).join(ClassSession).filter(
            self.model.student_id == student_id
        )
        if start_date:
            query = query.filter(ClassSession.session_date >= start_date)
        if end_date:
            query = query.filter(ClassSession.session_date <= end_date)
        return query.order_by(ClassSession.session_date.desc()).all()

    def get_by_student_and_session(self, student_id: UUID, class_session_id: UUID) -> Optional[AttendanceRecord]:
        """Get attendance record for a specific student and session."""
        return self.db.query(self.model).filter(
            and_(
                self.model.student_id == student_id,
                self.model.class_session_id == class_session_id
            )
        ).first()

    def get_stats(self, class_session_id: UUID) -> Dict[str, Any]:
        """Get attendance statistics for a session."""
        from app.models.attendance import AttendanceStatus
        
        stats = self.db.query(
            self.model.status,
            func.count(self.model.id).label('count')
        ).filter(
            self.model.class_session_id == class_session_id
        ).group_by(self.model.status).all()
        
        result = {
            'total': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'excused': 0
        }
        
        for status, count in stats:
            result[status.value] = count
            result['total'] += count
        
        return result

    def get_student_stats(self, student_id: UUID, start_date: Optional[date] = None,
                         end_date: Optional[date] = None) -> Dict[str, Any]:
        """Get attendance statistics for a student."""
        query = self.db.query(self.model).join(ClassSession).filter(
            self.model.student_id == student_id
        )
        
        if start_date:
            query = query.filter(ClassSession.session_date >= start_date)
        if end_date:
            query = query.filter(ClassSession.session_date <= end_date)
        
        stats = query.with_entities(
            self.model.status,
            func.count(self.model.id).label('count')
        ).group_by(self.model.status).all()
        
        result = {
            'total_sessions': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'excused': 0
        }
        
        for status, count in stats:
            result[status.value] = count
            result['total_sessions'] += count
        
        return result

    def bulk_create(self, records_data: List[Dict[str, Any]], recorded_by: UUID) -> Tuple[int, int, List[str]]:
        """Create multiple attendance records at once.
        
        Returns:
            Tuple of (created_count, updated_count, error_messages)
        """
        created = 0
        updated = 0
        errors = []
        
        for record_data in records_data:
            try:
                # Check if record already exists
                existing = self.get_by_student_and_session(
                    record_data['student_id'],
                    record_data['class_session_id']
                )
                
                if existing:
                    # Update existing record
                    for field, value in record_data.items():
                        if hasattr(existing, field):
                            setattr(existing, field, value)
                    existing.recorded_at = datetime.utcnow()
                    updated += 1
                else:
                    # Create new record
                    record_data['recorded_by'] = recorded_by
                    record_data['recorded_at'] = datetime.utcnow()
                    db_obj = self.model(**record_data)
                    self.db.add(db_obj)
                    created += 1
                    
            except Exception as e:
                errors.append(f"Error processing student {record_data.get('student_id')}: {str(e)}")
        
        self.db.commit()
        return created, updated, errors

    def get_course_attendance(self, course_group_id: UUID, session_date: date) -> List[AttendanceRecord]:
        """Get attendance records for all students in a course on a specific date."""
        return self.db.query(self.model).join(ClassSession).filter(
            and_(
                ClassSession.course_group_id == course_group_id,
                ClassSession.session_date == session_date
            )
        ).all()


class AttendanceChangeLogRepository(BaseRepository[AttendanceChangeLog]):
    """Repository for AttendanceChangeLog operations."""

    def __init__(self, db: Session):
        super().__init__(AttendanceChangeLog, db)

    def get_by_attendance_record(self, attendance_record_id: UUID) -> List[AttendanceChangeLog]:
        """Get all change logs for a specific attendance record."""
        return self.db.query(self.model).filter(
            self.model.attendance_record_id == attendance_record_id
        ).order_by(self.model.changed_at.desc()).all()

    def create_log(self, attendance_record_id: UUID, changed_by: UUID,
                   old_status: Optional[Any], new_status: Optional[Any],
                   old_notes: Optional[str], new_notes: Optional[str],
                   reason: Optional[str]) -> AttendanceChangeLog:
        """Create a change log entry."""
        log_data = {
            'attendance_record_id': attendance_record_id,
            'changed_by': changed_by,
            'changed_at': datetime.utcnow(),
            'old_status': old_status,
            'new_status': new_status,
            'old_notes': old_notes,
            'new_notes': new_notes,
            'reason': reason
        }
        return self.create(log_data)
