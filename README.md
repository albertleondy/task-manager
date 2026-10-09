# Mini Task Management Application

A clean, production-grade task management system designed with independent **Backend** (FastAPI) and **Frontend** (React) services.

---

## Quick Start Guide (Zero to Running in 2 Minutes)

### Prerequisites
* **Python:** 3.11, 3.12, or 3.13
* **Node.js:** v18+ (Tested on v20+ and v24+) & `npm`

---

### 1. Start the Backend Service (Terminal 1)

```bash
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On Linux / macOS:
source .venv/bin/activate
# On Windows (PowerShell):
# .\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Configure environment (pre-configured SQLite default)
cp .env.example .env    # On Windows: copy .env.example .env

# Run database tables initialization (optional, auto-created on start)
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **API Server:** `http://127.0.0.1:8000`
* **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`
* **Interactive ReDoc:** `http://127.0.0.1:8000/redoc`

---

### 2. Start the Frontend Service (Terminal 2)

```bash
cd frontend

# Install frontend dependencies
npm install

# Configure environment (pre-configured to connect to localhost:8000)
cp .env.example .env    # On Windows: copy .env.example .env

# Start Vite development server
npm run dev
```
* **Frontend Application:** Open **`http://localhost:5173`** in your browser.

---

### 3. Run Automated Tests

The backend test suite includes **40 automated integration and unit tests** with 100% pass rate:

```bash
cd backend

# Make sure virtualenv is activated
source .venv/bin/activate

# Run tests with verbose output
pytest -v
```

To run frontend build & type check:
```bash
cd frontend
npm run build
```

---

## Repository Layout

```
task-manager/
├── backend/          <- FastAPI backend service
│   ├── app/          <- Layered architecture (api, services, repositories, models, schemas)
│   ├── scripts/      <- Turnkey database setup scripts (setup_postgres.sh, setup_postgres.py)
│   ├── tests/        <- Pytest unit & integration tests (40 automated tests)
│   ├── SCHEMA.md     <- Database schema documentation with soft delete & cascade specifications
│   ├── API.md        <- REST API contract documentation and uniform envelope schemas
│   └── README.md     <- Detailed backend instructions, transactions & soft delete documentation
├── frontend/         <- React frontend service
│   ├── src/          <- Single-page application with TanStack Query, React Router, Tailwind CSS v4
│   └── README.md     <- Detailed frontend instructions, routing, and query hook documentation
├── task-manager.zip  <- Complete packaged project archive (excluding node_modules & venv)
└── README.md         <- This root documentation
```

---

## Architectural Highlights

### 1. Backend Service (`backend/`)
* **Technology:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, Pytest
* **Database & Transactions:**
  * **Zero-Config Default:** SQLite (`sqlite:///./tasks.db`) requires no local database server setup.
  * **Production Ready:** PostgreSQL compatibility with turnkey initialization scripts (`backend/scripts/setup_postgres.sh` / `backend/scripts/setup_postgres.py`).
  * **Atomic Transactions & Concurrency:** Database operations are wrapped in transactions (`db.commit()`, `db.rollback()`) and enforce foreign key cascade rules to prevent race conditions (TOCTOU, orphaned tasks).
  * **Soft Delete Architecture:** Both `boards` and `tasks` utilize soft deletes via `deleted_at` timestamps for audit logging, user mistake recovery, and relational integrity. Standard queries automatically filter `WHERE deleted_at IS NULL`.
* **Switching to PostgreSQL:**
  ```bash
  # Linux / macOS:
  ./backend/scripts/setup_postgres.sh
  # Windows / Cross-platform:
  python backend/scripts/setup_postgres.py
  ```
  Then set `DATABASE_URL=postgresql://postgres:password@localhost:5432/task_manager` in `backend/.env`.

### 2. Frontend Service (`frontend/`)
* **Technology:** React 19, TypeScript, Vite 6, TanStack React Query v5, React Router v7, Tailwind CSS v4, Zod
* **Data Fetching & State:** **TanStack React Query v5** custom hooks (`useGetBoards`, `useGetBoardById`, `useGetTasks`, `useCreateBoard`, `useCreateTask`, `useUpdateTask`, `useDeleteBoard`, `useDeleteTask`) with automatic query key caching and cache invalidation.
* **Routing & 404:** **React Router v7** with code-splitting (`lazy()` + `Suspense`) and dedicated `NotFound` page (`*`) for unrecognized paths.
* **Service Architecture:** Modular domain service folders (`src/lib/services/board/`, `src/lib/services/task/`) with pure async functions returning typed `{ data, error }` envelopes and colocated TypeScript interfaces.

---

## Self-Check Verification (Section 4)

1. **Stop Frontend / Run Backend:**
   Backend operates independently and answers REST requests (e.g. `curl http://127.0.0.1:8000/api/boards`).
2. **Stop Backend / Run Frontend:**
   Frontend loads gracefully in the browser and displays an informative `ErrorBanner` ("Unable to connect to the backend server. Please verify the backend service is running") with a **Retry Request** button rather than crashing or showing a blank page.
