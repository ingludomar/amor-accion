"""
Campus API endpoints.
"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.core.config import settings
from app.services.campus import CampusService
from app.schemas.campus import CampusCreate, CampusUpdate, CampusResponse, CampusListItem
from app.schemas.base import APIResponse, ResponseMeta, PaginatedResponse
from app.models.user import User


router = APIRouter()


@router.get("", response_model=APIResponse)
async def list_campuses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all campuses with pagination.
    Requires: campuses:read permission
    """
    service = CampusService(db)
    campuses, total = service.get_all_campuses(skip=skip, limit=limit, is_active=is_active)

    total_pages = (total + limit - 1) // limit

    paginated_data = PaginatedResponse(
        items=[CampusListItem.model_validate(c) for c in campuses],
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages
    )

    return APIResponse(
        success=True,
        action="campus.list",
        message="Campuses retrieved successfully",
        data=paginated_data.model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/{campus_id}", response_model=APIResponse)
async def get_campus(
    campus_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get campus by ID.
    Requires: campuses:read permission
    """
    service = CampusService(db)
    campus = service.get_campus(campus_id)

    return APIResponse(
        success=True,
        action="campus.get",
        message="Campus retrieved successfully",
        data=CampusResponse.model_validate(campus).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_campus(
    campus_data: CampusCreate,
    current_user: User = Depends(require_permission("campuses:write")),
    db: Session = Depends(get_db)
):
    """
    Create a new campus.
    Requires: campuses:write permission (SuperAdmin only)
    """
    service = CampusService(db)
    campus = service.create_campus(campus_data)

    return APIResponse(
        success=True,
        action="campus.created",
        message="Campus created successfully",
        data=CampusResponse.model_validate(campus).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.patch("/{campus_id}", response_model=APIResponse)
async def update_campus(
    campus_id: UUID,
    campus_data: CampusUpdate,
    current_user: User = Depends(require_permission("campuses:write")),
    db: Session = Depends(get_db)
):
    """
    Update a campus.
    Requires: campuses:write permission
    """
    service = CampusService(db)
    campus = service.update_campus(campus_id, campus_data)

    return APIResponse(
        success=True,
        action="campus.updated",
        message="Campus updated successfully",
        data=CampusResponse.model_validate(campus).model_dump(),
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.delete("/{campus_id}", response_model=APIResponse)
async def delete_campus(
    campus_id: UUID,
    current_user: User = Depends(require_permission("campuses:delete")),
    db: Session = Depends(get_db)
):
    """
    Soft delete a campus (set is_active=False).
    Requires: campuses:delete permission (SuperAdmin only)
    """
    service = CampusService(db)
    service.delete_campus(campus_id)

    return APIResponse(
        success=True,
        action="campus.deleted",
        message="Campus deactivated successfully",
        data=None,
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )
