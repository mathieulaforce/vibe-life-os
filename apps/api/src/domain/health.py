from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class HealthStatus:
    name: str
    status: str
    checked_at: datetime

    @staticmethod
    def ok(name: str) -> "HealthStatus":
        return HealthStatus(
            name=name,
            status="ok",
            checked_at=datetime.now(timezone.utc),
        )
