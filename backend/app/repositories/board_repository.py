from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.board import Board
from app.models.task import Task


class BoardRepository:
    """Repository handling database operations for Board entities with soft delete."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Board]:
        """Fetch all non-deleted boards ordered by creation time."""
        return (
            self.db.query(Board)
            .filter(Board.deleted_at.is_(None))
            .order_by(Board.created_at.desc())
            .all()
        )

    def get_by_id(self, board_id: int) -> Optional[Board]:
        """Fetch a single non-deleted board by its primary key ID."""
        return (
            self.db.query(Board)
            .filter(Board.id == board_id, Board.deleted_at.is_(None))
            .first()
        )

    def create(self, name: str) -> Board:
        """Create and persist a new board."""
        board = Board(name=name, updated_at=None)
        self.db.add(board)
        self.db.commit()
        self.db.refresh(board)
        return board

    def delete(self, board: Board) -> None:
        """Soft delete a board and cascade soft-delete all associated tasks."""
        now = datetime.now(timezone.utc)
        board.deleted_at = now
        self.db.add(board)
        # Cascade soft-delete all active tasks belonging to this board
        self.db.query(Task).filter(
            Task.board_id == board.id,
            Task.deleted_at.is_(None),
        ).update({"deleted_at": now}, synchronize_session=False)
        self.db.commit()

