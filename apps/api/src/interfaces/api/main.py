from fastapi import FastAPI

from src.application.health_service import HealthService

app = FastAPI(title="LifeOS API", version="0.1.0")


@app.get("/health")
def health_check() -> dict:
    status = HealthService().check()
    return {
        "name": status.name,
        "status": status.status,
        "checked_at": status.checked_at.isoformat(),
    }
