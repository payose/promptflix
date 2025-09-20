# app/models.py
from pydantic import BaseModel
from typing import Optional, List

class Movie(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    release_date: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    popularity: Optional[float] = None
    genre_ids: List[int] = []
    adult: bool = False
    original_language: Optional[str] = None
    original_title: Optional[str] = None

class RecommendMoviesRequest(BaseModel):
    prompt: str

class MovieRecommendation(BaseModel):
    title: str
    year: Optional[int] = None
    reason: Optional[str] = None

class HealthCheck(BaseModel):
    status: str
    message: str
    version: str
    tmdb_configured: bool
    openai_configured: bool