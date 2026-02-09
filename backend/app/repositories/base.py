"""
Base repository pattern for database operations.
"""
from typing import TypeVar, Generic, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.base import Base
from uuid import UUID


ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: UUID) -> Optional[ModelType]:
        """Get a single record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self) -> List[ModelType]:
        """Get all records."""
        return self.db.query(self.model).all()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get multiple records with pagination and optional filters."""
        query = self.db.query(self.model)

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, key).in_(value))
                    else:
                        query = query.filter(getattr(self.model, key) == value)

        return query.offset(skip).limit(limit).all()

    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count total records with optional filters."""
        query = self.db.query(func.count(self.model.id))

        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, key).in_(value))
                    else:
                        query = query.filter(getattr(self.model, key) == value)

        return query.scalar()

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: UUID, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update an existing record."""
        db_obj = self.get(id)
        if not db_obj:
            return None

        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: UUID) -> bool:
        """Delete a record."""
        db_obj = self.get(id)
        if not db_obj:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True

    def soft_delete(self, id: UUID) -> Optional[ModelType]:
        """Soft delete a record (set is_active=False)."""
        if not hasattr(self.model, 'is_active'):
            return None

        return self.update(id, {'is_active': False})
