import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.repositories.board_repository import BoardRepository
from app.repositories.task_repository import TaskRepository
from app.services.board_service import BoardService
from app.services.task_service import TaskService

# Create an in-memory SQLite database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enforce foreign key constraints in SQLite during tests
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Fixture providing a fresh in-memory database session per test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def board_repo(db_session: Session) -> BoardRepository:
    """Fixture providing BoardRepository."""
    return BoardRepository(db_session)


@pytest.fixture(scope="function")
def task_repo(db_session: Session) -> TaskRepository:
    """Fixture providing TaskRepository."""
    return TaskRepository(db_session)


@pytest.fixture(scope="function")
def board_service(board_repo: BoardRepository) -> BoardService:
    """Fixture providing BoardService for direct unit testing without a web server."""
    return BoardService(board_repo=board_repo)


@pytest.fixture(scope="function")
def task_service(task_repo: TaskRepository, board_repo: BoardRepository) -> TaskService:
    """Fixture providing TaskService for direct unit testing without a web server."""
    return TaskService(task_repo=task_repo, board_repo=board_repo)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Fixture providing a FastAPI TestClient bound to the isolated test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
