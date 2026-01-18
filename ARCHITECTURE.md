# FindsMovies - System Architecture Documentation

> Comprehensive technical documentation covering the entire system architecture, frontend-backend interaction, and data flow.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Pattern](#architecture-pattern)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Frontend-Backend Interaction](#frontend-backend-interaction)
7. [Data Flow](#data-flow)
8. [Key Features & Implementation](#key-features--implementation)
9. [Database Schema](#database-schema)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [State Management](#state-management)
12. [Caching Strategy](#caching-strategy)
13. [Authentication & Session Management](#authentication--session-management)

---

## System Overview

FindsMovies is a full-stack web application that enables users to discover movies using natural language queries powered by AI. The system integrates OpenAI for natural language processing and The Movie Database (TMDB) API for comprehensive movie data.

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   React SPA     │◄───────►│   FastAPI       │◄───────►│   PostgreSQL    │
│   (Frontend)    │   HTTP  │   (Backend)     │   ORM   │   (Database)    │
│                 │   SSE   │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    │ HTTP
                                    ▼
                            ┌─────────────────┐
                            │  External APIs  │
                            │  - OpenAI       │
                            │  - TMDB         │
                            └─────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: EventSource (Server-Sent Events)
- **UI Components**: Custom components + Radix UI primitives

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: Passlib (bcrypt)
- **HTTP Client**: Requests
- **ASGI Server**: Uvicorn
- **Migration**: Alembic

### External Services
- **OpenAI API**: GPT-3.5-turbo for movie recommendations
- **TMDB API**: Movie metadata, posters, ratings
- **Docker**: Containerization

---

## Architecture Pattern

The system follows a **layered architecture** with clear separation of concerns:

### Backend Layers
```
┌────────────────────────────────────────┐
│       API Layer (Routes/Endpoints)     │  ← FastAPI route handlers
├────────────────────────────────────────┤
│       Business Logic Layer             │  ← Services & utilities
├────────────────────────────────────────┤
│       Data Access Layer                │  ← SQLAlchemy ORM
├────────────────────────────────────────┤
│       Database Layer                   │  ← PostgreSQL
└────────────────────────────────────────┘
```

### Frontend Layers
```
┌────────────────────────────────────────┐
│       Presentation Layer               │  ← React Components
├────────────────────────────────────────┤
│       State Management Layer           │  ← Redux Store
├────────────────────────────────────────┤
│       Data Fetching Layer              │  ← Hooks & Axios
├────────────────────────────────────────┤
│       API Communication Layer          │  ← HTTP/SSE clients
└────────────────────────────────────────┘
```

---

## Backend Architecture

### Directory Structure

```
backend/app/
├── main.py                 # Application entry point + route handlers
├── config.py              # Configuration settings (Pydantic)
├── database.py            # Database connection & session management
├── auth.py                # Authentication logic
├── session.py             # Session middleware for anonymous tracking
├── models/                # SQLAlchemy ORM models
│   ├── user.py           # User model
│   ├── tracking.py       # SearchHistory, ClickEvent models
│   └── movie.py          # Movie-related models
└── services/              # Business logic & external API integrations
    └── movie.py          # TMDB & OpenAI service classes
```

### Core Components

#### 1. **main.py** - Application Entry Point
**Purpose**: Central hub for all API endpoints and request handling

**Key Responsibilities**:
- Define FastAPI application instance
- Configure CORS middleware
- Register all API routes
- Implement streaming endpoints (SSE)
- Handle in-memory caching
- Orchestrate service calls

**Key Functions**:
```python
# OpenAI Integration
query_openai_for_movies(prompt: str, content_filter: Optional[str])

# TMDB Integration
fetch_movie_details(movie_item: MovieListItem, content_filter: Optional[str])

# Helper Functions
make_tmdb_request(endpoint: str, params: Dict)
transform_tmdb_movie(movie_data: Dict)
transform_tmdb_tv(tv_data: Dict)
```

#### 2. **models/** - Database Models
**Purpose**: Define database schema using SQLAlchemy ORM

**Models**:

**User** (`models/user.py`):
```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=True, index=True)
    username = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
```

**SearchHistory** (`models/tracking.py`):
```python
class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(String, nullable=False)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True))
```

**ClickEvent** (`models/tracking.py`):
```python
class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    movie_id = Column(Integer, nullable=False)
    movie_title = Column(String, nullable=True)
    clicked_at = Column(DateTime(timezone=True))
```

#### 3. **database.py** - Database Configuration
**Purpose**: Manage database connections and sessions

**Key Components**:
```python
# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency injection function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 4. **auth.py** - Authentication Logic
**Purpose**: Handle user authentication and session linking

**Key Functions**:

```python
def create_user(email: str, password_hash: str, db: Session) -> User:
    """Create a new user account"""

def link_session_to_user(session_id: str, user_id: int, db: Session) -> dict:
    """Link anonymous activity from a session to a user account"""
```

**Anonymous-to-Authenticated Flow**:
1. User browses anonymously → tracked with `session_id`
2. User signs up/logs in → gets `user_id`
3. `link_session_to_user()` updates all records:
   - `SearchHistory` records with matching `session_id` get `user_id`
   - `ClickEvent` records with matching `session_id` get `user_id`

#### 5. **session.py** - Session Middleware
**Purpose**: Manage HTTP-only cookies for session tracking

**Key Features**:
- Creates unique `session_id` for each visitor
- Stores in secure, HTTP-only cookie
- Provides dependency injection functions:
  - `get_session_id()`: Always returns session_id
  - `get_user_id()`: Returns user_id if logged in, else None

---

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── main.tsx               # Application entry point
├── App.tsx               # Root component with routing
├── components/           # Reusable UI components
│   ├── core/            # Core app components
│   │   ├── Header.tsx
│   │   ├── MovieCard.tsx
│   │   ├── SectionResults.tsx
│   │   └── SearchBar.tsx
│   ├── ui/              # Generic UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── previousPage.tsx
│   └── SEO/             # SEO components
│       └── SEO.tsx
├── pages/               # Page components (routes)
│   ├── HomePage.tsx
│   ├── SearchResults.tsx
│   ├── MoviePage.tsx
│   └── NotFound.tsx
├── redux/               # State management
│   ├── store.ts        # Redux store configuration
│   └── movieSlice.ts   # Movie state slice
├── hooks/               # Custom React hooks
│   └── useMovieStreaming.ts
├── api/                 # API client configuration
│   └── axios.ts        # Axios instance
├── types/               # TypeScript type definitions
│   └── movie.ts
├── utils/               # Utility functions
└── lib/                 # Third-party library configurations
```

### Core Components

#### 1. **Redux State Management** (`redux/movieSlice.ts`)

**State Shape**:
```typescript
interface MovieState {
  loading: boolean;
  movies: Movie[];                                    // Current search results
  movieSection: Movie[];                              // Section movies
  sectionResults: Record<string, Movie[]>;           // Cached sections
  searchResults: Record<string, Movie[]>;            // Cached searches
  sectionLoading: boolean;
  sectionError: string | null;
  error: string | null;

  // Progressive loading states
  partialSections: Record<string, (Movie | PartialMovie)[]>;
  partialSearches: Record<string, (Movie | PartialMovie)[]>;
}
```

**Key Actions**:
```typescript
// Streaming actions
startSectionStreaming({ query })
startSearchStreaming({ query })
setInitialMovies({ query, movies })        // Initial titles from OpenAI
updateMovieDetail({ query, index, movie }) // Progressive TMDB details
completeSectionLoading({ query })
completeSearchLoading({ query })

// Cache actions
setSectionFromCache({ query, movies })
setSearchFromCache({ query, movies })
clearSearchCache()
clearSectionCache()

// Error handling
sectionStreamError({ query, error })
searchStreamError({ query, error })
```

#### 2. **Custom Hooks** (`hooks/useMovieStreaming.ts`)

**Purpose**: Encapsulate Server-Sent Events (SSE) streaming logic

**Usage**:
```typescript
const { streamMovies } = useMovieStreaming({
  type: 'search',  // or 'section'
  onComplete: () => {},
  onError: (error) => {}
});

// Start streaming
await streamMovies(query, filter);
```

**SSE Event Flow**:
```typescript
1. 'initial'   → Dispatch setInitialMovies (show titles immediately)
2. 'detail'    → Dispatch updateMovieDetail (update each movie progressively)
3. 'complete'  → Dispatch setFromCache (all data at once, cached)
4. 'done'      → Dispatch completeLoading (streaming finished)
5. 'error'     → Dispatch streamError (handle errors)
```

#### 3. **Component Architecture**

**HomePage.tsx**:
- Renders search bar
- Displays multiple movie sections
- Uses `SectionResults` component

**SectionResults.tsx**:
- Fetches and displays movie sections
- Implements horizontal scrolling
- Uses `MovieCard` for each movie
- **Key Fix**: Uses stable React keys (`${query}-${index}`) to prevent duplicate/missing movies during streaming

**SearchResults.tsx**:
- Handles search query from URL params
- Streams search results progressively
- Grid layout for movie cards
- **Key Fix**: Uses stable React keys for streaming updates

**MovieCard.tsx**:
- Displays movie poster, title, year
- Handles loading state (skeleton)
- Click tracking
- Hover effects

---

## Frontend-Backend Interaction

### Communication Patterns

#### 1. **Standard HTTP Requests**
Used for: One-time data fetching, mutations

```typescript
// Example: Track click event
POST /api/track/click
Body: { movie_id: 123, movie_title: "Inception" }

// Backend endpoint
@app.post("/api/track/click")
def track_movie_click(
    event: ClickEventRequest,
    session_id: str = Depends(get_session_id),
    user_id: Optional[int] = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    click_record = ClickEvent(
        session_id=session_id,
        user_id=user_id,
        movie_id=event.movie_id,
        movie_title=event.movie_title
    )
    db.add(click_record)
    db.commit()
    return {"success": True}
```

#### 2. **Server-Sent Events (SSE)**
Used for: Progressive loading, real-time updates

**Why SSE?**
- Unidirectional server-to-client streaming
- Native browser support (EventSource API)
- Automatic reconnection
- Simple text-based protocol

**Implementation**:

**Frontend** (`hooks/useMovieStreaming.ts`):
```typescript
const eventSource = new EventSource(
    `${baseUrl}/api/movies/search/stream?query=${query}`
);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'initial':
            // Show skeleton cards with titles immediately
            dispatch(setInitialMovies({ query: data.query, movies: data.movies }));
            break;

        case 'detail':
            // Update individual movie with full details
            dispatch(updateMovieDetail({
                query: data.query,
                index: data.index,
                movie: data.movie
            }));
            break;

        case 'done':
            // Streaming complete
            dispatch(completeLoading({ query: data.query }));
            eventSource.close();
            break;
    }
};
```

**Backend** (`main.py`):
```python
@app.get("/api/movies/search/stream")
async def stream_movie_search(query: str, filter: Optional[str] = None):
    async def event_generator():
        # Step 1: Query OpenAI for movie titles
        movie_list = query_openai_for_movies(query, filter)

        # Step 2: Send initial titles immediately
        initial_data = [{"title": m.title, "year": m.year} for m in movie_list]
        yield f"data: {json.dumps({'type': 'initial', 'query': query, 'movies': initial_data})}\n\n"

        # Step 3: Stream detailed information progressively
        for index, movie_item in enumerate(movie_list):
            movie_details = fetch_movie_details(movie_item, filter)
            if movie_details:
                yield f"data: {json.dumps({'type': 'detail', 'query': query, 'index': index, 'movie': movie_details})}\n\n"
                await asyncio.sleep(0.05)  # Prevent overwhelming client

        # Step 4: Send completion signal
        yield f"data: {json.dumps({'type': 'done', 'query': query})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

---

## Data Flow

### Complete Search Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER ACTION                                  │
│                  User types: "Dark psychological thrillers"             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. SearchBar captures query                                            │
│ 2. Navigate to /search?q=Dark+psychological+thrillers                  │
│ 3. SearchResults page mounts                                           │
│ 4. useMovieStreaming hook initiates SSE connection                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ EventSource
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI) - Stream Endpoint                 │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. GET /api/movies/search/stream?query=...                             │
│ 2. Extract session_id from cookie (Depends)                            │
│ 3. Extract user_id if logged in (Depends)                              │
│ 4. Check cache for query                                               │
│    ├─ If cached → Send complete event, return                          │
│    └─ If not cached → Continue                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPENAI API CALL                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ POST https://api.openai.com/v1/chat/completions                        │
│ Body: {                                                                 │
│   model: "gpt-3.5-turbo",                                               │
│   messages: [                                                           │
│     { role: "system", content: "Recommend 10 movies..." },              │
│     { role: "user", content: "Dark psychological thrillers" }           │
│   ]                                                                     │
│ }                                                                       │
│                                                                         │
│ Response: [                                                             │
│   { title: "Gone Girl", year: 2014 },                                  │
│   { title: "Black Swan", year: 2010 },                                 │
│   ...                                                                   │
│ ]                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SSE: Send Initial Event                              │
├─────────────────────────────────────────────────────────────────────────┤
│ data: {                                                                 │
│   "type": "initial",                                                    │
│   "query": "Dark psychological thrillers",                              │
│   "movies": [                                                           │
│     {"title": "Gone Girl", "year": 2014},                               │
│     {"title": "Black Swan", "year": 2010},                              │
│     ...                                                                 │
│   ]                                                                     │
│ }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: Display Skeleton Cards                     │
├─────────────────────────────────────────────────────────────────────────┤
│ Redux: setInitialMovies() → partialSearches updated                    │
│ UI: Render 10 MovieCard components with:                               │
│   - Title                                                               │
│   - Year                                                                │
│   - Loading skeleton (no poster yet)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              BACKEND: Fetch Details from TMDB (Loop)                    │
├─────────────────────────────────────────────────────────────────────────┤
│ For each movie (index 0-9):                                             │
│   1. GET https://api.themoviedb.org/3/search/movie                      │
│      params: { query: "Gone Girl", year: 2014 }                         │
│                                                                         │
│   2. Transform TMDB response to internal format                         │
│                                                                         │
│   3. SSE: Send detail event                                             │
│      data: {                                                            │
│        "type": "detail",                                                │
│        "query": "...",                                                  │
│        "index": 0,                                                      │
│        "movie": {                                                       │
│          id: 210577,                                                    │
│          title: "Gone Girl",                                            │
│          overview: "...",                                               │
│          poster_path: "/ts996lKsxvjkO2yiYG0ht4qAicO.jpg",               │
│          vote_average: 7.9,                                             │
│          ...                                                            │
│        }                                                                │
│      }                                                                  │
│                                                                         │
│   4. await asyncio.sleep(0.05) // Small delay                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         FRONTEND: Progressive Update (for each detail event)            │
├─────────────────────────────────────────────────────────────────────────┤
│ Redux: updateMovieDetail({ query, index: 0, movie })                   │
│   → partialSearches[query][0] = movie (full data)                      │
│                                                                         │
│ UI: MovieCard at index 0 re-renders with:                              │
│   - Poster image                                                        │
│   - Full overview                                                       │
│   - Rating                                                              │
│   - No more skeleton                                                    │
│                                                                         │
│ (Repeat for index 1, 2, 3... 9)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              BACKEND: Save to Database & Cache                          │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Save to database:                                                    │
│    search_record = SearchHistory(                                       │
│      session_id=session_id,                                             │
│      user_id=user_id,    // None if anonymous                           │
│      query="Dark psychological thrillers",                              │
│      results_count=10                                                   │
│    )                                                                    │
│    db.add(search_record)                                                │
│    db.commit()                                                          │
│                                                                         │
│ 2. Cache results:                                                       │
│    search_cache[query] = detailed_movies                                │
│                                                                         │
│ 3. SSE: Send done event                                                 │
│    data: {                                                              │
│      "type": "done",                                                    │
│      "query": "...",                                                    │
│      "total": 10                                                        │
│    }                                                                    │
│                                                                         │
│ 4. Close SSE connection                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                FRONTEND: Finalize Loading State                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Redux: completeSearchLoading({ query })                                │
│   → loading = false                                                     │
│   → searchResults[query] = partialSearches[query]                      │
│                                                                         │
│ UI: Remove any loading indicators                                      │
│                                                                         │
│ EventSource: Close connection                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Click Tracking Flow

```
User clicks on movie → MovieCard onClick
    │
    ├─ Navigate to /movie/{id}
    │
    └─ POST /api/track/click
           │
           ├─ Extract session_id (cookie)
           ├─ Extract user_id (if logged in)
           └─ Save ClickEvent to database
                  │
                  └─ Links to session and/or user
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SIGNUP FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. User has been browsing anonymously                                  │
│    - session_id = "abc123" (from cookie)                                │
│    - SearchHistory: session_id="abc123", user_id=NULL                   │
│    - ClickEvent: session_id="abc123", user_id=NULL                      │
│                                                                         │
│ 2. User clicks "Sign Up"                                                │
│    POST /api/auth/signup                                                │
│    Body: { email: "user@example.com", password: "..." }                │
│                                                                         │
│ 3. Backend:                                                             │
│    a. Check if email exists (prevent duplicates)                        │
│    b. Hash password with bcrypt                                         │
│    c. Create User record → user_id = 42                                 │
│    d. Link session to user:                                             │
│       UPDATE search_history                                             │
│       SET user_id = 42                                                  │
│       WHERE session_id = "abc123" AND user_id IS NULL                   │
│                                                                         │
│       UPDATE click_events                                               │
│       SET user_id = 42                                                  │
│       WHERE session_id = "abc123" AND user_id IS NULL                   │
│                                                                         │
│ 4. Response: { success: true, user: {...}, linked_activity: {...} }    │
│                                                                         │
│ 5. All anonymous activity now belongs to the user!                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Similar to signup, but:                                                 │
│ 1. Find existing user by email                                         │
│ 2. Verify password with bcrypt.verify()                                │
│ 3. Link any new anonymous activity from current session                │
│ 4. Return user info                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features & Implementation

### 1. Progressive Loading with SSE

**Problem**: Fetching 10 movies from TMDB takes 5-10 seconds
**Solution**: Stream results as they arrive

**Implementation**:
1. Show titles immediately (from OpenAI)
2. Fetch TMDB details in parallel
3. Update UI progressively as each movie loads
4. User sees content faster, perceived performance improves

### 2. Stable React Keys During Streaming

**Problem**: React keys changing during streaming caused duplicate/missing movies

**Original Code** (BUGGY):
```typescript
const movieId = isFullMovie ? movie.id : `${movie.title}-${index}`;
<div key={movieId}>  // Key changes from "Inception-5" to "12345"
```

**Fixed Code**:
```typescript
const movieKey = `${query}-${index}`;
<div key={movieKey}>  // Stable key throughout streaming
```

**Why this works**: Index remains constant, so React correctly updates the same component instead of unmounting/remounting.

### 3. Content Type Filtering

Supports filtering by:
- `movies` - Movies only
- `tv-shows` - TV series
- `anime` - Japanese animation
- `k-drama` - Korean dramas
- `all` - Mixed content

**Implementation**:
```python
# Backend adjusts OpenAI prompt based on filter
if content_filter == "tv-shows":
    content_type = "TV shows"

# Backend uses different TMDB endpoint
if content_filter in ["tv-shows", "anime", "k-drama"]:
    data = make_tmdb_request("/search/tv", params)
else:
    data = make_tmdb_request("/search/movie", params)
```

### 4. Anonymous User Tracking

**Why**: Track user behavior before login for better recommendations

**How**:
1. SessionMiddleware creates unique `session_id` on first visit
2. Store in HTTP-only cookie (secure, can't be accessed by JS)
3. Every action (search, click) saves with `session_id`
4. On signup/login, link all `session_id` records to `user_id`

**Privacy**: No PII stored until signup, easy to purge by session_id

---

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE,
    username VARCHAR,
    password_hash VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

#### search_history
```sql
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id),
    query VARCHAR NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_session_id ON search_history(session_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
```

#### click_events
```sql
CREATE TABLE click_events (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id),
    movie_id INTEGER NOT NULL,
    movie_title VARCHAR,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_click_events_session_id ON click_events(session_id);
CREATE INDEX idx_click_events_user_id ON click_events(user_id);
```

### Relationships

```
users (1) ───< (many) search_history
users (1) ───< (many) click_events
```

---

## API Endpoints Reference

### Movie Search & Discovery

#### Search Movies with AI
```http
GET /api/movies/search?query={query}&filter={filter}
```
**Response**: Complete movie list with all details

#### Stream Movie Search (SSE)
```http
GET /api/movies/search/stream?query={query}&filter={filter}&session_id={session_id}
```
**Events**: `initial`, `detail`, `done`, `error`

#### Get Movie Section
```http
GET /api/movies/section?query={query}
```
**Response**: Section movie list

#### Stream Movie Section (SSE)
```http
GET /api/movies/section/stream?query={query}
```
**Events**: `initial`, `detail`, `done`, `error`

#### Get Movie Details
```http
GET /api/movies/{movie_id}?media_type={movie|tv}
```
**Response**: Full movie/TV show details

#### Get Movie Reviews
```http
GET /api/movies/{movie_id}/reviews?media_type={movie|tv}
```
**Response**: TMDB reviews

#### Get Watch Providers
```http
GET /api/movies/{movie_id}/watch/providers?media_type={movie|tv}
```
**Response**: Streaming availability by region

### Tracking

#### Track Click Event
```http
POST /api/track/click
Body: {
  "movie_id": 123,
  "movie_title": "Inception"
}
```
**Response**: `{ success: true }`

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response**: `{ success: true, user: {...}, linked_activity: {...} }`

#### Log In
```http
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response**: `{ success: true, user: {...}, linked_activity: {...} }`

### Cache Management

#### Clear Search Cache
```http
DELETE /api/cache/search
```

#### Clear Section Cache
```http
DELETE /api/cache/section
```

#### Clear All Caches
```http
DELETE /api/cache/all
```

### Utility

#### Health Check
```http
GET /api/health
```
**Response**: System status and configuration

---

## State Management

### Redux Store Structure

```typescript
{
  movies: {
    // Loading states
    loading: boolean,
    sectionLoading: boolean,

    // Error states
    error: string | null,
    sectionError: string | null,

    // Complete data (cached)
    movies: Movie[],                          // Current search results
    movieSection: Movie[],                    // Current section
    sectionResults: {
      "action movies": Movie[],
      "sci-fi classics": Movie[],
      ...
    },
    searchResults: {
      "thriller movies": Movie[],
      ...
    },

    // Progressive loading (streaming)
    partialSections: {
      "action movies": (Movie | PartialMovie)[],
      ...
    },
    partialSearches: {
      "thriller movies": (Movie | PartialMovie)[],
      ...
    }
  }
}
```

### State Flow

```
User Action → Dispatch Action → Reducer Updates State → Components Re-render

Example:
User searches "action" → streamMovies("action")
                      → EventSource receives 'initial'
                      → dispatch(setInitialMovies({ query, movies }))
                      → Reducer: partialSearches["action"] = movies
                      → SearchResults re-renders with skeleton cards

                      → EventSource receives 'detail' (index 0)
                      → dispatch(updateMovieDetail({ query, index: 0, movie }))
                      → Reducer: partialSearches["action"][0] = movie
                      → MovieCard at index 0 re-renders with full data

                      → ... (repeat for each movie)

                      → EventSource receives 'done'
                      → dispatch(completeSearchLoading({ query }))
                      → Reducer: loading = false, searchResults["action"] = partialSearches["action"]
                      → UI shows complete state
```

---

## Caching Strategy

### Two-Tier Caching System

#### 1. Backend In-Memory Cache (Python Dict)
```python
search_cache: Dict[str, List[Dict[str, Any]]] = {}
section_cache: Dict[str, List[Dict[str, Any]]] = {}
```

**Lifetime**: Until server restart
**Purpose**: Avoid OpenAI + TMDB API calls for duplicate queries
**Key**: Query string (with filter for searches)

#### 2. Frontend Redux Cache
```typescript
sectionResults: Record<string, Movie[]>
searchResults: Record<string, Movie[]>
```

**Lifetime**: Until page refresh
**Purpose**: Instant display for repeated navigation
**Key**: Query string

### Cache Flow

```
User searches "action" (first time)
    └─> Frontend: Not in Redux → Call backend
            └─> Backend: Not in cache → Query OpenAI + TMDB
                    └─> Backend: Cache results
                    └─> Frontend: Cache results

User searches "action" (second time, same session)
    └─> Frontend: Found in Redux → Display immediately (no API call)

User searches "action" (after page refresh)
    └─> Frontend: Redux cleared → Call backend
            └─> Backend: Found in cache → Return immediately
                    └─> Send 'complete' event with all data
                    └─> Frontend: Cache results
```

---

## Authentication & Session Management

### Security Features

1. **Password Hashing**: Bcrypt with automatic salt
   ```python
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   password_hash = pwd_context.hash(password)
   ```

2. **HTTP-Only Cookies**: Session ID not accessible to JavaScript
   ```python
   response.set_cookie(
       key="session_id",
       value=session_id,
       httponly=True,
       secure=True,  # HTTPS only in production
       samesite="lax"
   )
   ```

3. **Dependency Injection**: Automatic session/user extraction
   ```python
   def search_movies(
       session_id: str = Depends(get_session_id),
       user_id: Optional[int] = Depends(get_user_id)
   ):
       # session_id always available
       # user_id is None if not logged in
   ```

### Session Lifecycle

```
1. First Visit
   ├─ SessionMiddleware generates UUID
   ├─ Set session_id cookie
   └─ User browses anonymously

2. User Actions (Anonymous)
   ├─ Search movies → SearchHistory(session_id, user_id=NULL)
   └─ Click movies → ClickEvent(session_id, user_id=NULL)

3. Sign Up / Log In
   ├─ Authenticate user → user_id = 42
   ├─ link_session_to_user(session_id, 42)
   └─ Update all records: user_id = 42

4. Subsequent Visits (Logged In)
   ├─ Session cookie persists
   ├─ get_user_id() returns 42
   └─ All actions linked to user
```

---

## Deployment Architecture

### Docker Compose Setup

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://backend:8000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/promptflix
      - TMDB_API_KEY=${TMDB_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=promptflix
      - POSTGRES_USER=promptflix
      - POSTGRES_PASSWORD=promptflix_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Production Considerations

1. **Environment Variables**: Use `.env` files, never commit secrets
2. **CORS**: Restrict to specific origins in production
3. **HTTPS**: Enable secure cookies, SSL/TLS
4. **Database**: Use managed PostgreSQL (AWS RDS, etc.)
5. **Caching**: Consider Redis for distributed caching
6. **Rate Limiting**: Protect against API abuse
7. **Monitoring**: Add logging, error tracking (Sentry, etc.)
8. **CDN**: Serve static assets via CDN

---

## Performance Optimizations

### Current Optimizations

1. **Progressive Loading**: SSE streams data as it arrives
2. **In-Memory Caching**: Avoid duplicate API calls
3. **Lazy Loading**: Components load on demand
4. **Debouncing**: Search input debounced (if implemented)
5. **Image Optimization**: TMDB provides multiple image sizes

### Future Optimizations

1. **Redis Cache**: Distributed caching for scaled deployments
2. **Database Indexing**: Already indexed on session_id, user_id
3. **API Pagination**: Limit results per query
4. **Image Lazy Loading**: Load images as they enter viewport
5. **Service Workers**: Offline support, cache API responses
6. **Code Splitting**: Split bundles by route

---

## Troubleshooting Guide

### Common Issues

#### 1. Movies Appearing Twice or Missing
**Cause**: React key changing during streaming
**Solution**: Fixed in `/frontend/src/components/core/SectionResults.tsx:101` and `/frontend/src/pages/SearchResults.tsx:118` - now uses stable keys

#### 2. CORS Errors
**Cause**: Mismatched origins
**Solution**: Check `ALLOWED_ORIGINS` in backend `.env`

#### 3. Database Connection Failed
**Cause**: PostgreSQL not running or wrong credentials
**Solution**: Check `DATABASE_URL` in backend `.env`

#### 4. OpenAI Rate Limit
**Cause**: Too many requests to OpenAI API
**Solution**: Implement rate limiting, use caching

#### 5. Session Not Persisting
**Cause**: Cookies not being sent
**Solution**: Check CORS `allow_credentials=True` and cookie settings

---

## Future Enhancements

### Planned Features

1. **User Profiles**: Save favorite movies, watchlists
2. **Recommendation Engine**: ML-based personalized recommendations
3. **Social Features**: Share lists, follow friends
4. **Advanced Filters**: Year range, rating, runtime
5. **Watchlist Tracking**: Mark as watched, rate movies
6. **Multi-Language**: i18n support
7. **Dark/Light Theme**: User preference
8. **Real-time Notifications**: New recommendations via WebSocket

### Technical Improvements

1. **GraphQL**: Replace REST with GraphQL for flexible queries
2. **Microservices**: Split into separate services (auth, search, recommendations)
3. **Event-Driven**: Use message queue (RabbitMQ, Kafka) for async processing
4. **Analytics**: Track user behavior for insights
5. **A/B Testing**: Experiment with different UX flows
6. **Mobile App**: React Native or Flutter app

---

## Contributing Guidelines

### Development Workflow

1. **Fork & Clone**: Fork the repo, clone to local machine
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Make Changes**: Implement feature, write tests
4. **Test Locally**: Run backend + frontend + database
5. **Commit**: Use conventional commits (`feat:`, `fix:`, etc.)
6. **Push**: Push to your fork
7. **Pull Request**: Open PR with description

### Code Standards

- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Strict mode, use interfaces/types
- **React**: Functional components, hooks
- **Git**: Conventional commits, descriptive messages

---

## Conclusion

FindsMovies is a modern, full-stack application demonstrating:

- **Clean Architecture**: Separation of concerns, modular design
- **Modern Tech Stack**: React, TypeScript, FastAPI, PostgreSQL
- **Real-time Features**: SSE for progressive loading
- **User Tracking**: Anonymous-to-authenticated flow
- **External Integrations**: OpenAI, TMDB APIs
- **Performance**: Caching, streaming, optimized rendering

The architecture is designed to be maintainable, scalable, and developer-friendly while providing an excellent user experience.

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Maintained By**: PromptFlix Team
