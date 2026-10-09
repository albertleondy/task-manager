# REST API Documentation

The Mini Task Management API is a RESTful service built with FastAPI. It provides endpoints to manage boards and their associated tasks.

## Base URL
Default: `http://localhost:8000`

Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## Standard Response Envelope

All API endpoints return a uniform response envelope with `data` and `error` keys:

### Success Response (`200 OK` / `201 Created`):
```json
{
  "data": { ... },
  "error": null
}
```

### Error Response (`400` / `404` / `422` / `500`):
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Task title must not be empty or whitespace only"
  }
}
```

### Common Error Codes:
* `VALIDATION_FAILED` (HTTP 400 or 422): Sent when a request body or parameter fails validation.
* `NOT_FOUND` (HTTP 404): Sent when a requested board or task ID does not exist.
* `BAD_REQUEST` (HTTP 400): Sent when request parameters are malformed.
* `INTERNAL_SERVER_ERROR` (HTTP 500): Sent if an unexpected server exception occurs.

---

## Endpoints

### 1. List All Boards
* **URL:** `GET /api/boards`
* **Status Code:** `200 OK`
* **Description:** Returns all boards with task counts.

#### Example Request:
```bash
curl -X GET http://localhost:8000/api/boards
```

#### Example Success Response (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Q3 Website Refresh",
    "created_at": "2026-10-08T15:30:00Z",
    "task_count": 3
  },
  {
    "id": 2,
    "name": "Onboarding",
    "created_at": "2026-10-08T16:00:00Z",
    "task_count": 0
  }
]
```

---

### 2. Create a Board
* **URL:** `POST /api/boards`
* **Status Code:** `201 Created`
* **Description:** Create a new board container.

#### Request Body:
```json
{
  "name": "Mobile App V2"
}
```

#### Example Request:
```bash
curl -X POST http://localhost:8000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"name": "Mobile App V2"}'
```

#### Example Success Response (`201 Created`):
```json
{
  "id": 3,
  "name": "Mobile App V2",
  "created_at": "2026-10-08T16:45:00Z",
  "task_count": 0
}
```

#### Example Error Response (`422 Unprocessable Entity` or `400 Bad Request`):
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Board name must not be empty or whitespace only",
  "field": "name"
}
```

---

### 3. Get Board by ID
* **URL:** `GET /api/boards/{boardId}`
* **Status Code:** `200 OK`

#### Example Request:
```bash
curl -X GET http://localhost:8000/api/boards/1
```

#### Example Success Response (`200 OK`):
```json
{
  "id": 1,
  "name": "Q3 Website Refresh",
  "created_at": "2026-10-08T15:30:00Z",
  "task_count": 3
}
```

#### Example Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Board with ID 9999 not found",
  "field": "board_id"
}
```

---

### 4. Delete a Board
* **URL:** `DELETE /api/boards/{boardId}`
* **Status Code:** `204 No Content`
* **Description:** Deletes the board and cascades deletion to all associated tasks.

#### Example Request:
```bash
curl -X DELETE http://localhost:8000/api/boards/1
```

#### Example Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Board with ID 9999 not found",
  "field": "board_id"
}
```

---

### 5. List Tasks on a Board
* **URL:** `GET /api/boards/{boardId}/tasks`
* **Query Parameters:**
  * `status` *(optional)*: Filter by `TODO`, `IN_PROGRESS`, or `DONE`.
* **Status Code:** `200 OK`
* **Behavior:** Returns `[]` if board has no tasks. Returns `404` if board does not exist.

#### Example Request:
```bash
# All tasks
curl -X GET http://localhost:8000/api/boards/1/tasks

# Filter by status
curl -X GET "http://localhost:8000/api/boards/1/tasks?status=IN_PROGRESS"
```

#### Example Success Response (`200 OK`):
```json
[
  {
    "id": 10,
    "board_id": 1,
    "title": "Design Figma prototype",
    "description": "Include dark mode variants",
    "status": "IN_PROGRESS",
    "created_at": "2026-10-08T15:35:00Z",
    "updated_at": "2026-10-08T15:40:00Z"
  }
]
```

#### Example Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Board with ID 9999 not found",
  "field": "board_id"
}
```

---

### 6. Create a Task on a Board
* **URL:** `POST /api/boards/{boardId}/tasks`
* **Status Code:** `201 Created`
* **Description:** Create a new task within a board.

#### Request Body:
```json
{
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions",
  "status": "TODO"
}
```

#### Example Request:
```bash
curl -X POST http://localhost:8000/api/boards/1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Set up CI/CD pipeline", "description": "Configure GitHub Actions", "status": "TODO"}'
```

#### Example Success Response (`201 Created`):
```json
{
  "id": 11,
  "board_id": 1,
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions",
  "status": "TODO",
  "created_at": "2026-10-08T16:50:00Z",
  "updated_at": "2026-10-08T16:50:00Z"
}
```

#### Example Error Response (`422 Unprocessable Entity`):
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Task title must not be empty or whitespace only",
  "field": "title"
}
```

---

### 7. Update a Task Status / Details
* **URL:** `PATCH /api/tasks/{taskId}`
* **Status Code:** `200 OK`
* **Description:** Update a task's status (`TODO`, `IN_PROGRESS`, `DONE`), title, or description.

#### Request Body:
```json
{
  "status": "DONE"
}
```

#### Example Request:
```bash
curl -X PATCH http://localhost:8000/api/tasks/11 \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

#### Example Success Response (`200 OK`):
```json
{
  "id": 11,
  "board_id": 1,
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions",
  "status": "DONE",
  "created_at": "2026-10-08T16:50:00Z",
  "updated_at": "2026-10-08T17:00:00Z"
}
```

#### Example Error Response (`422 Unprocessable Entity`):
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Input should be 'TODO', 'IN_PROGRESS' or 'DONE'",
  "field": "status"
}
```

---

### 8. Delete a Task
* **URL:** `DELETE /api/tasks/{taskId}`
* **Status Code:** `204 No Content`
* **Description:** Delete an existing task.

#### Example Request:
```bash
curl -X DELETE http://localhost:8000/api/tasks/11
```

#### Example Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Task with ID 9999 not found",
  "field": "task_id"
}
```
