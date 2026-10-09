from fastapi.testclient import TestClient


def test_create_board_api_success(client: TestClient):
    """POST /api/boards creates a board and returns 201 with {data, error} envelope."""
    response = client.post("/api/boards", json={"name": "Engineering Sprint"})
    assert response.status_code == 201
    body = response.json()
    assert body["error"] is None
    data = body["data"]
    assert data["id"] is not None
    assert data["name"] == "Engineering Sprint"
    assert "created_at" in data


def test_create_board_api_empty_name_error(client: TestClient):
    """POST /api/boards with empty name returns 422/400 with standardized error schema."""
    response = client.post("/api/boards", json={"name": ""})
    assert response.status_code in (400, 422)
    body = response.json()
    assert body["data"] is None
    assert body["error"]["code"] == "VALIDATION_FAILED"
    assert len(body["error"]["message"]) > 0


def test_create_board_api_missing_name_error(client: TestClient):
    """POST /api/boards with missing name field returns 422 with standardized error schema."""
    response = client.post("/api/boards", json={})
    assert response.status_code == 422
    body = response.json()
    assert body["data"] is None
    assert body["error"]["code"] == "VALIDATION_FAILED"


def test_list_boards_api(client: TestClient):
    """GET /api/boards lists all boards and returns 200 with {data, error}."""
    client.post("/api/boards", json={"name": "Board 1"})
    client.post("/api/boards", json={"name": "Board 2"})

    response = client.get("/api/boards")
    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    data = body["data"]
    assert isinstance(data, list)
    assert len(data) == 2


def test_get_board_api_not_found(client: TestClient):
    """GET /api/boards/9999 returns 404 with standardized error schema."""
    response = client.get("/api/boards/9999")
    assert response.status_code == 404
    body = response.json()
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"
    assert "9999" in body["error"]["message"]


def test_delete_board_api_success(client: TestClient):
    """DELETE /api/boards/{id} deletes board and returns 200 with {data: null, error: null}."""
    create_res = client.post("/api/boards", json={"name": "Board to Delete"})
    board_id = create_res.json()["data"]["id"]

    delete_res = client.delete(f"/api/boards/{board_id}")
    assert delete_res.status_code in (200, 204)
    if delete_res.status_code == 200:
        assert delete_res.json()["error"] is None

    # Verify board is gone
    get_res = client.get(f"/api/boards/{board_id}")
    assert get_res.status_code == 404


def test_delete_board_api_not_found(client: TestClient):
    """DELETE /api/boards/9999 returns 404 with standardized error schema."""
    response = client.delete("/api/boards/9999")
    assert response.status_code == 404
    body = response.json()
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"
