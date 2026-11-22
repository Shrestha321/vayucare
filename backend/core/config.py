"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings for the VayuCare application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = Field(default="development", description="Environment mode: development, testing, or production")
    LOG_LEVEL: str = Field(default="info", description="Logging level")
    HOST: str = Field(default="0.0.0.0", description="Backend host bind address")
    PORT: int = Field(default=8000, description="Backend port")

    # AI Configuration
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", description="Gemini model identifier")

    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./vayucare.db",
        description="Async SQLAlchemy database connection string",
    )

    # Security & CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="List of allowed CORS origins",
    )
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, description="Max AI generation requests per minute per IP")
    CACHE_TTL_SECONDS: int = Field(default=3600, description="In-memory cache TTL for identical queries in seconds")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: object) -> List[str]:
        """Convert comma-separated origin string into list of origins."""
        if isinstance(v, str):
            if not v.strip():
                return ["http://localhost:3000"]
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            return [str(i).strip() for i in v if str(i).strip()]
        return ["http://localhost:3000"]


@lru_cache()
def get_settings() -> Settings:
    """Retrieve cached application settings instance."""
    return Settings()
