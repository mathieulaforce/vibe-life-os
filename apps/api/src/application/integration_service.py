from datetime import datetime, timezone
from typing import Iterable

from sqlalchemy.orm import Session

from src.infrastructure.models import Integration


class IntegrationService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_integrations(self) -> list[Integration]:
        return self.session.query(Integration).order_by(Integration.provider.asc()).all()

    def connect(self, provider: str, access_token: str, refresh_token: str | None) -> Integration:
        integration = (
            self.session.query(Integration)
            .filter(Integration.provider == provider)
            .one_or_none()
        )
        if integration is None:
            integration = Integration(provider=provider, status="connected")
        integration.status = "connected"
        integration.access_token = access_token
        integration.refresh_token = refresh_token
        integration.connected_at = datetime.now(timezone.utc)
        self.session.add(integration)
        return integration

    def disconnect(self, provider: str) -> None:
        integration = (
            self.session.query(Integration)
            .filter(Integration.provider == provider)
            .one_or_none()
        )
        if integration:
            integration.status = "disconnected"
            integration.access_token = None
            integration.refresh_token = None
            self.session.add(integration)
