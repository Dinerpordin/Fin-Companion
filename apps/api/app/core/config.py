"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    APP_NAME: str = "Bangladesh Financial Companion API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/postgres"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # CORS — web app origins
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    # Privacy: never log raw financial inputs
    LOG_FINANCIAL_INPUTS: bool = False

    # WhatsApp Business API — Meta webhook verify token.
    # Must be set in .env before enabling the WhatsApp channel.
    # Leaving this empty effectively disables webhook verification.
    WHATSAPP_VERIFY_TOKEN: str = ""

    # Enterprise connector — admin secret to gate key-generation endpoint.
    # Must be set in .env before exposing to B2B partners.
    ENTERPRISE_ADMIN_SECRET: str = ""


settings = Settings()
