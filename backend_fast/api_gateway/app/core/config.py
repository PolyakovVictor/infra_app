from pydantic import validator
from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Social Network API Gateway"
    API_PREFIX: str = ""
    DEBUG: bool = False
    
    AUTH_SERVICE_URL: str
    USER_SERVICE_URL: str
    POST_SERVICE_URL: str
    NOTIFICATION_SERVICE_URL: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CORS_ORIGINS: List[str] = ["*"]
    
    REDIS_URL: str
    
    PUBLIC_PATHS: List[str] = [
        "/auth/token",
        "/auth/register",
        "/auth/password-reset",
        "/health",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()