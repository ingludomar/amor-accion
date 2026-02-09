"""
Academic API endpoints.
Includes: SchoolYear, Period, Subject, CourseGroup, TeacherAssignment, Enrollment, Transfer
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.academic import SchoolYearService
from app.schemas.academic import (
    SchoolYearCreate,
    SchoolYearUpdate,
    SchoolYearResponse,
    SchoolYearListItem
)
from app.schemas.base import APIResponse, ResponseMeta
from app.core.config import settings


router = APIRouter()


# ============================================================================
# SchoolYear Endpoints
# ============================================================================

@router.get("/school-years", response_model=APIResponse)
def list_school_years(
    campus_id: UUID = Query(..., description="ID de la sede"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of school years for a campus.

    Args:
        campus_id: Campus ID to filter by
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        db: Database session
        current_user: Authenticated user

    Returns:
        List of school years
    """
    service = SchoolYearService(db)
    school_years = service.get_list(campus_id, skip, limit)

    return APIResponse(
        success=True,
        action="school_years.list",
        message=f"Se encontraron {len(school_years)} años escolares",
        data=[SchoolYearListItem.model_validate(sy).model_dump() for sy in school_years],
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/school-years/current", response_model=APIResponse)
def get_current_school_year(
    campus_id: UUID = Query(..., description="ID de la sede"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the current active school year for a campus.

    Args:
        campus_id: Campus ID to filter by
        db: Database session
        current_user: Authenticated user

    Returns:
        Current school year

    Raises:
        HTTPException: If no current school year is configured
    """
    service = SchoolYearService(db)
    school_year = service.get_current(campus_id)

    if not school_year:
        raise HTTPException(
            status_code=404,
            detail="No hay año escolar actual configurado"
        )

    return APIResponse(
        success=True,
        action="school_years.get_current",
        message="Año escolar actual encontrado",
        data=SchoolYearResponse.model_validate(school_year).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/school-years/{school_year_id}", response_model=APIResponse)
def get_school_year(
    school_year_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific school year by ID.

    Args:
        school_year_id: School year ID
        db: Database session
        current_user: Authenticated user

    Returns:
        School year details

    Raises:
        HTTPException: If school year not found
    """
    service = SchoolYearService(db)
    school_year = service.get(school_year_id)

    if not school_year:
        raise HTTPException(
            status_code=404,
            detail="Año escolar no encontrado"
        )

    return APIResponse(
        success=True,
        action="school_years.get",
        message="Año escolar encontrado",
        data=SchoolYearResponse.model_validate(school_year).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/school-years", response_model=APIResponse)
def create_school_year(
    data: SchoolYearCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new school year.

    Args:
        data: School year data
        db: Database session
        current_user: Authenticated user

    Returns:
        Created school year

    Raises:
        HTTPException: If validation fails
    """
    service = SchoolYearService(db)

    try:
        school_year = service.create(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return APIResponse(
        success=True,
        action="school_years.create",
        message="Año escolar creado exitosamente",
        data=SchoolYearResponse.model_validate(school_year).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.put("/school-years/{school_year_id}", response_model=APIResponse)
def update_school_year(
    school_year_id: UUID,
    data: SchoolYearUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing school year.

    Args:
        school_year_id: School year ID to update
        data: Updated school year data
        db: Database session
        current_user: Authenticated user

    Returns:
        Updated school year

    Raises:
        HTTPException: If school year not found or validation fails
    """
    service = SchoolYearService(db)

    try:
        school_year = service.update(school_year_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not school_year:
        raise HTTPException(
            status_code=404,
            detail="Año escolar no encontrado"
        )

    return APIResponse(
        success=True,
        action="school_years.update",
        message="Año escolar actualizado exitosamente",
        data=SchoolYearResponse.model_validate(school_year).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.delete("/school-years/{school_year_id}", response_model=APIResponse)
def delete_school_year(
    school_year_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete (soft delete) a school year.

    Args:
        school_year_id: School year ID to delete
        db: Database session
        current_user: Authenticated user

    Returns:
        Success confirmation

    Raises:
        HTTPException: If school year not found
    """
    service = SchoolYearService(db)
    success = service.delete(school_year_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Año escolar no encontrado"
        )

    return APIResponse(
        success=True,
        action="school_years.delete",
        message="Año escolar eliminado exitosamente",
        data=None,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/school-years/{school_year_id}/set-current", response_model=APIResponse)
def set_current_school_year(
    school_year_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a school year as the current active one for its campus.
    This will unmark all other school years in the same campus.

    Args:
        school_year_id: School year ID to mark as current
        db: Database session
        current_user: Authenticated user

    Returns:
        Updated school year

    Raises:
        HTTPException: If school year not found
    """
    service = SchoolYearService(db)
    school_year = service.get(school_year_id)

    if not school_year:
        raise HTTPException(
            status_code=404,
            detail="Año escolar no encontrado"
        )

    service.repo.set_current(school_year_id, school_year.campus_id)

    # Reload to get updated state
    school_year = service.get(school_year_id)

    return APIResponse(
        success=True,
        action="school_years.set_current",
        message="Año escolar marcado como actual",
        data=SchoolYearResponse.model_validate(school_year).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )
