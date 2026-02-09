#!/usr/bin/env python
"""
Initial seed script for the attendance system.
Creates:
- Default roles (SuperAdmin, AdminSede, Profesor, Secretaria)
- Admin user
- Demo campus (Sede Principal)
- Demo school year
"""
import sys
import os
from datetime import date, datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.user import User, Role, UserRole
from app.models.campus import Campus, UserCampus
from app.models.academic import SchoolYear
import uuid


def seed_data():
    """Seed initial data into the database."""
    print("Starting database seeding...")

    # Create database engine
    engine = create_engine(str(settings.DATABASE_URL))
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Create roles
        print("\n1. Creating roles...")
        roles_data = [
            {
                "name": "SuperAdmin",
                "description": "Super Administrator with full access to all features and all campuses",
                "permissions": [
                    "campuses:read", "campuses:write", "campuses:delete",
                    "users:read", "users:write", "users:delete",
                    "students:read", "students:write", "students:delete",
                    "attendance:read", "attendance:write", "attendance:admin",
                    "reports:read", "reports:export",
                    "idcards:read", "idcards:write",
                    "settings:read", "settings:write"
                ]
            },
            {
                "name": "AdminSede",
                "description": "Campus Administrator with full access to their assigned campus(es)",
                "permissions": [
                    "users:read", "users:write",
                    "students:read", "students:write",
                    "attendance:read", "attendance:write", "attendance:admin",
                    "reports:read", "reports:export",
                    "idcards:read", "idcards:write",
                    "courses:read", "courses:write"
                ]
            },
            {
                "name": "Profesor",
                "description": "Teacher with access to their courses and attendance taking",
                "permissions": [
                    "students:read",
                    "attendance:read", "attendance:write",
                    "sessions:read", "sessions:write",
                    "reports:read"
                ]
            },
            {
                "name": "Secretaria",
                "description": "Administrative assistant with student management and reporting access",
                "permissions": [
                    "students:read", "students:write",
                    "guardians:read", "guardians:write",
                    "enrollments:read", "enrollments:write",
                    "idcards:read", "idcards:write",
                    "reports:read", "reports:export"
                ]
            }
        ]

        roles = {}
        for role_data in roles_data:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                role = Role(**role_data)
                db.add(role)
                db.flush()
                roles[role_data["name"]] = role
                print(f"  ✓ Created role: {role_data['name']}")
            else:
                roles[role_data["name"]] = existing_role
                print(f"  - Role already exists: {role_data['name']}")

        db.commit()

        # Create demo campus
        print("\n2. Creating demo campus...")
        existing_campus = db.query(Campus).filter(Campus.code == "PRINCIPAL").first()
        if not existing_campus:
            campus = Campus(
                name="Sede Principal",
                code="PRINCIPAL",
                address="Calle Principal 123",
                city="Bogotá",
                phone="3001234567",
                email="principal@colegio.edu",
                is_active=True
            )
            db.add(campus)
            db.flush()
            print(f"  ✓ Created campus: {campus.name}")
        else:
            campus = existing_campus
            print(f"  - Campus already exists: {campus.name}")

        db.commit()

        # Create admin user
        print("\n3. Creating admin user...")
        existing_user = db.query(User).filter(User.email == "admin@colegio.edu").first()
        if not existing_user:
            admin_user = User(
                email="admin@colegio.edu",
                username="admin",
                hashed_password=get_password_hash("changeme123"),
                full_name="Administrador del Sistema",
                document_type="CC",
                document_number="1000000001",
                phone="3009999999",
                is_active=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.flush()

            # Assign SuperAdmin role
            user_role = UserRole(
                user_id=admin_user.id,
                role_id=roles["SuperAdmin"].id
            )
            db.add(user_role)

            # Assign to campus
            user_campus = UserCampus(
                user_id=admin_user.id,
                campus_id=campus.id,
                is_primary=True,
                assigned_at=datetime.utcnow()
            )
            db.add(user_campus)

            db.commit()
            print(f"  ✓ Created admin user: {admin_user.email}")
            print(f"  ✓ Password: changeme123")
            print(f"  ✓ Role: SuperAdmin")
            print(f"  ✓ Campus: {campus.name}")
        else:
            print(f"  - Admin user already exists: {existing_user.email}")

        # Create demo school year
        print("\n4. Creating demo school year...")
        existing_year = db.query(SchoolYear).filter(SchoolYear.name == "2024-2025").first()
        if not existing_year:
            school_year = SchoolYear(
                name="2024-2025",
                start_date=date(2024, 2, 1),
                end_date=date(2024, 11, 30),
                is_current=True
            )
            db.add(school_year)
            db.commit()
            print(f"  ✓ Created school year: {school_year.name}")
        else:
            print(f"  - School year already exists: {existing_year.name}")

        print("\n" + "="*60)
        print("✓ Database seeding completed successfully!")
        print("="*60)
        print("\nDefault credentials:")
        print("  Email:    admin@colegio.edu")
        print("  Password: changeme123")
        print("\n⚠ IMPORTANT: Change the admin password immediately!")
        print("="*60)

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error during seeding: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
