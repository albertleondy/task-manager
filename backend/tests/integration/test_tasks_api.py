from fastapi.testclient import TestClient


def test_create_task_api_success(client: TestClient):
    """POST /api/boards/{board_id}/tasks creates task and returns 201 with {data, error}."""
    board_res = client.post("/api/boards", json={"name": "Feature Dev"})
    board_id = board_res.json()["data"]["id"]

    task_res = client.post(
        f"/api/boards/{board_id}/tasks",
        json={"title": "Implement authentication", "description": "JWT tokens"},
    )
    assert task_res.status_code == 201
    body = task_res.json()
    assert body["error"] is None
    data = body["data"]
    assert data["id"] is not None
    assert data["board_id"] == board_id
    assert data["title"] == "Implement authentication"
    assert data["description"] == "JWT tokens"
    assert data["status"] == "TODO"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_api_nonexistent_board_404(client: TestClient):
    """POST /api/boards/9999/tasks returns 404 with standardized error schema."""
    task_res = client.post(
        "/api/boards/9999/tasks",
        json={"title": "Orphan task"},
    )
    assert task_res.status_code == 404
    body = task_res.json()
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"


def test_create_task_api_empty_title_422(client: TestClient):
    """POST /api/boards/{board_id}/tasks with empty title returns 422 with standardized error."""
    board_res = client.post("/api/boards", json={"name": "Dev Board"})
    board_id = board_res.json()["data"]["id"]

    task_res = client.post(
        f"/api/boards/{board_id}/tasks",
        json={"title": ""},
    )
    assert task_res.status_code in (400, 422)
    body = task_res.json()
    assert body["data"] is None
    assert body["error"]["code"] == "VALIDATION_FAILED"


def test_list_tasks_for_board_api(client: TestClient):
    """GET /api/boards/{board_id}/tasks lists tasks and handles ?status= filter."""
    board_res = client.post("/api/boards", json={"name": "Roadmap"})
    board_id = board_res.json()["data"]["id"]

    # 1. Empty board returns empty list
    empty_res = client.get(f"/api/boards/{board_id}/tasks")
    assert empty_res.status_code == 200
    assert empty_res.json()["data"] == []
    assert empty_res.json()["error"] is None

    # 2. Add tasks
    client.post(f"/api/boards/{board_id}/tasks", json={"title": "Task 1", "status": "TODO"})
    client.post(f"/api/boards/{board_id}/tasks", json={"title": "Task 2", "status": "IN_PROGRESS"})
    client.post(f"/api/boards/{board_id}/tasks", json={"title": "Task 3", "status": "DONE"})

    # 3. List all
    all_res = client.get(f"/api/boards/{board_id}/tasks")
    assert all_res.status_code == 200
    assert len(all_res.json()["data"]) == 3

    # 4. Filter by status
    filter_res = client.get(f"/api/boards/{board_id}/tasks?status=IN_PROGRESS")
    assert filter_res.status_code == 200
    filtered_data = filter_res.json()["data"]
    assert len(filtered_data) == 1
    assert filtered_data[0]["title"] == "Task 2"


def test_list_tasks_nonexistent_board_404(client: TestClient):
    """GET /api/boards/9999/tasks returns 404."""
    res = client.get("/api/boards/9999/tasks")
    assert res.status_code == 404
    body = res.json()
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"


def test_update_task_status_api(client: TestClient):
    """PATCH /api/tasks/{task_id} updates task status and returns 200."""
    board_res = client.post("/api/boards", json={"name": "Board"})
    board_id = board_res.json()["data"]["id"]
    task_res = client.post(f"/api/boards/{board_id}/tasks", json={"title": "Initial Task"})
    task_id = task_res.json()["data"]["id"]

    patch_res = client.patch(f"/api/tasks/{task_id}", json={"status": "DONE"})
    assert patch_res.status_code == 200
    body = patch_res.json()
    assert body["error"] is None
    assert body["data"]["status"] == "DONE"


def test_update_task_invalid_status_api(client: TestClient):
    """PATCH /api/tasks/{task_id} with invalid status returns 422/400."""
    board_res = client.post("/api/boards", json={"name": "Board"})
    board_id = board_res.json()["data"]["id"]
    task_res = client.post(f"/api/boards/{board_id}/tasks", json={"title": "Task"})
    task_id = task_res.json()["data"]["id"]

    patch_res = client.patch(f"/api/tasks/{task_id}", json={"status": "INVALID_STATE"})
    assert patch_res.status_code in (400, 422)
    body = patch_res.json()
    assert body["data"] is None
    assert body["error"]["code"] == "VALIDATION_FAILED"


def test_delete_task_api(client: TestClient):
    """DELETE /api/tasks/{task_id} deletes task and returns 200/204."""
    board_res = client.post("/api/boards", json={"name": "Board"})
    board_id = board_res.json()["data"]["id"]
    task_res = client.post(f"/api/boards/{board_id}/tasks", json={"title": "Task"})
    task_id = task_res.json()["data"]["id"]

    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code in (200, 204)
    if del_res.status_code == 200:
        assert del_res.json()["error"] is None

    # Deleting again returns 404
    del_again = client.delete(f"/api/tasks/{task_id}")
    assert del_again.status_code == 404
    body = del_again.json()
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"
