from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import logging
from typing import List, Dict, Any, Optional
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PromptFlix API",
    description="Backend API for PromptFlix",
    version="1.0.0"
)

# CORS configuration
# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:3000",  # React dev server
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Environment variables
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not TMDB_API_KEY:
    logger.warning("TMDB_API_KEY not found in environment variables")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found in environment variables")

# Request models
class RecommendMoviesRequest(BaseModel):
    prompt: str

class MovieListItem(BaseModel):
    title: str
    year: int

# In-memory cache for API responses
search_cache: Dict[str, List[Dict[str, Any]]] = {}
section_cache: Dict[str, List[Dict[str, Any]]] = {}

def transform_tmdb_movie(movie_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform TMDB movie data to consistent format"""
    base_image_url = "https://image.tmdb.org/t/p/w500"
    
    return {
        "id": movie_data.get("id"),
        "title": movie_data.get("title"),
        "overview": movie_data.get("overview"),
        "release_date": movie_data.get("release_date"),
        "poster_path": f"{base_image_url}{movie_data.get('poster_path')}" if movie_data.get('poster_path') else None,
        "backdrop_path": f"{base_image_url}{movie_data.get('backdrop_path')}" if movie_data.get('backdrop_path') else None,
        "vote_average": movie_data.get("vote_average"),
        "vote_count": movie_data.get("vote_count"),
        "popularity": movie_data.get("popularity"),
        "genre_ids": movie_data.get("genre_ids", []),
        "adult": movie_data.get("adult", False),
        "original_language": movie_data.get("original_language"),
        "original_title": movie_data.get("original_title"),
    }

def make_tmdb_request(endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Helper function to make TMDB API requests"""
    if not TMDB_API_KEY:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")
    
    url = f"https://api.themoviedb.org/3{endpoint}"
    request_params = {"api_key": TMDB_API_KEY}
    if params:
        request_params.update(params)
    
    try:
        response = requests.get(url, params=request_params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"TMDB request failed: {e}")
        raise HTTPException(status_code=500, detail=f"TMDB request failed: {str(e)}")

def query_openai_for_movies(prompt: str) -> List[MovieListItem]:
    """Query OpenAI for movie recommendations"""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a knowledgeable assistant with expertise in movies and TV shows. "
                        "Your task is to recommend 10 movies based on the user's prompt. "
                        "Each recommendation should be an object containing the movie title and the year of release. "
                        "If there are multiple movies that match the user's criteria, prioritize those that are more recently released with higher ratings. "
                        "Return the results as a JSON array of 10 objects, strictly adhering to this format: "
                        "[{\"title\": \"Movie Title\", \"year\": 2023}, ...]. "
                        "Do not include additional commentary or formatting."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", 
            headers=headers, 
            json=body,
            timeout=30
        )
        response.raise_for_status()
        
        openai_response = response.json()
        content = openai_response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        try:
            # Parse the JSON response and clean it
            parsed_movies = json.loads(content.replace("\n", "").strip())
            
            # Validate the response format
            if (isinstance(parsed_movies, list) and 
                all(isinstance(movie, dict) and 
                    "title" in movie and isinstance(movie["title"], str) and
                    "year" in movie and isinstance(movie["year"], int)
                    for movie in parsed_movies)):
                
                return [MovieListItem(**movie) for movie in parsed_movies]
            else:
                raise ValueError("Invalid AI response format")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse OpenAI response: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse AI movie recommendations")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenAI request failed: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {str(e)}")

def fetch_movie_details(movie_item: MovieListItem) -> Optional[Dict[str, Any]]:
    """Fetch detailed movie information from TMDB"""
    try:
        params = {"query": movie_item.title, "year": movie_item.year}
        data = make_tmdb_request("/search/movie", params)
        
        if data.get("results") and len(data["results"]) > 0:
            return transform_tmdb_movie(data["results"][0])
        else:
            logger.warning(f"No TMDB results found for {movie_item.title} ({movie_item.year})")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching movie details for {movie_item.title}: {e}")
        return None

# Main search endpoint that mirrors Redux queryAIforMovieList
@app.get("/api/movies/search")
def search_movies_with_ai(query: str = Query(..., description="Search query for movie recommendations")) -> Dict[str, Any]:
    """Search for movies using AI recommendations + TMDB details (mirrors queryAIforMovieList)"""
    
    # Check cache first
    if query in search_cache:
        logger.info(f"Returning cached results for search query: {query}")
        return {
            "query": query,
            "movies": search_cache[query],
            "cached": True
        }
    
    try:
        # Step 1: Query OpenAI for movie recommendations
        movie_list = query_openai_for_movies(query)
        logger.info(f"OpenAI returned {len(movie_list)} movie recommendations")
        
        # Step 2: Fetch detailed information for each movie from TMDB
        detailed_movies = []
        for movie_item in movie_list:
            movie_details = fetch_movie_details(movie_item)
            if movie_details:
                detailed_movies.append(movie_details)
        
        # Cache the results
        search_cache[query] = detailed_movies
        
        logger.info(f"Successfully fetched details for {len(detailed_movies)} movies")
        return {
            "query": query,
            "movies": detailed_movies,
            "cached": False
        }
        
    except Exception as e:
        logger.error(f"Error in search_movies_with_ai: {e}")
        raise HTTPException(status_code=500, detail="Failed to search movies")

