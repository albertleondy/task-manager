import pytest
from app.exceptions import DomainValidationError, EntityNotFoundError
from app.schemas.board import BoardCreate
from app.schemas.task import TaskCreate, TaskStatus
from app.services.board_service import BoardService
from app.services.task_service import TaskService


class TestBoardService:
    """Unit tests for Board business rules (R27, R28)."""

    def test_create_board_success(self, board_service: BoardService):
        """Happy path: Create a valid board."""
        payload = BoardCreate(name="Sprint Planning")
        created = board_service.create_board(payload)

        assert created.id is not None
        assert created.name == "Sprint Planning"
        assert created.task_count == 0

    def test_create_board_with_empty_name_fails(self, board_service: BoardService):
        """Failure case: Attempt to create a board with an empty string."""
        with pytest.raises((DomainValidationError, ValueError)) as exc_info:
            board_service.create_board(BoardCreate(name=""))
        assert "empty or whitespace" in str(exc_info.value).lower()

    def test_create_board_with_whitespace_only_name_fails(self, board_service: BoardService):
        """Failure case: Attempt to create a board with whitespace only."""
        with pytest.raises((DomainValidationError, ValueError)) as exc_info:
            board_service.create_board(BoardCreate(name="   \t\n  "))
        assert "empty or whitespace" in str(exc_info.value).lower()

    def test_list_boards(self, board_service: BoardService):
        """Happy path: Listing multiple boards."""
        board_service.create_board(BoardCreate(name="Board A"))
        board_service.create_board(BoardCreate(name="Board B"))

        boards = board_service.list_boards()
        assert len(boards) == 2
        names = [b.name for b in boards]
        assert "Board A" in names
        assert "Board B" in names

    def test_get_board_by_id_success(self, board_service: BoardService):
        """Happy path: Fetching an existing board by ID."""
        board = board_service.create_board(BoardCreate(name="Q3 Goals"))
        fetched = board_service.get_board(board.id)

        assert fetched.id == board.id
        assert fetched.name == "Q3 Goals"

    def test_get_board_not_found_fails(self, board_service: BoardService):
        """Failure case: Fetching non-existent board returns 404 EntityNotFoundError."""
        with pytest.raises(EntityNotFoundError) as exc_info:
            board_service.get_board(9999)
        assert "9999" in exc_info.value.message

    def test_delete_board_cascades_tasks(
        self, board_service: BoardService, task_service: TaskService
    ):
        """R4 & R27: Board deletion deletes the board AND cascades removal to its tasks."""
        # 1. Create a board
        board = board_service.create_board(BoardCreate(name="Project X"))

        # 2. Add tasks to the board
        task1 = task_service.create_task(
            board.id, TaskCreate(title="Task 1", status=TaskStatus.TODO)
        )
        task2 = task_service.create_task(
            board.id, TaskCreate(title="Task 2", status=TaskStatus.IN_PROGRESS)
        )

        # Confirm tasks exist on board
        assert len(task_service.list_tasks_by_board(board.id)) == 2

        # 3. Delete the board
        board_service.delete_board(board.id)

        # 4. Verify board is gone
        with pytest.raises(EntityNotFoundError):
            board_service.get_board(board.id)

        # 5. Verify tasks were cascaded / are gone
        with pytest.raises(EntityNotFoundError):
            task_service.delete_task(task1.id)

        with pytest.raises(EntityNotFoundError):
            task_service.delete_task(task2.id)

    def test_delete_nonexistent_board_fails(self, board_service: BoardService):
        """Failure case: Deleting a non-existent board raises EntityNotFoundError."""
        with pytest.raises(EntityNotFoundError) as exc_info:
            board_service.delete_board(8888)
        assert "8888" in exc_info.value.message

    def test_soft_delete_preserves_records_with_deleted_at(
        self, db_session, board_service: BoardService, task_service: TaskService
    ):
        """Verify soft deletion sets deleted_at on board and cascaded tasks in DB."""
        from app.models.board import Board
        from app.models.task import Task

        board = board_service.create_board(BoardCreate(name="Audit Board"))
        task = task_service.create_task(board.id, TaskCreate(title="Audit Task"))

        board_service.delete_board(board.id)

        # Raw DB queries still find the records
        db_board = db_session.query(Board).filter(Board.id == board.id).first()
        assert db_board is not None
        assert db_board.deleted_at is not None

        db_task = db_session.query(Task).filter(Task.id == task.id).first()
        assert db_task is not None
        assert db_task.deleted_at is not None

