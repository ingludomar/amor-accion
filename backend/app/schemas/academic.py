"""
Academic schemas for validation and serialization.
Includes: SchoolYear, Period, Subject, CourseGroup, TeacherAssignment, Enrollment, Transfer
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from uuid import UUID


# ============================================================================
# SchoolYear Schemas
# ============================================================================

class SchoolYearBase(BaseModel):
    """Base schema for SchoolYear"""
    name: str = Field(..., min_length=1, max_length=100, description="School year name (e.g., '2024-2025')")
    start_date: date = Field(..., description="School year start date")
    end_date: date = Field(..., description="School year end date")
    is_current: bool = Field(default=False, description="Whether this is the current active school year")


class SchoolYearCreate(SchoolYearBase):
    """Schema for creating a new SchoolYear"""
    campus_id: UUID = Field(..., description="Campus ID this school year belongs to")


class SchoolYearUpdate(BaseModel):
    """Schema for updating a SchoolYear"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="School year name")
    start_date: Optional[date] = Field(None, description="School year start date")
    end_date: Optional[date] = Field(None, description="School year end date")
    is_current: Optional[bool] = Field(None, description="Whether this is the current active school year")


class SchoolYearResponse(SchoolYearBase):
    """Schema for SchoolYear response"""
    id: UUID
    campus_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SchoolYearListItem(BaseModel):
    """Lightweight schema for SchoolYear list items"""
    id: UUID
    name: str
    start_date: date
    end_date: date
    is_current: bool
    campus_id: UUID

    class Config:
        from_attributes = True
