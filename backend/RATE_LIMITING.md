# Rate Limiting Implementation for OpenAI API Calls

## Overview
This document outlines the implementation strategy for rate limiting OpenAI API calls in the FindsMovies backend. The rate limiting is session-based and includes both per-minute and per-day limits with configurable thresholds.

## Requirements
- **Scope**: Rate limiting applies only to OpenAI API calls
- **Tracking**: Based on `session_id` (cookie-based session identifier)
- **Limits**:
  - Per-minute rate limit (configurable)
  - Per-day rate limit (configurable)
- **Response**: Include rate limit information in API responses
- **Configurability**: Limits should be configurable via environment variables

## Affected Endpoints
The following endpoints make OpenAI API calls and will be rate-limited:
- `GET /api/movies/search` (main.py:300)

All endpoints call the `query_openai_for_movies()` function (main.py:189).

## Implementation Approaches

### Option 1: Redis-Based Rate Limiting (Recommended for Production)

**Pros:**
- Distributed: Works across multiple server instances
- Fast: In-memory performance with O(1) operations
- Built-in TTL: Automatic expiration of rate limit windows
- Scalable: Handles high traffic efficiently
- Persistent: Survives server restarts

**Cons:**
- Additional infrastructure dependency (Redis server)
- More complex setup and configuration
- Requires redis-py library

**Use Case:** Production environments, especially when scaling horizontally

### Option 2: In-Memory Dictionary (Recommended for MVP/Development)

**Pros:**
- Simple implementation: No external dependencies
- Fast: Direct memory access
- Easy to debug and test
- No additional infrastructure needed

**Cons:**
- Not distributed: Each server instance has separate counters
- Lost on server restart
- Not suitable for horizontal scaling
- Manul cleanup required for expired entries

**Use Case:** Development, testing, or single-instance deployments

## Recommended Architecture (Redis-Based)

### 1. Data Structure

Use Redis with the following key structure:
```
ratelimit:{session_id}:minute:{timestamp}  → count (TTL: 60 seconds)
ratelimit:{session_id}:day:{date}         → count (TTL: 24 hours)
```

### 2. Components

#### A. Configuration (`app/config.py`)
```python
class Settings(BaseSettings):
    # ... existing settings ...

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10
    RATE_LIMIT_PER_DAY: int = 100
    REDIS_URL: str = "redis://localhost:6379"
```

#### B. Rate Limiter Service (`app/services/rate_limiter.py`)
Create a new service module to handle rate limiting logic:

**Key Functions:**
- `check_rate_limit(session_id: str) -> RateLimitResult`
  - Checks both minute and day limits
  - Returns current usage and remaining quota
  - Raises HTTPException if limit exceeded

- `increment_rate_limit(session_id: str) -> RateLimitInfo`
  - Increments counters for both windows
  - Returns updated rate limit information

- `get_rate_limit_info(session_id: str) -> RateLimitInfo`
  - Retrieves current rate limit status without incrementing

**Data Models:**
```python
class RateLimitInfo(BaseModel):
    limit_minute: int
    remaining_minute: int
    limit_day: int
    remaining_day: int
    reset_minute: int  # Unix timestamp
    reset_day: int     # Unix timestamp
```

#### C. Dependency/Decorator (`app/dependencies.py`)
Create a FastAPI dependency for rate limiting:

```python
async def enforce_rate_limit(
    session_id: str = Depends(get_session_id)
) -> RateLimitInfo:
    """
    FastAPI dependency that enforces rate limits
    Raises HTTPException(429) if limit exceeded
    Returns RateLimitInfo on success
    """
    # Check and increment rate limit
    # Raise 429 if exceeded
    # Return info for response headers
```

#### D. Response Headers
Add rate limit information to all responses:
```
X-RateLimit-Limit-Minute: 10
X-RateLimit-Remaining-Minute: 7
X-RateLimit-Reset-Minute: 1642534800
X-RateLimit-Limit-Day: 100
X-RateLimit-Remaining-Day: 85
X-RateLimit-Reset-Day: 1642550400
```

### 3. Integration Points

#### Modify Affected Endpoints
Update all OpenAI-related endpoints to use the rate limiting dependency:

```python
@app.get("/api/movies/search")
async def search_movies_with_ai(
    query: str = Query(...),
    filter: Optional[str] = Query(None),
    session_id: str = Depends(get_session_id),
    user_id: Optional[int] = Depends(get_user_id),
    db: Session = Depends(get_db),
    rate_limit_info: RateLimitInfo = Depends(enforce_rate_limit)  # NEW
) -> Dict[str, Any]:
    # Add rate limit headers to response
    # ... existing logic ...
```

#### Alternative: Decorator Approach
For cleaner code, create a decorator:

```python
@rate_limit_openai()
@app.get("/api/movies/search")
async def search_movies_with_ai(...):
    # Decorator handles rate limiting automatically
```

### 4. Error Handling

