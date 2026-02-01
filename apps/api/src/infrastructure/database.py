from dataclasses import dataclass
import os


@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: int
    database: str
    user: str
    password: str

    @staticmethod
    def from_env() -> "DatabaseConfig":
        return DatabaseConfig(
            host=os.getenv("MARIADB_HOST", "localhost"),
            port=int(os.getenv("MARIADB_PORT", "3306")),
            database=os.getenv("MARIADB_DATABASE", "lifeos"),
            user=os.getenv("MARIADB_USER", "lifeos"),
            password=os.getenv("MARIADB_PASSWORD", "lifeos_dev"),
        )
