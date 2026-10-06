import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = "recomfusion-super-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    MODEL_ARTIFACT_PATH: str = "./artifacts"
    FRONTEND_URL: str = "http://localhost:5173"
    PROJECT_NAME: str = "RecomFusion API"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
