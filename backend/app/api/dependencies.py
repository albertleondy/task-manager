from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.board_repository import BoardRepository
from app.repositories.task_repository import TaskRepository
from app.services.board_service import BoardService
from app.services.task_service import TaskService


def get_board_repository(db: Session = Depends(get_db)) -> BoardRepository:
    """Dependency provider for BoardRepository."""
    return BoardRepository(db)


def get_task_repository(db: Session = Depends(get_db)) -> TaskRepository:
    """Dependency provider for TaskRepository."""
    return TaskRepository(db)


def get_board_service(
    board_repo: BoardRepository = Depends(get_board_repository),
) -> BoardService:
    """Dependency provider for BoardService."""
    return BoardService(board_repo=board_repo)


def get_task_service(
    task_repo: TaskRepository = Depends(get_task_repository),
    board_repo: BoardRepository = Depends(get_board_repository),
) -> TaskService:
    """Dependency provider for TaskService."""
    return TaskService(task_repo=task_repo, board_repo=board_repo)