# Section query endpoint that mirrors Redux sectionQuery
@app.get("/api/movies/section")
def get_movie_section_with_ai(query: str = Query(..., description="Section query for movie recommendations")) -> Dict[str, Any]:
    """Get movie section using AI recommendations + TMDB details (mirrors sectionQuery)"""
    
    # Check cache first
    if query in section_cache:
        logger.info(f"Returning cached results for section query: {query}")
        return {
            "query": query,
            "movies": section_cache[query],
            "cached": True
        }
    
    try:
        # Step 1: Query OpenAI for movie recommendations
        movie_list = query_openai_for_movies(query)
        logger.info(f"OpenAI returned {len(movie_list)} movie recommendations for section")
        
        # Step 2: Fetch detailed information for each movie from TMDB
        detailed_movies = []
        for movie_item in movie_list:
            movie_details = fetch_movie_details(movie_item)
            if movie_details:
                detailed_movies.append(movie_details)
        
        # Cache the results
        section_cache[query] = detailed_movies
        
        logger.info(f"Successfully fetched section details for {len(detailed_movies)} movies")
        return {
            "query": query,
            "movies": detailed_movies,
            "cached": False
        }
        
    except Exception as e:
        logger.error(f"Error in get_movie_section_with_ai: {e}")
        raise HTTPException(status_code=500, detail="Failed to get movie section")

# Fetch individual movie results (mirrors fetchMoviesResults)
@app.post("/api/movies/fetch-details")
def fetch_movie_result(movie_item: MovieListItem) -> Dict[str, Any]:
    """Fetch detailed movie information for a single movie (mirrors fetchMoviesResults)"""
    try:
        movie_details = fetch_movie_details(movie_item)
        if movie_details:
            return movie_details
        else:
            raise HTTPException(status_code=404, detail="No movie found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in fetch_movie_result: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch movie details")

# Cache management endpoints
@app.delete("/api/cache/search")
def clear_search_cache():
    """Clear search results cache (mirrors clearSearchCache)"""
    global search_cache
    search_cache = {}
    return {"message": "Search cache cleared"}

@app.delete("/api/cache/section")
def clear_section_cache():
    """Clear section results cache (mirrors clearSectionCache)"""
    global section_cache
    section_cache = {}
    return {"message": "Section cache cleared"}

@app.delete("/api/cache/all")
def clear_all_cache():
    """Clear all caches"""
    global search_cache, section_cache
    search_cache = {}
    section_cache = {}
    return {"message": "All caches cleared"}

# Individual movie details endpoint
@app.get("/api/movies/{movie_id}")
def get_movie_details(movie_id: int) -> Dict[str, Any]:
    """Get detailed information for a specific movie"""
    try:
        data = make_tmdb_request(f"/movie/{movie_id}")
        # Return raw TMDB data for movie details (includes genres, runtime, etc.)
        base_image_url = "https://image.tmdb.org/t/p/w500"

        # Transform poster and backdrop paths to full URLs
        if data.get('poster_path'):
            data['poster_path'] = f"{base_image_url}{data['poster_path']}"
        if data.get('backdrop_path'):
            data['backdrop_path'] = f"{base_image_url}{data['backdrop_path']}"

        return data
    except Exception as e:
        logger.error(f"Error getting movie details for ID {movie_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get movie details")

# Get reviews of a specific movie
@app.get("/api/movies/{movie_id}/reviews")
def get_movie_reviews(movie_id: int) -> Dict[str, Any]:
    """Get reviews for a specific movie"""
    try:
        data = make_tmdb_request(f"/movie/{movie_id}/reviews")
        return data
    except Exception as e:
        logger.error(f"Error getting movie reviews for ID {movie_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get movie reviews")

# Cache management endpoints
@app.delete("/api/cache/search")
def clear_search_cache():
    """Clear search results cache (mirrors clearSearchCache)"""
    global search_cache
    search_cache = {}
    return {"message": "Search cache cleared"}


@app.delete("/api/cache/section")
def clear_section_cache():
    """Clear section results cache (mirrors clearSectionCache)"""
    global section_cache
    section_cache = {}
    return {"message": "Section cache cleared"}

@app.delete("/api/cache/all")
def clear_all_cache():
    """Clear all caches"""
    global search_cache, section_cache
    search_cache = {}
    section_cache = {}
    return {"message": "All caches cleared"}

# Direct TMDB search endpoint (for cases where you need direct TMDB search)
@app.get("/api/tmdb/search")
def direct_tmdb_search(query: str = Query(..., description="Movie search query"), 
                      year: Optional[int] = None) -> List[Dict[str, Any]]:
    """Direct TMDB search without AI (for specific use cases)"""
    try:
        params = {"query": query, "page": 1}
        if year:
            params["year"] = year
        
        data = make_tmdb_request("/search/movie", params)
        movies = [transform_tmdb_movie(movie) for movie in data.get("results", [])]
        
        logger.info(f"Found {len(movies)} movies for direct TMDB query: {query}")
        return movies
        
    except Exception as e:
        logger.error(f"Error in direct TMDB search: {e}")
        raise HTTPException(status_code=500, detail="Failed to search movies")

# Health check endpoint
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "PromptFlix API is running",
        "tmdb_configured": bool(TMDB_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "search_cache_size": len(search_cache),
        "section_cache_size": len(section_cache)
    }

# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "message": "PromptFlix API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "endpoints": {
            "search": "GET /api/movies/search?query=...",
            "section": "GET /api/movies/section?query=...",
            "movie_details": "GET /api/movies/{movie_id}",
            "fetch_details": "POST /api/movies/fetch-details",
            "direct_tmdb": "GET /api/tmdb/search?query=..."
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )