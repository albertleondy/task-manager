#!/usr/bin/env python3
"""Cross-platform script to setup an empty PostgreSQL database for Task Manager.

Can be run directly via:
    python backend/scripts/setup_postgres.py [--reset]
"""

import argparse
import sys
import os

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("Error: 'psycopg2' is not installed.")
    print("Please install it via: pip install psycopg2-binary")
    sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(description="Initialize PostgreSQL Database for Task Manager")
    parser.add_argument("--host", default=os.getenv("PGHOST", "localhost"), help="PostgreSQL host")
    parser.add_argument("--port", type=int, default=int(os.getenv("PGPORT", "5432")), help="PostgreSQL port")
    parser.add_argument("--user", default=os.getenv("PGUSER", "postgres"), help="PostgreSQL username")
    parser.add_argument("--password", default=os.getenv("PGPASSWORD", "password"), help="PostgreSQL password")
    parser.add_argument("--database", default=os.getenv("PGDATABASE", "task_manager"), help="Target database name")
    parser.add_argument("--reset", action="store_true", help="Drop existing database before creating")
    return parser.parse_args()


DDL_SCHEMA = """
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
"""


def main():
    args = parse_args()

    print("=" * 60)
    print("  PostgreSQL Setup: Task Manager Database (Python)")
    print("=" * 60)
    print(f"Host:     {args.host}")
    print(f"Port:     {args.port}")
    print(f"User:     {args.user}")
    print(f"Database: {args.database}")
    print("=" * 60)

    # 1. Connect to default postgres DB to manage databases
    print("1. Connecting to PostgreSQL server...")
    try:
        conn = psycopg2.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=args.password,
            dbname="postgres",
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("   Connected successfully.")
    except Exception as e:
        print(f"Error: Failed to connect to PostgreSQL server: {e}")
        sys.exit(1)

    # 2. Reset if requested
    if args.reset:
        print(f"2. Dropping existing database '{args.database}' (--reset)...")
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{args.database}' AND pid <> pg_backend_pid();
        """)
        cursor.execute(f"DROP DATABASE IF EXISTS {args.database};")
        print(f"   Database '{args.database}' dropped.")

    # 3. Create database if not exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{args.database}';")
    exists = cursor.fetchone()
    if not exists:
        print(f"3. Creating database '{args.database}'...")
        cursor.execute(f"CREATE DATABASE {args.database};")
        print(f"   Database '{args.database}' created.")
    else:
        print(f"3. Database '{args.database}' already exists.")

    cursor.close()
    conn.close()

    # 4. Connect to target database and apply DDL schema
    print(f"4. Applying schema to '{args.database}'...")
    db_conn = psycopg2.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        dbname=args.database,
    )
    db_conn.autocommit = True
    db_cursor = db_conn.cursor()
    db_cursor.execute(DDL_SCHEMA)
    db_cursor.close()
    db_conn.close()
    print("   Tables, constraints, and indexes created successfully.")

    print("=" * 60)
    print(f"  PostgreSQL Database '{args.database}' is ready to use!")
    print("=" * 60)
    print("To configure backend to use PostgreSQL, update backend/.env:")
    print()
    print(f"DATABASE_URL=postgresql://{args.user}:{args.password}@{args.host}:{args.port}/{args.database}")
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
