"""
Student management API endpoints.
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.schemas.base import ResponseMeta, APIResponse
from app.models.user import User
from app.models.student import Guardian, StudentGuardian
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services.student import StudentService


router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=APIResponse)
def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campus_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of students with filters.
    Requires: students:read permission
    """
    service = StudentService(db)
    students, total = service.get_students(
        skip=skip,
        limit=limit,
        campus_id=campus_id,
        is_active=is_active,
        search=search,
    )

    # Format response
    items = []
    for student in students:
        age = service._calculate_age(student.birth_date)
        guardians = []
        for sg in student.guardians:
            guardians.append({
                "id": str(sg.guardian.id),
                "full_name": sg.guardian.full_name,
                "relationship_type": sg.relationship_type.value,
                "is_primary": sg.is_primary,
                "phone": sg.guardian.phone,
                "email": sg.guardian.email,
            })

        items.append({
            "id": str(student.id),
            "student_code": student.student_code,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": student.full_name,
            "document_type": student.document_type,
            "document_number": student.document_number,
            "birth_date": student.birth_date.isoformat(),
            "age": age,
            "gender": student.gender.value,
            "blood_type": student.blood_type,
            "campus_id": str(student.campus_id),
            "campus_name": student.campus.name if student.campus else None,
            "email": student.email,
            "phone": student.phone,
            "is_active": student.is_active,
            "guardians": guardians,
            "created_at": student.created_at.isoformat(),
        })

    page = (skip // limit) + 1
    total_pages = (total + limit - 1) // limit

    return APIResponse(
        success=True,
        action="student.list",
        message="Students retrieved successfully",
        data={
            "items": items,
            "total": total,
            "page": page,
            "page_size": limit,
            "total_pages": total_pages,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/{student_id}", response_model=APIResponse)
def get_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get student by ID with guardians.
    Requires: students:read permission
    """
    service = StudentService(db)
    student = service.get_student(student_id)

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    age = service._calculate_age(student.birth_date)
    guardians = []
    for sg in student.guardians:
        guardians.append({
            "id": str(sg.guardian.id),
            "full_name": sg.guardian.full_name,
            "first_name": sg.guardian.first_name,
            "last_name": sg.guardian.last_name,
            "document_type": sg.guardian.document_type,
            "document_number": sg.guardian.document_number,
            "relationship_type": sg.relationship_type.value,
            "is_primary": sg.is_primary,
            "is_authorized_pickup": sg.is_authorized_pickup,
            "lives_with": sg.lives_with,
            "phone": sg.guardian.phone,
            "email": sg.guardian.email,
            "address": sg.guardian.address,
            "occupation": sg.guardian.occupation,
            "notes": sg.notes,
        })

    return APIResponse(
        success=True,
        action="student.get",
        message="Student retrieved successfully",
        data={
            "id": str(student.id),
            "student_code": student.student_code,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": student.full_name,
            "document_type": student.document_type,
            "document_number": student.document_number,
            "birth_date": student.birth_date.isoformat(),
            "age": age,
            "gender": student.gender.value,
            "blood_type": student.blood_type,
            "allergies": student.allergies,
            "campus_id": str(student.campus_id),
            "campus_name": student.campus.name if student.campus else None,
            "email": student.email,
            "phone": student.phone,
            "address": student.address,
            "photo_url": student.photo_url,
            "is_active": student.is_active,
            "guardians": guardians,
            "created_at": student.created_at.isoformat(),
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("", response_model=APIResponse)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new student.
    Requires: students:write permission
    """
    service = StudentService(db)

    try:
        # Convert guardians to dict format
        guardians_data = []
        if student_data.guardians:
            for guardian in student_data.guardians:
                # Handle both string and enum types
                relationship_type = guardian.relationship_type
                if hasattr(relationship_type, 'value'):
                    relationship_type = relationship_type.value

                guardians_data.append({
                    "first_name": guardian.first_name,
                    "last_name": guardian.last_name,
                    "document_type": guardian.document_type,
                    "document_number": guardian.document_number,
                    "phone": guardian.phone,
                    "email": guardian.email,
                    "address": guardian.address,
                    "occupation": guardian.occupation,
                    "relationship_type": relationship_type,
                    "is_primary": guardian.is_primary,
                    "is_authorized_pickup": guardian.is_authorized_pickup,
                    "lives_with": guardian.lives_with,
                    "notes": guardian.notes,
                })

        # Handle both string and enum types for gender
        gender = student_data.gender
        if hasattr(gender, 'value'):
            gender = gender.value

        student = service.create_student(
            first_name=student_data.first_name,
            last_name=student_data.last_name,
            birth_date=student_data.birth_date,
            gender=gender,
            campus_id=student_data.campus_id,
            document_type=student_data.document_type,
            document_number=student_data.document_number,
            blood_type=student_data.blood_type,
            allergies=student_data.allergies,
            email=student_data.email,
            phone=student_data.phone,
            address=student_data.address,
            guardians=guardians_data if guardians_data else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    age = service._calculate_age(student.birth_date)
    guardians = []
    for sg in student.guardians:
        guardians.append({
            "id": str(sg.guardian.id),
            "full_name": sg.guardian.full_name,
            "relationship_type": sg.relationship_type.value,
            "is_primary": sg.is_primary,
            "phone": sg.guardian.phone,
        })

    return APIResponse(
        success=True,
        action="student.create",
        message="Student created successfully",
        data={
            "id": str(student.id),
            "student_code": student.student_code,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": student.full_name,
            "birth_date": student.birth_date.isoformat(),
            "age": age,
            "gender": student.gender.value,
            "campus_id": str(student.campus_id),
            "is_active": student.is_active,
            "guardians": guardians,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.patch("/{student_id}", response_model=APIResponse)
def update_student(
    student_id: UUID,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update student information.
    Requires: students:write permission
    """
    service = StudentService(db)

    # Convert to dict, excluding None values
    update_data = student_data.dict(exclude_unset=True)

    student = service.update_student(student_id, **update_data)

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    age = service._calculate_age(student.birth_date)
    guardians = []
    for sg in student.guardians:
        guardians.append({
            "id": str(sg.guardian.id),
            "full_name": sg.guardian.full_name,
            "relationship_type": sg.relationship_type.value,
            "is_primary": sg.is_primary,
        })

    return APIResponse(
        success=True,
        action="student.update",
        message="Student updated successfully",
        data={
            "id": str(student.id),
            "student_code": student.student_code,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "full_name": student.full_name,
            "birth_date": student.birth_date.isoformat(),
            "age": age,
            "gender": student.gender.value,
            "campus_id": str(student.campus_id),
            "is_active": student.is_active,
            "guardians": guardians,
        },
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.delete("/{student_id}", response_model=APIResponse)
def delete_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete (deactivate) student.
    Requires: students:delete permission
    """
    service = StudentService(db)

    success = service.delete_student(student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")

    return APIResponse(
        success=True,
        action="student.delete",
        message="Student deactivated successfully",
        data={"id": str(student_id)},
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/search/{search_term}", response_model=APIResponse)
def search_students(
    search_term: str,
    campus_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search students by name or code.
    Requires: students:read permission
    """
    service = StudentService(db)
    students = service.search_students(search_term, campus_id)

    items = []
    for student in students:
        age = service._calculate_age(student.birth_date)
        items.append({
            "id": str(student.id),
            "student_code": student.student_code,
            "full_name": student.full_name,
            "birth_date": student.birth_date.isoformat(),
            "age": age,
            "campus_id": str(student.campus_id),
            "is_active": student.is_active,
        })

    return APIResponse(
        success=True,
        action="student.search",
        message=f"Found {len(items)} students",
        data={"items": items},
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.get("/guardians/search", response_model=APIResponse)
def search_guardians(
    search: Optional[str] = None,
    document_number: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search guardians by name or document number.
    Requires: students:read permission
    """
    from app.repositories.student import GuardianRepository

    guardian_repo = GuardianRepository(db)
    query = db.query(Guardian)

    if document_number:
        guardian = guardian_repo.get_by_document(document_number)
        guardians = [guardian] if guardian else []
    elif search:
        query = query.filter(
            (Guardian.first_name.ilike(f"%{search}%")) |
            (Guardian.last_name.ilike(f"%{search}%")) |
            (Guardian.document_number.ilike(f"%{search}%"))
        )
        guardians = query.limit(20).all()
    else:
        guardians = []

    items = []
    for guardian in guardians:
        # Get students associated with this guardian
        student_count = db.query(StudentGuardian).filter(
            StudentGuardian.guardian_id == guardian.id
        ).count()

        items.append({
            "id": str(guardian.id),
            "full_name": guardian.full_name,
            "first_name": guardian.first_name,
            "last_name": guardian.last_name,
            "document_type": guardian.document_type,
            "document_number": guardian.document_number,
            "phone": guardian.phone,
            "email": guardian.email,
            "address": guardian.address,
            "occupation": guardian.occupation,
            "student_count": student_count,
        })

    return APIResponse(
        success=True,
        action="guardian.search",
        message=f"Found {len(items)} guardians",
        data={"items": items},
        meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
    )


@router.post("/{student_id}/guardians", response_model=APIResponse)
def add_guardian_to_student(
    student_id: UUID,
    guardian_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add guardian to existing student.
    Requires: students:write permission
    """
    service = StudentService(db)

    try:
        # Separate guardian data from relationship data
        relationship_data = {
            "relationship_type": guardian_data.pop("relationship_type", "acudiente"),
            "is_primary": guardian_data.pop("is_primary", False),
            "is_authorized_pickup": guardian_data.pop("is_authorized_pickup", True),
            "lives_with": guardian_data.pop("lives_with", True),
            "notes": guardian_data.pop("notes", None),
        }

        student = service.add_guardian(student_id, guardian_data, relationship_data)

        age = service._calculate_age(student.birth_date)
        guardians = []
        for sg in student.guardians:
            guardians.append({
                "id": str(sg.guardian.id),
                "full_name": sg.guardian.full_name,
                "first_name": sg.guardian.first_name,
                "last_name": sg.guardian.last_name,
                "relationship_type": sg.relationship_type.value,
                "is_primary": sg.is_primary,
                "phone": sg.guardian.phone,
            })

        return APIResponse(
            success=True,
            action="guardian.add",
            message="Guardian added successfully",
            data={
                "id": str(student.id),
                "student_code": student.student_code,
                "full_name": student.full_name,
                "guardians": guardians,
            },
            meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{student_id}/guardians/{guardian_id}", response_model=APIResponse)
def remove_guardian_from_student(
    student_id: UUID,
    guardian_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove guardian from student.
    Requires: students:write permission
    """
    service = StudentService(db)

    try:
        service.remove_guardian(student_id, guardian_id)

        return APIResponse(
            success=True,
            action="guardian.remove",
            message="Guardian removed successfully",
            data={"student_id": str(student_id), "guardian_id": str(guardian_id)},
            meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{student_id}/guardians/{guardian_id}", response_model=APIResponse)
def update_guardian_relationship(
    student_id: UUID,
    guardian_id: UUID,
    relationship_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update guardian relationship details.
    Requires: students:write permission
    """
    service = StudentService(db)

    try:
        student = service.update_guardian_relationship(student_id, guardian_id, relationship_data)

        # Find the updated guardian in the result
        updated_guardian = None
        for sg in student.guardians:
            if str(sg.guardian.id) == str(guardian_id):
                updated_guardian = {
                    "id": str(sg.guardian.id),
                    "full_name": sg.guardian.full_name,
                    "relationship_type": sg.relationship_type.value,
                    "is_primary": sg.is_primary,
                    "is_authorized_pickup": sg.is_authorized_pickup,
                    "lives_with": sg.lives_with,
                    "notes": sg.notes,
                }
                break

        return APIResponse(
            success=True,
            action="guardian.update",
            message="Guardian relationship updated successfully",
            data=updated_guardian,
            meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/guardians/{guardian_id}", response_model=APIResponse)
def update_guardian(
    guardian_id: UUID,
    guardian_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update guardian information (name, phone, email, etc.).
    Requires: students:write permission
    """
    service = StudentService(db)

    try:
        guardian = service.update_guardian(guardian_id, guardian_data)

        return APIResponse(
            success=True,
            action="guardian.update_info",
            message="Guardian information updated successfully",
            data={
                "id": str(guardian.id),
                "full_name": guardian.full_name,
                "first_name": guardian.first_name,
                "last_name": guardian.last_name,
                "document_type": guardian.document_type,
                "document_number": guardian.document_number,
                "phone": guardian.phone,
                "email": guardian.email,
                "address": guardian.address,
                "occupation": guardian.occupation,
            },
            meta=ResponseMeta(timestamp=datetime.utcnow(), version=settings.VERSION)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
