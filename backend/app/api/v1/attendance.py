"""
Attendance API endpoints.
Includes: ClassSession management, Attendance recording, Reports
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.services.attendance import ClassSessionService, AttendanceService
from app.schemas.attendance import (
    ClassSessionCreate, ClassSessionUpdate, ClassSessionResponse, ClassSessionListItem,
    ClassSessionWithAttendance, AttendanceBulkCreate, AttendanceBulkResponse,
    AttendanceRecordUpdate, AttendanceRecordResponse, AttendanceRecordDetail,
    AttendanceStats, AttendanceChangeLogResponse
)
from app.schemas.base import APIResponse, ResponseMeta


router = APIRouter()


# ============================================================================
# ClassSession Endpoints
# ============================================================================

@router.get("/sessions", response_model=APIResponse)
def list_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    date: Optional[date] = Query(None, description="Filter by specific date"),
    teacher_id: Optional[UUID] = Query(None, description="Filter by teacher"),
    course_group_id: Optional[UUID] = Query(None, description="Filter by course group"),
    campus_id: Optional[UUID] = Query(None, description="Filter by campus"),
    status: Optional[str] = Query(None, description="Filter by status (scheduled, in_progress, closed, cancelled)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of class sessions with optional filters.
    
    Requires: attendance:read permission
    """
    service = ClassSessionService(db)
    
    if date:
        sessions = service.get_sessions_by_date(date, campus_id)
    elif teacher_id:
        sessions = service.get_teacher_sessions(teacher_id)
    else:
        # Get all sessions with filters
        from app.repositories.attendance import ClassSessionRepository
        repo = ClassSessionRepository(db)
        filters = {}
        if course_group_id:
            filters['course_group_id'] = course_group_id
        if status:
            filters['status'] = status
        sessions = repo.get_multi(skip=skip, limit=limit, filters=filters if filters else None)
    
    items = []
    for session in sessions:
        items.append({
            'id': str(session.id),
            'course_group_id': str(session.course_group_id),
            'subject_id': str(session.subject_id),
            'teacher_id': str(session.teacher_id),
            'session_date': session.session_date.isoformat(),
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat(),
            'status': session.status.value,
            'topic': session.topic,
        })
    
    return APIResponse(
        success=True,
        action="sessions.list",
        message=f"Se encontraron {len(items)} sesiones",
        data=items,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/sessions/{session_id}", response_model=APIResponse)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific class session by ID.
    
    Requires: attendance:read permission
    """
    service = ClassSessionService(db)
    session = service.repo.get(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return APIResponse(
        success=True,
        action="sessions.get",
        message="Sesión encontrada",
        data={
            'id': str(session.id),
            'course_group_id': str(session.course_group_id),
            'subject_id': str(session.subject_id),
            'teacher_id': str(session.teacher_id),
            'period_id': str(session.period_id) if session.period_id else None,
            'session_date': session.session_date.isoformat(),
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat(),
            'status': session.status.value,
            'topic': session.topic,
            'notes': session.notes,
            'closed_at': session.closed_at.isoformat() if session.closed_at else None,
            'closed_by': str(session.closed_by) if session.closed_by else None,
            'is_active': session.is_active,
            'created_at': session.created_at.isoformat(),
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/sessions", response_model=APIResponse)
def create_session(
    data: ClassSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new class session.
    
    Requires: attendance:write permission
    """
    service = ClassSessionService(db)
    
    try:
        session = service.create_session(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return APIResponse(
        success=True,
        action="sessions.create",
        message="Sesión creada exitosamente",
        data={
            'id': str(session.id),
            'course_group_id': str(session.course_group_id),
            'subject_id': str(session.subject_id),
            'teacher_id': str(session.teacher_id),
            'session_date': session.session_date.isoformat(),
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat(),
            'status': session.status.value,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.patch("/sessions/{session_id}", response_model=APIResponse)
def update_session(
    session_id: UUID,
    data: ClassSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing class session.
    
    Requires: attendance:write permission
    """
    service = ClassSessionService(db)
    
    try:
        session = service.update_session(session_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return APIResponse(
        success=True,
        action="sessions.update",
        message="Sesión actualizada exitosamente",
        data={
            'id': str(session.id),
            'session_date': session.session_date.isoformat(),
            'start_time': session.start_time.isoformat(),
            'end_time': session.end_time.isoformat(),
            'status': session.status.value,
            'topic': session.topic,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/sessions/{session_id}/start", response_model=APIResponse)
def start_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a class session (change status to in_progress).
    
    Requires: attendance:write permission
    """
    service = ClassSessionService(db)
    
    try:
        session = service.start_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return APIResponse(
        success=True,
        action="sessions.start",
        message="Sesión iniciada exitosamente",
        data={
            'id': str(session.id),
            'status': session.status.value,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/sessions/{session_id}/close", response_model=APIResponse)
def close_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Close a class session.
    
    Requires: attendance:write permission
    """
    service = ClassSessionService(db)
    
    try:
        session = service.close_session(session_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return APIResponse(
        success=True,
        action="sessions.close",
        message="Sesión cerrada exitosamente",
        data={
            'id': str(session.id),
            'status': session.status.value,
            'closed_at': session.closed_at.isoformat() if session.closed_at else None,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/sessions/{session_id}/cancel", response_model=APIResponse)
def cancel_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel a class session.
    
    Requires: attendance:write permission
    """
    service = ClassSessionService(db)
    
    try:
        session = service.cancel_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return APIResponse(
        success=True,
        action="sessions.cancel",
        message="Sesión cancelada exitosamente",
        data={
            'id': str(session.id),
            'status': session.status.value,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


# ============================================================================
# Attendance Record Endpoints
# ============================================================================

@router.get("/sessions/{session_id}/records", response_model=APIResponse)
def get_session_attendance(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all attendance records for a session.
    
    Requires: attendance:read permission
    """
    service = AttendanceService(db)
    
    # Verify session exists
    session = service.session_repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    records = service.get_session_attendance(session_id)
    
    items = []
    for record in records:
        student = record.student
        items.append({
            'id': str(record.id),
            'student_id': str(record.student_id),
            'student_code': student.student_code if student else None,
            'student_name': student.full_name if student else None,
            'status': record.status.value,
            'arrival_time': record.arrival_time.isoformat() if record.arrival_time else None,
            'notes': record.notes,
            'recorded_at': record.recorded_at.isoformat(),
        })
    
    return APIResponse(
        success=True,
        action="attendance.list",
        message=f"Se encontraron {len(items)} registros de asistencia",
        data=items,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/sessions/{session_id}/records", response_model=APIResponse)
def take_attendance(
    session_id: UUID,
    data: AttendanceBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record attendance for multiple students in a session.
    
    Requires: attendance:write permission
    """
    service = AttendanceService(db)
    
    try:
        result = service.take_attendance(session_id, data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return APIResponse(
        success=True,
        action="attendance.create",
        message=f"Asistencia registrada: {result['created']} creados, {result['updated']} actualizados",
        data={
            'created': result['created'],
            'updated': result['updated'],
            'errors': result['errors'],
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.patch("/records/{record_id}", response_model=APIResponse)
def update_attendance(
    record_id: UUID,
    data: AttendanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a single attendance record.
    
    Requires: attendance:write permission
    """
    service = AttendanceService(db)
    
    try:
        record = service.update_attendance(record_id, data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not record:
        raise HTTPException(status_code=404, detail="Registro de asistencia no encontrado")
    
    return APIResponse(
        success=True,
        action="attendance.update",
        message="Registro de asistencia actualizado exitosamente",
        data={
            'id': str(record.id),
            'status': record.status.value,
            'arrival_time': record.arrival_time.isoformat() if record.arrival_time else None,
            'notes': record.notes,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/records/{record_id}/excuse", response_model=APIResponse)
def excuse_absence(
    record_id: UUID,
    reason: str = Query(..., description="Reason for excusing the absence"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark an absence as excused with a reason.
    
    Requires: attendance:write permission
    """
    service = AttendanceService(db)
    
    try:
        record = service.excuse_absence(record_id, reason, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not record:
        raise HTTPException(status_code=404, detail="Registro de asistencia no encontrado")
    
    return APIResponse(
        success=True,
        action="attendance.excuse",
        message="Inasistencia justificada exitosamente",
        data={
            'id': str(record.id),
            'status': record.status.value,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


# ============================================================================
# Statistics Endpoints
# ============================================================================

@router.get("/sessions/{session_id}/stats", response_model=APIResponse)
def get_session_stats(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get attendance statistics for a session.
    
    Requires: attendance:read permission
    """
    service = AttendanceService(db)
    
    # Verify session exists
    session = service.session_repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    stats = service.get_session_stats(session_id)
    
    return APIResponse(
        success=True,
        action="attendance.stats",
        message="Estadísticas calculadas exitosamente",
        data={
            'session_id': str(stats.session_id),
            'total_students': stats.total_students,
            'present': stats.present,
            'absent': stats.absent,
            'late': stats.late,
            'excused': stats.excused,
            'attendance_rate': stats.attendance_rate,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/students/{student_id}/history", response_model=APIResponse)
def get_student_attendance_history(
    student_id: UUID,
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get attendance history for a student.
    
    Requires: attendance:read permission
    """
    service = AttendanceService(db)
    
    records = service.get_student_attendance_history(student_id, start_date, end_date)
    
    items = []
    for record in records:
        session = record.class_session
        items.append({
            'id': str(record.id),
            'session_id': str(record.class_session_id),
            'session_date': session.session_date.isoformat() if session else None,
            'course_group_id': str(session.course_group_id) if session else None,
            'status': record.status.value,
            'arrival_time': record.arrival_time.isoformat() if record.arrival_time else None,
            'notes': record.notes,
        })
    
    return APIResponse(
        success=True,
        action="attendance.student_history",
        message=f"Se encontraron {len(items)} registros",
        data=items,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/students/{student_id}/stats", response_model=APIResponse)
def get_student_stats(
    student_id: UUID,
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get attendance statistics for a student.
    
    Requires: attendance:read permission
    """
    service = AttendanceService(db)
    
    stats = service.get_student_stats(student_id, start_date, end_date)
    
    return APIResponse(
        success=True,
        action="attendance.student_stats",
        message="Estadísticas calculadas exitosamente",
        data=stats,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


# ============================================================================
# Report Endpoints
# ============================================================================

@router.get("/reports/daily", response_model=APIResponse)
def get_daily_report(
    report_date: date = Query(..., description="Date for the report"),
    campus_id: Optional[UUID] = Query(None, description="Filter by campus"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get daily attendance report.
    
    Requires: attendance:read permission
    """
    service = AttendanceService(db)
    
    report = service.get_daily_report(report_date, campus_id)
    
    return APIResponse(
        success=True,
        action="attendance.daily_report",
        message="Reporte diario generado exitosamente",
        data=report,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


# ============================================================================
# Change Log Endpoints
# ============================================================================

@router.get("/records/{record_id}/history", response_model=APIResponse)
def get_attendance_change_history(
    record_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get change history for an attendance record.
    
    Requires: attendance:read permission
    """
    from app.repositories.attendance import AttendanceChangeLogRepository
    
    repo = AttendanceChangeLogRepository(db)
    logs = repo.get_by_attendance_record(record_id)
    
    items = []
    for log in logs:
        items.append({
            'id': str(log.id),
            'changed_at': log.changed_at.isoformat(),
            'changed_by': str(log.changed_by),
            'old_status': log.old_status.value if log.old_status else None,
            'new_status': log.new_status.value if log.new_status else None,
            'old_notes': log.old_notes,
            'new_notes': log.new_notes,
            'reason': log.reason,
        })
    
    return APIResponse(
        success=True,
        action="attendance.change_history",
        message=f"Se encontraron {len(items)} cambios",
        data=items,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )
