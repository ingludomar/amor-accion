"""
Base Pydantic schemas.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, List
from datetime import datetime
from uuid import UUID


class ResponseMeta(BaseModel):
    """Standard response metadata."""
    timestamp: datetime
    version: str = "1.0"


class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    action: str
    message: str
    data: Optional[Any] = None
    errors: Optional[List[dict]] = None
    meta: ResponseMeta

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        use_enum_values=True
    )


class BaseModelSchema(BaseSchema):
    """Base schema for database models with timestamps."""
    id: UUID
    created_at: datetime
    updated_at: datetime
