"""
Database models package.
Import all models here for Alembic auto-generation.
"""
from app.models.base import Base
from app.models.campus import Campus, UserCampus
from app.models.user import User, Role, UserRole, Teacher
from app.models.student import Student, Guardian, StudentGuardian
from app.models.academic import (
    SchoolYear,
    Period,
    CourseGroup,
    Subject,
    TeacherAssignment,
    Enrollment,
    Transfer
)
from app.models.attendance import ClassSession, AttendanceRecord, AttendanceChangeLog
from app.models.idcard import IDCardTemplate, IDCardIssued
from app.models.settings import Settings


__all__ = [
    "Base",
    "Campus",
    "UserCampus",
    "User",
    "Role",
    "UserRole",
    "Teacher",
    "Student",
    "Guardian",
    "StudentGuardian",
    "SchoolYear",
    "Period",
    "CourseGroup",
    "Subject",
    "TeacherAssignment",
    "Enrollment",
    "Transfer",
    "ClassSession",
    "AttendanceRecord",
    "AttendanceChangeLog",
    "IDCardTemplate",
    "IDCardIssued",
    "Settings",
]
