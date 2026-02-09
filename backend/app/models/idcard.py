"""
ID Card models for student and teacher identification cards.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base


class CardType(str, enum.Enum):
    """ID Card type enum."""
    STUDENT = "student"
    TEACHER = "teacher"


class IDCardTemplate(Base):
    """
    ID Card template model.
    Defines the layout and design for ID cards.
    """
    __tablename__ = "idcardtemplate"

    name = Column(String(100), nullable=False)
    card_type = Column(SQLEnum(CardType), nullable=False)
    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"))  # Nullable for global templates
    html_template = Column(Text, nullable=False)
    css_styles = Column(Text)
    fields_config = Column(JSONB, default=dict)  # Configuration for which fields to show
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    issued_cards = relationship("IDCardIssued", back_populates="template")

    def __repr__(self):
        return f"<IDCardTemplate(name={self.name}, type={self.card_type})>"


class IDCardIssued(Base):
    """
    Issued ID card model.
    Represents a generated ID card for a student or teacher.
    """
    __tablename__ = "idcardissued"

    template_id = Column(UUID(as_uuid=True), ForeignKey("idcardtemplate.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teacher.id"))
    card_number = Column(String(50), nullable=False, unique=True, index=True)
    qr_code = Column(String(255), nullable=False)  # Immutable identifier (student_code or teacher_code)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    photo_url = Column(String(255))
    pdf_url = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    # Relationships
    template = relationship("IDCardTemplate", back_populates="issued_cards")
    student = relationship("Student", foreign_keys=[student_id], back_populates="id_cards")
    teacher = relationship("Teacher", foreign_keys=[teacher_id])
    issuer = relationship("User")

    def __repr__(self):
        return f"<IDCardIssued(card_number={self.card_number}, active={self.is_active})>"
