from fastapi.testclient import TestClient

from src.interfaces.api.main import app


def test_health_check() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["name"] == "lifeos-api"
