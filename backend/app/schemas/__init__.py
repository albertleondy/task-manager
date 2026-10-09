from app.schemas.board import BoardBase, BoardCreate, BoardResponse
from app.schemas.task import TaskBase, TaskCreate, TaskUpdate, TaskResponse, TaskStatus
from app.schemas.error import ErrorResponse

__all__ = [
    "BoardBase",
    "BoardCreate",
    "BoardResponse",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskStatus",
    "ErrorResponse",
]
