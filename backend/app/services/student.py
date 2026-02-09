"""
Student service for business logic.
"""
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import date, datetime
from sqlalchemy.orm import Session
from app.repositories.student import StudentRepository, GuardianRepository
from app.models.student import Student, Guardian, StudentGuardian, RelationshipType


class StudentService:
    """Service for Student business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.student_repo = StudentRepository(db)
        self.guardian_repo = GuardianRepository(db)

    def _generate_student_code(self, campus_id: UUID) -> str:
        """Generate unique student code."""
        # Get last student for this campus
        students = self.student_repo.get_by_campus(campus_id, is_active=False)

        if not students:
            sequence = 1
        else:
            # Extract highest sequence number from student codes
            sequence = 1
            for student in students:
                try:
                    # Assuming format: STU-XXXXXX
                    parts = student.student_code.split('-')
                    if len(parts) == 2:
                        num = int(parts[1])
                        if num >= sequence:
                            sequence = num + 1
                except ValueError:
                    continue

        return f"STU-{sequence:06d}"

    def _calculate_age(self, birth_date: date) -> int:
        """Calculate age from birth date."""
        today = datetime.now().date()
        age = today.year - birth_date.year
        if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
            age -= 1
        return age

    def get_students(
        self,
        skip: int = 0,
        limit: int = 50,
        campus_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Student], int]:
        """Get list of students with filters."""
        query = self.db.query(Student)

        # Apply filters
        if campus_id:
            query = query.filter(Student.campus_id == campus_id)

        if is_active is not None:
            query = query.filter(Student.is_active == is_active)

        if search:
            query = query.filter(
                (Student.first_name.ilike(f"%{search}%")) |
                (Student.last_name.ilike(f"%{search}%")) |
                (Student.student_code.ilike(f"%{search}%")) |
                (Student.document_number.ilike(f"%{search}%"))
            )

        # Get total count
        total = query.count()

        # Get paginated results
        students = query.order_by(Student.created_at.desc()).offset(skip).limit(limit).all()

        return students, total

    def get_student(self, student_id: UUID) -> Optional[Student]:
        """Get student by ID with guardians."""
        return self.student_repo.get_with_guardians(student_id)

    def get_student_by_code(self, student_code: str) -> Optional[Student]:
        """Get student by student code."""
        return self.student_repo.get_by_code(student_code)

    def create_student(
        self,
        first_name: str,
        last_name: str,
        birth_date: date,
        gender: str,
        campus_id: UUID,
        document_type: Optional[str] = None,
        document_number: Optional[str] = None,
        blood_type: Optional[str] = None,
        allergies: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        guardians: Optional[List[Dict[str, Any]]] = None,
    ) -> Student:
        """Create a new student with guardians."""

        # Check if document number already exists
        if document_number:
            existing = self.db.query(Student).filter(
                Student.document_number == document_number
            ).first()
            if existing:
                raise ValueError(f"Student with document number {document_number} already exists")

        # Generate student code
        student_code = self._generate_student_code(campus_id)

        # Create student
        student_data = {
            "student_code": student_code,
            "first_name": first_name,
            "last_name": last_name,
            "document_type": document_type,
            "document_number": document_number,
            "birth_date": birth_date,
            "gender": gender,
            "blood_type": blood_type,
            "allergies": allergies,
            "email": email,
            "phone": phone,
            "address": address,
            "campus_id": campus_id,
            "is_active": True,
        }

        student = self.student_repo.create(student_data)

        # Create guardians if provided
        if guardians:
            for guardian_data in guardians:
                # Check if guardian already exists by document
                guardian = None
                if guardian_data.get("document_number"):
                    guardian = self.guardian_repo.get_by_document(guardian_data["document_number"])

                # Create new guardian if doesn't exist
                if not guardian:
                    guardian_create = {
                        "first_name": guardian_data["first_name"],
                        "last_name": guardian_data["last_name"],
                        "document_type": guardian_data.get("document_type"),
                        "document_number": guardian_data.get("document_number"),
                        "phone": guardian_data.get("phone"),
                        "email": guardian_data.get("email"),
                        "address": guardian_data.get("address"),
                        "occupation": guardian_data.get("occupation"),
                    }
                    guardian = self.guardian_repo.create(guardian_create)

                # Create student-guardian relationship
                student_guardian = StudentGuardian(
                    student_id=student.id,
                    guardian_id=guardian.id,
                    relationship_type=RelationshipType(guardian_data.get("relationship_type", "acudiente")),
                    is_primary=guardian_data.get("is_primary", False),
                    is_authorized_pickup=guardian_data.get("is_authorized_pickup", True),
                    lives_with=guardian_data.get("lives_with", True),
                    notes=guardian_data.get("notes"),
                )
                self.db.add(student_guardian)

        self.db.commit()
        self.db.refresh(student)

        return self.student_repo.get_with_guardians(student.id)

    def update_student(
        self,
        student_id: UUID,
        **kwargs
    ) -> Optional[Student]:
        """Update student information."""
        student = self.student_repo.get(student_id)
        if not student:
            return None

        # Update fields - permitir strings vacíos para address y allergies
        for key, value in kwargs.items():
            if hasattr(student, key):
                # Permitir actualizar con strings vacíos para algunos campos
                if key in ['address', 'allergies', 'email', 'phone', 'blood_type', 'document_type', 'document_number']:
                    setattr(student, key, value)
                elif value is not None:
                    setattr(student, key, value)

        self.db.commit()
        self.db.refresh(student)

        return self.student_repo.get_with_guardians(student.id)

    def delete_student(self, student_id: UUID) -> bool:
        """Soft delete student (deactivate)."""
        student = self.student_repo.get(student_id)
        if not student:
            return False

        student.is_active = False
        self.db.commit()

        return True

    def add_guardian(
        self,
        student_id: UUID,
        guardian_data: Dict[str, Any],
        relationship_data: Dict[str, Any],
    ) -> Student:
        """Add guardian to existing student."""
        student = self.student_repo.get(student_id)
        if not student:
            raise ValueError("Student not found")

        # Check if guardian exists
        guardian = None
        if guardian_data.get("document_number"):
            guardian = self.guardian_repo.get_by_document(guardian_data["document_number"])

        # Create guardian if doesn't exist
        if not guardian:
            guardian = self.guardian_repo.create(guardian_data)

        # Create relationship
        student_guardian = StudentGuardian(
            student_id=student.id,
            guardian_id=guardian.id,
            relationship_type=RelationshipType(relationship_data.get("relationship_type", "acudiente")),
            is_primary=relationship_data.get("is_primary", False),
            is_authorized_pickup=relationship_data.get("is_authorized_pickup", True),
            lives_with=relationship_data.get("lives_with", True),
            notes=relationship_data.get("notes"),
        )
        self.db.add(student_guardian)
        self.db.commit()

        return self.student_repo.get_with_guardians(student.id)

    def remove_guardian(
        self,
        student_id: UUID,
        guardian_id: UUID,
    ) -> bool:
        """Remove guardian relationship from student."""
        student = self.student_repo.get(student_id)
        if not student:
            raise ValueError("Student not found")

        # Find and delete the relationship
        relationship = self.db.query(StudentGuardian).filter(
            StudentGuardian.student_id == student_id,
            StudentGuardian.guardian_id == guardian_id
        ).first()

        if not relationship:
            raise ValueError("Guardian relationship not found")

        self.db.delete(relationship)
        self.db.commit()
        return True

    def update_guardian_relationship(
        self,
        student_id: UUID,
        guardian_id: UUID,
        relationship_data: Dict[str, Any],
    ) -> Student:
        """Update guardian relationship details."""
        student = self.student_repo.get(student_id)
        if not student:
            raise ValueError("Student not found")

        # Find the relationship
        relationship = self.db.query(StudentGuardian).filter(
            StudentGuardian.student_id == student_id,
            StudentGuardian.guardian_id == guardian_id
        ).first()

        if not relationship:
            raise ValueError("Guardian relationship not found")

        # Update relationship fields
        if "relationship_type" in relationship_data:
            relationship.relationship_type = RelationshipType(relationship_data["relationship_type"])
        if "is_primary" in relationship_data:
            relationship.is_primary = relationship_data["is_primary"]
        if "is_authorized_pickup" in relationship_data:
            relationship.is_authorized_pickup = relationship_data["is_authorized_pickup"]
        if "lives_with" in relationship_data:
            relationship.lives_with = relationship_data["lives_with"]
        if "notes" in relationship_data:
            relationship.notes = relationship_data["notes"]

        self.db.commit()
        return self.student_repo.get_with_guardians(student.id)

    def update_guardian(
        self,
        guardian_id: UUID,
        guardian_data: Dict[str, Any],
    ) -> Optional[Guardian]:
        """Update guardian information."""
        guardian = self.guardian_repo.get(guardian_id)
        if not guardian:
            raise ValueError("Guardian not found")

        # Update guardian fields
        for key, value in guardian_data.items():
            if hasattr(guardian, key) and key not in ['id', 'created_at', 'updated_at']:
                # Allow empty strings for optional fields
                if key in ['email', 'phone', 'address', 'occupation', 'document_type', 'document_number']:
                    setattr(guardian, key, value)
                elif value is not None:
                    setattr(guardian, key, value)

        self.db.commit()
        self.db.refresh(guardian)
        return guardian

    def search_students(
        self,
        search_term: str,
        campus_id: Optional[UUID] = None,
    ) -> List[Student]:
        """Search students by name or code."""
        return self.student_repo.search(search_term, campus_id)
