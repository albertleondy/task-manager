from typing import List, Optional, Union
from app.exceptions import DomainValidationError, EntityNotFoundError
from app.models.task import Task, TaskStatus
from app.repositories.board_repository import BoardRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate


class TaskService:
    """Service encapsulating business logic for Tasks."""

    def __init__(self, task_repo: TaskRepository, board_repo: BoardRepository):
        self.task_repo = task_repo
        self.board_repo = board_repo

    def _get_board_or_fail(self, board_id: int):
        board = self.board_repo.get_by_id(board_id)
        if not board:
            raise EntityNotFoundError(f"Board with ID {board_id} not found", field="board_id")
        return board

    def _get_task_or_fail(self, task_id: int) -> Task:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise EntityNotFoundError(f"Task with ID {task_id} not found", field="task_id")
        return task

    def _parse_and_validate_status(self, status_val: Optional[Union[str, TaskStatus]]) -> Optional[TaskStatus]:
        if status_val is None:
            return None
        if isinstance(status_val, TaskStatus):
            return status_val
        try:
            return TaskStatus(status_val)
        except (ValueError, KeyError):
            valid_statuses = ", ".join([s.value for s in TaskStatus])
            raise DomainValidationError(
                f"Invalid status value: '{status_val}'. Allowed values are: {valid_statuses}",
                field="status",
            )

    def list_tasks_by_board(
        self, board_id: int, status: Optional[Union[str, TaskStatus]] = None
    ) -> List[TaskResponse]:
        """List tasks belonging to a board, optionally filtering by status."""
        # Ensure the parent board exists (raises 404 if not found)
        self._get_board_or_fail(board_id)

        parsed_status = self._parse_and_validate_status(status) if status else None
        tasks = self.task_repo.get_all_by_board(board_id=board_id, status=parsed_status)
        return [TaskResponse.model_validate(task) for task in tasks]

    def create_task(self, board_id: int, data: TaskCreate) -> TaskResponse:
        """Create a new task under a board after validation."""
        self._get_board_or_fail(board_id)

        title = data.title.strip() if data.title else ""
        if not title:
            raise DomainValidationError("Task title must not be empty or whitespace only", field="title")

        description = data.description.strip() if data.description and data.description.strip() else None
        status = data.status or TaskStatus.TODO

        task = self.task_repo.create(
            board_id=board_id,
            title=title,
            description=description,
            status=status,
        )
        return TaskResponse.model_validate(task)

    def update_task(self, task_id: int, data: TaskUpdate) -> TaskResponse:
        """Update a task's status, title, or description."""
        task = self._get_task_or_fail(task_id)

        parsed_status = None
        if data.status is not None:
            parsed_status = self._parse_and_validate_status(data.status)

        title = None
        if data.title is not None:
            title = data.title.strip()
            if not title:
                raise DomainValidationError("Task title must not be empty or whitespace only", field="title")

        description = None
        if data.description is not None:
            description = data.description.strip() if data.description.strip() else None

        updated_task = self.task_repo.update(
            task=task,
            status=parsed_status,
            title=title,
            description=description,
        )
        return TaskResponse.model_validate(updated_task)

    def delete_task(self, task_id: int) -> None:
        """Delete a task by ID."""
        task = self._get_task_or_fail(task_id)
        self.task_repo.delete(task)
