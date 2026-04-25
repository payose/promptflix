"""
Rate Limiter Service

Implements session-based rate limiting for OpenAI API calls using in-memory caching.
Uses cachetools.TTLCache for automatic expiry handling.
"""

import threading
from datetime import datetime, timezone
import time

from pydantic import BaseModel
from cachetools import TTLCache

from ..config import settings


class RateLimitInfo(BaseModel):
    """Rate limit information for API responses"""
    limit_hour: int
    remaining_hour: int
    limit_day: int
    remaining_day: int
    reset_hour: int    # Unix timestamp
    reset_day: int     # Unix timestamp


class RateLimiter:
    """
    In-memory rate limiter using TTLCache for automatic cleanup.

    Features:
    - Per-hour and per-day rate limits
    - Thread-safe with locking
    - Automatic expiry via TTLCache
    - O(1) performance
    """

    def __init__(self):
        # Separate caches for each fixed window
        self.hour_cache = TTLCache(maxsize=10000, ttl=3600)
        self.day_cache = TTLCache(maxsize=10000, ttl=86400)

        # Thread lock for concurrent request safety
        self.cache_lock = threading.Lock()

    def _get_current_hour_key(self) -> int:
        """Get current hour as Unix timestamp (floored to hour)"""
        return int(time.time() // 3600) * 3600

    def _get_current_day_key(self) -> str:
        """Get current day as YYYY-MM-DD string"""
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def check_and_increment(self, session_id: str) -> RateLimitInfo:
        """
        Check if session is within rate limits and increment counters.

        Args:
            session_id: Session identifier

        Returns:
            RateLimitInfo with current status

        Raises:
            RateLimitExceeded: If either hour or day limit is exceeded
        """
        with self.cache_lock:
            current_hour = self._get_current_hour_key()
            current_day = self._get_current_day_key()

            # Create cache keys
            hour_key = f"{session_id}:{current_hour}"
            day_key = f"{session_id}:{current_day}"

            # Get current counts
            hour_count = self.hour_cache.get(hour_key, 0)
            day_count = self.day_cache.get(day_key, 0)

            # Check limits BEFORE incrementing
            if hour_count >= settings.RATE_LIMIT_PER_HOUR:
                reset_hour = current_hour + 3600
                reset_day = self._get_day_end_timestamp()

                raise RateLimitExceeded(
                    limit_type="per_hour",
                    retry_after=reset_hour - int(time.time()),
                    rate_limit_info=RateLimitInfo(
                        limit_hour=settings.RATE_LIMIT_PER_HOUR,
                        remaining_hour=0,
                        limit_day=settings.RATE_LIMIT_PER_DAY,
                        remaining_day=max(0, settings.RATE_LIMIT_PER_DAY - day_count),
                        reset_hour=reset_hour,
                        reset_day=reset_day
                    )
                )

            if day_count >= settings.RATE_LIMIT_PER_DAY:
                reset_hour = current_hour + 3600
                reset_day = self._get_day_end_timestamp()

                raise RateLimitExceeded(
                    limit_type="per_day",
                    retry_after=reset_day - int(time.time()),
                    rate_limit_info=RateLimitInfo(
                        limit_hour=settings.RATE_LIMIT_PER_HOUR,
                        remaining_hour=max(0, settings.RATE_LIMIT_PER_HOUR - hour_count),
                        limit_day=settings.RATE_LIMIT_PER_DAY,
                        remaining_day=0,
                        reset_hour=reset_hour,
                        reset_day=reset_day
                    )
                )

            # Increment counters
            self.hour_cache[hour_key] = hour_count + 1
            self.day_cache[day_key] = day_count + 1

            # Calculate reset times
            reset_hour = current_hour + 3600
            reset_day = self._get_day_end_timestamp()

            # Return updated info
            return RateLimitInfo(
                limit_hour=settings.RATE_LIMIT_PER_HOUR,
                remaining_hour=settings.RATE_LIMIT_PER_HOUR - (hour_count + 1),
                limit_day=settings.RATE_LIMIT_PER_DAY,
                remaining_day=settings.RATE_LIMIT_PER_DAY - (day_count + 1),
                reset_hour=reset_hour,
                reset_day=reset_day
            )

    def _get_day_end_timestamp(self) -> int:
        """Get Unix timestamp for end of current UTC day"""
        now = datetime.now(timezone.utc)
        end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        return int(end_of_day.timestamp())

    def get_current_limits(self, session_id: str) -> RateLimitInfo:
        """
        Get current rate limit status without incrementing.

        Args:
            session_id: Session identifier

        Returns:
            RateLimitInfo with current status
        """
        with self.cache_lock:
            current_hour = self._get_current_hour_key()
            current_day = self._get_current_day_key()

            hour_key = f"{session_id}:{current_hour}"
            day_key = f"{session_id}:{current_day}"

            hour_count = self.hour_cache.get(hour_key, 0)
            day_count = self.day_cache.get(day_key, 0)

            reset_hour = current_hour + 3600
            reset_day = self._get_day_end_timestamp()

            return RateLimitInfo(
                limit_hour=settings.RATE_LIMIT_PER_HOUR,
                remaining_hour=max(0, settings.RATE_LIMIT_PER_HOUR - hour_count),
                limit_day=settings.RATE_LIMIT_PER_DAY,
                remaining_day=max(0, settings.RATE_LIMIT_PER_DAY - day_count),
                reset_hour=reset_hour,
                reset_day=reset_day
            )


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""

    def __init__(self, limit_type: str, retry_after: int, rate_limit_info: RateLimitInfo):
        self.limit_type = limit_type
        self.retry_after = retry_after
        self.rate_limit_info = rate_limit_info
        super().__init__(f"Rate limit exceeded: {limit_type}")


# Global rate limiter instance
rate_limiter = RateLimiter()
