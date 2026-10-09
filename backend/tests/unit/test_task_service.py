import pytest
from app.exceptions import DomainValidationError, EntityNotFoundError
from app.schemas.board import BoardCreate
from app.schemas.task import TaskCreate, TaskStatus, TaskUpdate
from app.services.board_service import BoardService
from app.services.task_service import TaskService


class TestTaskService:
    """Unit tests for Task business rules (R27, R28)."""

    def test_create_task_success(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Happy path: Create task on an existing board."""
        board = board_service.create_board(BoardCreate(name="Sprint 1"))
        task_data = TaskCreate(
            title="Design Database Schema",
            description="Use SQLAlchemy and PostgreSQL types",
            status=TaskStatus.TODO,
        )
        created_task = task_service.create_task(board.id, task_data)

        assert created_task.id is not None
        assert created_task.board_id == board.id
        assert created_task.title == "Design Database Schema"
        assert created_task.description == "Use SQLAlchemy and PostgreSQL types"
        assert created_task.status == TaskStatus.TODO
        assert created_task.created_at is not None
        assert created_task.updated_at is not None

    def test_create_task_default_status_is_todo(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Happy path: Creating task with default status yields TODO."""
        board = board_service.create_board(BoardCreate(name="Default Status Board"))
        task_data = TaskCreate(title="Just a title")
        created_task = task_service.create_task(board.id, task_data)

        assert created_task.status == TaskStatus.TODO

    def test_create_task_on_nonexistent_board_fails(self, task_service: TaskService):
        """Failure case: Attempt to create task on non-existent board ID."""
        task_data = TaskCreate(title="Orphan Task")
        with pytest.raises(EntityNotFoundError) as exc_info:
            task_service.create_task(9999, task_data)
        assert "9999" in exc_info.value.message

    def test_create_task_with_empty_title_fails(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Failure case: Attempt to create task with empty string title."""
        board = board_service.create_board(BoardCreate(name="Validation Board"))
        with pytest.raises((DomainValidationError, ValueError)) as exc_info:
            task_service.create_task(board.id, TaskCreate(title=""))
        assert "empty or whitespace" in str(exc_info.value).lower()

    def test_create_task_with_whitespace_title_fails(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Failure case: Attempt to create task with whitespace-only title."""
        board = board_service.create_board(BoardCreate(name="Validation Board"))
        with pytest.raises((DomainValidationError, ValueError)) as exc_info:
            task_service.create_task(board.id, TaskCreate(title="    \t  \n"))
        assert "empty or whitespace" in str(exc_info.value).lower()

    def test_filter_tasks_by_status(
        self, board_service: BoardService, task_service: TaskService
    ):
        """R27: Filter tasks by status query parameter."""
        board = board_service.create_board(BoardCreate(name="Filter Board"))
        task_service.create_task(board.id, TaskCreate(title="Task 1", status=TaskStatus.TODO))
        task_service.create_task(board.id, TaskCreate(title="Task 2", status=TaskStatus.IN_PROGRESS))
        task_service.create_task(board.id, TaskCreate(title="Task 3", status=TaskStatus.DONE))
        task_service.create_task(board.id, TaskCreate(title="Task 4", status=TaskStatus.DONE))

        # All tasks
        all_tasks = task_service.list_tasks_by_board(board.id)
        assert len(all_tasks) == 4

        # Filter TODO
        todo_tasks = task_service.list_tasks_by_board(board.id, status="TODO")
        assert len(todo_tasks) == 1
        assert todo_tasks[0].title == "Task 1"

        # Filter IN_PROGRESS
        in_progress_tasks = task_service.list_tasks_by_board(board.id, status="IN_PROGRESS")
        assert len(in_progress_tasks) == 1
        assert in_progress_tasks[0].title == "Task 2"

        # Filter DONE
        done_tasks = task_service.list_tasks_by_board(board.id, status="DONE")
        assert len(done_tasks) == 2

    def test_list_tasks_on_empty_board_returns_empty_list(
        self, board_service: BoardService, task_service: TaskService
    ):
        """R10: An empty board returns an empty list, not an error."""
        board = board_service.create_board(BoardCreate(name="Empty Board"))
        tasks = task_service.list_tasks_by_board(board.id)
        assert tasks == []

    def test_list_tasks_on_nonexistent_board_fails(self, task_service: TaskService):
        """R10: Return 404 if the board does not exist."""
        with pytest.raises(EntityNotFoundError) as exc_info:
            task_service.list_tasks_by_board(9999)
        assert "9999" in exc_info.value.message

    def test_list_tasks_with_invalid_status_filter_fails(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Failure case: Filtering by an invalid status value raises DomainValidationError."""
        board = board_service.create_board(BoardCreate(name="Test Board"))
        with pytest.raises(DomainValidationError) as exc_info:
            task_service.list_tasks_by_board(board.id, status="INVALID_STATUS")
        assert "Invalid status value" in exc_info.value.message

    def test_update_task_status_success(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Happy path: Updating task status."""
        board = board_service.create_board(BoardCreate(name="Update Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Initial Task"))

        updated = task_service.update_task(
            task.id, TaskUpdate(status=TaskStatus.IN_PROGRESS)
        )
        assert updated.status == TaskStatus.IN_PROGRESS

        updated_done = task_service.update_task(
            task.id, TaskUpdate(status=TaskStatus.DONE)
        )
        assert updated_done.status == TaskStatus.DONE

    def test_update_task_details_optional(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Optional extension: Updating task title and description."""
        board = board_service.create_board(BoardCreate(name="Detail Update Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Old Title", description="Old Desc"))

        updated = task_service.update_task(
            task.id,
            TaskUpdate(title="New Title", description="New Description", status=TaskStatus.IN_PROGRESS),
        )
        assert updated.title == "New Title"
        assert updated.description == "New Description"
        assert updated.status == TaskStatus.IN_PROGRESS

    def test_update_task_invalid_status_fails(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Failure case: Updating to an invalid status value fails."""
        board = board_service.create_board(BoardCreate(name="Test Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Task A"))

        with pytest.raises((DomainValidationError, ValueError)) as exc_info:
            task_service.update_task(task.id, TaskUpdate.model_validate({"status": "ARCHIVED"}))
        assert "status" in str(exc_info.value).lower() or "input should be" in str(exc_info.value).lower()

    def test_update_nonexistent_task_fails(self, task_service: TaskService):
        """Failure case: Updating a non-existent task ID raises EntityNotFoundError."""
        with pytest.raises(EntityNotFoundError) as exc_info:
            task_service.update_task(9999, TaskUpdate(status=TaskStatus.DONE))
        assert "9999" in exc_info.value.message

    def test_delete_task_success(
        self, board_service: BoardService, task_service: TaskService
    ):
        """Happy path: Deleting an existing task."""
        board = board_service.create_board(BoardCreate(name="Delete Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Task to delete"))

        task_service.delete_task(task.id)

        # Deleting again or querying should fail
        with pytest.raises(EntityNotFoundError):
            task_service.delete_task(task.id)

    def test_delete_nonexistent_task_fails(self, task_service: TaskService):
        """Failure case: Deleting a non-existent task ID raises EntityNotFoundError."""
        with pytest.raises(EntityNotFoundError) as exc_info:
            task_service.delete_task(9999)
        assert "9999" in exc_info.value.message

    def test_task_soft_delete_preserves_record_with_deleted_at(
        self, db_session, board_service: BoardService, task_service: TaskService
    ):
        """Verify soft deletion sets deleted_at on single task in DB."""
        from app.models.task import Task

        board = board_service.create_board(BoardCreate(name="Single Task Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Single Task"))

        task_service.delete_task(task.id)

        # Raw DB query still finds the record
        db_task = db_session.query(Task).filter(Task.id == task.id).first()
        assert db_task is not None
        assert db_task.deleted_at is not None

