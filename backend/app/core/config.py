"""
Application configuration using Pydantic Settings.
"""
from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, PostgresDsn, field_validator


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Attendance Management System"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development")

    # Database
    DATABASE_URL: PostgresDsn

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: Union[List[str], str] = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # File Upload
    MEDIA_ROOT: str = "./media"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100

    # Attendance Settings
    ATTENDANCE_EDIT_WINDOW_HOURS: int = 24
    ATTENDANCE_STATES: List[str] = ["present", "absent", "late", "excused"]

    # ID Cards
    IDCARD_EXPIRY_MONTHS: int = 12

    @property
    def database_url_sync(self) -> str:
        """Get synchronous database URL for Alembic."""
        return str(self.DATABASE_URL).replace("+asyncpg", "")


settings = Settings()
