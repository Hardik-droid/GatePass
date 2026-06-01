from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GatePass API"
    app_url: str = "http://localhost:3000"
    environment: str = "development"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None

    resend_api_key: str | None = None
    email_from: str = "support@gatepass.local"
    qr_signing_secret: str = "dev-only-qr-signing-secret-change-before-production"

    enable_dev_payment_simulator: bool = True
    enable_dev_email_preview: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
