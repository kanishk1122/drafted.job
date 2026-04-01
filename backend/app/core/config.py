import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "JobHuntr API"
    database_url: str = os.getenv("DATABASE_URL", "postgresql://admin:password123@localhost:5432/jobhuntr")
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", "")
    nvidia_model: str = os.getenv("MODEL_NAME", "qwen/qwen3.5-397b-a17b")
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-tactical-key-256")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7 # 7 days
    
    class Config:
        case_sensitive = True

settings = Settings()
