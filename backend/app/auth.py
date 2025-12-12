from sqlalchemy.orm import Session
from sqlalchemy import update
import logging

from .models.user import User
from .models.tracking import SearchHistory, ClickEvent

logger = logging.getLogger(__name__)


def link_session_to_user(session_id: str, user_id: int, db: Session) -> dict:
    """
    Link all anonymous activity from a session to a user account.

    Why this function exists:
    - When user signs up/logs in, they already have anonymous tracking data
    - We need to "claim" that data and link it to their account
    - Updates both search_history and click_events tables

    Args:
        session_id: The session_id from the cookie (anonymous tracking)
        user_id: The user's ID after signup/login
        db: Database session

    Returns:
        dict with counts of updated records

    Example flow:
        1. User browses anonymously (session_id = "abc123")
        2. They search for movies → saved with session_id="abc123", user_id=NULL
        3. They click movies → saved with session_id="abc123", user_id=NULL
        4. User signs up → gets user_id=42
        5. Call this function: link_session_to_user("abc123", 42, db)
        6. All their anonymous data now has user_id=42
    """
    try:
        # Update search_history: set user_id where session_id matches and user_id is NULL
        # Why check user_id is NULL? Don't overwrite data already linked to another user
        search_update = (
            update(SearchHistory)
            .where(SearchHistory.session_id == session_id)
            .where(SearchHistory.user_id.is_(None))
            .values(user_id=user_id)
        )
        search_result = db.execute(search_update)

        # Update click_events: set user_id where session_id matches and user_id is NULL
        click_update = (
            update(ClickEvent)
            .where(ClickEvent.session_id == session_id)
            .where(ClickEvent.user_id.is_(None))
            .values(user_id=user_id)
        )
        click_result = db.execute(click_update)

        db.commit()

        searches_linked = search_result.rowcount
        clicks_linked = click_result.rowcount

        logger.info(
            f"Linked session to user: session_id={session_id}, user_id={user_id}, "
            f"searches={searches_linked}, clicks={clicks_linked}"
        )

        return {
            "success": True,
            "searches_linked": searches_linked,
            "clicks_linked": clicks_linked,
            "total_linked": searches_linked + clicks_linked
        }

    except Exception as e:
        logger.error(f"Error linking session to user: {e}")
        db.rollback()
        raise


def create_user(email: str, password_hash: str, db: Session) -> User:
    """
    Create a new user account.

    Why this is here:
    - Centralized user creation logic
    - Will be called from signup endpoint
    - Returns the user object for immediate use

    Args:
        email: User's email
        password_hash: Already hashed password (never store plaintext!)
        db: Database session

    Returns:
        User object
    """
    user = User(
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # Get the auto-generated ID

    logger.info(f"Created new user: id={user.id}, email={email}")
    return user
