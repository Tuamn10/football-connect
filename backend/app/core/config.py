from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    ALGORITHM: str = "HS256"

    ASSISTANT_PROVIDER: str = "gemini"
    ASSISTANT_API_KEY: str | None = None
    ASSISTANT_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    ASSISTANT_MODEL: str = "gemini-2.5-flash"
    ASSISTANT_ENABLED: bool = False
    ASSISTANT_TIMEOUT: float = 15.0

    # SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str = "Football Connect"
    SMTP_USE_TLS: bool = True

    # OTP Configuration
    PASSWORD_RESET_OTP_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_OTP_MAX_ATTEMPTS: int = 5
    PASSWORD_RESET_RESEND_SECONDS: int = 60
    PASSWORD_RESET_DEBUG: bool = False
    
    # Email Relay Configuration (For bypassing Render SMTP block)
    EMAIL_RELAY_URL: str | None = None
    EMAIL_RELAY_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()