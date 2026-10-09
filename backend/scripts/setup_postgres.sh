#!/usr/bin/env bash
# ==============================================================================
# Setup PostgreSQL Database for Mini Task Management Application
# ==============================================================================
# This script creates an empty PostgreSQL database (default: 'task_manager')
# and sets up all required tables, foreign keys with ON DELETE CASCADE,
# constraints, and performance indexes.
#
# Usage:
#   bash backend/scripts/setup_postgres.sh [OPTIONS]
#
# Options:
#   -h, --host     PostgreSQL host (default: localhost or $PGHOST)
#   -p, --port     PostgreSQL port (default: 5432 or $PGPORT)
#   -u, --user     PostgreSQL user (default: postgres or $PGUSER)
#   -w, --password PostgreSQL password (default: password or $PGPASSWORD)
#   -d, --db       Target database name (default: task_manager or $PGDATABASE)
#   --reset        Drop existing database if it exists and recreate it clean
#   --help         Display this help message
# ==============================================================================

set -e

# Default configuration
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_USER="${PGUSER:-postgres}"
DB_PASS="${PGPASSWORD:-password}"
DB_NAME="${PGDATABASE:-task_manager}"
RESET_DB=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--host) DB_HOST="$2"; shift ;;
    -p|--port) DB_PORT="$2"; shift ;;
    -u|--user) DB_USER="$2"; shift ;;
    -w|--password) DB_PASS="$2"; shift ;;
    -d|--db|--database) DB_NAME="$2"; shift ;;
    --reset) RESET_DB=true ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -h, --host     PostgreSQL host (default: localhost)"
      echo "  -p, --port     PostgreSQL port (default: 5432)"
      echo "  -u, --user     PostgreSQL user (default: postgres)"
      echo "  -w, --password PostgreSQL password (default: password)"
      echo "  -d, --db       Target database name (default: task_manager)"
      echo "  --reset        Drop existing database before setup"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

export PGPASSWORD="$DB_PASS"

echo "=========================================================="
echo "  PostgreSQL Setup: Task Manager Database"
echo "=========================================================="
echo "Host:     $DB_HOST"
echo "Port:     $DB_PORT"
echo "User:     $DB_USER"
echo "Database: $DB_NAME"
echo "=========================================================="

# Check if psql command is available
if ! command -v psql &> /dev/null; then
  echo "Error: 'psql' client is not installed or not in PATH."
  echo "Tip: You can also run 'python backend/scripts/setup_postgres.py'"
  exit 1
fi

# 1. Check connection to PostgreSQL server
echo "1. Testing connection to PostgreSQL server at $DB_HOST:$DB_PORT..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
  echo "Error: Could not connect to PostgreSQL server."
  echo "Please verify that PostgreSQL is running and credentials are valid."
  exit 1
fi
echo "   Connected successfully."

# 2. Reset database if requested
if [ "$RESET_DB" = true ]; then
  echo "2. Dropping existing database '$DB_NAME' (--reset specified)..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();
  " >/dev/null 2>&1 || true
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null
  echo "   Dropped '$DB_NAME'."
fi

# 3. Create database if it does not exist
echo "3. Creating database '$DB_NAME' if it does not exist..."
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" >/dev/null
  echo "   Database '$DB_NAME' created."
else
  echo "   Database '$DB_NAME' already exists."
fi

# 4. Apply Schema DDL
echo "4. Applying database schema (tables, constraints, indexes)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF' >/dev/null
-- Boards table
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL
);


CREATE INDEX IF NOT EXISTS ix_boards_id ON boards (id);

-- Tasks table with Foreign Key ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'TODO',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC') NOT NULL,
    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT chk_task_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'))
);

CREATE INDEX IF NOT EXISTS ix_tasks_id ON tasks (id);
CREATE INDEX IF NOT EXISTS ix_tasks_board_id ON tasks (board_id);
CREATE INDEX IF NOT EXISTS ix_tasks_status ON tasks (status);
EOF

echo "   Schema applied successfully."

# 5. Output connection string and instructions
echo "=========================================================="
echo "  PostgreSQL Database '$DB_NAME' is ready to use!"
echo "=========================================================="
echo "To configure your backend to use this database, update backend/.env:"
echo ""
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Or export the environment variable before running uvicorn:"
echo "export DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME\""
echo "=========================================================="
