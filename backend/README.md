# Mini Task Management Backend Service

A robust, production-structured REST API for the Mini Task Management Application built with **Python 3.11+**, **FastAPI**, **SQLAlchemy**, and **Pydantic v2**.

---

## 1. Stack Choice & Justification (Section 5)

* **Language Choice (Python vs. Java):** Python was chosen primarily because it is the language I am most familiar with, allowing for rapid and confident implementation. Additionally, compared to Java (e.g., Spring Boot), Python with FastAPI eliminates heavy boilerplate, provides near-instant container startup, and operates with a drastically lower memory footprint (~50 MB vs. 300+ MB on the JVM) while still offering robust type safety and automatic OpenAPI generation.
* **Backend Framework:** Python with **FastAPI**.
  * *Reason:* FastAPI provides first-class asynchronous support, automatic OpenAPI/Swagger interactive documentation, and high-performance validation via Pydantic v2. Its dependency injection system facilitates clean architectural layering and frictionless unit testing.
* **Database & ORM:** **SQLite** (default zero-config) / **PostgreSQL** compatible via **SQLAlchemy 2.0**.
  * *Reason:* SQLite enables zero-overhead local development and instant test execution without requiring Docker or external services, while SQLAlchemy's dialect-agnostic ORM ensures seamless production deployment to PostgreSQL.

---

## 2. Architecture & Directory Structure

The project strictly follows a **Layered Clean Architecture** pattern (R17) to ensure complete separation of concerns:

```
backend/
├── app/
│   ├── api/                  # Controller Layer: HTTP routes, parameter parsing, status codes
│   │   ├── v1/
│   │   │   ├── boards.py     # Board endpoints & nested task routes
│   │   │   └── tasks.py      # Task endpoints (PATCH status, DELETE)
│   │   └── dependencies.py   # FastAPI Dependency Injection wiring
│   ├── services/             # Business Logic Layer: Pure domain validation & orchestration
│   │   ├── board_service.py  # Board rules (non-empty names, cascade validation)
│   │   └── task_service.py   # Task rules (status validation, board existence check)
│   ├── repositories/         # Data Access Layer: SQLAlchemy queries & persistence
│   │   ├── board_repository.py
│   │   └── task_repository.py
│   ├── models/               # Database ORM Entities (SQLAlchemy)
│   │   ├── board.py          # Board table definition
│   │   └── task.py           # Task table with FK ON DELETE CASCADE
│   ├── schemas/              # Data Validation & Serialization (Pydantic v2)
│   │   ├── board.py          # Board input/output schemas
│   │   ├── task.py           # Task input/output schemas
│   │   └── error.py          # Uniform ErrorResponse schema (R16)
│   ├── config.py             # App & environment configuration
│   ├── database.py           # Engine, SessionLocal, and SQLite FK pragma listener
│   ├── exceptions.py         # Domain exceptions (EntityNotFoundError, DomainValidationError)
│   └── main.py               # FastAPI app factory, CORS middleware, global exception handlers
├── migrations/               # Alembic database migration scripts
├── tests/                    # Automated test suite (Pytest)
│   ├── conftest.py           # Test fixtures (isolated in-memory DB, TestClient)
│   ├── unit/                 # Pure Service-layer unit tests (R27, R28)
│   └── integration/          # API endpoint HTTP tests (R15, R16)
├── API.md                    # Detailed API contract and curl examples
├── SCHEMA.md                 # Full database schema and index specifications
└── requirements.txt          # Python dependencies
```

---

## 3. Prerequisites

* **Python:** 3.10, 3.11, or 3.12
* **Package Manager:** `pip`

---

## 4. Setup & Run Instructions (Clean Clone)

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Create and activate a virtual environment
* **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```
* **macOS / Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure environment (Optional)
A default `.env.example` is provided with pre-configured defaults:
```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

### Step 5: Database Schema Creation (R6)
The application automatically creates all tables on startup. Alternatively, you can run Alembic migrations:
```bash
alembic upgrade head
```

### Step 6: Start the Backend Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* The API will be live at: **`http://127.0.0.1:8000`**
* Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**
* ReDoc UI: **`http://127.0.0.1:8000/redoc`**

---

### Switching to PostgreSQL (Optional / Production)

By default, the application runs on **SQLite** (`sqlite:///./tasks.db`) for instant zero-dependency execution. If you prefer to run against **PostgreSQL**:

1. **Install PostgreSQL driver** (already listed in `requirements.txt`):
   ```bash
   pip install psycopg2-binary
   ```

2. **Initialize an empty PostgreSQL database and schema**:
   We provide automated turnkey scripts to initialize a clean database, tables, foreign keys with `ON DELETE CASCADE`, and indexes:
   * **Linux / macOS:**
     ```bash
     ./scripts/setup_postgres.sh
     ```
     *(Supports flags: `--host localhost --port 5432 --user postgres --password password --db task_manager --reset`)*
   * **Windows / Cross-platform:**
     ```bash
     python scripts/setup_postgres.py
     ```

3. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager"
   ```

4. **Start the server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   On startup, SQLAlchemy validates and binds to PostgreSQL. You can also run Alembic migrations directly:
   ```bash
   alembic upgrade head
   ```

---

## 5. Running the Tests (R27, R28, R30)

Run the entire test suite using `pytest`:

```bash
pytest -v
```

To run with test coverage reporting:
```bash
pytest --cov=app --cov-report=term-missing
```

### Test Strategy Summary:
* **Unit Tests (`tests/unit/`):** Directly test domain logic and business rules in `BoardService` and `TaskService` in isolation with mock/in-memory data, verifying creation, empty/whitespace validation, cascading deletes, and error propagation without starting a web server.
* **Integration Tests (`tests/integration/`):** Test HTTP contracts, verifying status codes (200, 201, 204, 400, 422, 404) and consistent JSON error formats across all endpoints.

---

## 6. Database Schema & Constraints (R3, R4, R5, R7)

* Detailed documentation is provided in [`SCHEMA.md`](./SCHEMA.md).
* **Foreign Key Constraint:** `tasks.board_id -> boards.id` enforced in the database.
* **Deletion Policy (Soft Delete):** Both `boards` and `tasks` tables utilize **Soft Deletes** via a `deleted_at` timestamp (`NULL` indicates active records).
  * **Why Soft Delete Was Chosen:**
    1. **Protection Against User Mistakes:** Accidental deletions are a frequent user occurrence. Soft deleting preserves records so they can be seamlessly restored without needing database backup restores.
    2. **Audit Trail & Logging:** Retains full entity history for traceability, compliance, and event logging.
  * **Cascading Soft Deletes:** Soft deleting a board automatically sets `deleted_at` across all of its active child tasks. All standard queries automatically filter `WHERE deleted_at IS NULL`.
* **Indexes:** `tasks.board_id` (for fast board task lookups) and `tasks.status` (for task status filtering).
* **Decisions Considered & Rejected (R7):**
  * *Status Lookup Table:* Rejected in favor of string/enum validation to eliminate unnecessary JOIN overhead on a fixed 3-state workflow (`TODO`, `IN_PROGRESS`, `DONE`).


### Concurrency, Database Transactions & Race Condition Handling

1. **Why Database Transactions Matter:**
   * **Atomicity:** Ensures multi-statement operations either succeed completely or revert without partial writes.
   * **Consistency & Rollback:** When an error occurs during commit, rolling back the transaction prevents session corruption and dirty reads.
2. **Race Conditions in Mini Task Management & How They Are Prevented:**
   * **Parent-Child Deletion Race (TOCTOU - Time Of Check To Time Of Use):**
     * *Scenario:* User A submits a new task to Board 1. Concurrently, User B deletes Board 1.
     * *Defense:* While the service checks board existence first, the true defense is enforced at the database layer via `FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE`. If the board is deleted concurrently, the database engine immediately rejects the task insert with a foreign key violation, preventing orphaned tasks.
   * **Concurrent Task Status Updates (Lost Updates):**
     * *Scenario:* Two users drag or update the same task at the exact same millisecond.
     * *Defense:* Relational engines (PostgreSQL/SQLite) serialize row writes during `UPDATE`. Whichever transaction commits last applies. In high-concurrency systems, **Optimistic Concurrency Control (OCC)** using a `version_id` column or **Pessimistic Locking** (`SELECT ... FOR UPDATE` via `query.with_for_update()`) can be introduced to return `HTTP 409 Conflict` if state has changed since load.

---

## 7. API Contract & Uniform Error Format (R15, R16)

* Detailed endpoint specification and curl commands are provided in [`API.md`](./API.md).
* **Consistent Response Schema:**
  * **Success:** `{"data": { ... }, "error": null}`
  * **Error:**
    ```json
    {
      "data": null,
      "error": {
        "code": "VALIDATION_FAILED",
        "message": "Task title must not be empty or whitespace only"
      }
    }
    ```

---

## 8. Assumptions

1. **Single User / Trusted Network:** As outlined in Section 10 of the brief, authentication, authorization, and multi-tenancy are omitted.
2. **Task Status Values:** Exact values are restricted to `TODO`, `IN_PROGRESS`, and `DONE`.
3. **Data Volume:** Assume manageable numbers of tasks per board; server-side pagination is omitted per brief specifications.

---

## 9. Trade-offs & Limitations

1. **Synchronous DB Sessions with FastAPI:** Used standard SQLAlchemy synchronous engine and session management because the local database load is low and synchronous SQLite/PostgreSQL drivers are simpler and zero-friction to set up for reviewers.
2. **CORS Policy:** Permissive CORS (`*` and localhost ports `3000`, `5173`) configured to ensure instant frontend connectivity across any local development environment.
