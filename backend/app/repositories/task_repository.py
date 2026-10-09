from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus


class TaskRepository:
    """Repository handling database operations for Task entities with soft delete."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_by_board(self, board_id: int, status: Optional[TaskStatus] = None) -> List[Task]:
        """Fetch non-deleted tasks belonging to a board, optionally filtering by status."""
        query = self.db.query(Task).filter(
            Task.board_id == board_id,
            Task.deleted_at.is_(None),
        )
        if status is not None:
            query = query.filter(Task.status == status)
        return query.order_by(Task.created_at.asc()).all()

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Fetch a single non-deleted task by its primary key ID."""
        return (
            self.db.query(Task)
            .filter(Task.id == task_id, Task.deleted_at.is_(None))
            .first()
        )

    def create(
        self,
        board_id: int,
        title: str,
        description: Optional[str] = None,
        status: TaskStatus = TaskStatus.TODO,
    ) -> Task:
        """Create and persist a new task."""
        task = Task(
            board_id=board_id,
            title=title,
            description=description,
            status=status,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(
        self,
        task: Task,
        status: Optional[TaskStatus] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Task:
        """Update an existing task's status, title, or description."""
        if status is not None:
            task.status = status
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        """Soft delete a task from the database."""
        task.deleted_at = datetime.now(timezone.utc)
        self.db.add(task)
        self.db.commit()

