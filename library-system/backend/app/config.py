import os
from typing import Optional
from pydantic_settings import BaseSettings

# Get the directory where this config file is located
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./library.db"

    # Storage Configuration
    STORAGE_TYPE: str = "minio"  # minio or oss

    # MinIO Configuration
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "cc-book"
    MINIO_SECURE: str = "false"

    # Aliyun OSS Configuration
    OSS_ACCESS_KEY_ID: Optional[str] = None
    OSS_ACCESS_KEY_SECRET: Optional[str] = None
    OSS_ENDPOINT: Optional[str] = None
    OSS_BUCKET_NAME: Optional[str] = None

    class Config:
        env_file = os.path.join(BASE_DIR, ".env")


settings = Settings()
