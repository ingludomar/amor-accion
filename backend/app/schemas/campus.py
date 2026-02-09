"""
Campus schemas.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID
from app.schemas.base import BaseSchema, BaseModelSchema


class CampusBase(BaseSchema):
    """Base campus schema."""
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None


class CampusCreate(CampusBase):
    """Schema for creating a campus."""
    pass


class CampusUpdate(BaseSchema):
    """Schema for updating a campus."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None


class CampusResponse(BaseModelSchema, CampusBase):
    """Schema for campus response."""
    is_active: bool


class CampusListItem(BaseSchema):
    """Schema for campus list item."""
    id: UUID
    name: str
    code: str
    city: Optional[str]
    is_active: bool
