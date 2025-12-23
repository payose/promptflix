from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from ..database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    query = Column(String, nullable=False)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SearchHistory(id={self.id}, query={self.query}, session_id={self.session_id})>"


class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    movie_id = Column(Integer, nullable=False)
    movie_title = Column(String, nullable=True)
    clicked_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ClickEvent(id={self.id}, movie_id={self.movie_id}, session_id={self.session_id})>"
