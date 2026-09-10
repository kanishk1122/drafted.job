import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "JobHuntr API"
    DATABASE_URL: str = "postgresql://admin:password123@localhost:5432/jobhuntr"
    REDIS_URL: str = "redis://localhost:6379/0"
    NVIDIA_API_KEY: str = ""
    MODEL_NAME: str = "meta/llama-3.3-70b-instruct"
    LIGHT_MODEL_NAME: str = "meta/llama-3.3-70b-instruct"
    HEAVY_MODEL_NAME: str = "meta/llama-3.3-70b-instruct"
    EMBEDDING_MODEL_NAME: str = "nvidia/nv-embed-v1"
    EMBEDDING_DIM: int = 4096  # nvidia/nv-embed-v1 actual output dimension
    SECRET_KEY: str = "your-super-secret-tactical-key-256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    class Config:
        case_sensitive = False
        env_file = ".env"
        extra = "ignore"

settings = Settings()
