# app/config.py
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import logging

logger = logging.getLogger(__name__)

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

    # Rate Limiting
    RATE_LIMIT_PER_HOUR: int = 5
    RATE_LIMIT_PER_DAY: int = 10
    SEARCH_CACHE_TTL_SECONDS: int = 86400
    SEARCH_CACHE_MAX_ITEMS: int = 1000

    @field_validator('RATE_LIMIT_PER_DAY')
    @classmethod
    def validate_daily_limit(cls, v: int, info) -> int:
        """Ensure daily limit is reasonable given hourly limit"""
        per_hour = info.data.get('RATE_LIMIT_PER_HOUR', 10)

        if v < per_hour:
            raise ValueError('RATE_LIMIT_PER_DAY must be >= RATE_LIMIT_PER_HOUR')

        if v > per_hour * 24:
            logger.warning(f'Daily limit ({v}) is higher than theoretical max ({per_hour * 24})')

        return v

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env that aren't defined in Settings

settings = Settings()
