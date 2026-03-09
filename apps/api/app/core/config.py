"""
Smart Offer — Backend Configuration

Centralized settings loaded from environment variables.

@see .claude/rules/07-quality-security-devops.md (secrets via env vars)
@see infra/.env.example
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings — loaded from environment variables."""

    # Database
    database_url: str = "postgresql+asyncpg://smartoffer:changeme@localhost:5432/smartoffer"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Logging
    log_level: str = "info"

    # Allocation rules
    participant_weight: float = 0.10

    # Gemini AI (backend proxy)
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
