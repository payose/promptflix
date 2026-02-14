from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import requests
import os
import logging
from typing import List, Dict, Any, Optional
import json
import asyncio
from dotenv import load_dotenv

from .session import SessionMiddleware, get_session_id, get_user_id
from .database import get_db
from .models.tracking import SearchHistory, ClickEvent
from .models.user import User
from .auth import link_session_to_user, create_user

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FindsMovies API",
    description="Backend API for FindsMovies",
    version="1.0.0"
)

# CORS configuration
# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")
if ALLOWED_ORIGINS_ENV:
    # Remove empty strings from split
    ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

# For development, allow all origins. In production, use specific origins
# You can also use ["*"] to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,  # IMPORTANT: Must be True to send/receive cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add session middleware for anonymous user tracking
# Why: Automatically manages session_id cookies for tracking before login
app.add_middleware(SessionMiddleware)

# Log CORS configuration
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

# Password hashing configuration
# Why bcrypt? Industry standard, slow by design (makes brute-force attacks harder)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

class ClickEventRequest(BaseModel):
    """
    Request model for tracking movie clicks

    Why we need this:
    - movie_id: The TMDB ID of the clicked movie
    - movie_title: Human-readable title for analytics
    """
    movie_id: int
    movie_title: str

class SignupRequest(BaseModel):
    """
    Request model for user signup

    Why simple for now:
    - Just email and password for MVP
    - Can add username, profile info later
    """
    email: str
    password: str

class LoginRequest(BaseModel):
    """Request model for user login"""
    email: str
    password: str

# In-memory cache for API responses
search_cache: Dict[str, List[Dict[str, Any]]] = {}

def get_cors_headers():
    """Get CORS headers for streaming responses"""
    # Allow all origins for streaming endpoints
    # The CORSMiddleware handles the actual origin validation
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
    }

