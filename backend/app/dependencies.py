"""
FastAPI Dependencies

Central location for reusable dependency functions.
"""

from fastapi import Depends, HTTPException

from .services.rate_limiter import rate_limiter, RateLimitInfo, RateLimitExceeded
from .session import get_session_id


def _is_valid_session_format(session_id: str) -> bool:
    """
    Validate session ID format to prevent injection attacks.

    Args:
        session_id: Session identifier to validate

    Returns:
        True if valid format, False otherwise
    """
    # Session IDs should be alphanumeric (UUID format with hyphens is also alphanumeric after removal)
    # Allow hyphens for UUID format
    clean_id = session_id.replace("-", "")
    return clean_id.isalnum() and 16 <= len(session_id) <= 128


def check_rate_limit_for_session(session_id: str) -> RateLimitInfo:
    """
    Validate and increment rate limits for a specific session ID.

    Keep this callable outside FastAPI's dependency system so routes can decide
    whether a request should consume quota, for example after a cache check.
    """
    if not _is_valid_session_format(session_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid session identifier format"
        )

    try:
        return rate_limiter.check_and_increment(session_id)
    except RateLimitExceeded as e:
        raise _rate_limit_http_exception(e)


def get_rate_limit_info_for_session(session_id: str) -> RateLimitInfo:
    """Return current rate limit status without consuming quota."""
    if not _is_valid_session_format(session_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid session identifier format"
        )

    return rate_limiter.get_current_limits(session_id)


async def enforce_rate_limit(
    session_id: str = Depends(get_session_id)
) -> RateLimitInfo:
    """
    FastAPI dependency that enforces rate limits for OpenAI API calls.

    This should be added to all endpoints that make OpenAI API calls.

    Args:
        session_id: Session identifier from cookie

    Returns:
        RateLimitInfo with current rate limit status

    Raises:
        HTTPException(400): If session_id format is invalid
        HTTPException(429): If rate limit is exceeded

    Usage:
        @app.get("/api/some-endpoint")
        async def my_endpoint(
            rate_limit_info: RateLimitInfo = Depends(enforce_rate_limit)
        ):
            # Add rate limit headers to response
            # ... your endpoint logic ...
    """
    return check_rate_limit_for_session(session_id)


def _rate_limit_http_exception(e: RateLimitExceeded) -> HTTPException:
    error_message = (
        f"You have exceeded the {e.limit_type.replace('_', '-')} rate limit. "
        f"Please try again in {e.retry_after} seconds."
    )

    return HTTPException(
        status_code=429,
        detail={
            "error": "Rate limit exceeded",
            "message": error_message,
            "limit_type": e.limit_type,
            "retry_after": e.retry_after,
            "rate_limit": {
                "limit_hour": e.rate_limit_info.limit_hour,
                "remaining_hour": e.rate_limit_info.remaining_hour,
                "limit_day": e.rate_limit_info.limit_day,
                "remaining_day": e.rate_limit_info.remaining_day,
                "reset_hour": e.rate_limit_info.reset_hour,
                "reset_day": e.rate_limit_info.reset_day,
            }
        },
        headers={
            "Retry-After": str(e.retry_after),
            "X-RateLimit-Limit-Hour": str(e.rate_limit_info.limit_hour),
            "X-RateLimit-Remaining-Hour": str(e.rate_limit_info.remaining_hour),
            "X-RateLimit-Reset-Hour": str(e.rate_limit_info.reset_hour),
            "X-RateLimit-Limit-Day": str(e.rate_limit_info.limit_day),
            "X-RateLimit-Remaining-Day": str(e.rate_limit_info.remaining_day),
            "X-RateLimit-Reset-Day": str(e.rate_limit_info.reset_day),
        }
    )
