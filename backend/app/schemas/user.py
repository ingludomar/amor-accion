"""
User and Teacher Pydantic schemas.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=150)
    document_type: Optional[str] = Field(None, max_length=20)
    document_number: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role_ids: List[UUID] = Field(default_factory=list)
    campus_ids: List[UUID] = Field(default_factory=list)
    is_teacher: bool = False
    teacher_code: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)
    document_type: Optional[str] = Field(None, max_length=20)
    document_number: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    role_ids: Optional[List[UUID]] = None
    campus_ids: Optional[List[UUID]] = None


class UserResponse(UserBase):
    id: UUID
    is_superuser: bool
    photo_url: Optional[str]
    created_at: datetime
    roles: List[str] = []
    campuses: List[dict] = []
    is_teacher: bool = False
    teacher_code: Optional[str] = None

    class Config:
        from_attributes = True


# Teacher Schemas
class TeacherBase(BaseModel):
    teacher_code: str = Field(..., min_length=1, max_length=50)
    specialization: Optional[str] = None
    bio: Optional[str] = None


class TeacherCreate(TeacherBase):
    user_id: UUID


class TeacherUpdate(BaseModel):
    teacher_code: Optional[str] = Field(None, min_length=1, max_length=50)
    specialization: Optional[str] = None
    bio: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
