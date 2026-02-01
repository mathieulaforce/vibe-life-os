from src.domain.health import HealthStatus


class HealthService:
    def check(self) -> HealthStatus:
        return HealthStatus.ok("lifeos-api")