When rate limit is exceeded, return:
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the per-minute rate limit. Please try again in X seconds.",
  "limit_type": "per_minute",  // or "per_day"
  "retry_after": 45,  // seconds until reset
  "rate_limit": {
    "limit_minute": 10,
    "remaining_minute": 0,
    "limit_day": 100,
    "remaining_day": 85
  }
}
```

HTTP Status: `429 Too Many Requests`

Headers:
```
Retry-After: 45
X-RateLimit-Limit-Minute: 10
X-RateLimit-Remaining-Minute: 0
X-RateLimit-Reset-Minute: 1642534845
```

## Alternative Architecture (In-Memory)

For simpler MVP implementation without Redis:

### 1. Data Structure
```python
# In-memory storage
rate_limit_store = {
    "session_id_123": {
        "minute": {
            "timestamp": 1642534800,  # Start of current minute
            "count": 5
        },
        "day": {
            "date": "2024-01-18",
            "count": 47
        }
    }
}
```

### 2. Cleanup Strategy
Implement background task to periodically clean expired entries:
```python
@app.on_event("startup")
async def start_cleanup_task():
    asyncio.create_task(cleanup_expired_rate_limits())

async def cleanup_expired_rate_limits():
    while True:
        # Remove entries older than 24 hours
        await asyncio.sleep(3600)  # Run every hour
```

## Implementation Steps

### Phase 1: Basic Setup
1. Add rate limiting configuration to `app/config.py`
2. Install dependencies (redis-py for Redis approach)
3. Create `app/services/rate_limiter.py` module
4. Implement basic rate limit checking logic

### Phase 2: Core Implementation
5. Implement `check_rate_limit()` function
6. Implement `increment_rate_limit()` function
7. Create FastAPI dependency `enforce_rate_limit()`
8. Add error handling and 429 responses

### Phase 3: Integration
9. Update all affected endpoints with rate limiting dependency
10. Add response headers to all OpenAI endpoints
11. Implement rate limit info in response bodies

### Phase 4: Testing & Refinement
12. Write unit tests for rate limiter service
13. Write integration tests for rate-limited endpoints
14. Test edge cases (boundary conditions, concurrent requests)
15. Add monitoring/logging for rate limit violations

### Phase 5: Documentation & Deployment
16. Update API documentation with rate limit details
17. Add environment variables to deployment configuration
18. Monitor and adjust limits based on usage patterns

## Configuration Examples

### Development (.env)
```bash
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_DAY=100
REDIS_URL=redis://localhost:6379
```

### Production (.env)
```bash
RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_PER_DAY=500
REDIS_URL=redis://production-redis:6379
```

## Testing Strategy

### Unit Tests
- Test rate limit counter increment
- Test limit boundary conditions
- Test reset logic (minute/day rollovers)
- Test concurrent request handling

### Integration Tests
- Test rate limit enforcement on actual endpoints
- Test response headers
- Test 429 error responses
- Test rate limit info in successful responses

### Load Tests
- Verify performance under high traffic
- Test Redis connection pooling
- Verify cleanup mechanisms work

## Monitoring & Observability

### Metrics to Track
- Rate limit violations per session
- Average requests per session (minute/day)
- 429 response rate
- Rate limiter performance (latency)

### Logging
Log the following events:
- Rate limit exceeded (with session_id, limit type)
- Rate limit resets
- Configuration changes
- Redis connection errors (if using Redis)

### Alerts
Set up alerts for:
- High 429 error rate (possible DDoS or bug)
- Redis connection failures
- Unusual spike in OpenAI requests

## Security Considerations

1. **Session ID Validation**: Ensure session_id is properly validated to prevent injection attacks
2. **Rate Limit Bypass**: Consider additional IP-based limiting for suspicious patterns
3. **Configuration Security**: Store Redis credentials securely (environment variables, secrets manager)
4. **DDoS Protection**: Rate limiting helps, but consider additional WAF/CDN protection
5. **User Feedback**: Clear error messages help legitimate users understand limits

## Future Enhancements

1. **User-Specific Limits**: Higher limits for authenticated users vs anonymous
2. **Tiered Limits**: Premium users get higher limits
3. **Burst Allowance**: Allow short bursts above the per-minute limit
4. **Dynamic Limits**: Adjust limits based on system load
5. **Rate Limit Dashboard**: Admin UI to view and adjust limits
6. **Graceful Degradation**: Queue requests when near limit instead of rejecting
7. **Analytics**: Track usage patterns to optimize limits

## Dependencies

### Redis Approach
```txt
redis==5.0.1
```

### In-Memory Approach
No additional dependencies required.

## Migration Path

Start with **in-memory implementation** for MVP, then migrate to **Redis** when:
- Deploying multiple server instances
- Need to persist rate limits across restarts
- Traffic volume requires more robust solution

Migration is straightforward since the service interface remains the same.

## Questions to Consider

Before implementation, confirm:
1. What should the initial rate limits be? (Suggestion: 10/min, 100/day for MVP)
2. Should authenticated users have different limits?
3. Should we implement both approaches or start with one?
4. Do we have Redis infrastructure available?
5. Should rate limits reset at midnight UTC or on a rolling 24-hour window?
6. Should we implement a grace period for first-time users?

## Summary

**Recommended Approach:**
- **MVP/Development**: Start with in-memory implementation (simpler, no dependencies)
- **Production**: Migrate to Redis-based implementation (scalable, distributed)

**Key Benefits:**
- Prevents API abuse and cost overruns
- Provides transparency through response headers
- Configurable limits for different environments
- Clean separation of concerns with dedicated service module
- Easy to test and monitor

**Next Steps:**
1. Confirm rate limit values
2. Choose implementation approach (Redis vs in-memory)
3. Begin Phase 1 implementation
4. Iterate based on usage patterns
