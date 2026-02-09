"""
Student schemas.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import date
from app.schemas.base import BaseSchema, BaseModelSchema
from app.models.student import Gender, RelationshipType


class GuardianBase(BaseSchema):
    """Base guardian schema."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    document_type: Optional[str] = Field(None, max_length=20)
    document_number: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(None, max_length=255)
    occupation: Optional[str] = Field(None, max_length=100)


class GuardianCreate(GuardianBase):
    """Schema for creating a guardian."""
    relationship_type: RelationshipType
    is_primary: bool = False
    is_authorized_pickup: bool = True
    lives_with: bool = True
    notes: Optional[str] = None


class GuardianResponse(BaseModelSchema, GuardianBase):
    """Schema for guardian response."""
    pass


class StudentGuardianResponse(BaseSchema):
    """Schema for student-guardian relationship response."""
    guardian: GuardianResponse
    relationship_type: RelationshipType
    is_primary: bool
    is_authorized_pickup: bool
    lives_with: bool
    notes: Optional[str]


class StudentBase(BaseSchema):
    """Base student schema."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    document_type: Optional[str] = Field(None, max_length=20)
    document_number: Optional[str] = Field(None, max_length=50)
    birth_date: date
    gender: Gender
    blood_type: Optional[str] = Field(None, max_length=10)
    allergies: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)


class StudentCreate(StudentBase):
    """Schema for creating a student."""
    campus_id: UUID
    guardians: List[GuardianCreate] = []


class StudentUpdate(BaseSchema):
    """Schema for updating a student."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: Optional[bool] = None
    campus_id: Optional[UUID] = None


class StudentResponse(BaseModelSchema, StudentBase):
    """Schema for student response."""
    student_code: str
    campus_id: UUID
    photo_url: Optional[str]
    is_active: bool
    age: Optional[int] = None
    guardians: List[StudentGuardianResponse] = []


class StudentListItem(BaseSchema):
    """Schema for student list item."""
    id: UUID
    student_code: str
    first_name: str
    last_name: str
    birth_date: date
    age: Optional[int]
    campus_id: UUID
    is_active: bool
    photo_url: Optional[str]