def transform_tmdb_movie(movie_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform TMDB movie data to consistent format"""

    return {
        "id": movie_data.get("id"),
        "title": movie_data.get("title"),
        "overview": movie_data.get("overview"),
        "release_date": movie_data.get("release_date"),
        "poster_path": movie_data.get("poster_path"),
        "backdrop_path": movie_data.get("backdrop_path"),
        "vote_average": movie_data.get("vote_average"),
        "vote_count": movie_data.get("vote_count"),
        "popularity": movie_data.get("popularity"),
        "genre_ids": movie_data.get("genre_ids", []),
        "adult": movie_data.get("adult", False),
        "original_language": movie_data.get("original_language"),
        "original_title": movie_data.get("original_title"),
        "video": movie_data.get("video", False),
        "media_type": "movie",
    }

def transform_tmdb_tv(tv_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform TMDB TV show data to consistent format (matching movie structure)"""

    return {
        "id": tv_data.get("id"),
        "title": tv_data.get("name"),  # TV shows use 'name' instead of 'title'
        "overview": tv_data.get("overview"),
        "release_date": tv_data.get("first_air_date"),  # TV shows use 'first_air_date'
        "poster_path": tv_data.get("poster_path"),
        "backdrop_path": tv_data.get("backdrop_path"),
        "vote_average": tv_data.get("vote_average"),
        "vote_count": tv_data.get("vote_count"),
        "popularity": tv_data.get("popularity"),
        "genre_ids": tv_data.get("genre_ids", []),
        "adult": False,  # TV shows don't have adult flag
        "original_language": tv_data.get("original_language"),
        "original_title": tv_data.get("original_name"),  # TV shows use 'original_name'
        "video": False,  # Not applicable to TV shows
        "media_type": "tv",
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

def query_openai_for_movies(prompt: str, content_filter: Optional[str] = None) -> List[MovieListItem]:
    """Query OpenAI for movie/TV recommendations based on content filter"""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    # Build system prompt based on filter
    if content_filter == "tv-shows":
        content_type = "TV shows"
        content_description = "TV shows (series, limited series, miniseries)"
    elif content_filter == "anime":
        content_type = "anime"
        content_description = "anime (Japanese animated shows or movies)"
    elif content_filter == "k-drama":
        content_type = "K-dramas"
        content_description = "Korean dramas (K-dramas)"
    elif content_filter == "movies":
        content_type = "movies"
        content_description = "movies only (no TV shows)"
    else:  # "all" or None
        content_type = "movies or TV shows"
        content_description = "movies or TV shows"

    try:
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        f"You are a knowledgeable assistant with expertise in movies and TV shows. "
                        f"Your task is to recommend 10 {content_description} based on the user's prompt. "
                        f"IMPORTANT: Only recommend {content_description}. Do not mix content types. "
                        f"Each recommendation should be an object containing the title and the year of release. "
                        f"For TV shows, use the first air year. "
                        f"If there are multiple options that match the user's criteria, prioritize those that are more recently released with higher ratings. "
                        f"Return the results as a JSON array of 10 objects, strictly adhering to this format: "
                        f"[{{\"title\": \"Title Here\", \"year\": 2023}}, ...]. "
                        f"Do not include additional commentary or formatting."
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
            
    except requests.exceptions.HTTPError as e:
        # Check specifically for rate limit errors (429)
        if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
            logger.error(f"OpenAI rate limit exceeded: {e}")
            raise HTTPException(
                status_code=429,
                detail="OpenAI rate limit exceeded. Please try again in a few moments."
            )
        else:
            logger.error(f"OpenAI HTTP error: {e}")
            raise HTTPException(status_code=500, detail=f"OpenAI request failed: {str(e)}")
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenAI request failed: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {str(e)}")

def fetch_movie_details(movie_item: MovieListItem, content_filter: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetch detailed movie/TV information from TMDB based on content filter"""
    try:
        # Determine search endpoint based on filter
        if content_filter in ["tv-shows", "anime", "k-drama"]:
            # Search for TV shows
            params = {"query": movie_item.title, "first_air_date_year": movie_item.year}
            data = make_tmdb_request("/search/tv", params)

            if data.get("results") and len(data["results"]) > 0:
                return transform_tmdb_tv(data["results"][0])
            else:
                logger.warning(f"No TMDB TV results found for {movie_item.title} ({movie_item.year})")
                return None
        else:
            # Search for movies (default for 'movies', 'all', or None)
            params = {"query": movie_item.title, "year": movie_item.year}
            data = make_tmdb_request("/search/movie", params)

            if data.get("results") and len(data["results"]) > 0:
                return transform_tmdb_movie(data["results"][0])
            else:
                logger.warning(f"No TMDB movie results found for {movie_item.title} ({movie_item.year})")
                return None

    except Exception as e:
        logger.error(f"Error fetching details for {movie_item.title}: {e}")
        return None

# Main search endpoint that mirrors Redux queryAIforMovieList
@app.get("/api/movies/search")
def search_movies_with_ai(
    query: str = Query(..., description="Search query for movie recommendations"),
    filter: Optional[str] = Query(None, description="Content type filter: all, movies, tv-shows, anime, k-drama"),
    session_id: str = Depends(get_session_id),  # Get session_id from cookie
    user_id: Optional[int] = Depends(get_user_id),  # Get user_id if logged in
    db: Session = Depends(get_db)  # Get database session
) -> Dict[str, Any]:
    """
    Search for movies using AI recommendations + TMDB details (mirrors queryAIforMovieList)

    Why the new dependencies:
    - session_id: Tracks anonymous users via cookie
    - user_id: If user is logged in, links search to their account
    - db: Database session to save search history
    """

    # Create cache key that includes filter
    cache_key = f"{query}_{filter or 'all'}"

    # Check cache first
    if cache_key in search_cache:
        logger.info(f"Returning cached results for search query: {query} (filter: {filter})")
        return {
            "query": query,
            "movies": search_cache[cache_key],
            "cached": True
        }

    try:
        # Step 1: Query OpenAI for movie/TV recommendations with filter
        movie_list = query_openai_for_movies(query, filter)
        logger.info(f"OpenAI returned {len(movie_list)} recommendations (filter: {filter})")

        # Step 2: Fetch detailed information for each item from TMDB
        detailed_movies = []
        for movie_item in movie_list:
            movie_details = fetch_movie_details(movie_item, filter)
            if movie_details:
                detailed_movies.append(movie_details)

        # Cache the results with filter-specific key
        search_cache[cache_key] = detailed_movies

        # Step 3: Save search to database for tracking
        # Why: Track what users search for, even when anonymous
        search_record = SearchHistory(
            session_id=session_id,  # Always present (from cookie)
            user_id=user_id,  # None if anonymous, set if logged in
            query=query,
            results_count=len(detailed_movies)
        )
        db.add(search_record)
        db.commit()
        logger.info(f"Saved search to database: session_id={session_id}, user_id={user_id}")

        logger.info(f"Successfully fetched details for {len(detailed_movies)} items")
        return {
            "query": query,
            "movies": detailed_movies,
            "cached": False
        }

    except Exception as e:
        logger.error(f"Error in search_movies_with_ai: {e}")
        db.rollback()  # Rollback database changes on error
        raise HTTPException(status_code=500, detail="Failed to search movies")

# Streaming endpoint for search (progressive loading)
@app.get("/api/movies/search/stream")
async def stream_movie_search(
    query: str = Query(..., description="Search query for movie recommendations"),
    filter: Optional[str] = Query(None, description="Content type filter: all, movies, tv-shows, anime, k-drama"),
    session_id: Optional[str] = Query(None, description="Session ID from cookie (for EventSource compatibility)"),
    user_id: Optional[int] = Depends(get_user_id),
    db: Session = Depends(get_db),
    session_id_from_cookie: str = Depends(get_session_id)
):
    """Stream movie search data - first titles, then progressive TMDB details"""

    # Use session_id from query param if provided (EventSource), otherwise use cookie
    actual_session_id = session_id or session_id_from_cookie

    async def event_generator():
        try:
            # Create cache key that includes filter
            cache_key = f"{query}_{filter or 'all'}"

            # Check cache first - if cached, send all at once
            if cache_key in search_cache:
                logger.info(f"Returning cached results for search query: {query} (filter: {filter})")

                # Save cached search to database too
                try:
                    search_record = SearchHistory(
                        session_id=actual_session_id,
                        user_id=user_id,
                        query=query,
                        results_count=len(search_cache[cache_key])
                    )
                    db.add(search_record)
                    db.commit()
                    logger.info(f"Saved cached search to database: session_id={actual_session_id}, user_id={user_id}")
                except Exception as db_error:
                    logger.error(f"Failed to save cached search to database: {db_error}")
                    db.rollback()

                yield f"data: {json.dumps({'type': 'complete', 'query': query, 'movies': search_cache[cache_key]})}\n\n"
                return

            # Step 1: Query OpenAI for movie/TV recommendations with filter
            try:
                movie_list = query_openai_for_movies(query, filter)
                logger.info(f"OpenAI returned {len(movie_list)} recommendations for search (filter: {filter})")
            except HTTPException as http_exc:
                # Handle HTTPException from query_openai_for_movies
                error_message = http_exc.detail
                logger.error(f"OpenAI query failed: {error_message}")
                yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"
                return

            # Step 2: Send initial titles/years immediately
            initial_data = [{"title": movie.title, "year": movie.year} for movie in movie_list]
            yield f"data: {json.dumps({'type': 'initial', 'query': query, 'movies': initial_data})}\n\n"

            # Step 3: Fetch and stream detailed information for each item
            detailed_movies = []
            for index, movie_item in enumerate(movie_list):
                movie_details = fetch_movie_details(movie_item, filter)
                if movie_details:
                    detailed_movies.append(movie_details)
                    # Stream each detail as it's fetched
                    yield f"data: {json.dumps({'type': 'detail', 'query': query, 'index': index, 'movie': movie_details})}\n\n"
                    # Small delay to avoid overwhelming the client
                    await asyncio.sleep(0.05)

            # Cache the complete results with filter-specific key
            search_cache[cache_key] = detailed_movies

            # Save search to database for tracking
            try:
                search_record = SearchHistory(
                    session_id=actual_session_id,
                    user_id=user_id,
                    query=query,
                    results_count=len(detailed_movies)
                )
                db.add(search_record)
                db.commit()
                logger.info(f"Saved search to database: session_id={actual_session_id}, user_id={user_id}")
            except Exception as db_error:
                logger.error(f"Failed to save search to database: {db_error}")
                db.rollback()

            # Send completion signal
            yield f"data: {json.dumps({'type': 'done', 'query': query, 'total': len(detailed_movies)})}\n\n"
            logger.info(f"Successfully streamed {len(detailed_movies)} items for search: {query} (filter: {filter})")

        except Exception as e:
            logger.error(f"Error in stream_movie_search: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    # Combine standard SSE headers with CORS headers
    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
    }
    headers.update(get_cors_headers())

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers=headers
    )

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
    """Clear search results cache (includes all searches and sections)"""
    global search_cache
    search_cache = {}
    return {"message": "Search cache cleared"}

@app.delete("/api/cache/all")
def clear_all_cache():
    """Clear all caches"""
    global search_cache
    search_cache = {}
    return {"message": "All caches cleared"}

# Individual movie/TV details endpoint
@app.get("/api/movies/{content_id}")
def get_content_details(
    content_id: int,
    media_type: Optional[str] = Query(None, description="Media type: movie or tv")
) -> Dict[str, Any]:
    """Get detailed information for a specific movie or TV show"""
    try:
        # Determine endpoint based on media_type
        endpoint = f"/tv/{content_id}" if media_type == "tv" else f"/movie/{content_id}"

        data = make_tmdb_request(endpoint)
        base_image_url = "https://image.tmdb.org/t/p/w500"

        # Transform poster and backdrop paths to full URLs
        if data.get('poster_path'):
            data['poster_path'] = f"{base_image_url}{data['poster_path']}"
        if data.get('backdrop_path'):
            data['backdrop_path'] = f"{base_image_url}{data['backdrop_path']}"

        # Normalize TV show data to match movie structure for frontend compatibility
        if media_type == "tv":
            data['title'] = data.get('name', data.get('title'))
            data['release_date'] = data.get('first_air_date', data.get('release_date'))
            data['runtime'] = data.get('episode_run_time', [0])[0] if data.get('episode_run_time') else 0
            data['media_type'] = 'tv'
        else:
            data['media_type'] = 'movie'

        return data
    except Exception as e:
        logger.error(f"Error getting content details for ID {content_id} (type: {media_type}): {e}")
        raise HTTPException(status_code=500, detail="Failed to get content details")

# Get reviews of a specific movie/TV show
@app.get("/api/movies/{content_id}/reviews")
def get_content_reviews(
    content_id: int,
    media_type: Optional[str] = Query(None, description="Media type: movie or tv")
) -> Dict[str, Any]:
    """Get reviews for a specific movie or TV show"""
    try:
        endpoint = f"/tv/{content_id}/reviews" if media_type == "tv" else f"/movie/{content_id}/reviews"
        data = make_tmdb_request(endpoint)
        return data
    except Exception as e:
        logger.error(f"Error getting reviews for ID {content_id} (type: {media_type}): {e}")
        raise HTTPException(status_code=500, detail="Failed to get reviews")

# Get watch providers for a specific movie/TV show
@app.get("/api/movies/{content_id}/watch/providers")
def get_content_watch_providers(
    content_id: int,
    media_type: Optional[str] = Query(None, description="Media type: movie or tv")
) -> Dict[str, Any]:
    """Get streaming/rental/purchase availability for a specific movie or TV show"""
    try:
        endpoint = f"/tv/{content_id}/watch/providers" if media_type == "tv" else f"/movie/{content_id}/watch/providers"
        data = make_tmdb_request(endpoint)
        return data
    except Exception as e:
        logger.error(f"Error getting watch providers for ID {content_id} (type: {media_type}): {e}")
        raise HTTPException(status_code=500, detail="Failed to get watch providers")


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

# Click tracking endpoint
@app.post("/api/track/click")
def track_movie_click(
    event: ClickEventRequest,
    session_id: str = Depends(get_session_id),
    user_id: Optional[int] = Depends(get_user_id),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Track when a user clicks on a movie

    Why this endpoint exists:
    - Records user engagement with movies
    - Links clicks to session_id (anonymous tracking)
    - Links to user_id if logged in
    - Useful for recommendations and analytics

    Frontend should call this when user:
    - Clicks on a movie card to view details
    - Navigates to /movie/{id}
    """
    try:
        click_record = ClickEvent(
            session_id=session_id,
            user_id=user_id,
            movie_id=event.movie_id,
            movie_title=event.movie_title
        )
        db.add(click_record)
        db.commit()
        logger.info(f"Tracked click: movie_id={event.movie_id}, session_id={session_id}, user_id={user_id}")

        return {
            "success": True,
            "message": "Click tracked successfully",
            "movie_id": event.movie_id
        }

    except Exception as e:
        logger.error(f"Error tracking click: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to track click")


# User signup endpoint
@app.post("/api/auth/signup")
def signup(
    request: SignupRequest,
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new user account and link anonymous activity.

    Why this flow:
    1. Check if email already exists (prevent duplicates)
    2. Hash the password (NEVER store plaintext!)
    3. Create user in database
    4. Link all their anonymous activity (searches, clicks) to their new account
    5. Return user info (but NOT the password hash!)

    This is THE MAGIC MOMENT where anonymous becomes identified.
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password (bcrypt makes this slow on purpose - security feature)
        password_hash = pwd_context.hash(request.password)

        # Create user
        user = create_user(email=request.email, password_hash=password_hash, db=db)

        # CRITICAL: Link all anonymous activity to this new user
        # Why? User has been browsing anonymously, now we "claim" that history
        link_result = link_session_to_user(session_id, user.id, db)

        logger.info(f"New user signed up: {user.id}, linked {link_result['total_linked']} records")

        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "linked_activity": link_result
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Signup failed")


# User login endpoint
@app.post("/api/auth/login")
def login(
    request: LoginRequest,
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Login existing user and link any new anonymous activity.

    Why link on login too?
    - User might have used app anonymously on a new device
    - Or cleared cookies and browsed before logging in
    - We want to capture that activity too!

    Flow:
    1. Find user by email
    2. Verify password matches
    3. Link any anonymous activity from this session
    4. Return user info
    """
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        # Why not just compare strings? Hash is one-way, must use verify()
        if not pwd_context.verify(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Link any anonymous activity from this session to the user
        # Why? User may have browsed before logging in
        link_result = link_session_to_user(session_id, user.id, db)

        logger.info(f"User logged in: {user.id}, linked {link_result['total_linked']} records")

        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "linked_activity": link_result
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


# Health check endpoint
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "FindsMovies API is running",
        "tmdb_configured": bool(TMDB_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "cache_size": len(search_cache)
    }

# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "message": "FindsMovies API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "endpoints": {
            "search": "GET /api/movies/search?query=...&filter=...",
            "search_stream": "GET /api/movies/search/stream?query=...&filter=...",
            "movie_details": "GET /api/movies/{movie_id}?media_type=...",
            "movie_reviews": "GET /api/movies/{movie_id}/reviews?media_type=...",
            "watch_providers": "GET /api/movies/{movie_id}/watch/providers?media_type=...",
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