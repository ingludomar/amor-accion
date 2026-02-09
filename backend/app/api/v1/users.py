"""
User management API endpoints.
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from datetime import datetime
from app.core.config import settings
from app.schemas.base import ResponseMeta
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.base import APIResponse, PaginatedResponse
from app.services.user import UserService


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=APIResponse)
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campus_id: Optional[UUID] = None,
    role_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of users with filters.
    Requires: users:read permission
    """
    service = UserService(db)

    filters = {}
    if campus_id:
        filters["campus_id"] = campus_id
    if role_id:
        filters["role_id"] = role_id
    if is_active is not None:
        filters["is_active"] = is_active
    if search:
        filters["search"] = search

    users, total = service.get_users(skip=skip, limit=limit, filters=filters)

    # Format response
    items = []
    for user in users:
        roles = [ur.role.name for ur in user.roles]
        campuses = [
            {
                "id": str(uc.campus.id),
                "name": uc.campus.name,
                "code": uc.campus.code,
                "is_primary": uc.is_primary,
            }
            for uc in user.campuses
        ]

        is_teacher = user.teacher_profile is not None
        teacher_code = user.teacher_profile.teacher_code if is_teacher else None

        items.append({
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "document_type": user.document_type,
            "document_number": user.document_number,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "roles": roles,
            "campuses": campuses,
            "is_teacher": is_teacher,
            "teacher_code": teacher_code,
            "created_at": user.created_at.isoformat(),
        })

    page = (skip // limit) + 1
    total_pages = (total + limit - 1) // limit

    return APIResponse(
        success=True,
        action="user.list",
        message="Users retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "page_size": limit,
            "total_pages": total_pages,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/{user_id}", response_model=APIResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get user by ID.
    Requires: users:read permission
    """
    service = UserService(db)
    user = service.get_user(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    roles = [ur.role.name for ur in user.roles]
    campuses = [
        {
            "id": str(uc.campus.id),
            "name": uc.campus.name,
            "code": uc.campus.code,
            "is_primary": uc.is_primary,
        }
        for uc in user.campuses
    ]

    is_teacher = user.teacher_profile is not None
    teacher_code = user.teacher_profile.teacher_code if is_teacher else None

    return APIResponse(
        success=True,
        action="user.get",
        message="User retrieved successfully",
        data={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "document_type": user.document_type,
            "document_number": user.document_number,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "roles": roles,
            "campuses": campuses,
            "is_teacher": is_teacher,
            "teacher_code": teacher_code,
            "created_at": user.created_at.isoformat(),
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("", response_model=APIResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new user.
    Requires: users:write permission
    """
    service = UserService(db)

    try:
        user = service.create_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            full_name=user_data.full_name,
            role_ids=user_data.role_ids,
            campus_ids=user_data.campus_ids,
            document_type=user_data.document_type,
            document_number=user_data.document_number,
            phone=user_data.phone,
            is_teacher=user_data.is_teacher,
            teacher_code=user_data.teacher_code,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    roles = [ur.role.name for ur in user.roles]
    campuses = [
        {
            "id": str(uc.campus.id),
            "name": uc.campus.name,
            "code": uc.campus.code,
            "is_primary": uc.is_primary,
        }
        for uc in user.campuses
    ]

    is_teacher = user.teacher_profile is not None
    teacher_code = user.teacher_profile.teacher_code if is_teacher else None

    return APIResponse(
        success=True,
        action="user.create",
        message="User created successfully",
        data={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "document_type": user.document_type,
            "document_number": user.document_number,
            "phone": user.phone,
            "is_active": user.is_active,
            "roles": roles,
            "campuses": campuses,
            "is_teacher": is_teacher,
            "teacher_code": teacher_code,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.patch("/{user_id}", response_model=APIResponse)
def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update user information.
    Requires: users:write permission
    """
    service = UserService(db)

    user = service.update_user(
        user_id=user_id,
        full_name=user_data.full_name,
        document_type=user_data.document_type,
        document_number=user_data.document_number,
        phone=user_data.phone,
        is_active=user_data.is_active,
        role_ids=user_data.role_ids,
        campus_ids=user_data.campus_ids,
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    roles = [ur.role.name for ur in user.roles]
    campuses = [
        {
            "id": str(uc.campus.id),
            "name": uc.campus.name,
            "code": uc.campus.code,
            "is_primary": uc.is_primary,
        }
        for uc in user.campuses
    ]

    is_teacher = user.teacher_profile is not None
    teacher_code = user.teacher_profile.teacher_code if is_teacher else None

    return APIResponse(
        success=True,
        action="user.update",
        message="User updated successfully",
        data={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "document_type": user.document_type,
            "document_number": user.document_number,
            "phone": user.phone,
            "is_active": user.is_active,
            "roles": roles,
            "campuses": campuses,
            "is_teacher": is_teacher,
            "teacher_code": teacher_code,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.delete("/{user_id}", response_model=APIResponse)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete (deactivate) user.
    Requires: users:delete permission
    """
    service = UserService(db)

    success = service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    return APIResponse(
        success=True,
        action="user.delete",
        message="User deactivated successfully",
        data={"id": str(user_id)},
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/roles/all", response_model=APIResponse)
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all available roles.
    """
    service = UserService(db)
    roles = service.get_all_roles()

    return APIResponse(
        success=True,
        action="role.list",
        message="Roles retrieved successfully",
        data={"items": roles},
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )
