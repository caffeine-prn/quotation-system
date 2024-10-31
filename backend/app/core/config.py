from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quotation System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "https://quotation-system-frontend.vercel.app",
        "https://quotation-system-53dr.vercel.app"
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres.uauipckmcikscbpuecfc:vikzub-nyzfix-3coVni@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # Vercel 환경변수로 덮어쓸 예정
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True

settings = Settings()