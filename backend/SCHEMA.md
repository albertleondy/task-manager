# Database Schema Documentation

This document describes the database design, tables, datatypes, constraints, indexes, migration workflow, and architectural decisions for the **Mini Task Management Application**.

---

## 1. Entity Relationship Diagram

```
+-------------------------------------------------------------+
|                           boards                            |
+-------------------------------------------------------------+
| id         : INTEGER (PK, Auto-increment)                  |
| name       : VARCHAR(255) NOT NULL                          |
| created_at : TIMESTAMP NOT NULL                             |
| updated_at : TIMESTAMP NOT NULL                             |
| deleted_at : TIMESTAMP NULL                                 |
+-------------------------------------------------------------+
                              |
                              | 1
                              |
                              | has many
                              | (ON DELETE CASCADE)
                              |
                              v N
+-------------------------------------------------------------+
|                            tasks                            |
+-------------------------------------------------------------+
| id          : INTEGER (PK, Auto-increment)                  |
| board_id    : INTEGER NOT NULL (FK -> boards.id)            |
| title       : VARCHAR(255) NOT NULL                         |
| description : TEXT NULL                                     |
| status      : VARCHAR(32) NOT NULL DEFAULT 'TODO'           |
| created_at  : TIMESTAMP NOT NULL                            |
| updated_at  : TIMESTAMP NOT NULL                            |
| deleted_at  : TIMESTAMP NULL                                |
+-------------------------------------------------------------+
```

---

## 2. Table Specifications

### 2.1 Table: `boards`

| Column Name | Data Type | Nullable | Default | Constraints / Key | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | Auto-increment | `PRIMARY KEY` | Unique identifier for the board. |
| `name` | `VARCHAR(255)` | `NO` | None | `NOT NULL`, Non-empty validation | Human-readable title of the board container. |
| `created_at` | `TIMESTAMP` / `DATETIME` | `NO` | `CURRENT_TIMESTAMP` | `NOT NULL` | UTC timestamp when board was created. |
| `updated_at` | `TIMESTAMP` / `DATETIME` | `NO` | `CURRENT_TIMESTAMP` | `NOT NULL`, Auto-updated on modification | UTC timestamp when board was last modified. |
| `deleted_at` | `TIMESTAMP` / `DATETIME` | `YES` | `NULL` | None | UTC timestamp when board was soft-deleted (`NULL` = active). |


#### Indexes on `boards`
* `ix_boards_id` (on `id`): Primary key index for rapid $O(1)$ single-board lookup.

---

### 2.2 Table: `tasks`

| Column Name | Data Type | Nullable | Default | Constraints / Key | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | Auto-increment | `PRIMARY KEY` | Unique identifier for the task. |
| `board_id` | `INTEGER` | `NO` | None | `FOREIGN KEY (boards.id) ON DELETE CASCADE` | References the parent board. Enforced at the database level. |
| `title` | `VARCHAR(255)` | `NO` | None | `NOT NULL`, Non-empty validation | Short title describing the task. |
| `description` | `TEXT` | `YES` | `NULL` | None | Detailed notes or context for the task. |
| `status` | `VARCHAR(32)` | `NO` | `'TODO'` | `NOT NULL`, Enum Check `('TODO', 'IN_PROGRESS', 'DONE')` | Lifecycle stage of the task. |
| `created_at` | `TIMESTAMP` / `DATETIME` | `NO` | `CURRENT_TIMESTAMP` | `NOT NULL` | UTC timestamp when task was created. |
| `updated_at` | `TIMESTAMP` / `DATETIME` | `NO` | `CURRENT_TIMESTAMP` | `NOT NULL`, Auto-updated on modification | UTC timestamp when task was last modified. |
| `deleted_at` | `TIMESTAMP` / `DATETIME` | `YES` | `NULL` | None | UTC timestamp when task was soft-deleted (`NULL` = active). |

#### Indexes on `tasks`
* `ix_tasks_id` (on `id`): Primary key index for fast retrieval, updates, and deletes by task ID.
* `ix_tasks_board_id` (on `board_id`): Indexed foreign key. **Reason:** The predominant query pattern is listing all tasks belonging to a specific board (`WHERE board_id = ?`). Without this index, every task query on a board would require a full table scan.
* `ix_tasks_status` (on `status`): **Reason:** Enables efficient filtering by task status (`WHERE board_id = ? AND status = ?`) for board status views (e.g. showing only open or in-progress tasks).

---

## 3. Foreign Key & Soft Deletion Architecture (R3, R4)

### Soft Delete Implementation
* **Soft Delete Mechanism:** When a user deletes a task or a board, the record is NOT physically purged with SQL `DELETE`. Instead, the application sets `deleted_at = UTC_TIMESTAMP`.
* **Active Record Filtering:** All active queries strictly filter records where `deleted_at IS NULL`.
* **Cascading Soft Deletes:** When a board is soft-deleted, the application cascades the soft delete to all active tasks associated with that board, ensuring child tasks are hidden in unison with their parent board.
* **Database-Level Backup:** Physical foreign keys maintain `ON DELETE CASCADE` so that if administrative purging is ever executed, referential integrity remains mathematically guaranteed.

---

## 4. Schema Creation & Migrations (R6)

The database schema can be created through either of two ways:

1. **Alembic Migrations (Recommended for Production & CI):**
   ```bash
   alembic upgrade head
   ```
   Migration script `migrations/versions/001_initial_schema.py` establishes the baseline tables, foreign key constraints, `deleted_at` columns, and indexes.

2. **Automatic Application Startup Fallback:**
   When the FastAPI application boots up (`app/main.py` lifespan context), `Base.metadata.create_all(bind=engine)` runs automatically, ensuring that on a fresh clone or in-memory test environment, all tables exist immediately without extra manual setup.

---

## 5. Architectural Decisions Considered & Rationale (R7)

1. **Status Lookup Table vs. Enum Column:**
   * *Considered:* Creating a separate `task_statuses` table with foreign key IDs.
   * *Rejected:* For a fixed 3-state task lifecycle (`TODO`, `IN_PROGRESS`, `DONE`), a normalized lookup table introduces unnecessary JOIN overhead on every query, extra database round trips, and complexity without operational benefit. Enforcing valid states via Pydantic model validation and database-level enum/check constraints provides strong data integrity with zero performance penalty.

2. **Why Soft Delete Was Chosen (Over Hard Delete):**
   * *User Mistake Issues & Accidental Deletions:* Accidental user deletions are one of the most common operational incidents in task tracking systems. Soft deletion ensures that accidentally deleted boards or tasks can be restored immediately (`UPDATE ... SET deleted_at = NULL`) without costly and disruptive point-in-time database backup restores.
   * *Audit Logging & Activity History:* Soft deletion preserves full traceability of every entity. It enables historical analytics, audit trail tracking (e.g. knowing who completed or deleted an item and when), and post-mortem reviews.

