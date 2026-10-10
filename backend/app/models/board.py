from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Board(Base):
    """Board model representing a named task container."""

    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, nullable=True, default=None, onupdate=utc_now)
    deleted_at = Column(DateTime, nullable=True, default=None)



    # Relationship to tasks with cascade delete enforced at ORM and DB level
    tasks = relationship(
        "Task",
        back_populates="board",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

