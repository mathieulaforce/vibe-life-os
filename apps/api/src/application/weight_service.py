from datetime import date, datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy.orm import Session

from src.infrastructure.models import Integration, WeightEntry


class WeightService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_weights(self, days: int) -> list[WeightEntry]:
        cutoff = date.today() - timedelta(days=days - 1)
        return (
            self.session.query(WeightEntry)
            .filter(WeightEntry.entry_date >= cutoff)
            .order_by(WeightEntry.entry_date.asc())
            .all()
        )

    def save_weight(self, entry_date: date, weight_kg: float, goal_kg: float | None) -> WeightEntry:
        existing = (
            self.session.query(WeightEntry)
            .filter(
                WeightEntry.entry_date == entry_date,
                WeightEntry.source == "manual",
            )
            .one_or_none()
        )
        if existing:
            existing.weight_kg = weight_kg
            existing.goal_kg = goal_kg
            self.session.add(existing)
            return existing

        entry = WeightEntry(
            entry_date=entry_date,
            weight_kg=weight_kg,
            goal_kg=goal_kg,
            source="manual",
        )
        self.session.add(entry)
        return entry

    def should_sync_to_garmin(self, entry_date: date) -> bool:
        garmin_weight = (
            self.session.query(WeightEntry)
            .filter(
                WeightEntry.entry_date == entry_date,
                WeightEntry.source == "garmin",
            )
            .one_or_none()
        )
        return garmin_weight is None

    def touch_garmin_sync(self) -> None:
        integration = (
            self.session.query(Integration)
            .filter(Integration.provider == "garmin")
            .one_or_none()
        )
        if integration and integration.status == "connected":
            integration.last_sync_at = datetime.now(timezone.utc)
            self.session.add(integration)
