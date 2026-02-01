from datetime import date, datetime
from typing import Iterator

import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.application.health_service import HealthService
from src.application.integration_service import IntegrationService
from src.application.weight_service import WeightService
from src.infrastructure.database import Base, ENGINE, SessionLocal
from src.infrastructure.models import Integration, WeightEntry

load_dotenv()

app = FastAPI(title="LifeOS API", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def get_session() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@app.on_event("startup")
def init_db() -> None:
    Base.metadata.create_all(bind=ENGINE)


class WeightCreateRequest(BaseModel):
    entry_date: date | None = None
    weight_kg: float = Field(..., gt=0)
    goal_kg: float | None = Field(default=None, gt=0)


class IntegrationConnectResponse(BaseModel):
    auth_url: str


@app.get("/health")
def health_check() -> dict:
    status = HealthService().check()
    return {
        "name": status.name,
        "status": status.status,
        "checked_at": status.checked_at.isoformat(),
    }


@app.get("/integrations")
def list_integrations(session: Session = Depends(get_session)) -> list[dict]:
    service = IntegrationService(session)
    integrations = service.list_integrations()
    return [
        {
            "provider": integration.provider,
            "status": integration.status,
            "connected_at": integration.connected_at.isoformat() if integration.connected_at else None,
            "last_sync_at": integration.last_sync_at.isoformat() if integration.last_sync_at else None,
        }
        for integration in integrations
    ]


@app.post("/integrations/{provider}/connect", response_model=IntegrationConnectResponse)
def start_integration(provider: str) -> IntegrationConnectResponse:
    if provider not in {"garmin", "strava"}:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    return IntegrationConnectResponse(auth_url=f"/integrations/{provider}/callback?code=stub")


@app.get("/integrations/{provider}/callback")
def integration_callback(provider: str, code: str, session: Session = Depends(get_session)) -> dict:
    if provider not in {"garmin", "strava"}:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    service = IntegrationService(session)
    integration = service.connect(provider, access_token=f"{provider}_access_{code}", refresh_token=None)
    session.commit()
    return {
        "provider": integration.provider,
        "status": integration.status,
        "connected_at": integration.connected_at.isoformat() if integration.connected_at else None,
    }


@app.post("/integrations/{provider}/disconnect")
def integration_disconnect(provider: str, session: Session = Depends(get_session)) -> dict:
    if provider not in {"garmin", "strava"}:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    service = IntegrationService(session)
    service.disconnect(provider)
    session.commit()
    return {"provider": provider, "status": "disconnected"}


@app.get("/weights")
def list_weights(days: int = 30, session: Session = Depends(get_session)) -> list[dict]:
    service = WeightService(session)
    entries = service.list_weights(days=days)
    by_date: dict[date, WeightEntry] = {}
    for entry in entries:
        current = by_date.get(entry.entry_date)
        if current is None or entry.source == "garmin":
            by_date[entry.entry_date] = entry
    return [
        {
            "entry_date": entry.entry_date.isoformat(),
            "weight_kg": entry.weight_kg,
            "goal_kg": entry.goal_kg,
            "source": entry.source,
        }
        for entry in sorted(by_date.values(), key=lambda item: item.entry_date)
    ]


@app.post("/weights")
def create_weight(payload: WeightCreateRequest, session: Session = Depends(get_session)) -> dict:
    entry_date = payload.entry_date or date.today()
    service = WeightService(session)
    entry = service.save_weight(entry_date, payload.weight_kg, payload.goal_kg)
    garmin_sync = None
    if service.should_sync_to_garmin(entry_date):
        service.touch_garmin_sync()
        garmin_sync = "queued_stub"
    session.commit()
    return {
        "entry_date": entry.entry_date.isoformat(),
        "weight_kg": entry.weight_kg,
        "goal_kg": entry.goal_kg,
        "source": entry.source,
        "garmin_sync": garmin_sync,
    }
