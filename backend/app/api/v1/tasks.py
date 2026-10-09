from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_task_service
from app.schemas.task import TaskResponse, TaskUpdate
from app.schemas.response import ApiResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.patch(
    "/{task_id}",
    response_model=ApiResponse[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="Update a task's status, title, or description",
)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    task_service: TaskService = Depends(get_task_service),
) -> Dict[str, Any]:
    """Update a task's status or optional title/description wrapped in data envelope."""
    task = task_service.update_task(task_id=task_id, data=payload)
    return {"data": task, "error": None}


@router.delete(
    "/{task_id}",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete a task",
)
def delete_task(
    task_id: int,
    task_service: TaskService = Depends(get_task_service),
) -> Dict[str, Any]:
    """Delete a task by ID."""
    task_service.delete_task(task_id=task_id)
    return {"data": None, "error": None}
