import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class TaskStatus(str, enum.Enum):
    """Supported task statuses."""
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class Task(Base):
    """Task model representing an item of work inside a Board."""

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    board_id = Column(
        Integer,
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        SQLEnum(TaskStatus, values_callable=lambda obj: [e.value for e in obj], name="task_status_enum", native_enum=False),
        default=TaskStatus.TODO,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, nullable=True, default=None, onupdate=utc_now)
    deleted_at = Column(DateTime, nullable=True, default=None)

    board = relationship("Board", back_populates="tasks")


