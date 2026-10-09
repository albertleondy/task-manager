from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, Query, status
from app.api.dependencies import get_board_service, get_task_service
from app.schemas.board import BoardCreate, BoardResponse
from app.schemas.task import TaskCreate, TaskResponse
from app.schemas.response import ApiResponse
from app.services.board_service import BoardService
from app.services.task_service import TaskService

router = APIRouter(prefix="/boards", tags=["Boards"])


@router.get(
    "",
    response_model=ApiResponse[List[BoardResponse]],
    status_code=status.HTTP_200_OK,
    summary="List all boards",
)
def list_boards(
    board_service: BoardService = Depends(get_board_service),
) -> Dict[str, Any]:
    """Retrieve all boards with their task counts wrapped in data envelope."""
    boards = board_service.list_boards()
    return {"data": boards, "error": None}


@router.post(
    "",
    response_model=ApiResponse[BoardResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new board",
)
def create_board(
    payload: BoardCreate,
    board_service: BoardService = Depends(get_board_service),
) -> Dict[str, Any]:
    """Create a new board container wrapped in data envelope."""
    board = board_service.create_board(payload)
    return {"data": board, "error": None}


@router.get(
    "/{board_id}",
    response_model=ApiResponse[BoardResponse],
    status_code=status.HTTP_200_OK,
    summary="Get a board by ID",
)
def get_board(
    board_id: int,
    board_service: BoardService = Depends(get_board_service),
) -> Dict[str, Any]:
    """Retrieve a single board by its ID wrapped in data envelope."""
    board = board_service.get_board(board_id)
    return {"data": board, "error": None}


@router.delete(
    "/{board_id}",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete a board",
)
def delete_board(
    board_id: int,
    board_service: BoardService = Depends(get_board_service),
) -> Dict[str, Any]:
    """Delete a board and cascade delete its associated tasks."""
    board_service.delete_board(board_id)
    return {"data": None, "error": None}


# Nested task routes on board
@router.get(
    "/{board_id}/tasks",
    response_model=ApiResponse[List[TaskResponse]],
    status_code=status.HTTP_200_OK,
    summary="List tasks on a board",
)
def list_tasks_for_board(
    board_id: int,
    status_param: Optional[str] = Query(None, alias="status", description="Filter tasks by status (TODO, IN_PROGRESS, DONE)"),
    task_service: TaskService = Depends(get_task_service),
) -> Dict[str, Any]:
    """List all tasks associated with a specific board, optionally filtered by status."""
    tasks = task_service.list_tasks_by_board(board_id=board_id, status=status_param)
    return {"data": tasks, "error": None}


@router.post(
    "/{board_id}/tasks",
    response_model=ApiResponse[TaskResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a task on a board",
)
def create_task_for_board(
    board_id: int,
    payload: TaskCreate,
    task_service: TaskService = Depends(get_task_service),
) -> Dict[str, Any]:
    """Create a new task belonging to a specific board."""
    task = task_service.create_task(board_id=board_id, data=payload)
    return {"data": task, "error": None}
