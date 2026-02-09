"""
Student and Guardian repositories.
"""
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.student import Student, Guardian
from app.repositories.base import BaseRepository
from uuid import UUID


class StudentRepository(BaseRepository[Student]):
    """Repository for Student operations."""

    def __init__(self, db: Session):
        super().__init__(Student, db)

    def get_by_code(self, student_code: str) -> Optional[Student]:
        """Get student by student code."""
        return self.db.query(Student).filter(Student.student_code == student_code).first()

    def get_with_guardians(self, student_id: UUID) -> Optional[Student]:
        """Get student with guardians loaded."""
        return self.db.query(Student).options(
            joinedload(Student.guardians)
        ).filter(Student.id == student_id).first()

    def get_by_campus(self, campus_id: UUID, is_active: bool = True) -> List[Student]:
        """Get students by campus."""
        query = self.db.query(Student).filter(Student.campus_id == campus_id)
        if is_active:
            query = query.filter(Student.is_active == True)
        return query.all()

    def search(self, search_term: str, campus_id: Optional[UUID] = None) -> List[Student]:
        """Search students by name or code."""
        query = self.db.query(Student).filter(
            (Student.first_name.ilike(f"%{search_term}%")) |
            (Student.last_name.ilike(f"%{search_term}%")) |
            (Student.student_code.ilike(f"%{search_term}%"))
        )
        if campus_id:
            query = query.filter(Student.campus_id == campus_id)
        return query.limit(50).all()


class GuardianRepository(BaseRepository[Guardian]):
    """Repository for Guardian operations."""

    def __init__(self, db: Session):
        super().__init__(Guardian, db)

    def get_by_document(self, document_number: str) -> Optional[Guardian]:
        """Get guardian by document number."""
        return self.db.query(Guardian).filter(
            Guardian.document_number == document_number
        ).first()
