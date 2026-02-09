"""
Settings model for system and campus-specific configuration.
"""
from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class Settings(Base):
    """
    System settings model.
    Stores configuration parameters globally or per campus.
    """
    __tablename__ = "settings"

    campus_id = Column(UUID(as_uuid=True), ForeignKey("campus.id"))  # Nullable for global settings
    key = Column(String(100), nullable=False, index=True)
    value = Column(JSONB, nullable=False)
    description = Column(Text)

    # Relationships
    campus = relationship("Campus", back_populates="settings")

    # Unique constraint: one setting per key per campus (or global if campus_id is null)
    __table_args__ = (
        UniqueConstraint('campus_id', 'key', name='uq_campus_key'),
    )

    def __repr__(self):
        return f"<Settings(campus_id={self.campus_id}, key={self.key})>"
