"""
Attendance services for business logic.
Includes: ClassSessionService, AttendanceService
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date, time, datetime
from sqlalchemy.orm import Session

from app.repositories.attendance import ClassSessionRepository, AttendanceRecordRepository, AttendanceChangeLogRepository
from app.schemas.attendance import (
    ClassSessionCreate, ClassSessionUpdate, AttendanceBulkCreate,
    AttendanceRecordUpdate, AttendanceStats, SessionStatus, AttendanceStatus
)
from app.models.attendance import ClassSession, AttendanceRecord


class ClassSessionService:
    """Service for ClassSession business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = ClassSessionRepository(db)

    def create_session(self, data: ClassSessionCreate) -> ClassSession:
        """
        Create a new class session.
        
        Validates:
        - End time is after start time
        - No conflicting sessions for the same teacher
        """
        # Validate times
        if data.end_time <= data.start_time:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
        
        # Check for conflicting sessions
        if self.repo.has_conflicting_session(
            data.teacher_id, data.session_date, data.start_time, data.end_time
        ):
            raise ValueError("El profesor ya tiene una sesión programada en este horario")
        
        # Create session
        session_dict = data.model_dump()
        session_dict['status'] = SessionStatus.SCHEDULED
        
        return self.repo.create(session_dict)

    def update_session(self, session_id: UUID, data: ClassSessionUpdate) -> Optional[ClassSession]:
        """
        Update an existing class session.
        
        Validates:
        - Session exists and is not closed/cancelled
        - No time conflicts if times are changed
        """
        session = self.repo.get(session_id)
        if not session:
            return None
        
        # Check if session can be edited
        if session.status in [SessionStatus.CLOSED, SessionStatus.CANCELLED]:
            raise ValueError("No se puede editar una sesión cerrada o cancelada")
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Validate times if they are being updated
        if 'start_time' in update_data or 'end_time' in update_data:
            start = update_data.get('start_time', session.start_time)
            end = update_data.get('end_time', session.end_time)
            
            if end <= start:
                raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
            
            # Check for conflicts
            if self.repo.has_conflicting_session(
                session.teacher_id, session.session_date, start, end, exclude_session_id=session_id
            ):
                raise ValueError("El nuevo horario conflictúa con otra sesión del profesor")
        
        return self.repo.update(session_id, update_data)

    def start_session(self, session_id: UUID) -> Optional[ClassSession]:
        """Start a class session (change status to IN_PROGRESS)."""
        session = self.repo.get(session_id)
        if not session:
            return None
        
        if session.status != SessionStatus.SCHEDULED:
            raise ValueError("Solo se pueden iniciar sesiones programadas")
        
        return self.repo.update(session_id, {'status': SessionStatus.IN_PROGRESS})

    def close_session(self, session_id: UUID, closed_by: UUID) -> Optional[ClassSession]:
        """Close a class session."""
        session = self.repo.get(session_id)
        if not session:
            return None
        
        if session.status not in [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]:
            raise ValueError("No se puede cerrar una sesión que no está activa")
        
        return self.repo.close_session(session_id, closed_by)

    def cancel_session(self, session_id: UUID) -> Optional[ClassSession]:
        """Cancel a class session."""
        session = self.repo.get(session_id)
        if not session:
            return None
        
        if session.status == SessionStatus.CLOSED:
            raise ValueError("No se puede cancelar una sesión ya cerrada")
        
        return self.repo.update(session_id, {'status': SessionStatus.CANCELLED})

    def get_teacher_sessions(self, teacher_id: UUID, start_date: Optional[date] = None,
                            end_date: Optional[date] = None) -> List[ClassSession]:
        """Get all sessions for a teacher in a date range."""
        return self.repo.get_by_teacher(teacher_id, start_date, end_date)

    def get_sessions_by_date(self, session_date: date, campus_id: Optional[UUID] = None) -> List[ClassSession]:
        """Get all sessions for a specific date."""
        return self.repo.get_by_date(session_date, campus_id)

    def get_session_with_attendance(self, session_id: UUID) -> Optional[ClassSession]:
        """Get session with all attendance records."""
        return self.repo.get_with_attendance(session_id)


