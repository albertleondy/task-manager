from typing import List, Optional
from app.exceptions import DomainValidationError, EntityNotFoundError
from app.models.board import Board
from app.repositories.board_repository import BoardRepository
from app.schemas.board import BoardCreate, BoardResponse


class BoardService:
    """Service encapsulating business logic for Boards."""

    def __init__(self, board_repo: BoardRepository):
        self.board_repo = board_repo

    def list_boards(self) -> List[BoardResponse]:
        """List all boards with their metadata and task counts."""
        boards = self.board_repo.get_all()
        responses = []
        for board in boards:
            resp = BoardResponse.model_validate(board)
            resp.task_count = len([t for t in board.tasks if t.deleted_at is None]) if board.tasks is not None else 0
            responses.append(resp)
        return responses

    def get_board_or_fail(self, board_id: int) -> Board:
        """Fetch board entity or raise EntityNotFoundError."""
        board = self.board_repo.get_by_id(board_id)
        if not board:
            raise EntityNotFoundError(f"Board with ID {board_id} not found", field="board_id")
        return board

    def get_board(self, board_id: int) -> BoardResponse:
        """Get a single board by ID."""
        board = self.get_board_or_fail(board_id)
        resp = BoardResponse.model_validate(board)
        resp.task_count = len([t for t in board.tasks if t.deleted_at is None]) if board.tasks is not None else 0
        return resp


    def create_board(self, data: BoardCreate) -> BoardResponse:
        """Create a new board after business rule validation."""
        name = data.name.strip() if data.name else ""
        if not name:
            raise DomainValidationError("Board name must not be empty or whitespace only", field="name")

        board = self.board_repo.create(name=name)
        resp = BoardResponse.model_validate(board)
        resp.task_count = 0
        return resp

    def delete_board(self, board_id: int) -> None:
        """Delete a board by ID, cascading removal to associated tasks."""
        board = self.get_board_or_fail(board_id)
        self.board_repo.delete(board)
