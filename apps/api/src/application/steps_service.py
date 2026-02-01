from datetime import date, timedelta

from sqlalchemy.orm import Session

from src.infrastructure.models import StepEntry


class StepsService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_steps(self, days: int = 365) -> list[StepEntry]:
        cutoff = date.today() - timedelta(days=max(days - 1, 0))
        return (
            self.session.query(StepEntry)
            .filter(StepEntry.entry_date >= cutoff)
            .order_by(StepEntry.entry_date.asc(), StepEntry.created_at.asc())
            .all()
        )