class AttendanceService:
    """Service for AttendanceRecord business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = AttendanceRecordRepository(db)
        self.change_log_repo = AttendanceChangeLogRepository(db)
        self.session_repo = ClassSessionRepository(db)

    def take_attendance(self, class_session_id: UUID, data: AttendanceBulkCreate, 
                       recorded_by: UUID) -> Dict[str, Any]:
        """
        Record attendance for multiple students at once.
        
        Returns dict with created, updated counts and any errors.
        """
        # Verify session exists and is not cancelled
        session = self.session_repo.get(class_session_id)
        if not session:
            raise ValueError("Sesión no encontrada")
        
        if session.status == SessionStatus.CANCELLED:
            raise ValueError("No se puede tomar asistencia en una sesión cancelada")
        
        # Prepare records data
        records_data = []
        for record in data.records:
            record_dict = record.model_dump()
            record_dict['class_session_id'] = class_session_id
            records_data.append(record_dict)
        
        # Bulk create/update
        created, updated, errors = self.repo.bulk_create(records_data, recorded_by)
        
        # If session was scheduled, change to in_progress
        if session.status == SessionStatus.SCHEDULED:
            self.session_repo.update(class_session_id, {'status': SessionStatus.IN_PROGRESS})
        
        return {
            'created': created,
            'updated': updated,
            'errors': errors
        }

    def update_attendance(self, attendance_record_id: UUID, data: AttendanceRecordUpdate,
                         changed_by: UUID) -> Optional[AttendanceRecord]:
        """
        Update a single attendance record.
        
        Creates an audit log entry for the change.
        """
        record = self.repo.get(attendance_record_id)
        if not record:
            return None
        
        # Get old values for audit log
        old_status = record.status
        old_notes = record.notes
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Remove reason from update data (it's for the log only)
        reason = update_data.pop('reason', None)
        
        # Update the record
        updated_record = self.repo.update(attendance_record_id, update_data)
        
        if updated_record:
            # Create change log
            self.change_log_repo.create_log(
                attendance_record_id=attendance_record_id,
                changed_by=changed_by,
                old_status=old_status,
                new_status=updated_record.status,
                old_notes=old_notes,
                new_notes=updated_record.notes,
                reason=reason
            )
        
        return updated_record

    def get_session_attendance(self, class_session_id: UUID) -> List[AttendanceRecord]:
        """Get all attendance records for a session with student info."""
        return self.repo.get_by_session_with_students(class_session_id)

    def get_student_attendance_history(self, student_id: UUID, start_date: Optional[date] = None,
                                      end_date: Optional[date] = None) -> List[AttendanceRecord]:
        """Get attendance history for a student."""
        return self.repo.get_by_student(student_id, start_date, end_date)

    def get_session_stats(self, class_session_id: UUID) -> AttendanceStats:
        """Get attendance statistics for a session."""
        raw_stats = self.repo.get_stats(class_session_id)
        
        total = raw_stats['total']
        present = raw_stats['present']
        late = raw_stats['late']
        
        # Calculate attendance rate (present + late count as attended)
        attendance_rate = ((present + late) / total * 100) if total > 0 else 0.0
        
        return AttendanceStats(
            session_id=class_session_id,
            total_students=total,
            present=raw_stats['present'],
            absent=raw_stats['absent'],
            late=raw_stats['late'],
            excused=raw_stats['excused'],
            attendance_rate=round(attendance_rate, 2)
        )

    def get_student_stats(self, student_id: UUID, start_date: Optional[date] = None,
                         end_date: Optional[date] = None) -> Dict[str, Any]:
        """Get attendance statistics for a student."""
        raw_stats = self.repo.get_student_stats(student_id, start_date, end_date)
        
        total = raw_stats['total_sessions']
        present = raw_stats['present']
        late = raw_stats['late']
        
        # Calculate attendance rate
        attendance_rate = ((present + late) / total * 100) if total > 0 else 0.0
        
        return {
            'student_id': str(student_id),
            'total_sessions': total,
            'present': present,
            'absent': raw_stats['absent'],
            'late': late,
            'excused': raw_stats['excused'],
            'attendance_rate': round(attendance_rate, 2)
        }

    def excuse_absence(self, attendance_record_id: UUID, reason: str, 
                      changed_by: UUID) -> Optional[AttendanceRecord]:
        """
        Mark an absence as excused with a reason.
        
        This creates a change log entry.
        """
        record = self.repo.get(attendance_record_id)
        if not record:
            return None
        
        # Can only excuse absent or late records
        if record.status not in [AttendanceStatus.ABSENT, AttendanceStatus.LATE]:
            raise ValueError("Solo se pueden justificar inasistencias o tardanzas")
        
        # Update to excused
        update_data = AttendanceRecordUpdate(
            status=AttendanceStatus.EXCUSED,
            reason=reason
        )
        
        return self.update_attendance(attendance_record_id, update_data, changed_by)

    def get_daily_report(self, report_date: date, campus_id: Optional[UUID] = None) -> Dict[str, Any]:
        """
        Get daily attendance report.
        
        Returns statistics for all sessions on a given date.
        """
        sessions = self.session_repo.get_by_date(report_date, campus_id)
        
        session_stats = []
        total_attendance_rate = 0
        sessions_with_attendance = 0
        
        for session in sessions:
            stats = self.repo.get_stats(session.id)
            if stats['total'] > 0:
                sessions_with_attendance += 1
                rate = ((stats['present'] + stats['late']) / stats['total']) * 100
                total_attendance_rate += rate
                
                session_stats.append({
                    'session_id': str(session.id),
                    'course_group_id': str(session.course_group_id),
                    'subject_id': str(session.subject_id),
                    'status': session.status.value,
                    'total_students': stats['total'],
                    'present': stats['present'],
                    'absent': stats['absent'],
                    'late': stats['late'],
                    'excused': stats['excused'],
                    'attendance_rate': round(rate, 2)
                })
        
        overall_rate = (total_attendance_rate / sessions_with_attendance) if sessions_with_attendance > 0 else 0
        
        return {
            'date': report_date.isoformat(),
            'campus_id': str(campus_id) if campus_id else None,
            'total_sessions': len(sessions),
            'sessions_with_attendance': sessions_with_attendance,
            'overall_attendance_rate': round(overall_rate, 2),
            'session_stats': session_stats
        }

    def get_student_attendance_for_course(self, student_id: UUID, course_group_id: UUID,
                                         start_date: Optional[date] = None,
                                         end_date: Optional[date] = None) -> List[AttendanceRecord]:
        """Get attendance records for a student in a specific course."""
        query = self.db.query(AttendanceRecord).join(ClassSession).filter(
            AttendanceRecord.student_id == student_id,
            ClassSession.course_group_id == course_group_id
        )
        
        if start_date:
            query = query.filter(ClassSession.session_date >= start_date)
        if end_date:
            query = query.filter(ClassSession.session_date <= end_date)
        
        return query.order_by(ClassSession.session_date.desc()).all()
