# app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Movie App API"
    VERSION: str = "1.0.0"
    
    # API Keys
    TMDB_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # API URLs
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    YOUTUBE_BASE_URL: str = "https://www.googleapis.com/youtube/v3"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()