"""
Academic repositories for database operations.
Includes: SchoolYear, Period, Subject, CourseGroup, TeacherAssignment, Enrollment, Transfer
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.orm import Session

from app.models.academic import SchoolYear
from app.repositories.base import BaseRepository


class SchoolYearRepository(BaseRepository[SchoolYear]):
    """Repository for SchoolYear database operations"""

    def __init__(self, db: Session):
        super().__init__(SchoolYear, db)

    def get_by_campus(self, campus_id: UUID, skip: int = 0, limit: int = 100) -> List[SchoolYear]:
        """
        Get all school years for a specific campus.

        Args:
            campus_id: Campus ID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of SchoolYear objects
        """
        query = select(SchoolYear).where(
            and_(
                SchoolYear.campus_id == campus_id,
                SchoolYear.is_active == True
            )
        ).offset(skip).limit(limit).order_by(SchoolYear.start_date.desc())

        return list(self.db.scalars(query).all())

    def get_current(self, campus_id: UUID) -> Optional[SchoolYear]:
        """
        Get the current active school year for a campus.

        Args:
            campus_id: Campus ID to filter by

        Returns:
            SchoolYear object if found, None otherwise
        """
        query = select(SchoolYear).where(
            and_(
                SchoolYear.campus_id == campus_id,
                SchoolYear.is_current == True,
                SchoolYear.is_active == True
            )
        )
        return self.db.scalar(query)

    def set_current(self, school_year_id: UUID, campus_id: UUID) -> None:
        """
        Set a school year as the current one for a campus.
        Unmarks all other school years in the same campus as non-current.

        Args:
            school_year_id: ID of the school year to mark as current
            campus_id: Campus ID

        Returns:
            None
        """
        # Unmark all school years in this campus as non-current
        self.db.query(SchoolYear).filter(
            SchoolYear.campus_id == campus_id
        ).update({"is_current": False})

        # Mark the specified school year as current
        self.db.query(SchoolYear).filter(
            SchoolYear.id == school_year_id
        ).update({"is_current": True})

        self.db.commit()
