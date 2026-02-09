"""
Campus service.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from uuid import UUID
from app.repositories.campus import CampusRepository
from app.schemas.campus import CampusCreate, CampusUpdate
from app.models.campus import Campus
from app.core.exceptions import NotFoundException, ConflictException


class CampusService:
    """Service for Campus business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.repository = CampusRepository(db)

    def get_campus(self, campus_id: UUID) -> Campus:
        """Get campus by ID."""
        campus = self.repository.get(campus_id)
        if not campus:
            raise NotFoundException("Campus not found")
        return campus

    def get_all_campuses(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> tuple[List[Campus], int]:
        """Get all campuses with pagination."""
        filters = {}
        if is_active is not None:
            filters['is_active'] = is_active

        campuses = self.repository.get_multi(skip=skip, limit=limit, filters=filters)
        total = self.repository.count(filters=filters)
        return campuses, total

    def create_campus(self, campus_data: CampusCreate) -> Campus:
        """Create a new campus."""
        # Check if code already exists
        existing = self.repository.get_by_code(campus_data.code)
        if existing:
            raise ConflictException(f"Campus with code '{campus_data.code}' already exists")

        campus_dict = campus_data.model_dump()
        campus = self.repository.create(campus_dict)
        return campus

    def update_campus(self, campus_id: UUID, campus_data: CampusUpdate) -> Campus:
        """Update a campus."""
        campus = self.get_campus(campus_id)

        # Check if new code conflicts with another campus
        if campus_data.code and campus_data.code != campus.code:
            existing = self.repository.get_by_code(campus_data.code)
            if existing:
                raise ConflictException(f"Campus with code '{campus_data.code}' already exists")

        update_dict = campus_data.model_dump(exclude_unset=True)
        updated_campus = self.repository.update(campus_id, update_dict)
        return updated_campus

    def delete_campus(self, campus_id: UUID) -> bool:
        """Soft delete a campus."""
        campus = self.get_campus(campus_id)
        self.repository.soft_delete(campus_id)
        return True

    def activate_campus(self, campus_id: UUID) -> Campus:
        """Activate a campus."""
        campus = self.get_campus(campus_id)
        updated = self.repository.update(campus_id, {'is_active': True})
        return updated
