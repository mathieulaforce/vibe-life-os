from datetime import date

from fastapi.testclient import TestClient

from src.interfaces.api.main import app


def test_create_and_list_weight() -> None:
    client = TestClient(app)
    response = client.post(
        "/weights",
        json={
            "entry_date": date.today().isoformat(),
            "weight_kg": 80.5,
            "goal_kg": 75.0,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["weight_kg"] == 80.5

    response = client.get("/weights?days=7")
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) >= 1
    assert entries[-1]["source"] in {"manual", "garmin"}
