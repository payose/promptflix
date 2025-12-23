import uuid
from typing import Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class SessionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to manage session_id cookies for anonymous user tracking.

    Why this exists:
    - Automatically generates session_id for new visitors
    - Stores it in a cookie that persists across requests
    - Makes session_id available to all routes via request.state
    """

    async def dispatch(self, request: Request, call_next):
        # Get session_id from cookie, or generate new one
        session_id = request.cookies.get("session_id")

        if not session_id:
            # Generate new session_id (UUID format for uniqueness)
            session_id = str(uuid.uuid4())
            # Flag that we need to set the cookie in the response
            should_set_cookie = True
        else:
            should_set_cookie = False

        # Store session_id in request state so routes can access it
        request.state.session_id = session_id

        # Process the request
        response: Response = await call_next(request)

        # Set cookie if this is a new session
        if should_set_cookie:
            response.set_cookie(
                key="session_id",
                value=session_id,
                max_age=60 * 60 * 24 * 365,  # 1 year
                httponly=False,  # Allow JavaScript to read (needed for EventSource)
                samesite="lax",  # CSRF protection
                secure=False  # Set to True in production with HTTPS
            )

        return response


def get_session_id(request: Request) -> str:
    """
    FastAPI dependency to get session_id from request.

    Why this is a dependency:
    - Clean way to inject session_id into route handlers
    - Type-safe (returns str, not Optional)
    - Raises error if session_id somehow missing (shouldn't happen with middleware)

    Usage in routes:
        @app.get("/some-route")
        def my_route(session_id: str = Depends(get_session_id)):
            # session_id is automatically available here
    """
    return request.state.session_id


def get_user_id(request: Request) -> Optional[int]:
    """
    FastAPI dependency to get user_id from request state (after login).

    Why this exists:
    - After login, we'll store user_id in request.state
    - Routes can use this to check if user is authenticated
    - Returns None for anonymous users

    Usage:
        @app.get("/some-route")
        def my_route(user_id: Optional[int] = Depends(get_user_id)):
            if user_id:
                # User is logged in
            else:
                # Anonymous user
    """
    return getattr(request.state, "user_id", None)
