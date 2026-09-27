import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"

class Settings(BaseSettings):
    PROJECT_NAME: str = "OmniForge — Autonomous Multi-Agent Playtesting Swarm"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Server settings
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    
    # AI Provider Settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Database
    DATABASE_PATH: str = str(DATA_DIR / "omniforge.db")
    
    # CORS Security & Interoperability
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:8000",
        "https://omniforge-frontend.onrender.com",
    ]
    CORS_ORIGIN_REGEX: str = r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?|https://.*\.onrender\.com|https://.*\.vercel\.app"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)
