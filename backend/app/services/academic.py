"""
Academic services for business logic.
Includes: SchoolYear, Period, Subject, CourseGroup, TeacherAssignment, Enrollment, Transfer
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.repositories.academic import SchoolYearRepository
from app.schemas.academic import SchoolYearCreate, SchoolYearUpdate
from app.models.academic import SchoolYear


class SchoolYearService:
    """Service for SchoolYear business logic"""

    def __init__(self, db: Session):
        self.db = db
        self.repo = SchoolYearRepository(db)

    def create(self, data: SchoolYearCreate) -> SchoolYear:
        """
        Create a new school year.

        Args:
            data: SchoolYearCreate schema with school year data

        Returns:
            Created SchoolYear object

        Raises:
            ValueError: If end_date is not after start_date
        """
        # Validate that end_date > start_date
        if data.end_date <= data.start_date:
            raise ValueError("End date must be after start date")

        # Create school year from dict
        school_year_dict = data.model_dump()
        created = self.repo.create(school_year_dict)

        # If marking as current, unmark all others and mark this one
        if data.is_current:
            self.repo.set_current(created.id, data.campus_id)

        return created

    def update(self, school_year_id: UUID, data: SchoolYearUpdate) -> Optional[SchoolYear]:
        """
        Update an existing school year.

        Args:
            school_year_id: ID of the school year to update
            data: SchoolYearUpdate schema with updated data

        Returns:
            Updated SchoolYear object, or None if not found

        Raises:
            ValueError: If updated dates are invalid
        """
        school_year = self.repo.get(school_year_id)
        if not school_year:
            return None

        # Validate dates if they are being updated
        update_data = data.model_dump(exclude_unset=True)

        if "start_date" in update_data or "end_date" in update_data:
            start = update_data.get("start_date", school_year.start_date)
            end = update_data.get("end_date", school_year.end_date)
            if end <= start:
                raise ValueError("End date must be after start date")

        # If marking as current, unmark all others first
        if update_data.get("is_current") == True:
            self.repo.set_current(school_year_id, school_year.campus_id)
            # Remove is_current from update_data as it was already set
            update_data.pop("is_current", None)

        return self.repo.update(school_year_id, update_data)

    def get_list(self, campus_id: UUID, skip: int = 0, limit: int = 100) -> List[SchoolYear]:
        """
        Get list of school years for a campus.

        Args:
            campus_id: Campus ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of SchoolYear objects
        """
        return self.repo.get_by_campus(campus_id, skip, limit)

    def get(self, school_year_id: UUID) -> Optional[SchoolYear]:
        """
        Get a specific school year by ID.

        Args:
            school_year_id: ID of the school year

        Returns:
            SchoolYear object if found, None otherwise
        """
        return self.repo.get(school_year_id)

    def delete(self, school_year_id: UUID) -> bool:
        """
        Soft delete a school year.

        Args:
            school_year_id: ID of the school year to delete

        Returns:
            True if deleted, False if not found
        """
        return self.repo.delete(school_year_id)

    def get_current(self, campus_id: UUID) -> Optional[SchoolYear]:
        """
        Get the current active school year for a campus.

        Args:
            campus_id: Campus ID to filter by

        Returns:
            SchoolYear object if found, None otherwise
        """
        return self.repo.get_current(campus_id)
