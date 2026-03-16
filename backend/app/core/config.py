from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Railway automatically sets DATABASE_URL if you add a Postgres plugin
    # Falls back to SQLite for local development
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./database/churn.db"
    )
    MODEL_PATH:  str = os.getenv("MODEL_PATH",  "ml_models/churn_model.pkl")
    SCALER_PATH: str = os.getenv("SCALER_PATH", "ml_models/scaler.pkl")
    META_PATH:   str = os.getenv("META_PATH",   "ml_models/meta.json")
    LOG_LEVEL:   str = os.getenv("LOG_LEVEL",   "INFO")
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()