# app/services.py
import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

from ..models.movie import Movie, MovieRecommendation
from ..config import settings

logger = logging.getLogger(__name__)

class TMDBService:
    def __init__(self, api_key: str, base_url: str = settings.TMDB_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url
        self.base_image_url = "https://image.tmdb.org/t/p/w500"
        
        # Genre mapping for section queries
        self.genre_mapping = {
            'action': '28',
            'adventure': '12',
            'animation': '16',
            'comedy': '35',
            'crime': '80',
            'documentary': '99',
            'drama': '18',
            'family': '10751',
            'fantasy': '14',
            'history': '36',
            'horror': '27',
            'music': '10402',
            'mystery': '9648',
            'romance': '10749',
            'science fiction': '878',
            'sci-fi': '878',
            'tv movie': '10770',
            'thriller': '53',
            'war': '10752',
            'western': '37'
        }

    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make HTTP request to TMDB API"""
        if not self.api_key:
            raise HTTPException(status_code=500, detail="TMDB API key not configured")
        
        url = f"{self.base_url}{endpoint}"
        request_params = {"api_key": self.api_key}
        if params:
            request_params.update(params)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=request_params, timeout=10)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"TMDB HTTP error: {e}")
            raise HTTPException(status_code=e.response.status_code, detail=f"TMDB request failed: {e}")
        except httpx.RequestError as e:
            logger.error(f"TMDB request error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to connect to TMDB: {e}")

    def _transform_movie(self, movie_data: Dict[str, Any]) -> Movie:
        """Transform TMDB movie data to Movie model"""
        return Movie(
            id=movie_data.get("id"),
            title=movie_data.get("title"),
            overview=movie_data.get("overview"),
            release_date=movie_data.get("release_date"),
            poster_path=f"{self.base_image_url}{movie_data.get('poster_path')}" if movie_data.get('poster_path') else None,
            backdrop_path=f"{self.base_image_url}{movie_data.get('backdrop_path')}" if movie_data.get('backdrop_path') else None,
            vote_average=movie_data.get("vote_average"),
            vote_count=movie_data.get("vote_count"),
            popularity=movie_data.get("popularity"),
            genre_ids=movie_data.get("genre_ids", []),
            adult=movie_data.get("adult", False),
            original_language=movie_data.get("original_language"),
            original_title=movie_data.get("original_title"),
        )

    async def search_movies(self, query: str, year: Optional[int] = None) -> List[Movie]:
        """Search for movies"""
        params = {"query": query, "page": 1}
        if year:
            params["year"] = year
        
        data = await self._make_request("/search/movie", params)
        return [self._transform_movie(movie) for movie in data.get("results", [])]

    async def get_section_movies(self, query: str) -> List[Movie]:
        """Get movies for specific sections"""
        query_lower = query.lower()
        
        # Determine endpoint and parameters
        endpoint = "/movie/popular"  # default
        params = {"page": 1}
        
        if "popular" in query_lower:
            endpoint = "/movie/popular"
        elif "top rated" in query_lower or "top" in query_lower:
            endpoint = "/movie/top_rated"
        elif "upcoming" in query_lower:
            endpoint = "/movie/upcoming"
        elif "now playing" in query_lower or "current" in query_lower:
            endpoint = "/movie/now_playing"
        else:
            # Check for genre-specific requests
            for genre_name, genre_id in self.genre_mapping.items():
                if genre_name in query_lower:
                    endpoint = "/discover/movie"
                    params["with_genres"] = genre_id
                    params["sort_by"] = "popularity.desc"
                    break
        
        data = await self._make_request(endpoint, params)
        return [self._transform_movie(movie) for movie in data.get("results", [])]

    async def get_movie_details(self, movie_id: int) -> Movie:
        """Get detailed movie information"""
        data = await self._make_request(f"/movie/{movie_id}")
        return self._transform_movie(data)


class OpenAIService:
    def __init__(self, api_key: str, base_url: str = settings.OPENAI_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url

    async def get_movie_recommendations(self, prompt: str) -> List[MovieRecommendation]:
        """Get movie recommendations from OpenAI"""
        if not self.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a movie assistant. Recommend 10 movies based on the user's prompt. "
                        "Return strictly JSON format: "
                        "[{\"title\": \"Movie Title\", \"year\": 2023, \"reason\": \"Brief reason for recommendation\"}, ...]"
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=body,
                    timeout=30
                )
                response.raise_for_status()
                
                openai_response = response.json()
                content = openai_response.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                try:
                    recommendations_data = json.loads(content)
                    return [MovieRecommendation(**rec) for rec in recommendations_data]
                except json.JSONDecodeError:
                    logger.warning("Failed to parse OpenAI JSON response")
                    return []
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenAI HTTP error: {e}")
            raise HTTPException(status_code=e.response.status_code, detail=f"OpenAI request failed: {e}")
        except httpx.RequestError as e:
            logger.error(f"OpenAI request error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to connect to OpenAI: {e}")
