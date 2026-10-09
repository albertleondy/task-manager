#!/usr/bin/env python3
"""Convenient CLI tool to inspect the SQLite database."""
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / "tasks.db"


def inspect_db():
    if not DB_PATH.exists():
        print(f"Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("=" * 60)
    print(f" DATABASE: {DB_PATH.resolve()}")
    print("=" * 60)

    # 1. Boards
    print("\n📋 TABLE: boards")
    cursor.execute("SELECT id, name, created_at FROM boards ORDER BY id ASC")
    boards = cursor.fetchall()
    if not boards:
        print("  (No boards found)")
    else:
        for b in boards:
            print(f"  [ID: {b['id']}] {b['name']} (created: {b['created_at']})")

    # 2. Tasks
    print("\n📝 TABLE: tasks")
    cursor.execute("SELECT id, board_id, title, status, created_at FROM tasks ORDER BY id ASC")
    tasks = cursor.fetchall()
    if not tasks:
        print("  (No tasks found)")
    else:
        for t in tasks:
            print(f"  [ID: {t['id']}] Board #{t['board_id']} | Status: {t['status']:<11} | Title: {t['title']}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    inspect_db()
