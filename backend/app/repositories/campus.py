"""
Campus repository.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.campus import Campus
from app.repositories.base import BaseRepository


class CampusRepository(BaseRepository[Campus]):
    """Repository for Campus operations."""

    def __init__(self, db: Session):
        super().__init__(Campus, db)

    def get_by_code(self, code: str) -> Optional[Campus]:
        """Get campus by code."""
        return self.db.query(Campus).filter(Campus.code == code).first()

    def get_active(self) -> List[Campus]:
        """Get all active campuses."""
        return self.db.query(Campus).filter(Campus.is_active == True).all()
